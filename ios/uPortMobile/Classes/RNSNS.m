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
#import <AWSCore/AWSCore.h>
#import <AWSCognito/AWSCognito.h>
#import <AWSSNS/AWSSNS.h>
#import "RNSNS.h"

@implementation RNSNS

RCT_EXPORT_MODULE();


RCT_EXPORT_METHOD(registerDevice:(NSString *)deviceToken address:(NSString *)address resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject){
  
  AWSCognitoCredentialsProvider *credentialsProvider = [[AWSCognitoCredentialsProvider alloc] initWithRegionType:AWSRegionUSWest2
                                                                                                  identityPoolId:@"us-west-2:0be7c308-3ff5-4e24-adab-604327d4c9d4"];
  AWSServiceConfiguration *configuration = [[AWSServiceConfiguration alloc] initWithRegion:AWSRegionUSWest2
                                                                       credentialsProvider:credentialsProvider];
  
  [AWSSNS registerSNSWithConfiguration:configuration forKey:@"USWest2SNS"];
  
  /* This is the code to actually register the device with Amazon SNS Mobile Push based on the token received */
  
  #ifdef DEBUG
    NSString * myArn = @"arn:aws:sns:us-west-2:113196216558:app/APNS_SANDBOX/uPort";
  #else
    NSString * myArn = @"arn:aws:sns:us-west-2:113196216558:app/APNS/uPort";
  #endif

  NSLog(@"SNS ARN: %@", myArn);
  
  AWSSNSCreatePlatformEndpointInput *platformEndpointRequest = [AWSSNSCreatePlatformEndpointInput new];
  platformEndpointRequest.customUserData = address;
  platformEndpointRequest.token = deviceToken;
  platformEndpointRequest.platformApplicationArn = myArn;
  
  AWSSNS *snsManager = [AWSSNS SNSForKey:@"USWest2SNS"];

  [[snsManager createPlatformEndpoint:platformEndpointRequest] continueWithBlock:^id(AWSTask *task) {
    
    if (task.error){
      NSString *errorMessage = task.error.userInfo[@"Message"];
      NSLog(@"SNS Registration Error: %@", errorMessage);
      if (errorMessage) {
        NSRange   searchedRange = NSMakeRange(0, [errorMessage length]);
        NSString *pattern = @"(arn:[^ ]+)";
        NSError  *error = nil;
        
        NSRegularExpression* regex = [NSRegularExpression regularExpressionWithPattern: pattern options:0 error:&error];
        NSTextCheckingResult *match = [regex firstMatchInString:errorMessage options:0 range: searchedRange];
        if ([match numberOfRanges] > 0) {
          NSString *endpointArn = [errorMessage substringWithRange:[match rangeAtIndex:1]];
          NSLog(@"EndpointARN: %@", endpointArn);
          
          AWSSNSSetEndpointAttributesInput *setEndpointAttributesRequest = [AWSSNSSetEndpointAttributesInput new];
          setEndpointAttributesRequest.attributes = @{
                                                      @"CustomUserData" : address,
                                                      @"Token" : deviceToken
                                                      };
          setEndpointAttributesRequest.endpointArn = endpointArn;
          [[snsManager setEndpointAttributes: setEndpointAttributesRequest] continueWithBlock:^id(AWSTask *task) {
             if (task.error){
               reject([NSString stringWithFormat:@"%ld",task.error.code], errorMessage, task.error);
             } else {
               resolve(endpointArn);
             }
            return nil;
          }];
          
          resolve(endpointArn);
          return nil;
        }
        reject([NSString stringWithFormat:@"%ld",task.error.code], errorMessage, task.error);
      } else {
        reject([NSString stringWithFormat:@"%ld",task.error.code], task.error.description, task.error);
      }
      return nil;
    }
    else {
      resolve(((AWSSNSCreateEndpointResponse *)task.result).endpointArn);
    }
    return nil;
  }];
}



@end
