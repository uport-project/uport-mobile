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

#import "UPTHDSignerReactNativeBridge.h"
#import "UPTHDSigner.h"
#import "UPTHDSigner+Utils.h"

@implementation UPTHDSignerReactNativeBridge

RCT_EXPORT_MODULE(NativeHDSignerModule);

RCT_EXPORT_METHOD(hasSeed:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([UPTHDSigner hasSeed]));
}

RCT_EXPORT_METHOD(listSeedAddresses:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  resolve([UPTHDSigner listSeedAddresses]);
}

RCT_EXPORT_METHOD(createSeed:(NSString *)protectionLevel resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    UPTHDSignerProtectionLevel enumStorageLevel = [UPTHDSigner enumStorageLevelWithStorageLevel:protectionLevel];
    if ( enumStorageLevel == UPTHDSignerProtectionLevelNotRecognized ) {
        reject( UPTHDSignerErrorCodeLevelParamNotRecognized, UPTHDSignerErrorCodeLevelParamNotRecognized, nil);
        return;
    }

    [UPTHDSigner createHDSeed:enumStorageLevel callback:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        if ( !error ) {
            resolve( @{ @"address": ethAddress, @"pubKey": publicKey } );
        } else {
            reject( @(error.code).stringValue , error.description, error );
        }
    }];
}

RCT_EXPORT_METHOD(addressForPath:(NSString *)rootAddress derivationPath:(NSString *)derivationPath prompt:(NSString *)prompt resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [UPTHDSigner computeAddressForPath:rootAddress derivationPath:derivationPath prompt:prompt callback:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        if ( !error ) {
            resolve( @{ @"address": ethAddress, @"pubKey": publicKey } );
        } else {
            reject( @(error.code).stringValue , error.description, error );
        }
    }];
}

RCT_EXPORT_METHOD(showSeed:(NSString *)rootAddress prompt:(NSString *)prompt resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [UPTHDSigner showSeed:rootAddress prompt:prompt callback:^(NSString *phrase, NSError *error) {
        if ( !error ) {
            resolve( phrase );
        } else {
            reject( @(error.code).stringValue , error.description, error );
        }
    }];
}

RCT_EXPORT_METHOD(importSeed:(NSString *)phrase level:(NSString *)protectionLevel resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    UPTHDSignerProtectionLevel enumStorageLevel = [UPTHDSigner enumStorageLevelWithStorageLevel:protectionLevel];
    if ( enumStorageLevel == UPTHDSignerProtectionLevelNotRecognized ) {
        reject( UPTHDSignerErrorCodeLevelParamNotRecognized, UPTHDSignerErrorCodeLevelParamNotRecognized, nil);
        return;
    }

    [UPTHDSigner importSeed:enumStorageLevel phrase:phrase callback:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        if ( !error ) {
            resolve( @{ @"address": ethAddress, @"pubKey": publicKey } );
        } else {
            reject( @(error.code).stringValue , error.description, error );
        }
    }];
}

RCT_EXPORT_METHOD(signTx:(NSString *)rootAddress derivationPath:(NSString *)derivationPath txPayload:(NSString *)txPayload prompt:(NSString *)prompt resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [UPTHDSigner signTransaction:rootAddress derivationPath:derivationPath txPayload:txPayload prompt:prompt callback:^(NSDictionary *signature, NSError *error) {
        if ( !error ) {
            resolve( signature );
        } else {
            reject( @(error.code).stringValue , error.description, error );
        }
    }];
}

RCT_EXPORT_METHOD(signJwt:(NSString *)rootAddress derivationPath:(NSString *)derivationPath data:(NSString *)data prompt:(NSString *)prompt resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [UPTHDSigner signJWT:rootAddress derivationPath:derivationPath data:data prompt:prompt callback:^(NSDictionary *signature, NSError *error) {
        if ( !error ) {
            resolve(signature);
        } else {
            reject( @(error.code).stringValue , error.description, error );
        }
    }];
}

RCT_EXPORT_METHOD(privateKeyForPath:(NSString *)rootAddress derivationPath:(NSString *)derivationPath prompt:(NSString *)prompt resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [UPTHDSigner privateKeyForPath:rootAddress derivationPath:derivationPath prompt:prompt callback:^(NSString *privateKeyBase64, NSError *error) {
        if ( !error ) {
            resolve( privateKeyBase64 );
        } else {
            reject( @(error.code).stringValue , error.description, error );
        }
    }];
}

RCT_EXPORT_METHOD(deleteSeed:(NSString *)phrase resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [UPTHDSigner deleteSeed:phrase callback:^(BOOL deleted, NSError *error) {
        if ( !error ) {
            //            resolve( [NSNumber numberWithBool:deleted] );
            resolve( nil );
        } else {
            NSString *errorCode = [NSString stringWithFormat:@"%@", @(error.code)];
            reject( errorCode, error.description, error);
        }
    }];
}

@end
