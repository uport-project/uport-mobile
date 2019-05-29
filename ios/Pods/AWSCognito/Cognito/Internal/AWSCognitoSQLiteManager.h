/**
 Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 */

#import <Foundation/Foundation.h>

@class AWSCognitoRecord;
@class AWSCognitoDatasetMetadata;

@interface AWSCognitoSQLiteManager : NSObject

@property (nonatomic, strong) NSString *identityId;
@property (nonatomic, strong) NSString *deviceId;


- (instancetype)initWithIdentityId:(NSString *)identityId deviceId:(NSString *)deviceId;
- (void)initializeDatasetTables:(NSString *) datasetName;
- (void)deleteAllData;
- (void)deleteSQLiteDatabase;

- (NSArray *)getDatasets:(NSError **)error;
- (void)loadDatasetMetadata:(AWSCognitoDatasetMetadata *)dataset error:(NSError **)error;
- (BOOL)putDatasetMetadata:(NSArray *)datasets error:(NSError **)error;
- (AWSCognitoRecord *)getRecordById:(NSString *)recordId datasetName:(NSString *)datasetName error:(NSError **)error;
- (BOOL)putRecord:(AWSCognitoRecord *)record datasetName:(NSString *)datasetName  error:(NSError **)error;
- (BOOL)flagRecordAsDeletedById:(NSString *)recordId datasetName:(NSString *)datasetName  error:(NSError **)error;
- (BOOL)deleteRecordById:(NSString *)recordId datasetName:(NSString *)datasetName error:(NSError **)error;
- (BOOL)deleteDataset:(NSString *)datasetName error:(NSError **)error;
- (BOOL)deleteMetadata:(NSString *)datasetName error:(NSError **)error;
- (BOOL)updateWithRemoteChanges:(NSString *)datasetName nonConflicts:(NSArray *)nonConflictRecords resolvedConflicts:(NSArray *)resolvedConflicts error:(NSError **)error;
- (BOOL)updateLocalRecordMetadata:(NSString *)datasetName records:(NSArray *)updatedRecords error:(NSError **)error;
- (BOOL)resetSyncCount:(NSString *)datasetName error:(NSError **)error;

- (NSNumber *) numRecords:(NSString *)datasetName;

- (NSArray *)getMergeDatasets:(NSString *)datasetName error:(NSError **)error;
- (BOOL)reparentDatasets:(NSString *)oldId withNewId:(NSString *)newId error:(NSError **)error;

- (NSArray *)allRecords:(NSString *)datasetName;
- (NSDictionary *)recordsUpdatedAfterLastSync:(NSString *)datasetName error:(NSError **)error;

- (NSNumber *)lastSyncCount:(NSString *)datasetName;
- (void)updateLastSyncCount:(NSString *)datasetName syncCount:(NSNumber *)syncCount lastModifiedBy:(NSString *)lastModifiedBy;

@end
