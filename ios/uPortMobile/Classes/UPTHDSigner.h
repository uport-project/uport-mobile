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

#import <Foundation/Foundation.h>

typedef NS_ENUM( NSInteger, UPTHDSignerProtectionLevel ) {
  /// @description stores key via VALValet with VALAccessibilityWhenUnlockedThisDeviceOnly
  UPTHDSignerProtectionLevelNormal = 0,
  
  /// @description stores key via VALSynchronizableValet
  UPTHDSignerProtectionLevelICloud,
  
  /// @description stores key via VALSecureEnclaveValet
  UPTHDSignerProtectionLevelPromptSecureEnclave,
  
  /// @description stores key via VALSinglePromptSecureEnclaveValet
  UPTHDSignerProtectionLevelSinglePromptSecureEnclave,
  
  /// @description Indicates an invalid unrecognized storage level
  ///  Debug strategy:
  ///  1. confirm no typo on react native sender side,
  ///  2. confirm parity with android levels
  ///  3. maybe update string constants in this class
  UPTHDSignerProtectionLevelNotRecognized = NSNotFound
};

///
/// @description: these strings are the possible strings passed in from react native as indicated in clubhouse task 2565
///
FOUNDATION_EXPORT NSString *const ReactNativeHDSignerProtectionLevelNormal;
FOUNDATION_EXPORT NSString *const ReactNativeHDSignerProtectionLevelICloud;
FOUNDATION_EXPORT NSString *const ReactNativeHDSignerProtectionLevelPromptSecureEnclave;
FOUNDATION_EXPORT NSString *const ReactNativeHDSignerProtectionLevelSinglePromptSecureEnclave;


/// @param ethAddress    an Ethereum adderss with prefix '0x'. May be nil if error occured
/// @param publicKey    a base 64 encoded representation of the NSData public key. Note: encoded with no line
///                     breaks. May be nil if error occured.
/// @param error        non-nil only if an error occured
typedef void (^UPTHDSignerSeedCreationResult)(NSString *ethAddress, NSString *publicKey, NSError *error);

/// @param  phrase      12 space delimited words
typedef void (^UPTHDSignerSeedPhraseResult)(NSString *phrase, NSError *error);

typedef void (^UPTHDSignerTransactionSigningResult)(NSDictionary *signature, NSError *error);
typedef void (^UPTHDSignerJWTSigningResult)(NSDictionary *signature, NSError *error);

/// param privateKey is a base64 string
typedef void (^UPTHDSignerPrivateKeyResult)(NSString *privateKeyBase64, NSError *error);

typedef void (^UPTEthSignerDeleteSeedResult)(BOOL deleted, NSError *error);

FOUNDATION_EXPORT NSString * const UPTHDSignerErrorCodeLevelParamNotRecognized;
FOUNDATION_EXPORT NSString * const UPTHDSignerErrorCodeLevelPrivateKeyNotFound;

FOUNDATION_EXPORT NSString * const UPORT_ROOT_DERIVATION_PATH;

@interface UPTHDSigner : NSObject

+ (BOOL)hasSeed;

+ (NSArray *)listSeedAddresses;

/// @param  callback contains phrase
+ (void)showSeed:(NSString *)rootAddress prompt:(NSString *)prompt callback:(UPTHDSignerSeedPhraseResult)callback;


/// @param  callback     a root account Ethereum address and root account public key
+ (void)createHDSeed:(UPTHDSignerProtectionLevel)protectionLevel callback:(UPTHDSignerSeedCreationResult)callback;

/// @param  callback     a root account Ethereum address and root account public key
+ (void)importSeed:(UPTHDSignerProtectionLevel)protectionLevel phrase:(NSString *)phrase callback:(UPTHDSignerSeedCreationResult)callback;

/// @param  address     a root account Ethereum address
/// @param  callback    the derived Ethereum address and derived public key
+ (void)computeAddressForPath:(NSString *)address derivationPath:(NSString *)derivationPath prompt:(NSString *)prompt callback:(UPTHDSignerSeedCreationResult)callback;


/// @param  address     a root account Ethereum address
+ (void)signTransaction:(NSString *)ethereumAddress derivationPath:(NSString *)derivationPath txPayload:(NSString *)txPayload prompt:(NSString *)prompt callback:(UPTHDSignerTransactionSigningResult)callback;

/// @param  address     a root account Ethereum address
+ (void)signJWT:(NSString *)ethereumAddress derivationPath:(NSString *)derivationPath data:(NSString *)data prompt:(NSString *)prompt callback:(UPTHDSignerJWTSigningResult)callback;

/// @param rootAddress  a root account Ethereum address
+ (void)privateKeyForPath:(NSString *)rootAddress derivationPath:(NSString *)derivationPath prompt:(NSString *)prompt callback:(UPTHDSignerPrivateKeyResult)callback;

+ (void)deleteSeed:(NSString *)phrase callback:(UPTEthSignerDeleteSeedResult)callback;

@end
