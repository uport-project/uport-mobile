//
//  LWCrypto.m
//  LightwalletMobile
//
//  Created by Pelle Braendgaard on 1/24/16.
//  Copyright © 2016 Consensys LLC. All rights reserved.
//

#import <Security/Security.h>
#import "LWCrypto.h"
#import "RCTConvert.h"
#import "RCTBridge.h"
#import "RCTUtils.h"

@implementation LWCrypto

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getRandomValues:(NSUInteger)length
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSMutableData* bytes = [NSMutableData dataWithLength:length];
  NSLog(@"getRandomValues");
  if (SecRandomCopyBytes(kSecRandomDefault, length, [bytes mutableBytes]) == 0) {
    NSString *randStr = [bytes base64EncodedStringWithOptions:0];
    resolve(randStr);
  } else {
    char *errmsg = strerror(errno);
    NSLog(@"getRandomValues Error was code: %d - message: %s", errno, errmsg);
    reject([NSNull init]);
//    reject([NSError errorWithDomain: @"LWCrypto" [NSString stringWithFormat: @"%s", errmsg]] ]);
  }

}

@end
