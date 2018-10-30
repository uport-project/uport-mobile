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

#import "UPTHDSigner.h"
#import "UPTHDSigner+Utils.h"

@implementation UPTHDSigner (Utils)

+ (NSArray<NSString *> *)wordsFromPhrase:(NSString *)phrase {
    NSArray<NSString *> *words = [phrase componentsSeparatedByCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    return [words filteredArrayUsingPredicate:[NSPredicate predicateWithFormat:@"SELF != ''"]];
}

+ (NSData*)randomEntropy {
    NSUInteger entropyCapacity = 128 / 8;
    NSMutableData* entropy = [NSMutableData dataWithCapacity:(128 / 8)];
    NSUInteger numBytes = entropyCapacity / 4;
    for( NSUInteger i = 0 ; i < numBytes; ++i ) {
        u_int32_t randomBits = arc4random();
        [entropy appendBytes:(void *)&randomBits length:4];
    }

    return entropy;
}

+ (UPTHDSignerProtectionLevel)enumStorageLevelWithStorageLevel:(NSString *)storageLevel {
    NSArray<NSString *> *storageLevels = @[ ReactNativeHDSignerProtectionLevelNormal,
            ReactNativeHDSignerProtectionLevelICloud,
            ReactNativeHDSignerProtectionLevelPromptSecureEnclave,
            ReactNativeHDSignerProtectionLevelSinglePromptSecureEnclave];
    return (UPTHDSignerProtectionLevel)[storageLevels indexOfObject:storageLevel];
}

+ (NSString *)base64StringWithURLEncodedBase64String:(NSString *)URLEncodedBase64String {
  NSMutableString *characterConverted = [[[URLEncodedBase64String stringByReplacingOccurrencesOfString:@"-" withString:@"+"] stringByReplacingOccurrencesOfString:@"_" withString:@"/"] mutableCopy];
  if ( characterConverted.length % 4 != 0 ) {
    NSUInteger numEquals = 4 - characterConverted.length % 4;
    NSString *equalsPadding = [@"" stringByPaddingToLength:numEquals withString: @"=" startingAtIndex:0];
    [characterConverted appendString:equalsPadding];
  }
  
  return characterConverted;
  
}

+ (NSString *)URLEncodedBase64StringWithBase64String:(NSString *)base64String {
  return [[[base64String stringByReplacingOccurrencesOfString:@"+" withString:@"-"] stringByReplacingOccurrencesOfString:@"/" withString:@"_"] stringByReplacingOccurrencesOfString:@"=" withString:@""];
}

@end
