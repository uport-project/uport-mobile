// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//

#import "UPTEthSigner.h"
#import "EthereumSigner.h"
#import <Valet/VALValet.h>
#import <Valet/VALSecureEnclaveValet.h>
#import <Valet/VALSynchronizableValet.h>
#import <Valet/VALSinglePromptSecureEnclaveValet.h>
#import "UPTEthSigner+Utils.h"
#import <CoreBitcoin/CoreBitcoin.h>
#import <CoreBitcoin/CoreBitcoin+Categories.h>
#import <CoreBitcoin/openssl/rand.h>
#include <openssl/ec.h>
#include <openssl/ecdsa.h>
#include <openssl/bn.h>
#include <openssl/evp.h>
#include <openssl/obj_mac.h>
#include <openssl/rand.h>

static int     BTCRegenerateKey(EC_KEY *eckey, BIGNUM *priv_key);
static int     ECDSA_SIG_recover_key_GFp(EC_KEY *eckey, BIGNUM *r, BIGNUM *s, const unsigned char *msg, int msglen, int recid, int check);

NSString *const ReactNativeKeychainProtectionLevelNormal = @"simple";
NSString *const ReactNativeKeychainProtectionLevelICloud = @"cloud"; // icloud keychain backup
NSString *const ReactNativeKeychainProtectionLevelPromptSecureEnclave = @"prompt";
NSString *const ReactNativeKeychainProtectionLevelSinglePromptSecureEnclave = @"singleprompt";

/// @description identifiers so valet can encapsulate our keys in the keychain
NSString *const UPTPrivateKeyIdentifier = @"UportPrivateKeys";
NSString *const UPTProtectionLevelIdentifier = @"UportProtectionLevelIdentifier";
NSString *const UPTEthAddressIdentifier = @"UportEthAddressIdentifier";

/// @desctiption the key prefix to concatenate with the eth address necessary to lookup the private key
NSString *const UPTPrivateKeyLookupKeyNamePrefix = @"address-";
NSString *const UPTProtectionLevelLookupKeyNamePrefix = @"level-address-";

NSString * const UPTSignerErrorCodeLevelParamNotRecognized = @"-11";
NSString * const UPTSignerErrorCodeLevelPrivateKeyNotFound = @"-12";

@implementation UPTEthSigner

+ (void)createKeyPairWithStorageLevel:(UPTEthKeychainProtectionLevel)protectionLevel result:(UPTEthSignerKeyPairCreationResult)result {
    BTCKey *keyPair = [[BTCKey alloc] init];
    [UPTEthSigner saveKey:keyPair.privateKey protectionLevel:protectionLevel result:result];
}


+ (NSMutableData*) compressedPublicKey:(EC_KEY *)key {
    if (!key) return nil;
    EC_KEY_set_conv_form(key, POINT_CONVERSION_COMPRESSED);
    int length = i2o_ECPublicKey(key, NULL);
    if (!length) return nil;
    NSAssert(length <= 65, @"Pubkey length must be up to 65 bytes.");
    NSMutableData* data = [[NSMutableData alloc] initWithLength:length];
    unsigned char* bytes = [data mutableBytes];
    if (i2o_ECPublicKey(key, &bytes) != length) return nil;
    return data;
}


+ (void)signTransaction:(NSString *)ethAddress data:(NSString *)payload userPrompt:(NSString*)userPromptText  result:(UPTEthSignerTransactionSigningResult)result {
    UPTEthKeychainProtectionLevel protectionLevel = [UPTEthSigner protectionLevelWithEthAddress:ethAddress];
    if ( protectionLevel == UPTEthKeychainProtectionLevelNotRecognized ) {
      NSError *protectionLevelError = [[NSError alloc] initWithDomain:@"UPTError" code:UPTSignerErrorCodeLevelParamNotRecognized.integerValue userInfo:@{@"message": [NSString stringWithFormat:@"protection level not found for eth address: signTransaction %@", ethAddress]}];
        result( nil, protectionLevelError);
        return;
    }

    BTCKey *key = [self keyPairWithEthAddress:ethAddress userPromptText:userPromptText protectionLevel:protectionLevel];
    if (key) {
        NSData *payloadData = [[NSData alloc] initWithBase64EncodedString:payload options:0];
        NSData *hash = [UPTEthSigner keccak256:payloadData];
        NSDictionary *signature = ethereumSignature(key, hash, NULL);
        result(signature, nil);
    } else {
        NSError *protectionLevelError = [[NSError alloc] initWithDomain:@"UPTError" code:UPTSignerErrorCodeLevelPrivateKeyNotFound.integerValue userInfo:@{@"message": @"private key not found for eth address"}];
        result( nil, protectionLevelError);
    }

}

+ (void)signJwt:(NSString *)ethAddress userPrompt:(NSString*)userPromptText data:(NSData *)payload result:(UPTEthSignerTransactionSigningResult)result {
    UPTEthKeychainProtectionLevel protectionLevel = [UPTEthSigner protectionLevelWithEthAddress:ethAddress];
    if ( protectionLevel == UPTEthKeychainProtectionLevelNotRecognized ) {
      NSError *protectionLevelError = [[NSError alloc] initWithDomain:@"UPTError" code:UPTSignerErrorCodeLevelParamNotRecognized.integerValue userInfo:@{@"message": [NSString stringWithFormat:@"protection level not found for eth address: signJwt %@", ethAddress]}];
        result( nil, protectionLevelError);
        return;
    }

    BTCKey *key = [self keyPairWithEthAddress:ethAddress userPromptText:userPromptText protectionLevel:protectionLevel];
    if (key) {
        NSData *hash = [payload SHA256];
        NSDictionary *signature = ethereumSignature(key, hash, NULL);
        result(signature, nil);
    } else {
        NSError *protectionLevelError = [[NSError alloc] initWithDomain:@"UPTError" code:UPTSignerErrorCodeLevelPrivateKeyNotFound.integerValue userInfo:@{@"message": @"private key not found for eth address"}];
        result( nil, protectionLevelError);
    }
}

+ (NSArray *)allAddresses {
    VALValet *addressKeystore = [UPTEthSigner ethAddressesKeystore];
    return [[addressKeystore allKeys] allObjects];
}


/// @description - saves the private key and requested protection level in the keychain
///              - private key converted to nsdata without base64 encryption
+ (void)saveKey:(NSData *)privateKey protectionLevel:(UPTEthKeychainProtectionLevel)protectionLevel result:(UPTEthSignerKeyPairCreationResult)result {
    BTCKey *keyPair = [[BTCKey alloc] initWithPrivateKey:privateKey];
    NSString *ethAddress = [UPTEthSigner ethAddressWithPublicKey:keyPair.publicKey];
    VALValet *privateKeystore = [UPTEthSigner privateKeystoreWithProtectionLevel:protectionLevel];
    NSString *privateKeyLookupKeyName = [UPTEthSigner privateKeyLookupKeyNameWithEthAddress:ethAddress];
    [privateKeystore setObject:keyPair.privateKey forKey:privateKeyLookupKeyName];
    [UPTEthSigner saveProtectionLevel:protectionLevel withEthAddress:ethAddress];
    [UPTEthSigner saveEthAddress:ethAddress];
    NSString *publicKeyString = [keyPair.publicKey base64EncodedStringWithOptions:0];
    result( ethAddress, publicKeyString, nil );
}

+ (void)deleteKey:(NSString *)ethAddress result:(UPTEthSignerDeleteKeyResult)result {
    UPTEthKeychainProtectionLevel protectionLevel = [UPTEthSigner protectionLevelWithEthAddress:ethAddress];
    if ( protectionLevel != UPTEthKeychainProtectionLevelNotRecognized ) {
        VALValet *privateKeystore = [UPTEthSigner privateKeystoreWithProtectionLevel:protectionLevel];
        [privateKeystore removeObjectForKey:ethAddress];
    }
  
    VALValet *protectionLevelsKeystore = [UPTEthSigner keystoreForProtectionLevels];
    [protectionLevelsKeystore removeObjectForKey:ethAddress];
  
    VALValet *addressKeystore = [UPTEthSigner ethAddressesKeystore];
    [addressKeystore removeObjectForKey:ethAddress];
  
    result( YES, nil );
}


+ (NSString *)ethAddressWithPublicKey:(NSData *)publicKey {
  NSData *strippedPublicKey = [publicKey subdataWithRange:NSMakeRange(1,[publicKey length]-1)];
  NSData *address = [[UPTEthSigner keccak256:strippedPublicKey] subdataWithRange:NSMakeRange(12, 20)];
  return [NSString stringWithFormat:@"0x%@", [address hex]];
}

#pragma mark - Private

+ (void)saveProtectionLevel:(UPTEthKeychainProtectionLevel)protectionLevel withEthAddress:(NSString *)ethAddress {
    VALValet *protectionLevelsKeystore = [UPTEthSigner keystoreForProtectionLevels];
    NSString *protectionLevelLookupKey = [UPTEthSigner protectionLevelLookupKeyNameWithEthAddress:ethAddress];
    NSString *keystoreCompatibleProtectionLevel = [UPTEthSigner keychainCompatibleProtectionLevel:protectionLevel];
    [protectionLevelsKeystore setString:keystoreCompatibleProtectionLevel forKey:protectionLevelLookupKey];
}

+ (UPTEthKeychainProtectionLevel)protectionLevelWithEthAddress:(NSString *)ethAddress {
    NSString *protectionLevelLookupKeyName = [UPTEthSigner protectionLevelLookupKeyNameWithEthAddress:ethAddress];
    VALValet *protectionLevelsKeystore = [UPTEthSigner keystoreForProtectionLevels];
    NSString *keychainSourcedProtectionLevel = [protectionLevelsKeystore stringForKey:protectionLevelLookupKeyName];
    if ( !keychainSourcedProtectionLevel ) {
        return UPTEthKeychainProtectionLevelNotRecognized;
    }
  
    return [UPTEthSigner protectionLevelFromKeychainSourcedProtectionLevel:keychainSourcedProtectionLevel];
}

+ (VALValet *)keystoreForProtectionLevels {
    return [[VALValet alloc] initWithIdentifier:UPTProtectionLevelIdentifier accessibility:VALAccessibilityAlways];
}

+ (NSString *)privateKeyLookupKeyNameWithEthAddress:(NSString *)ethAddress {
    return [NSString stringWithFormat:@"%@%@", UPTPrivateKeyLookupKeyNamePrefix, ethAddress];
}

+ (NSString *)protectionLevelLookupKeyNameWithEthAddress:(NSString *)ethAddress {
    return [NSString stringWithFormat:@"%@%@", UPTProtectionLevelLookupKeyNamePrefix, ethAddress];
}

+ (VALValet *)ethAddressesKeystore {
    return [[VALValet alloc] initWithIdentifier:UPTEthAddressIdentifier accessibility:VALAccessibilityAlways];
}

/// @return NSString a derived version of UPTEthKeychainProtectionLevel appropriate for keychain storage
+ (NSString *)keychainCompatibleProtectionLevel:(UPTEthKeychainProtectionLevel)protectionLevel {
    return @(protectionLevel).stringValue;
}

/// @param protectionLevel sourced from the keychain. Was originally created with +(NSString *)keychainCompatibleProtectionLevel:
+ (UPTEthKeychainProtectionLevel)protectionLevelFromKeychainSourcedProtectionLevel:(NSString *)protectionLevel {
    return (UPTEthKeychainProtectionLevel)protectionLevel.integerValue;
}

+ (NSSet *)addressesFromKeystore:(UPTEthKeychainProtectionLevel)protectionLevel {
    VALValet *keystore = [UPTEthSigner privateKeystoreWithProtectionLevel:protectionLevel];
    NSArray *keys = [[keystore allKeys] allObjects];
    NSMutableSet *addresses = [NSMutableSet new];
    for (NSString *key in keys) {
        NSString *ethAddress = [key substringFromIndex:UPTPrivateKeyLookupKeyNamePrefix.length];
        [addresses addObject:ethAddress];
    }

    return addresses;
}


+ (void)saveEthAddress:(NSString *)ethAddress {
    VALValet *addressKeystore = [UPTEthSigner ethAddressesKeystore];
    [addressKeystore setString:ethAddress forKey:ethAddress];
}

/// @param usePromptText the string to display to the user when requesting access to the secure enclave
/// @return private key as NSData
+ (NSData *)privateKeyWithEthAddress:(NSString *)ethAddress userPromptText:(NSString *)userPromptText protectionLevel:(UPTEthKeychainProtectionLevel)protectionLevel {
    VALValet *privateKeystore = [self privateKeystoreWithProtectionLevel:protectionLevel];
    NSString *privateKeyLookupKeyName = [UPTEthSigner privateKeyLookupKeyNameWithEthAddress:ethAddress];
    NSData *privateKey;
    switch ( protectionLevel ) {
        case UPTEthKeychainProtectionLevelNormal: {
            privateKey = [privateKeystore objectForKey:privateKeyLookupKeyName];
            break;
        }
        case UPTEthKeychainProtectionLevelICloud: {
            privateKey = [privateKeystore objectForKey:privateKeyLookupKeyName];
            break;
        }
        case UPTEthKeychainProtectionLevelPromptSecureEnclave: {
            privateKey = [(VALSecureEnclaveValet *)privateKeystore objectForKey:privateKeyLookupKeyName userPrompt:userPromptText];
            break;
        }
        case UPTEthKeychainProtectionLevelSinglePromptSecureEnclave: {
            privateKey = [(VALSinglePromptSecureEnclaveValet *)privateKeystore objectForKey:privateKeyLookupKeyName userPrompt:userPromptText];
            break;
        }
        case UPTEthKeychainProtectionLevelNotRecognized:
            // then it will return nil
            break;
        default:
            // then it will return nil
            break;
    }

    return privateKey;
}
/// @param usePromptText the string to display to the user when requesting access to the secure enclave
/// @return BTCKey
+ (BTCKey *)keyPairWithEthAddress:(NSString *)ethAddress userPromptText:(NSString *)userPromptText protectionLevel:(UPTEthKeychainProtectionLevel)protectionLevel {
  NSData *privateKey = [self privateKeyWithEthAddress:ethAddress userPromptText:userPromptText protectionLevel:protectionLevel];
  if (privateKey) {
    return [[BTCKey alloc] initWithPrivateKey:privateKey];
  } else {
    return nil;
  }
}

/// @param storageLevel indicates which private keystore to create and return
/// @return returns VALValet or valid subclass: VALSynchronizableValet, VALSecureEnclaveValet, VALSinglePromptSecureEnclaveValet
+ (VALValet *)privateKeystoreWithProtectionLevel:(UPTEthKeychainProtectionLevel)protectionLevel {
    VALValet *keystore;
    switch ( protectionLevel ) {
        case UPTEthKeychainProtectionLevelNormal: {
            keystore = [[VALValet alloc] initWithIdentifier:UPTPrivateKeyIdentifier accessibility:VALAccessibilityWhenUnlockedThisDeviceOnly];
            break;
        }
        case UPTEthKeychainProtectionLevelICloud: {
            keystore = [[VALSynchronizableValet alloc] initWithIdentifier:UPTPrivateKeyIdentifier accessibility:VALAccessibilityWhenUnlocked];
            break;
        }
        case UPTEthKeychainProtectionLevelPromptSecureEnclave: {
            keystore = [[VALSecureEnclaveValet alloc] initWithIdentifier:UPTPrivateKeyIdentifier accessControl:VALAccessControlUserPresence];
            break;
        }
        case UPTEthKeychainProtectionLevelSinglePromptSecureEnclave: {
            keystore = [[VALSinglePromptSecureEnclaveValet alloc] initWithIdentifier:UPTPrivateKeyIdentifier accessControl:VALAccessControlUserPresence];
            break;
        }
        case UPTEthKeychainProtectionLevelNotRecognized:
            // then it will return nil
            break;
        default:
            // then it will return nil
            break;
    }

    return keystore;
}

static int BTCRegenerateKey(EC_KEY *eckey, BIGNUM *priv_key) {
    BN_CTX *ctx = NULL;
    EC_POINT *pub_key = NULL;

    if (!eckey) return 0;

    const EC_GROUP *group = EC_KEY_get0_group(eckey);

    BOOL success = NO;
    if ((ctx = BN_CTX_new())) {
        if ((pub_key = EC_POINT_new(group))) {
            if (EC_POINT_mul(group, pub_key, priv_key, NULL, NULL, ctx)) {
                EC_KEY_set_private_key(eckey, priv_key);
                EC_KEY_set_public_key(eckey, pub_key);
                success = YES;
            }
        }
    }

    if (pub_key) EC_POINT_free(pub_key);
    if (ctx) BN_CTX_free(ctx);

    return success;
}

// Perform ECDSA key recovery (see SEC1 4.1.6) for curves over (mod p)-fields
// recid selects which key is recovered
// if check is non-zero, additional checks are performed
static int ECDSA_SIG_recover_key_GFp(EC_KEY *eckey, BIGNUM *r, BIGNUM *s, const unsigned char *msg, int msglen, int recid, int check) {
    if (!eckey) return 0;

    int ret = 0;
    BN_CTX *ctx = NULL;

    BIGNUM *x = NULL;
    BIGNUM *e = NULL;
    BIGNUM *order = NULL;
    BIGNUM *sor = NULL;
    BIGNUM *eor = NULL;
    BIGNUM *field = NULL;
    EC_POINT *R = NULL;
    EC_POINT *O = NULL;
    EC_POINT *Q = NULL;
    BIGNUM *rr = NULL;
    BIGNUM *zero = NULL;
    int n = 0;
    int i = recid / 2;

    const EC_GROUP *group = EC_KEY_get0_group(eckey);
    if ((ctx = BN_CTX_new()) == NULL) { ret = -1; goto err; }
    BN_CTX_start(ctx);
    order = BN_CTX_get(ctx);
    if (!EC_GROUP_get_order(group, order, ctx)) { ret = -2; goto err; }
    x = BN_CTX_get(ctx);
    if (!BN_copy(x, order)) { ret=-1; goto err; }
    if (!BN_mul_word(x, i)) { ret=-1; goto err; }
    if (!BN_add(x, x, r)) { ret=-1; goto err; }
    field = BN_CTX_get(ctx);
    if (!EC_GROUP_get_curve_GFp(group, field, NULL, NULL, ctx)) { ret=-2; goto err; }
    if (BN_cmp(x, field) >= 0) { ret=0; goto err; }
    if ((R = EC_POINT_new(group)) == NULL) { ret = -2; goto err; }
    if (!EC_POINT_set_compressed_coordinates_GFp(group, R, x, recid % 2, ctx)) { ret=0; goto err; }
    if (check) {
        if ((O = EC_POINT_new(group)) == NULL) { ret = -2; goto err; }
        if (!EC_POINT_mul(group, O, NULL, R, order, ctx)) { ret=-2; goto err; }
        if (!EC_POINT_is_at_infinity(group, O)) { ret = 0; goto err; }
    }
    if ((Q = EC_POINT_new(group)) == NULL) { ret = -2; goto err; }
    n = EC_GROUP_get_degree(group);
    e = BN_CTX_get(ctx);
    if (!BN_bin2bn(msg, msglen, e)) { ret=-1; goto err; }
    if (8*msglen > n) BN_rshift(e, e, 8-(n & 7));
    zero = BN_CTX_get(ctx);
    if (!BN_zero(zero)) { ret=-1; goto err; }
    if (!BN_mod_sub(e, zero, e, order, ctx)) { ret=-1; goto err; }
    rr = BN_CTX_get(ctx);
    if (!BN_mod_inverse(rr, r, order, ctx)) { ret=-1; goto err; }
    sor = BN_CTX_get(ctx);
    if (!BN_mod_mul(sor, s, rr, order, ctx)) { ret=-1; goto err; }
    eor = BN_CTX_get(ctx);
    if (!BN_mod_mul(eor, e, rr, order, ctx)) { ret=-1; goto err; }
    if (!EC_POINT_mul(group, Q, eor, R, sor, ctx)) { ret=-2; goto err; }
    if (!EC_KEY_set_public_key(eckey, Q)) { ret=-2; goto err; }

    ret = 1;

    err:
    if (ctx) {
        BN_CTX_end(ctx);
        BN_CTX_free(ctx);
    }
    if (R != NULL) EC_POINT_free(R);
    if (O != NULL) EC_POINT_free(O);
    if (Q != NULL) EC_POINT_free(Q);
    return ret;
}

@end
