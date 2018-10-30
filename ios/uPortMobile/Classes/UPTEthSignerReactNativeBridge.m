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

#import "UPTEthSignerReactNativeBridge.h"
#import <CoreBitcoin/CoreBitcoin.h>
#import <CoreBitcoin/CoreBitcoin+Categories.h>
#import <CoreBitcoin/openssl/rand.h>
#import "UPTEthSigner.h"
#import "UPTEthSigner+Utils.h"

@implementation UPTEthSignerReactNativeBridge

RCT_EXPORT_MODULE(NativeSignerModule);

RCT_EXPORT_METHOD(createKeyPair:(NSString *)storageLevel resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    UPTEthKeychainProtectionLevel enumStorageLevel = [UPTEthSigner enumStorageLevelWithStorageLevel:storageLevel];
    if ( enumStorageLevel == UPTEthKeychainProtectionLevelNotRecognized ) {
        reject( UPTSignerErrorCodeLevelParamNotRecognized, UPTSignerErrorCodeLevelParamNotRecognized, nil);
        return;
    }

    [UPTEthSigner createKeyPairWithStorageLevel:enumStorageLevel result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        if ( !error ) {
            NSDictionary *payload = @{ @"address": ethAddress, @"pubKey": publicKey };
            resolve(payload);
        } else {
            NSString *errorCode = [NSString stringWithFormat:@"%@", @(error.code)];
            reject( errorCode, error.description, error);
        }
    }];
}

RCT_EXPORT_METHOD(importKey:(NSString *)privateKey protectionLevel:(NSString *)protectionLevel resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    UPTEthKeychainProtectionLevel enumStorageLevel = [UPTEthSigner enumStorageLevelWithStorageLevel:protectionLevel];
    if ( enumStorageLevel == UPTEthKeychainProtectionLevelNotRecognized ) {
        reject( UPTSignerErrorCodeLevelParamNotRecognized, UPTSignerErrorCodeLevelParamNotRecognized, nil);
        return;
    }

    NSData *privateKeyData = [[NSData alloc] initWithBase64EncodedString:privateKey options:NSDataBase64DecodingIgnoreUnknownCharacters];
    [UPTEthSigner saveKey:privateKeyData protectionLevel:enumStorageLevel result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        if ( !error ) {
            NSDictionary *payload = @{ @"address": ethAddress, @"pubKey": publicKey };
            resolve(payload);
        } else {
            NSString *errorCode = [NSString stringWithFormat:@"%@", @(error.code)];
            reject( errorCode, error.description, error);
        }
    }];
}

RCT_EXPORT_METHOD(signTx:(NSString *)ethAddress data:(NSString *)payload userPrompt:(NSString*)userPromptText resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    [UPTEthSigner signTransaction:ethAddress data:payload userPrompt:userPromptText result:^(NSDictionary *signature, NSError *error) {
        if ( !error ) {
            resolve(signature);
        } else {
            NSString *errorCode = [NSString stringWithFormat:@"%@", @(error.code)];
            reject( errorCode, error.description, error);
        }
    }];
}

RCT_EXPORT_METHOD(signJwt:(NSString *)ethAddress data:(NSString *)payload userPrompt:(NSString*)userPromptText resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    NSData *payloadData = [[NSData alloc] initWithBase64EncodedString:payload options:NSDataBase64DecodingIgnoreUnknownCharacters];
    [UPTEthSigner signJwt:ethAddress userPrompt:userPromptText data:payloadData result:^(NSDictionary *signature, NSError *error) {
        if ( !error ) {
            resolve(signature);
        } else {
            NSString *errorCode = [NSString stringWithFormat:@"%@", @(error.code)];
            reject( errorCode, error.description, error);
        }
    }];
}

RCT_EXPORT_METHOD(allAddresses: (RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
    NSArray *addresses = [UPTEthSigner allAddresses];
    if (addresses) {
        resolve(addresses);
    } else {
        resolve([NSArray new]);
    }
}

RCT_EXPORT_METHOD(deleteKey:(NSString *)ethAddress resolve:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    [UPTEthSigner deleteKey:ethAddress result:^(BOOL deleted, NSError *error) {
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
