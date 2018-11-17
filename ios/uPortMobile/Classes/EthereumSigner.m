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

#import "EthereumSigner.h"

#import "CoreBitcoin/CoreBitcoin+Categories.h"
#import "CoreBitcoin/BTCKey.h"
#include <openssl/bn.h>
#include <openssl/ec.h>
#include <openssl/obj_mac.h>

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

NSMutableData *compressedPublicKey(EC_KEY *key) {
  if (!key) return nil;
  EC_KEY_set_conv_form(key, POINT_CONVERSION_COMPRESSED);
  int length = i2o_ECPublicKey(key, NULL);
  if (!length) return nil;
  NSCAssert(length <= 65, @"Pubkey length must be up to 65 bytes.");
  NSMutableData* data = [[NSMutableData alloc] initWithLength:length];
  unsigned char* bytes = [data mutableBytes];
  if (i2o_ECPublicKey(key, &bytes) != length) return nil;
  return data;
}


NSDictionary *ethereumSignature(BTCKey *keypair, NSData *hash, NSData *chainId) {
  NSDictionary *sig = genericSignature(keypair, hash, YES);
  NSData *rData = (NSData *)sig[@"r"];
  NSData *sData = (NSData *)sig[@"s"];
  BN_ULONG base = 0x1b; // pre-EIP155
  if (chainId) {
    BIGNUM *v = BN_new(); BN_bin2bn(chainId.bytes, chainId.length, v);
    // TODO support longer chainIDs
    base = BN_get_word(v) * 2 + 35;
    BN_clear_free(v);
  }
  
  NSDictionary *signatureDictionary = @{ @"v": @(base + [sig[@"recoveryParam"] intValue]),
                                         @"r": [rData base64EncodedStringWithOptions:0],
                                         @"s":[sData base64EncodedStringWithOptions:0]};
  return signatureDictionary;
}


NSDictionary *genericSignature(BTCKey *keypair, NSData *hash, BOOL lowS) {
  NSMutableData *privateKey = [keypair privateKey];
  EC_KEY* key = EC_KEY_new_by_curve_name(NID_secp256k1);
  
  BIGNUM *bignum = BN_bin2bn(privateKey.bytes, (int)privateKey.length, BN_new());
  BTCRegenerateKey(key, bignum);
  
  
  const BIGNUM *privkeyBIGNUM = EC_KEY_get0_private_key(key);
  
  BTCMutableBigNumber* privkeyBN = [[BTCMutableBigNumber alloc] initWithBIGNUM:privkeyBIGNUM];
  BTCBigNumber* n = [BTCCurvePoint curveOrder];
  
  // I'm sure there is a better way of doing this
  const BIGNUM* zero = [[BTCBigNumber alloc] initWithInt32:0].BIGNUM;
  
  for (int iter = 0; true; iter++ ) {
    NSMutableData* kdata = [keypair signatureNonceForHash:hash];
    BTCMutableBigNumber* k = [[BTCMutableBigNumber alloc] initWithUnsignedBigEndian:kdata];
    
    if (BN_cmp(k.BIGNUM, zero) <= 0 && BN_cmp(k.BIGNUM, n.BIGNUM) >= 0) continue;
      
    [k mod:n]; // make sure k belongs to [0, n - 1]
  
    BTCDataClear(kdata);
  
    BTCCurvePoint* K = [[BTCCurvePoint generator] multiply:k];
    // K was infinity and does not work, redo it
    if ([K isInfinity]) continue;
    BTCBigNumber* Kx = K.x;
  
    BTCBigNumber* hashBN = [[BTCBigNumber alloc] initWithUnsignedBigEndian:hash];
  
    // Compute s = (k^-1)*(h + Kx*privkey)
  
    BTCBigNumber* signatureBN = [[[privkeyBN multiply:Kx] add:hashBN] multiply:[k inverseMod:n] mod:n];
  
    // Neither r nor s can be zero
    if ([Kx isZero] || [signatureBN isZero]) continue;
  
    BIGNUM *r = BN_new();
    BN_copy(r, Kx.BIGNUM);
    BIGNUM *s = BN_new();
    BN_copy(s, signatureBN.BIGNUM);
    uint8_t recoveryParam = BN_is_odd(K.y.BIGNUM) ? 1 : 0;
    
    BN_clear_free(bignum);
    BTCDataClear(privateKey);
    [privkeyBN clear];
    [k clear];
    [hashBN clear];
    [K clear];
    [Kx clear];
    [signatureBN clear];
    EC_KEY_free(key);

    BIGNUM *twiceS = BN_new();
    BN_add(twiceS, s, s);
    if (lowS && BN_cmp(twiceS, n.BIGNUM) > 0) {
      // enforce low S values, by negating the value (modulo the order) if above order/2.
      BN_sub(s, n.BIGNUM, s);
      recoveryParam ^= 1;
    }
    BN_clear_free(twiceS);

    NSMutableData* rData = [NSMutableData dataWithLength:32];
    NSMutableData* sData = [NSMutableData dataWithLength:32];
  
    BN_bn2bin(r,rData.mutableBytes);
    BN_bn2bin(s,sData.mutableBytes);
    
    BN_clear_free(r);
    BN_clear_free(s);
    return @{
             @"r": rData,
             @"s": sData,
             @"recoveryParam": @(recoveryParam)
             };
  }
  return @{};
}

NSData *simpleSignature(BTCKey *keypair, NSData *hash) {
  NSDictionary *sig = genericSignature(keypair, hash, NO);
  NSData *rData = (NSData *)sig[@"r"];
  NSData *sData = (NSData *)sig[@"s"];
  ///////
  NSMutableData *sigData = [NSMutableData dataWithLength:64];
  unsigned char* sigBytes = sigData.mutableBytes;
  memset(sigBytes, 0, 64);
  
  memcpy(sigBytes, rData.bytes, 32);
  memcpy(sigBytes+32, sData.bytes, 32);
  return sigData;
}
