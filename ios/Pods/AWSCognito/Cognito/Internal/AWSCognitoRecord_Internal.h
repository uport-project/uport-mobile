/**
 Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 */

#import "AWSCognitoRecord.h"

@interface AWSCognitoRecordMetadata()

@property (nonatomic, strong) NSDate *lastModified;

- (instancetype)initWithDictionary:(NSDictionary *)dictionary;

@end

@interface AWSCognitoRecord()

/**
 * Initializes a AWSCognitoRecord with the values from a dictionary.
 *
 * @param dictionary The dictionary must contain a mapping of NSStrings to NSStrings.
 */
- (instancetype)initWithDictionary:(NSDictionary *)dictionary;

/**
 * Returns a copy of the AWSCognitoRecord with the last written time updated to the current time and the version number set based on the dirty count.
 *
 */
- (AWSCognitoRecord *)copyForFlush;

@end

@interface AWSCognitoRecordValue()

@property (nonatomic, assign) AWSCognitoRecordValueType type;
@property (nonatomic, strong) NSObject *stringValue;


- (instancetype)initWithString:(NSString *)value
                          type:(AWSCognitoRecordValueType)type;

- (NSString *)toJsonString;
- (instancetype)initWithJson:(NSString *)json
                        type:(AWSCognitoRecordValueType)type;
@end