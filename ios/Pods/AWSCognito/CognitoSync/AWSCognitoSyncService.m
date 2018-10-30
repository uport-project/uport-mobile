/*
 Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 */

#import "AWSCognitoSyncService.h"
#import <AWSCore/AWSNetworking.h>
#import <AWSCore/AWSCategory.h>
#import <AWSCore/AWSNetworking.h>
#import <AWSCore/AWSSignature.h>
#import <AWSCore/AWSService.h>
#import <AWSCore/AWSURLRequestSerialization.h>
#import <AWSCore/AWSURLResponseSerialization.h>
#import <AWSCore/AWSURLRequestRetryHandler.h>
#import <AWSCore/AWSSynchronizedMutableDictionary.h>
#import "AWSCognitoSyncResources.h"

@interface AWSCognitoSyncResponseSerializer : AWSJSONResponseSerializer

@end

@implementation AWSCognitoSyncResponseSerializer

#pragma mark - Service errors

static NSDictionary *errorCodeDictionary = nil;
+ (void)initialize {
    errorCodeDictionary = @{
                            @"IncompleteSignature" : @(AWSCognitoSyncErrorIncompleteSignature),
                            @"InvalidClientTokenId" : @(AWSCognitoSyncErrorInvalidClientTokenId),
                            @"MissingAuthenticationToken" : @(AWSCognitoSyncErrorMissingAuthenticationToken),
                            @"AlreadyStreamedException" : @(AWSCognitoSyncErrorAlreadyStreamed),
                            @"DuplicateRequestException" : @(AWSCognitoSyncErrorDuplicateRequest),
                            @"InternalErrorException" : @(AWSCognitoSyncErrorInternalError),
                            @"InvalidConfigurationException" : @(AWSCognitoSyncErrorInvalidConfiguration),
                            @"InvalidLambdaFunctionOutputException" : @(AWSCognitoSyncErrorInvalidLambdaFunctionOutput),
                            @"InvalidParameterException" : @(AWSCognitoSyncErrorInvalidParameter),
                            @"LambdaThrottledException" : @(AWSCognitoSyncErrorLambdaThrottled),
                            @"LimitExceededException" : @(AWSCognitoSyncErrorLimitExceeded),
                            @"NotAuthorizedErrorException" : @(AWSCognitoSyncErrorNotAuthorized),
                            @"ResourceConflictException" : @(AWSCognitoSyncErrorResourceConflict),
                            @"ResourceNotFoundException" : @(AWSCognitoSyncErrorResourceNotFound),
                            @"TooManyRequestsException" : @(AWSCognitoSyncErrorTooManyRequests),
                            };
}

- (id)responseObjectForResponse:(NSHTTPURLResponse *)response
                originalRequest:(NSURLRequest *)originalRequest
                 currentRequest:(NSURLRequest *)currentRequest
                           data:(id)data
                          error:(NSError *__autoreleasing *)error {
    id responseObject = [super responseObjectForResponse:response
                                         originalRequest:originalRequest
                                          currentRequest:currentRequest
                                                    data:data
                                                   error:error];
    if (!*error && [responseObject isKindOfClass:[NSDictionary class]]) {
        NSString *errorTypeStr = [[response allHeaderFields] objectForKey:@"x-amzn-ErrorType"];
        NSString *errorTypeHeader = [[errorTypeStr componentsSeparatedByString:@":"] firstObject];

        if ([errorTypeStr length] > 0 && errorTypeHeader) {
            if (errorCodeDictionary[errorTypeHeader]) {
                if (error) {
                    NSDictionary *userInfo = @{NSLocalizedDescriptionKey : [responseObject objectForKey:@"message"]?[responseObject objectForKey:@"message"]:[NSNull null], NSLocalizedFailureReasonErrorKey: errorTypeStr};
                    *error = [NSError errorWithDomain:AWSCognitoSyncErrorDomain
                                                 code:[[errorCodeDictionary objectForKey:errorTypeHeader] integerValue]
                                             userInfo:userInfo];
                }
                return responseObject;
            } else if (errorTypeHeader) {
                if (error) {
                    NSDictionary *userInfo = @{NSLocalizedDescriptionKey : [responseObject objectForKey:@"message"]?[responseObject objectForKey:@"message"]:[NSNull null], NSLocalizedFailureReasonErrorKey: errorTypeStr};
                    *error = [NSError errorWithDomain:AWSCognitoSyncErrorDomain
                                                 code:AWSCognitoSyncErrorUnknown
                                             userInfo:userInfo];
                }
                return responseObject;
            }
        }

        if (self.outputClass) {
            responseObject = [AWSMTLJSONAdapter modelOfClass:self.outputClass
                                       fromJSONDictionary:responseObject
                                                    error:error];
        }
    }

    return responseObject;
}

@end

@interface AWSCognitoSyncRequestRetryHandler : AWSURLRequestRetryHandler

@end

@implementation AWSCognitoSyncRequestRetryHandler

- (AWSNetworkingRetryType)shouldRetry:(uint32_t)currentRetryCount
                             response:(NSHTTPURLResponse *)response
                                 data:(NSData *)data
                                error:(NSError *)error {
    AWSNetworkingRetryType retryType = [super shouldRetry:currentRetryCount
                                                 response:response
                                                     data:data
                                                    error:error];
    if(retryType == AWSNetworkingRetryTypeShouldNotRetry
       && [error.domain isEqualToString:AWSCognitoSyncErrorDomain]
       && currentRetryCount < self.maxRetryCount) {
        switch (error.code) {
            case AWSCognitoSyncErrorIncompleteSignature:
            case AWSCognitoSyncErrorInvalidClientTokenId:
            case AWSCognitoSyncErrorMissingAuthenticationToken:
            retryType = AWSNetworkingRetryTypeShouldRefreshCredentialsAndRetry;
            break;

            default:
            break;
        }
    }

    return retryType;
}

@end

@interface AWSRequest()

@property (nonatomic, strong) AWSNetworkingRequest *internalRequest;

@end

@interface AWSCognitoSync()

@property (nonatomic, strong) AWSNetworking *networking;
@property (nonatomic, strong) AWSServiceConfiguration *configuration;

@end

@interface AWSServiceConfiguration()

@property (nonatomic, strong) AWSEndpoint *endpoint;

@end

@implementation AWSCognitoSync

static AWSSynchronizedMutableDictionary *_serviceClients = nil;

+ (instancetype)defaultCognitoSync {
    if (![AWSServiceManager defaultServiceManager].defaultServiceConfiguration) {
        return nil;
    }

    static AWSCognitoSync *_defaultCognitoSync = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
        _defaultCognitoSync = [[AWSCognitoSync alloc] initWithConfiguration:AWSServiceManager.defaultServiceManager.defaultServiceConfiguration];
#pragma clang diagnostic pop
    });

    return _defaultCognitoSync;
}

+ (void)registerCognitoSyncWithConfiguration:(AWSServiceConfiguration *)configuration forKey:(NSString *)key {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _serviceClients = [AWSSynchronizedMutableDictionary new];
    });
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    [_serviceClients setObject:[[AWSCognitoSync alloc] initWithConfiguration:configuration]
                        forKey:key];
#pragma clang diagnostic pop
}

+ (instancetype)CognitoSyncForKey:(NSString *)key {
    return [_serviceClients objectForKey:key];
}

+ (void)removeCognitoSyncForKey:(NSString *)key {
    [_serviceClients removeObjectForKey:key];
}

- (instancetype)init {
    @throw [NSException exceptionWithName:NSInternalInconsistencyException
                                   reason:@"`- init` is not a valid initializer. Use `+ defaultCognitoSync` or `+ CognitoSyncForKey:` instead."
                                 userInfo:nil];
    return nil;
}

- (instancetype)initWithConfiguration:(AWSServiceConfiguration *)configuration {
    if (self = [super init]) {
        _configuration = [configuration copy];

        _configuration.endpoint = [[AWSEndpoint alloc] initWithRegion:_configuration.regionType
                                                              service:AWSServiceCognitoService
                                                         useUnsafeURL:NO];

        AWSSignatureV4Signer *signer = [[AWSSignatureV4Signer alloc] initWithCredentialsProvider:_configuration.credentialsProvider
                                                                                        endpoint:_configuration.endpoint];
        AWSNetworkingRequestInterceptor *baseInterceptor = [[AWSNetworkingRequestInterceptor alloc] initWithUserAgent:_configuration.userAgent];
        _configuration.requestInterceptors = @[baseInterceptor, signer];

        _configuration.baseURL = _configuration.endpoint.URL;
        _configuration.requestSerializer = [AWSJSONRequestSerializer new];
        _configuration.retryHandler = [[AWSCognitoSyncRequestRetryHandler alloc] initWithMaximumRetryCount:_configuration.maxRetryCount];
        _configuration.headers = @{@"Host" : _configuration.endpoint.hostName,
                                   @"Content-Type" : @"application/x-amz-json-1.1"};

        _networking = [[AWSNetworking alloc] initWithConfiguration:_configuration];
    }

    return self;
}

- (AWSTask *)invokeRequest:(AWSRequest *)request
               HTTPMethod:(AWSHTTPMethod)HTTPMethod
                URLString:(NSString *) URLString
             targetPrefix:(NSString *)targetPrefix
            operationName:(NSString *)operationName
              outputClass:(Class)outputClass {
    if (!request) {
        request = [AWSRequest new];
    }

    AWSNetworkingRequest *networkingRequest = request.internalRequest;
    if (request) {
        networkingRequest.parameters = [[AWSMTLJSONAdapter JSONDictionaryFromModel:request] aws_removeNullValues];
    } else {
        networkingRequest.parameters = @{};
    }


    NSMutableDictionary *headers = [NSMutableDictionary new];

    networkingRequest.headers = headers;
    networkingRequest.HTTPMethod = HTTPMethod;
    networkingRequest.requestSerializer = [[AWSJSONRequestSerializer alloc] initWithJSONDefinition:[[AWSCognitoSyncResources sharedInstance] JSONObject]
                                                                                        actionName:operationName];
    networkingRequest.responseSerializer = [[AWSCognitoSyncResponseSerializer alloc] initWithJSONDefinition:[[AWSCognitoSyncResources sharedInstance] JSONObject]
                                                                                                     actionName:operationName
                                                                                                    outputClass:outputClass];
    return [self.networking sendRequest:networkingRequest];
}

#pragma mark - Service method

- (AWSTask *)bulkPublish:(AWSCognitoSyncBulkPublishRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodPOST
                     URLString:@"/identitypools/{IdentityPoolId}/bulkpublish"
                  targetPrefix:@""
                 operationName:@"BulkPublish"
                   outputClass:[AWSCognitoSyncBulkPublishResponse class]];
}

- (AWSTask *)deleteDataset:(AWSCognitoSyncDeleteDatasetRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodDELETE
                     URLString:@"/identitypools/{IdentityPoolId}/identities/{IdentityId}/datasets/{DatasetName}"
                  targetPrefix:@""
                 operationName:@"DeleteDataset"
                   outputClass:[AWSCognitoSyncDeleteDatasetResponse class]];
}

- (AWSTask *)describeDataset:(AWSCognitoSyncDescribeDatasetRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodGET
                     URLString:@"/identitypools/{IdentityPoolId}/identities/{IdentityId}/datasets/{DatasetName}"
                  targetPrefix:@""
                 operationName:@"DescribeDataset"
                   outputClass:[AWSCognitoSyncDescribeDatasetResponse class]];
}

- (AWSTask *)describeIdentityPoolUsage:(AWSCognitoSyncDescribeIdentityPoolUsageRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodGET
                     URLString:@"/identitypools/{IdentityPoolId}"
                  targetPrefix:@""
                 operationName:@"DescribeIdentityPoolUsage"
                   outputClass:[AWSCognitoSyncDescribeIdentityPoolUsageResponse class]];
}

- (AWSTask *)describeIdentityUsage:(AWSCognitoSyncDescribeIdentityUsageRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodGET
                     URLString:@"/identitypools/{IdentityPoolId}/identities/{IdentityId}"
                  targetPrefix:@""
                 operationName:@"DescribeIdentityUsage"
                   outputClass:[AWSCognitoSyncDescribeIdentityUsageResponse class]];
}

- (AWSTask *)getBulkPublishDetails:(AWSCognitoSyncGetBulkPublishDetailsRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodPOST
                     URLString:@"/identitypools/{IdentityPoolId}/getBulkPublishDetails"
                  targetPrefix:@""
                 operationName:@"GetBulkPublishDetails"
                   outputClass:[AWSCognitoSyncGetBulkPublishDetailsResponse class]];
}

- (AWSTask *)getCognitoEvents:(AWSCognitoSyncGetCognitoEventsRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodGET
                     URLString:@"/identitypools/{IdentityPoolId}/events"
                  targetPrefix:@""
                 operationName:@"GetCognitoEvents"
                   outputClass:[AWSCognitoSyncGetCognitoEventsResponse class]];
}

- (AWSTask *)getIdentityPoolConfiguration:(AWSCognitoSyncGetIdentityPoolConfigurationRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodGET
                     URLString:@"/identitypools/{IdentityPoolId}/configuration"
                  targetPrefix:@""
                 operationName:@"GetIdentityPoolConfiguration"
                   outputClass:[AWSCognitoSyncGetIdentityPoolConfigurationResponse class]];
}

- (AWSTask *)listDatasets:(AWSCognitoSyncListDatasetsRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodGET
                     URLString:@"/identitypools/{IdentityPoolId}/identities/{IdentityId}/datasets"
                  targetPrefix:@""
                 operationName:@"ListDatasets"
                   outputClass:[AWSCognitoSyncListDatasetsResponse class]];
}

- (AWSTask *)listIdentityPoolUsage:(AWSCognitoSyncListIdentityPoolUsageRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodGET
                     URLString:@"/identitypools"
                  targetPrefix:@""
                 operationName:@"ListIdentityPoolUsage"
                   outputClass:[AWSCognitoSyncListIdentityPoolUsageResponse class]];
}

- (AWSTask *)listRecords:(AWSCognitoSyncListRecordsRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodGET
                     URLString:@"/identitypools/{IdentityPoolId}/identities/{IdentityId}/datasets/{DatasetName}/records"
                  targetPrefix:@""
                 operationName:@"ListRecords"
                   outputClass:[AWSCognitoSyncListRecordsResponse class]];
}

- (AWSTask *)registerDevice:(AWSCognitoSyncRegisterDeviceRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodPOST
                     URLString:@"/identitypools/{IdentityPoolId}/identity/{IdentityId}/device"
                  targetPrefix:@""
                 operationName:@"RegisterDevice"
                   outputClass:[AWSCognitoSyncRegisterDeviceResponse class]];
}

- (AWSTask *)setCognitoEvents:(AWSCognitoSyncSetCognitoEventsRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodPOST
                     URLString:@"/identitypools/{IdentityPoolId}/events"
                  targetPrefix:@""
                 operationName:@"SetCognitoEvents"
                   outputClass:nil];
}

- (AWSTask *)setIdentityPoolConfiguration:(AWSCognitoSyncSetIdentityPoolConfigurationRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodPOST
                     URLString:@"/identitypools/{IdentityPoolId}/configuration"
                  targetPrefix:@""
                 operationName:@"SetIdentityPoolConfiguration"
                   outputClass:[AWSCognitoSyncSetIdentityPoolConfigurationResponse class]];
}

- (AWSTask *)subscribeToDataset:(AWSCognitoSyncSubscribeToDatasetRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodPOST
                     URLString:@"/identitypools/{IdentityPoolId}/identities/{IdentityId}/datasets/{DatasetName}/subscriptions/{DeviceId}"
                  targetPrefix:@""
                 operationName:@"SubscribeToDataset"
                   outputClass:[AWSCognitoSyncSubscribeToDatasetResponse class]];
}

- (AWSTask *)unsubscribeFromDataset:(AWSCognitoSyncUnsubscribeFromDatasetRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodDELETE
                     URLString:@"/identitypools/{IdentityPoolId}/identities/{IdentityId}/datasets/{DatasetName}/subscriptions/{DeviceId}"
                  targetPrefix:@""
                 operationName:@"UnsubscribeFromDataset"
                   outputClass:[AWSCognitoSyncUnsubscribeFromDatasetResponse class]];
}

- (AWSTask *)updateRecords:(AWSCognitoSyncUpdateRecordsRequest *)request {
    return [self invokeRequest:request
                    HTTPMethod:AWSHTTPMethodPOST
                     URLString:@"/identitypools/{IdentityPoolId}/identities/{IdentityId}/datasets/{DatasetName}"
                  targetPrefix:@""
                 operationName:@"UpdateRecords"
                   outputClass:[AWSCognitoSyncUpdateRecordsResponse class]];
}

@end