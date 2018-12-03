//
//  SignerTests.m
//  uPortMobileTests
//
//  Created by josh on 10/23/17.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import <XCTest/XCTest.h>
#import "UPTEthSigner.h"
#import "UPTEthSigner+Utils.h"
#import <CoreBitcoin/CoreBitcoin.h>
#import <CoreBitcoin/CoreBitcoin+Categories.h>

@interface SignerTests : XCTestCase

@end

@implementation SignerTests

- (void)testDeleteKey {
    NSString *referencePrivateKey = @"5047c789919e943c559d8c134091d47b4642122ba0111dfa842ef6edefb48f38";
    NSData *privateKeyData = [UPTEthSigner dataFromHexString:referencePrivateKey];
    [UPTEthSigner saveKey:privateKeyData protectionLevel:UPTEthKeychainProtectionLevelNormal result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        XCTAssertNil(error);
        [UPTEthSigner deleteKey:ethAddress result:^(BOOL deleted, NSError *error) {
            XCTAssertTrue(deleted);
            XCTAssertNil(error);
        }];
    }];
  
}

- (void)testKeyCreation {
    XCTestExpectation *kpExpectations = [self expectationWithDescription:@"finished testKeyCreation"];
    [UPTEthSigner createKeyPairWithStorageLevel:UPTEthKeychainProtectionLevelPromptSecureEnclave result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        XCTAssertNil(error, @"error creating key pair %@", error);
        NSLog( @"eth address: %@ . for public key: %@", ethAddress, publicKey );
        [kpExpectations fulfill];
    }];
    [self waitForExpectationsWithTimeout:1 handler:^(NSError *error) {
      NSLog(@"error running tests : %@", error);
    }];
}

/// @description this is a completely synchronous functino even though the callback in the for loop looks ansyc
- (void)testAllAddresses {
    NSInteger lastProtectionLevel = (NSInteger)UPTEthKeychainProtectionLevelSinglePromptSecureEnclave;
    for ( NSInteger i = 0; i <= lastProtectionLevel; ++i ) {
        [UPTEthSigner createKeyPairWithStorageLevel:(UPTEthKeychainProtectionLevel)i result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
            XCTAssertNil(error, @"error creating key pair %@", error);
            NSLog( @"eth address: %@ . for public key: %@", ethAddress, publicKey );
        }];
    }

    NSArray *allAddresses = [UPTEthSigner allAddresses];
    XCTAssertGreaterThan(allAddresses.count, lastProtectionLevel, @"allAddresses returned no data, should return at least 4 keys");
    NSLog( @"allAddresses -> %@", allAddresses);
}

- (void)testBTCLibraryKeyDataFidelity {
    NSData *privateKey = [BTCKey new].privateKey;
    NSString *privateKeyString = [[NSString alloc] initWithData:privateKey encoding:NSUTF8StringEncoding];
    BTCKey *keyCopy = [[BTCKey alloc] initWithPrivateKey:privateKey];
    NSString *keyCopyString = [[NSString alloc] initWithData:keyCopy.privateKey encoding:NSUTF8StringEncoding];
    XCTAssertEqualObjects(privateKey, keyCopy.privateKey);
    XCTAssertEqualObjects(privateKeyString, keyCopyString);
}

- (void)testPrivateKeyRecreation {
    NSString *referencePrivateKey = @"5047c789919e943c559d8c134091d47b4642122ba0111dfa842ef6edefb48f38"; // hex string
    NSData *privateKeyData32Bytes = [UPTEthSigner dataFromHexString:referencePrivateKey];
    NSLog( @"private key data from hex strin has num bytes -> %@", @(privateKeyData32Bytes.length));

    BTCKey *keyPair = [[BTCKey alloc] initWithPrivateKey:privateKeyData32Bytes];
    XCTAssertEqualObjects(privateKeyData32Bytes, keyPair.privateKey, @"private data keys dont match" );
  
    NSString *referencePublicKey = @"04bf42759e6d2a684ef64a8210c55bf2308e4101f78959ffa335ff045ef1e4252b1c09710281f8971b39efed7bfb61ae381ed73b9faa5a96f17e00c1a4c32796b1";
    NSString *hexPublicKeyRecreation = [UPTEthSigner hexStringWithDataKey:keyPair.publicKey];
    XCTAssertEqualObjects(hexPublicKeyRecreation, referencePublicKey, @"public key error" );
  
    NSString *hexPrivateKeyRecreation = [UPTEthSigner hexStringWithDataKey:keyPair.privateKey];
    NSLog( @"privatekey reference: %@ and generated privateKey: %@", referencePrivateKey, hexPrivateKeyRecreation);
    XCTAssertEqualObjects(referencePrivateKey, hexPrivateKeyRecreation, @"hex did not work right");
}

- (void)testPublicKeyRecreation {
    NSString *referencePublicKey = @"04bf42759e6d2a684ef64a8210c55bf2308e4101f78959ffa335ff045ef1e4252b1c09710281f8971b39efed7bfb61ae381ed73b9faa5a96f17e00c1a4c32796b1";
    NSData *publicKeyDataBytes = [UPTEthSigner dataFromHexString:referencePublicKey];
    NSLog( @"public key data from hex strin has num bytes -> %@", @(publicKeyDataBytes.length));

    BTCKey *keyPair = [[BTCKey alloc] initWithPublicKey:publicKeyDataBytes];
    XCTAssertEqualObjects(publicKeyDataBytes, keyPair.publicKey);

    NSString *hexPublicKeyRecreation = [UPTEthSigner hexStringWithDataKey:keyPair.publicKey];
    NSLog( @"public key reference : %@ and generated public key : %@", referencePublicKey, hexPublicKeyRecreation );
    XCTAssertEqualObjects(referencePublicKey, hexPublicKeyRecreation, @"hex public keys did not match");
}

- (void)testSavingKey {
    XCTestExpectation *kpExpectations = [self expectationWithDescription:@"finished keypair"];
    NSString *referencePrivateKey = @"5047c789919e943c559d8c134091d47b4642122ba0111dfa842ef6edefb48f38";
    NSString *referencePublicKey = @"BL9CdZ5tKmhO9kqCEMVb8jCOQQH3iVn/ozX/BF7x5CUrHAlxAoH4lxs57+17+2GuOB7XO5+qWpbxfgDBpMMnlrE=";
    NSString *referenceEthAddress = @"0x45c4EBd7Ffb86891BA6f9F68452F9F0815AAcD8b".lowercaseString;
    NSData *privateKeyData32Bytes = [UPTEthSigner dataFromHexString:referencePrivateKey];
    [UPTEthSigner saveKey:privateKeyData32Bytes protectionLevel:UPTEthKeychainProtectionLevelPromptSecureEnclave result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        NSLog( @"testSavingKey, created public key is -> %@ and the eth address is %@", publicKey, ethAddress);
        XCTAssertNil( error, @"error saving private key: %@", error );
        XCTAssertEqualObjects( referencePublicKey, publicKey, @"public keys did not match" );
        XCTAssertEqualObjects( referenceEthAddress, ethAddress, @"eth address did not match reference" );
        [kpExpectations fulfill];
    }];
    [self waitForExpectationsWithTimeout:1 handler:^(NSError *error) {
      NSLog(@"error running tests : %@", error);
    }];
}

- (void)testSignTxPlain {
    XCTestExpectation *kpExpectations = [self expectationWithDescription:@"finished keypair"];
    NSString *referencePrivateKey = @"NobiRYkMf5l3Zrc6Idjln2OF4SCIMa84YldHkMvD0Vg=";
    NSString *referenceEthAddress = @"0x7f2d6bb19b6a52698725f4a292e985c51cefc315";
    NSString *rawTransaction = @"84CFC6Q7dACDL+/YlJ4gaMziLeTh6A8Vy3HvQ1ogo7N8iA3gtrOnZAAAiQq83vASNFZ4kA==";
    int vReference = 28;
    NSString *rReference = @"gJ47XvJfSjsDkTni+3D3C2NuuonHejsB4MccGjbYQSY=";
    NSString *sReference = @"OFJN/NPkEstrw39FlLutEEtnZLsUxk5CxplzAQbRiFo=";

    NSData *privateKeyData32Bytes = [[NSData alloc] initWithBase64EncodedString:referencePrivateKey options:0];
    NSLog(@"private key data: %@", privateKeyData32Bytes);
    [UPTEthSigner saveKey:privateKeyData32Bytes protectionLevel:UPTEthKeychainProtectionLevelPromptSecureEnclave result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        NSLog(@"testSavingKey, created public key is -> %@ and the eth address is %@", publicKey, ethAddress);
        XCTAssertNil(error, @"error saving private key: %@", error);
        XCTAssertEqualObjects(ethAddress, referenceEthAddress, @"eth addresses did not match");
    }];

    [UPTEthSigner signTransaction:referenceEthAddress data:rawTransaction userPrompt:@"signing test" result:^(NSDictionary *signature, NSError *error) {
        if ( !error ) {
            NSLog(@"signature: %@", signature);
          XCTAssertEqualObjects(signature[@"r"], rReference, @"signature r value did not match");
          XCTAssertEqualObjects(signature[@"s"], sReference, @"signature s value did not match");
          XCTAssertEqualObjects(signature[@"v"], @(vReference), @"signature v value did not match");
        } else {
            NSLog(@"error signing transaction : %@", error);
        }
        [kpExpectations fulfill];
    }];
  [self waitForExpectationsWithTimeout:1 handler:^(NSError *error) {
    NSLog(@"error running tests : %@", error);
  }];
}

- (void)testSignJwt {
  XCTestExpectation *kpExpectations = [self expectationWithDescription:@"finished keypair"];
//  NSLog(@"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< JWT:");
    NSString *referencePrivateKey = @"278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f";
    NSString *referenceAddress = @"0xf3beac30c498d9e26865f34fcaa57dbb935b0d74";
    NSData *privateKeyData32Bytes = [UPTEthSigner dataFromHexString:referencePrivateKey];
//    NSLog( @"privateKeyDAta testSsignJwt length -> %@", @(privateKeyData32Bytes.length));
    [UPTEthSigner saveKey:privateKeyData32Bytes protectionLevel:UPTEthKeychainProtectionLevelNormal result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        NSLog(@"testSavingKey, created public key is -> %@ and the eth address is %@", publicKey, ethAddress);
        XCTAssertNil(error, @"error saving private key: %@", error);
        XCTAssertEqualObjects(ethAddress, referenceAddress, @"eth addresses did not match");
    }];
  NSArray *referenceData = @[
   @{ @"encoded": @"ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3NpZlEuZXlKcGMzTWlPaUl6TkhkcWMzaDNkbVIxWVc1dk4wNUdRemgxYWs1S2JrWnFZbUZqWjFsbFYwRTRiU0lzSW1saGRDSTZNVFE0TlRNeU1URXpNeXdpWTJ4aGFXMXpJanA3SW01aGJXVWlPaUpDYjJJaWZTd2laWGh3SWpveE5EZzFOREEzTlRNemZR",
   @"decoded": @"eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIzNHdqc3h3dmR1YW5vN05GQzh1ak5KbkZqYmFjZ1llV0E4bSIsImlhdCI6MTQ4NTMyMTEzMywiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiZXhwIjoxNDg1NDA3NTMzfQ",
   @"hex": @"65794a30655841694f694a4b563151694c434a68624763694f694a46557a49314e6b736966512e65794a7063334d694f69497a4e48647163336833646d5231595735764e303547517a6831616b354b626b5a71596d466a5a316c6c5630453462534973496d6c68644349364d5451344e544d794d54457a4d797769593278686157317a496a7037496d3568625755694f694a4362324969665377695a586877496a6f784e4467314e4441334e544d7a6651",
    @"r":@"sg1oJ7J/f2pWaX2JwqzA61oWMUK5v0LYVxUp3PvG7Y0=",
    @"s":@"uQlWFj8kOlIQO1PXeMNzcu+JO68jGlM+xJ+UUi+Kcl4=",
    @"v":@1
  },
   @{ @"encoded": @"ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3NpZlEuZXlKcGMzTWlPaUl6TkhkcWMzaDNkbVIxWVc1dk4wNUdRemgxYWs1S2JrWnFZbUZqWjFsbFYwRTRiU0lzSW1saGRDSTZNVFE0TlRNeU1URXpNekF3TUN3aVkyeGhhVzF6SWpwN0ltNWhiV1VpT2lKQ2IySWlmU3dpWlhod0lqb3hORGcxTkRBM05UTXpNREF3ZlE=",
      @"decoded": @"eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIzNHdqc3h3dmR1YW5vN05GQzh1ak5KbkZqYmFjZ1llV0E4bSIsImlhdCI6MTQ4NTMyMTEzMzAwMCwiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiZXhwIjoxNDg1NDA3NTMzMDAwfQ",
      @"hex": @"65794a30655841694f694a4b563151694c434a68624763694f694a46557a49314e6b736966512e65794a7063334d694f69497a4e48647163336833646d5231595735764e303547517a6831616b354b626b5a71596d466a5a316c6c5630453462534973496d6c68644349364d5451344e544d794d54457a4d7a41774d437769593278686157317a496a7037496d3568625755694f694a4362324969665377695a586877496a6f784e4467314e4441334e544d7a4d4441776651",
      @"r":@"XJlwY1KrGRa53oHjz6vjsJadn+Er1ZW6WvLg1KiBQok=",
      @"s":@"1fb8Kmp/oQL5+LTRYe6smTMcWt8cju8Dexjbs+v1CeU=",
      @"v":@0
  },
   @{ @"encoded": @"ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3NpZlEuZXlKcGMzTWlPaUl6TkhkcWMzaDNkbVIxWVc1dk4wNUdRemgxYWs1S2JrWnFZbUZqWjFsbFYwRTRiU0lzSW1saGRDSTZNVFE0TlRNeU1URXpNeXdpWTJ4aGFXMXpJanA3SW01aGJXVWlPaUpDYjJJaWZTd2laWGh3SWpveU5EZzFNekl4TVRNemZR",
      @"decoded": @"eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3MiOiIzNHdqc3h3dmR1YW5vN05GQzh1ak5KbkZqYmFjZ1llV0E4bSIsImlhdCI6MTQ4NTMyMTEzMywiY2xhaW1zIjp7Im5hbWUiOiJCb2IifSwiZXhwIjoyNDg1MzIxMTMzfQ",
      @"hex": @"65794a30655841694f694a4b563151694c434a68624763694f694a46557a49314e6b736966512e65794a7063334d694f69497a4e48647163336833646d5231595735764e303547517a6831616b354b626b5a71596d466a5a316c6c5630453462534973496d6c68644349364d5451344e544d794d54457a4d797769593278686157317a496a7037496d3568625755694f694a4362324969665377695a586877496a6f794e4467314d7a49784d544d7a6651",
      @"r":@"yHkI8fY42iquI+3CSM0k75cJQ4X1DoiGV436YgFQIhI=",
      @"s":@"VL4zte6tNSoSb9o174gkK7LWHuzGaZiROEsU7wqAtak=",
      @"v":@1
 }
];
  kpExpectations.expectedFulfillmentCount = [referenceData count];
  
  [referenceData enumerateObjectsUsingBlock: ^(NSDictionary *example, NSUInteger idx, BOOL *stop) {
//    NSLog(@"-------------------------------------------------------------------");
//    NSLog(@"encoded payload: %@", example[@"encoded"]);
    NSData *payload = [[NSData alloc] initWithBase64EncodedString:example[@"encoded"] options:0];
//    NSLog(@"decoded payload: %@", payloadString);
    [UPTEthSigner signJwt:referenceAddress userPrompt:@"test signing data" data:payload result:^(NSDictionary *signature, NSError *error) {
      
      XCTAssertEqualObjects(signature[@"v"], example[@"v"], @"signature v value did not match");
      XCTAssertEqualObjects(signature[@"s"], example[@"s"], @"signature s value did not match");
      XCTAssertEqualObjects(signature[@"r"], example[@"r"], @"signature r value did not match");
      [kpExpectations fulfill];
    }];
  }];
  [self waitForExpectationsWithTimeout:1 handler:^(NSError *error) {
    NSLog(@"error running tests : %@", error);
  }];
//  NSLog(@"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< FINISH:");
}

static inline NSArray *referenceKeyPairs() {
  return @[
 @{@"privateKey":@"4e1559a4ec4dff8e2369635fc936fce9281d3044f49b8acaacd935041b6ae785",@"publicKey":@"04971cbb0c73cc0a9c6d659a4eb772120f7c39bf7a9ecb69c1fc2af2a3088bf1e18d56aea43080dcc4b5153e587f9817951edbbba9f955c2fc56337338ca908aac",@"address":@"0xf34e6ddffedec32f759641552634f8b0df9c66a8",@"jwtsig":@"3Br7BEdZwSaX8wNBxBnJvDWDwlfjPhtP3LSR95J7p4QpZ_bhqXIIJIkZdU29a7F-A9CQRkTPVUGCWvGHJ2VUDA",@"txsig":
               @{@"v":@27,@"r":@"TiyBsT+rragKtEbyeu5j0s3UBd1Mg1PhauWcz18FqR4=",@"s":@"H636/N3+JGbF8Vl6z/CjasA5H1glEWD8JYD+UOT8zn0="
                 }
             },
           @{@"privateKey":@"25692381beee3b4e85f2acf66ada03b10672db2113f91f9df94e90cce5d5a1ad",@"publicKey":@"04870a5b9ea009b4ad9eb2b40eb87c441bba3a14413fcf56d2ac4be5a954b39fec08368fa2e188fe6bc3c14cd14ed83e83de8d1e8475b3e3589a7d2718ae27cd73",@"address":@"0xa998c6074b5cc04fcd775303e0f9a61ca535f35e",@"jwtsig":@"2AqNpkt89PyW0mfg80sJZ5EpVVrVS88iAX-VvbWvJIhWXD3o45-9cDl_PxDJaRGYUMQXpNrji4dPLO2rQO8MJQ",@"txsig":
               @{@"v":@27,@"r":@"PTsUW/G8/e0ABwXIVZA/XHM4JDDQfLSCst6+MY49IjY=",@"s":@"IVxIsAt0Xn2Boc0j6V8uods+wZtH7LlwBbtpKQkVhfM="
                 }
             },
           @{@"privateKey":@"95b44703405c3a9a2dc24502d22681437390b6b5366548003a4cce8c0f0fe146",@"publicKey":@"04a7b872b976fbae0798b00b0a32b24a4bf74068bb2c9c949f87816faac2112721794b334baba378ed46c834238a4443f23a4eeb15fba332af6424ef31a00d229d",@"address":@"0x7824fa28d444c250c0902fefd6c832fa88972db2",@"jwtsig":@"-wYyGYTgY_gSZGwwHg2pdu18qiqMtFh9x4nFPfCdaGhTb_GniZbo6GUb0xs1YvO0pO-fFuq4r5YUYcjbrAmbTA",@"txsig":
               @{@"v":@27,@"r":@"Y61Qgg1DNwJj7dcdtdvnfpmiz+2URlBo+UIBxJV5Vrw=",@"s":@"Ps4RL61fyom6akVXi65JaYeQnATMcKgrjmS5W8IKV3Q="
                 }
             },
           @{@"privateKey":@"efdd115c0ca8f5501ec03a2c4210343294956c898cd1fa4bae80d3ecc52b23db",@"publicKey":@"042f578053fbb8b4dc587fa9a795bc60b5ba7d08e835f37f49cb34664cc32705f23577dfee6bb7d6a19d9998b373465bc7c0d9185d1d66770a74f53b1ff42297b7",@"address":@"0x8ac0e83a1b492bbdfd0da7a1048351a5b066249b",@"jwtsig":@"fcjKhN9m2HagKPb8fh5sMsldOt-GXt4GlfRiIDnhFIvOuWQVhVJyBbrkRbN8SmoeQ2mNkBhHm1PhT3DHWzEorA",@"txsig":
               @{@"v":@28,@"r":@"y/u9o/qFhlFotjrSga+6MrTnilx+2kKGkV6f5SFAPUU=",@"s":@"HTxXWcd+RgBLzBPTqulW9FbPFdZUarRSLyszyPRVTqM="
                 }
             },
           @{@"privateKey":@"6a5e632c21700b25a99b391ae4ef034e08a7a192914d38b4655dd9058fe498df",@"publicKey":@"044b5d602119fe293fe75d89aceee3ad7623b159c61e0eb6837d52981ea143e363eb0604a09b62eefec9f29b14ef9d5199266773e5f316d34ede019c16357f75c3",@"address":@"0xfb643e22564cb6cfdf7677a610348c172b83bc7b",@"jwtsig":@"CxVQYUF_9radbcDNFCbg3142xZ6YRnlc3c6bVUX3diyzVmQzXL_gLdw-AeryZF3AyOlkf17TOXYS3pIXoW48TA",@"txsig":
               @{@"v":@28,@"r":@"PzXkY4KKSA9UTquF5S6W+FzE9jKeIGOXdWoawhfDMHY=",@"s":@"Xs7uQ5tp0djko4Hcq61SaEDYS+w2/HRuiuBNXw0ydBM="
                 }
             },
           @{@"privateKey":@"f93330497fe0d36e8e4fc39795ff8a82d5e4d388adb6c518c2582bfff2dae529",@"publicKey":@"04d82922e10f15115acb74fe1a89c0de3d09d966906ef49225d510e858cb4e666c87803017b85fd33e3b98613e1494756c7b08011764a91ea16c793e384f2bff67",@"address":@"0x4ca3a9e0fd60bcfdd87681978bd6ab90e73b0832",@"jwtsig":@"-JaIQk8QIoUBSgLFpzPR0BLcN852zcB36zg4OKgSs_9lZXV-U5kK1GczXTihHhj8VoowdlSYj2HB58WKfD_uoA",@"txsig":
               @{@"v":@28,@"r":@"fm0RDNglR2FHKTnsy8v/4M81hb6rOKNYt5LyGM59s4c=",@"s":@"aCWKCCna/PaL0nUUCpeT+5LhGYd1bCyyZvjfVWu3sFU="
                 }
             },
           @{@"privateKey":@"01060240a4a4f38707482d9a5faf7fef6f9d5a93704598ed43759a4515a7004a",@"publicKey":@"04aaf92ac70d5bb49ffd28eccdb85de6c7a4e6019f347ff8e1d5f083bcbff7e5815731801c4784d7846a3d1950f02822f4aa15466b126fd4d6ad3e360c92bd3ebb",@"address":@"0xf138e67af6783c1e29032dd095f9d836b05fe581",@"jwtsig":@"aLXtuFa1LsRV2JyPckvlEJRbPh2qTIlUVk2dRyIT2JnoV01tFO3MfaMn_uW8ahYW-9wiCemfA-4yJAUB6H93Pw",@"txsig":
               @{@"v":@28,@"r":@"OFXjxx/u8tTA1w+Gjm4pPsIctT9kFHnqzcrJkG6Ms1g=",@"s":@"YEkiGBhLXFUZrSBQYF79Es1Z0TIlitq5sCobTqc0kO8="
                 }
             },
           @{@"privateKey":@"4ee10f8179f853314ad5814f9c8a12aa78b5173c93ca7cdd1731740403f413ca",@"publicKey":@"04d3d44f70a846825ab77db703e5d8924b5f6d723a98d2b0bd2dc9f67b6c4af2ce7d13eec8060df7d721baacced91c79afb7a439a56daf2f21d17ee45c5b9c4e6c",@"address":@"0x69ff45046756ddb98d61f392056b3d04e32d8bd4",@"jwtsig":@"mZspCm8ml4c0wP28H-mpZY0RQby42ZteHsvQ3osXObjGV8XckL_FzFY6leSnpiDF_iCCp390NSyEe7sfGeN3_Q",@"txsig":
               @{@"v":@27,@"r":@"zz6scur+3rVrLuZGwnVRy91DemUva3TjizG6r9dkvWc=",@"s":@"f4+JnvUpIwago5Zz+syugmdpfMhs4/OX9McQY21Qzbc="
                 }
             },
           @{@"privateKey":@"884c225a67e48935779f390db094818b7c2c0319f55c76cf62eb5b7a4df03f69",@"publicKey":@"04d2d3498de5a3d0b5ce9e03c4858af7bc8a30a90ac245f11dadde36e4f5f7aaf9e550952a2b7d64f7ab5c8e0f0f6bcfb6a2a8f48929bf34c6bd0382ad48129fd9",@"address":@"0x674ba15dfd54b3e48f7134a246eb33a1202f31e3",@"jwtsig":@"BgFYvqekFZXmit58E6YyTOi7rkz9pXqY6B8Ly1lv-uA3eEAS-ajHbf5O3BHn8kKCTwRX7ObdZE_uACNn5k9-6w",@"txsig":
               @{@"v":@28,@"r":@"tUPJ2LRIaP5vPMJnzMYgb7zLcq7y6wPT0wBTrTAJ0w0=",@"s":@"ZyTMYjTyotr93l3LGjjaznINYjwnaB8KnLkg7ojogwk="
                 }
             },
           @{@"privateKey":@"019e0e384311b48e9ccc2750c0bd122e7e3b4db3d5c0a898b216068960f029fe",@"publicKey":@"04f60f7491d3b9f99cabc62cf51779fcac00f808a8f04795ab70b4488f19d6802a286ad2a2684ef01b89d3a3b25b64234addd226984fbe8b0ace580e192c1b938d",@"address":@"0xcccbc15856de1c89fc7dd2199e0fd307619224bd",@"jwtsig":@"2_ddtzVB6tRanvkqWWdet7mzr8pf1kOXbAGvYAwS1O-jsE20rM8ezMQAyFEifoB5cObeyZagiphadDyjvFEaEg",@"txsig":
               @{@"v":@28,@"r":@"7apUh9aRFngt95KDQCW/weJVN6IYWWUVsIGm+TRgoL8=",@"s":@"fo97wNWLDcjWz6Uc9Lvh/lh9kuH6uPADGEw9o3oyKSQ="
                 }
             },
           @{@"privateKey":@"d003cd7071f4b3fe85256b4fa1046a1df20196b20b37869932dd28b9423e3f99",@"publicKey":@"045887932f712696ceccffc18bf103d6b5b54ae7fcaa05af4e35cef958ba03083b486391e9c9408e470e95570bcb85fbb42f10b4bcc96e8f8d24f398a3f2050be5",@"address":@"0x2860b31d01c27ee58b65c9cfa96a66428452209d",@"jwtsig":@"DDN1d4Lk0-Bq1JKs90ToO6f7gw9u9K6m_fUvPT5ENvIIDm_6KI_M0FFSf02YS7-HOl1mvlHwGAyR-ommaCNpFA",@"txsig":
               @{@"v":@28,@"r":@"Gdbyqii1oykpU9R2sbgLfdrnAauvQrbVDQvkkFhjiyU=",@"s":@"e34dqk8rLKQYRKwuJKUzmPZiG9IS7lZbvhEc1kCiag8="
                 }
             },
           @{@"privateKey":@"20fe2194231bbbd237c94f3ffc55f4a94f536aa191b5cf026eb0d9ff20704371",@"publicKey":@"041067a52549e14d563e572925419fe8dbb5a9b775aa25acc4ddf5b5b2d95d6e14951ea0e7fb0b915ac7d7c7fc00ff93016d393c80005a1820536c50774281e020",@"address":@"0x45e7dffad61bb58639de09d8e2f82af7a4b567ce",@"jwtsig":@"sqXseGUZDaoCtRC_IcO90b7zmeTMt9dvgNjx-vptsSg22b1EzS6N-DbaPEZk6z_oM2sEsWbnby-IX9JRI55zHw",@"txsig":
               @{@"v":@28,@"r":@"MBCLYZlfUPVsW7Dtfa4UZ6zlamkXbFAGJJ536RjcWrk=",@"s":@"Gq/v7/xJzDcszwq3EdRrhe8iJpnvgRmNXzuNFH6Xdsc="
                 }
             },
           @{@"privateKey":@"2fb2eb84a45c5a6b0f0a69c4868ce0d6deab7ae376cfc88f19b08f920746f69d",@"publicKey":@"04ecdb8b1d8575eccf3d254c04a4ba0b9ec68c7a43053f5c3a37dcfccc0a0a4c46e4c579070e51807c661d13874fba3f50ddd95dd7289f99df4643a320ca7ce55b",@"address":@"0x034d9566428abf22fa1e48a61d6f0f5688108b60",@"jwtsig":@"CFEcsb0s0t8HMkD4hTYoqRdtAcoIgQk0cTIyD__-FQeh6NZuIciyc49e4EcNWxtXkocPc8aZCOKA2JTnbwAZDQ",@"txsig":
               @{@"v":@28,@"r":@"fnMqglWNTqzdsHyxVM2Aq162m2Ps07Lf++nOmWB8utQ=",@"s":@"X/I2oeIG/04RRqt1L6dnslOksnQdBafadI2YQ6J1Whk="
                 }
             },
           @{@"privateKey":@"fccc238b12e9c296c0f96d9e48a7dd3c0d4df195f53720d079728b8e1cc28b17",@"publicKey":@"0438d034a52871836191ce5659eff157aaa7feed16c58bb8a2511c685a89779885e0a30dd52e56f4d90fb0282fcf67186d6f4f4097b8ec172853c148fda9b10178",@"address":@"0x51396c5f444b6ef5fc81733a7526d281c083d201",@"jwtsig":@"Y-5l1cPkJElpCS8N5tBMnlSGO4rCKS4L4-Wo0ei9Wvz5_2fER_lMApxm87ROv_hsxWpEeA3lUlgoI61f6kj14g",@"txsig":
               @{@"v":@27,@"r":@"ddmKEBYryK+DW1NhBQcz3HHS6j2JcY50x2G8Ceaq92Q=",@"s":@"BOzmcvwvX7eKWCjtZuu4ywP7jZ4pDo3FzopV4d+oRXQ="
                 }
             },
           @{@"privateKey":@"a7fec323144afe1c1773b38df6ba30604d86a85788855c0579fda0b1ab82404e",@"publicKey":@"0473915692e411cd9c6b762a5653aec44655f9206c0d151b03d00e7a573e8838a849a702ef9174a537c01399989fd1bce95205f2677f2f39e892c0fa4ecb9e7209",@"address":@"0xdaa1c0545800dc929dea802d5dfda4023938671d",@"jwtsig":@"O3OPhOHNcHiqZ8lJQL9TsiO7zyOHU7Th3QZlnqtSAqFGglcDNGJJs0pTZBuybMt6tLohgGXCUiawcy68jvHOKA",@"txsig":
               @{@"v":@27,@"r":@"jP5yS00LOJABy7lTMA7eUjIUYnzsIfGsrGNsOXMd4ps=",@"s":@"dySgZteuxj3eD8WoBm0OEAf6WTtd8ETFkuvv03zsQic="
                 }
             },
           @{@"privateKey":@"19f99371c390cd8e70a0532c635e47e1355ceffda9c3bc8713d012ed03ec06e8",@"publicKey":@"043ac91d6c11b62dd73b9d48fe2468be750e29200f7285a03752e8bc8bb234c42ef383bf61d08b75f9ce3aaef8a2fee39f86bd3cb4ad078c37249e04019e5937e9",@"address":@"0x2192896ae7d442b6f5b9b4eb2d62c68b64be9b7c",@"jwtsig":@"lIzyO31ZgS41CTBseyzFA7MKEqi_FIP2MJPg8wyuaVoPYvNwmPCbqTftfyYwv3DjDQKovys2-Wa6KiPiXs1ScA",@"txsig":
               @{@"v":@27,@"r":@"WxmjC71w2NBzLLZ3ZzapeYWeHNCT66Y9oLISYmF+bkc=",@"s":@"NIvLqlLrCptfmuQNtOy7k9ZUFPvcExi37JcxFog4F3U="
                 }
             },
           @{@"privateKey":@"62ce71798568e1f96495201a364e9670d399d97d8d5178398e3eb423dc0e7561",@"publicKey":@"04ce7b781959ad7cccd5552251be811247654b212ebbf73b31802c8c8d81c0b79100963433ae5f5036e9a8192855284029c86070c9c70227181694f008ed7ec964",@"address":@"0x53dda7b3f76353a12c4330419edd002a40f6d264",@"jwtsig":@"SvfCtPcL_-i1760xXWP8AE8BEhEXvCTn6hbawf9kBIHIdiWiqz9uWoEobN5-3ma1Mjem7-zUgOvHV-qQ8ZbuVw",@"txsig":
               @{@"v":@27,@"r":@"+IZ0+Qso0ZWPktRj9p8cXwM0vKfyy19AKl7tkayZ1uo=",@"s":@"Pcs3AXdXOMh2Gv26qEbqFKkKjha8HPEbU/vjJTzvoro="
                 }
             },
           @{@"privateKey":@"e44c40c7728078ae6339101f81bf5302fc075011abd80ba09f32bd3ed2d06f56",@"publicKey":@"04604b036899a9670804c382edb1566a2f9a9ba81165c6d820972e3fdcbefc69353b7254c6ab9860f519192bd1561c48d9df41b277b249841b59e79f308082f940",@"address":@"0x33e76ac20f2c2968736a511ab951ca5f1d3c91dc",@"jwtsig":@"OAjf7G2JK2j-KRjL8axKOaQL4sb3z_N2LvsaX7wZewqrkUL9arKTv2is1FF_gsi5yJkHbVjJcT6VwW-NfWRpTw",@"txsig":
               @{@"v":@28,@"r":@"dTaLF/idookY+OnoJV1Fj+YXnY5sseAwI+x5FpK++kM=",@"s":@"Wj+kSEUFcuXMoEWGjFcQy/mr+1R34XozhB7omduoOM0="
                 }
             },
           @{@"privateKey":@"a8baaee5cc9de9c05e5eca19f24ffb2a02702b6f31cb456138ad641a324b15f1",@"publicKey":@"04a47d549e6a9ea697df7a2efff224d3829986f26502e4c5af8b7fcb0d9718f76a792f573d9bb628163321b3e09b848266553a1c4b8b8f6a99fecd2b24fcdc35cc",@"address":@"0xf10c10a877bf48cd6e165e598420d184d545c710",@"jwtsig":@"mXooezXiSupDRnkg04HMu4rxljwa7jnhEhDQPOr3QKacmygDhq0YUQWwyKViyrbhsyYNLQmrOfHe8CaERUhexg",@"txsig":
               @{@"v":@27,@"r":@"b1ExJHRFB4pwCtINT3CdD6PF0BkmEI/6ikGOcgG9XXA=",@"s":@"GpoZH+rSnNHovTM8T/QZoZunFfaxI93gTmELeEpwfu8="
                 }
             },
           @{@"privateKey":@"7f505ebd23dadd2a01e1115be61f4ccb4e6f12f09eb7e9188ee21288f456e577",@"publicKey":@"04987c664b3e42d9582f59743af12252a1f741ad99a464d9129719477ba75b4673f1343e3de47cb41085a29b48ec71aa83cf85f7cfdd3eccee1b707acef1d983ca",@"address":@"0xedd67644082494a750f27cd88bbf1a71cf924c97",@"jwtsig":@"kgjSiYtYE3YymfKMiZywD_c_nMRHhiyL-gTpoNXsaq2nNFuueIiWRwAYY1X2ZHl8mBMr__Ume_mQT-MAvaQSyw",@"txsig":
               @{@"v":@27,@"r":@"Y6lnfzUV7D+vpxLWvrfKOU6eF4ALX3sO+XOXs69Fg7I=",@"s":@"fcrAhssiT3Byjk7EW0XzleA+UhgE14BrHqgehQY/PWg="
                 }
             },
           @{@"privateKey":@"ee97e7658fbfc07c5bfb57fc5a14f6f6c97d6ac8e3f341c999883175c20fcf05",@"publicKey":@"04a238c1634624236c41f01c2299e6ccbbc257e6be213d97985427ca5ad241bbe7cae795f3f93319f28fa31f97cb92ba2999b50f431cf52e8e4d74530e73f811cb",@"address":@"0xacc258d24cf3bcce696970d82704b13651aa5110",@"jwtsig":@"gTskEAgYVe_pBEG2U9jA7U82gxIZLGxLV__m46KZO-fo-RIeEguk4kSeJft5MjuZXhyLkLxp3IDpihM8m99hwA",@"txsig":
               @{@"v":@27,@"r":@"UiEf12c+nOx2qwIAC8u5wnw0czxcB/sPO215ZtypT+o=",@"s":@"MWMQpHAKq39DsbEsB1AGb+hDnN1gE8bcC2fODjaI3k4="
                 }
             },
           @{@"privateKey":@"be9d4fb5c681f75c55243b81bdcbf30ecc2d7e1b8c7a34195fb9775ab76fc2ef",@"publicKey":@"044e2bb08529f68c72cfd93710541c68e58abb2f2561dbb39a3275bda1e9720fec08f1c665524abd08a991832d3c7dc0639efeacd22e754c82fc59b2e2bbf42658",@"address":@"0x4c17ca8cc38ed5c6828085004d98dac7c1a88ca9",@"jwtsig":@"CcZq5_7Yv1UHJ_IkERzDL8hwDxZNd2hIAuQckvkuQWVFh9o8N4-aVxU5jLFGbMR4eNNhHwl4Q0PgeAads4sWOw",@"txsig":
               @{@"v":@28,@"r":@"FNzxaQ9nZTnlZOjY0qymUvvLKhd8gy6lJuj7bwIkDFI=",@"s":@"KM04QG5I0Rzqb5l9f7+sj6zbR/PuiubOBtTWEg2mD+A="
                 }
             },
           @{@"privateKey":@"3b0c49416d5ec9517e7870ab6566ac011da5ea5f011ddcff8e15d7cd0cd87328",@"publicKey":@"042279e00a1c89b20abfc5b4af0efa96d36cf286eb36b5128c7d15aaa75be829349345412a5be6588dbab14fcc6aa107b36a2b92265dd8cb352b0dd806b1d772e3",@"address":@"0x5e120e24884dcd7f575a284ca3e9cbf9db70fd19",@"jwtsig":@"foeD4MInXaqrQFwFS8fu0e8Od-2wQ6YNRNAtHcmTg3YnOgXtwpZ9b50TskVdVh4B6ortcz2fenVHHET6Deo7-Q",@"txsig":
               @{@"v":@27,@"r":@"O3UqbVGpe06GDrBM1KMO1Asci2hq0ucHN5MpzZHDuf0=",@"s":@"GGdS5fvplCcWTuzfQZ4s4swJu9hztPZ5Jwzn+a5Uw9s="
                 }
             },
           @{@"privateKey":@"0565790c4d0915c167c089ddd63cdf3016f1651d97bd52541494cd7834e7a739",@"publicKey":@"04e26735c1b919f375a69a3d0e3e1cd4ffcb9de7fb39811073afe6da03c6a2ceb01c0477fa6fbe5e54ee8242049128e61aed21bb7b9edb0a7c224833741837f0fe",@"address":@"0xf087ac18893f337cc6c4f3392ac02cf36ed29b21",@"jwtsig":@"6vqOMUbEvEohSHucATLZOClqtR5XbfSVAvcO77ryoezGHKA51TtYAwFuP-CYjIBiCrN2BqiDCat9BEYpW-WoLg",@"txsig":
               @{@"v":@27,@"r":@"F488AWPD4srfimiaF6oecFfrwSAXwRIMbDNBDapFrVg=",@"s":@"M/ntFoU/vhfLNFGrZUhFwd+WJ+AQvlA27mM4tVqVdYo="
                 }
             },
           @{@"privateKey":@"c8da839ad57a613d97c5e374d621f70b7b78902492da70f3ac271fe27d5652f2",@"publicKey":@"045b3c5e611ea34896e1e07a4f664da6b9e4352be568d9d576b93800611ccdee7f4bc16fc3b936c35668cd70c77b894daee1100795826fbfae7c977dfe9bf5724f",@"address":@"0x7ba6f7ec98a081e00a4b4ea6d4608600a2140860",@"jwtsig":@"UVWK8Fj0_UCYOX5k054VDieDqjNyMEDqU9z7sR1pBlEkcnNHSPTy-_yERivs256JF6agLvUpkbEft8bM9SWRTA",@"txsig":
               @{@"v":@27,@"r":@"2+F4WypEy/QLatF3sBW4zmVWadB3g5P5f0h5UeGK/Fk=",@"s":@"H1I+N1/X3BvirIHDhSaCDcgwsu9nX7YjEY23bhdrUOk="
                 }
             },
           @{@"privateKey":@"c995eab5513262c2822e15920b9064376d1b33f01b125e0d7093e7351e366d5e",@"publicKey":@"04ddc5215b73096ce8bd6ba48dcbd0ca527947bb89c6299df393c6730cee0a508eca50fc5607f76ad66bfd596a04e88faf178c456cdfae168beaa8b3e2bec86dc5",@"address":@"0x5a9d02fccee8b2507820889c6a25907592b2352e",@"jwtsig":@"UMku-ulQQMyhJIsKfyTxIEe7_HV5k7IApDl8VtuPnnktbmoqFVdIbMNFarr15GYt-IoA125oQLP9Bo23OU_q6g",@"txsig":
               @{@"v":@27,@"r":@"cKUwmDelHTcpZCc2FSJJowKrRDYpFNtSSqL2k46VH0I=",@"s":@"P3E8AWzHcUeu8nXmBlzaJIomWtuIZc3OVM9qmxUJOSE="
                 }
             },
           @{@"privateKey":@"f0176976a08750d2ad33eb46f339511b1f23990c2b5a8c59574fa75bb3bc9aad",@"publicKey":@"04cefcc25039c8da1b4da310e143c82559fdcfc06bddf7ba0469a5207d2dbcdd35be69fe57c4ea2f6a923931b9a1b44ed65e1d9f0401ea63e662a6f7bc6c94416f",@"address":@"0x94c43da2c7fb4986925ce2a3cc2adb4be42457de",@"jwtsig":@"CTlw7KDH6Pwt1mAeNbR1ePaQ06dv96NreO5Es7b4L8L4TP31vsupZWsiBSeOQ6m71TapkgyTOgpavNXF1wbYAA",@"txsig":
               @{@"v":@28,@"r":@"1GOzHHHiQZIkHCp++E5VDQ+gfpxHFv5YtIkclkhUH4c=",@"s":@"Xqd+ptV9/QpoHv8Z/ir5mVCscBYWvJEe/E4AS9nUE/E="
                 }
             },
           @{@"privateKey":@"313bc6445765165aca25f412475f3321842c270d9400f585d59bb8ed23167c1e",@"publicKey":@"04e21b6775c41f568f3d46829a5b3844044231ba26a77fb42c831635095e9f08c09ce4980230a8937e9f22711a766c2a8c88e420b78b0fe858505661a418664f0c",@"address":@"0xd07eb4161cd20716e7756d37d6ac0d2e851ea3dd",@"jwtsig":@"vQTFP2H24XMthwRsd80Hxh_7GnaGeLAGWSUw0pEz3SfSaYbtdGUOefXEsdEBrvYXVSseQQr1VIGUc_hZ8j6rPA",@"txsig":
               @{@"v":@28,@"r":@"yAPxN8j8o/poHX/TTgIxm9GgWRCdX+D507w2nDWGyfQ=",@"s":@"fBXdhRO6X2wRJVIv9cbwlFgFk22Xh2V+znOCjMb8nCI="
                 }
             },
           @{@"privateKey":@"035d88da05943288a90581ddca5a3dacb068beb60602efa26ab61f91b202b098",@"publicKey":@"04234aa244803d0c6daba8361bb6ea5225947ed48508958667cc17507445adf9377a605e9866bdfc5b59b8339c9577491655a77a09c8be0136e4b9d28098a91625",@"address":@"0x47221e33c828259edbebf4cde1e57bf09224fe7b",@"jwtsig":@"npBfIb-pGeG_JrEXjmDJrBWMa7SroSoPBqbAsuHC-yZjFFOBNuhoOc6nAJzRvtoGRH_oT7LXz_bqdoIVb2KglA",@"txsig":
               @{@"v":@28,@"r":@"4AOp+h/WWIYUyClst0ypx3yosxTFUvhQ11Cs95AomQg=",@"s":@"PbGvvjxw1H8GwumAKXjXcnIuz6U35scAa1WG/e9OTbI="
                 }
             },
           @{@"privateKey":@"c5f42cd60790e3d57f883a535f19902ee9515cf2f5e3031767499116e5ef0835",@"publicKey":@"04afa6e4ee3ecd820bf8442fb381513e4fffa1f94e3268db8fb9168fc963289f63541549d000fd26dbf9d339819a3b1f6496c7592e22c6c2109439614fbe7792ed",@"address":@"0xc7f2b6ce3c775d0e011c77a978ea1713c17e314e",@"jwtsig":@"1s6QCrFtWOghTRreZqimcJGqLob3dYq-fPOV7YBu4DmPiGdOZeF7aVOVh2mnPiKChdCWyws71t8Q4kcbn4KOvQ",@"txsig":
               @{@"v":@28,@"r":@"DxPStY6FhR1cMnrOY2355mtwz7Tbe2mUkToxL4zW+1I=",@"s":@"dgfh0dhqPM+QyeTg8TRx/o99YLQFloppP7IKs6dl5Io="
                 }
             },
           @{@"privateKey":@"18dc8bd93b827cdb2c03555ea1c25f641c14ca9e309aa4cc06c8c8a27682dbe1",@"publicKey":@"0418010d32c772db246f362308d871c10d8a329501ae099583259d3427514462a70a6f9b7d6882451dc823e577658100db4a70758e8cb3277a7fd8ce34da4dc11e",@"address":@"0x8183a72d9163f19400bf4243de3d2307e42044d8",@"jwtsig":@"2S3X-IburN8P5uuaDuZkLs4KpMKkxhF3a20mtV1NJ0Q1liWt1h5x4zw9owN9clYpor5jBZgYAua9Gl7neaTkyA",@"txsig":
               @{@"v":@28,@"r":@"K9/Xqq7SdUJsrAo9hJR7T9vNvztkIPTxG3VeNNmqtFQ=",@"s":@"aEYoLqpdqpdp5+RWcdB4k7nkpQrlXHVfRydH4NcJbQY="
                 }
             },
           @{@"privateKey":@"3dd60ce7a16cee8844304a3008e344a48802040f89aa37b5a8c644b3e03734a8",@"publicKey":@"04ab052bbe671c5f09b6b2edbe9326170758d83e8344caa3fd3a10e59d294bd66ac4ddca10823a265a4315d97147eaa9768c28fc87ae50b3c23ebefc9b78eeb671",@"address":@"0x64ed433519e8c99c990104e5feecca360e88ad67",@"jwtsig":@"OQQuRn2m5NFVgm7OVL9amcr1rvfuOe6dv9ojul-PGOLWbqS5N_sFiiSbckrZXBElWcYe9NR6iULMEfFJ_aP0rQ",@"txsig":
               @{@"v":@27,@"r":@"AnueK0BcFhcUZPLePAPyWQzWbkOX0TRjp9SYu+cWeD8=",@"s":@"LASEGyUukne5fc5dL1w+CX9aiDC5YUt+3oKsg5tGAEU="
                 }
             },
           @{@"privateKey":@"a0670660819203cc4cd606fb10e41964c88df593f10a7b3a6586a0c77cd7b788",@"publicKey":@"04a325ab40e5abacf3421551cd04e3fe67c30a6bd9b20ccfc928bca5c641b0f18cf41b0bbbebde829c67b355327ded5e767ef8d9004efc70162cc172a7a9431c48",@"address":@"0x8da5e4f050638e59e87bba9ecd2cb1e6daac777a",@"jwtsig":@"NfR8hmJDpwTjq0zUl4hql2t69AwiMXFSiA6jxDzoa4wLX-5o957Cryw0hUuX9qAqtw8AbMCvVJCiYe7LId3NqQ",@"txsig":
               @{@"v":@27,@"r":@"z0l0N5ABmZwQwSMhHh4HhZoQF1Ngur2dAnghEFHYJ44=",@"s":@"AVfJYls7Wc/cKBlIs9jItTfTZbHFEdcqLvTRX5vLT0w="
                 }
             },
           @{@"privateKey":@"4058c4d945d175894a343593e20a7ea0e443bc7519f6e724cbfdff33caa1c417",@"publicKey":@"0407770f4cca19f7f2c066d9278caa6d40b89e32251e696b9ee24753a151589bd9b131f995a8938bbbc8339b56e2880772410db55b055365243d6adb5ca5ea7b16",@"address":@"0x0e899ed45a65b7df769409ad7b4022a88ba6e88d",@"jwtsig":@"i5H24fGipgB3uqKFybinTShghtVWXSDzLZgC7xv-OtDkkakkHXL0z-9zYv6CultHF4H7AokfR2jm-XEojVi9vQ",@"txsig":
               @{@"v":@28,@"r":@"4fpmukGxYAFV1kH3yofvQgrqwFSUHrTVehEQMPDkzJI=",@"s":@"Y8aS+SbZF+fBeA01jFPX58PsfoKaCQ8cy4csp0FyJLs="
                 }
             },
           @{@"privateKey":@"28f92893986f228df0701b671797de98692dbea624e9020ae90ca46324f1dbb8",@"publicKey":@"0430f6f8205a476aff0be8a5822039bc636010f60ae550888901309061b2dcfbb8ab8570849d58c5c26fb0a2e21164dcd9cf7dd38346c30ea319b4d85e173fb648",@"address":@"0x2cfdba50cef4740afb6653637b9753e157013ab9",@"jwtsig":@"iOYwRCk49OhKhfpE9ToUdSnhnsT7kW9yJeQ6q-qN7kO8AkKh5_HvoJBnSem6Ttqls8kEjF-mcyTyBtvkTwJR6Q",@"txsig":
               @{@"v":@28,@"r":@"W5+3rQKKjRGS9r+pooK5e7UULDM6JV13yAeP9bvj8/w=",@"s":@"QD8LIj2DzGMDKX5NYPvd4H4PeIHxRGr2JnZX9zLKRP4="
                 }
             },
           @{@"privateKey":@"538c6cf52b02f0197b3ab5ee0c4daf22d10d9e0481949bc9918216e89b17004b",@"publicKey":@"041bf5f17e55a2c873e8ef8a69bbc32b1cc01def543460c246d89ad91d193042493a8fa619200f35bf7e1babe67dc893d75921f4734e3a3d9bbc02517f1056a31f",@"address":@"0xc7567e2839190e618979a2e0ccd29a1b661b0901",@"jwtsig":@"-cyEBJEWjUYabyTJNi6rn7sDCIniKtlftxxoQmyuJEUE47o3nMAgfFALLoEH0NF1VuzzLyPoQmaRdrp5iZjrJg",@"txsig":
               @{@"v":@28,@"r":@"C4/aYMZuqJr10ChbxMPEkBfrRXqJ8dl7ic7p/0zssdY=",@"s":@"BVFnSn8gVpJXOoHFmWiYv6chvuRQkTbyR84OpbwRBgQ="
                 }
             },
           @{@"privateKey":@"5ec82d04429686c9808db35b85d3a84db754f58bc46e0499dafefac308bc0a69",@"publicKey":@"04aee714af6eb30f96a1c256bce9b6313134adfd1144f986d1959c2e04a0abb1f7942ffed5f27d4d2cc7ff833822da038c7440163956be4313622aa1a1ab5e73f2",@"address":@"0xf8484190e003797a21eb2b522b0e7f3545bc5c98",@"jwtsig":@"_-evI1296bUxUinbixLgfim-27QrMDo1HCOwmJd1cOH0Q2BL31F0mx--3rDvK9xbz3kIPNGGUBXhial_MnPxdw",@"txsig":
               @{@"v":@28,@"r":@"kzy2H/0+/UOyyuotaz2Xti4kwkqJHbvpag+0nhGYCTg=",@"s":@"CYvCL4+NuPSbWP5FulA6FM7MXsdbICN+E8PUiNPPukw="
                 }
             },
           @{@"privateKey":@"25f904bda7cf7d8ae422a3dc0a8b8b838714064deac36d0481f8e999d3b06318",@"publicKey":@"04e4fa81dcafb3c23a138082fda1101e050377e68d129f333aef77d47920aae3e6e7fc7ece4a342f97bce3e3827c3c3d7e15d623286a4e91e814d40e730212277a",@"address":@"0xe694d6bfb0e0f60e047f37790f0bbf2e3a78352c",@"jwtsig":@"otDw4UATSRxEQl45M16cHez3AEIm4Vz_QZg8uy5zddqRO2kX49M8enr3yjsLVuRkE0cqH4W6nfu4tSRJb847kg",@"txsig":
               @{@"v":@27,@"r":@"kK6qJ3rfp1JTOBllEmHziyPyPzaDScu/UqYpLbaIwzs=",@"s":@"HqABQoNLa5aF6sppmPWuoKFrPQttMaRlsKx5j5JQ2mI="
                 }
             },
           @{@"privateKey":@"b3d9a71fcf70440e851e303e13851a89b35a5f37911d57ba0fb88627279f21a5",@"publicKey":@"04bd4bd6c081183df296568823e08a08cac67fc8d3a451b3d2a52b06835e0b93b413d4a4e72d0edc846641296e91685683ab5c6fe7206e79581afe598f8c8eee80",@"address":@"0x769952b356819d8e1ab63312d5ac3c2c14d1801e",@"jwtsig":@"xWUEZjxun0i2DpZ49uJKSlCAkZw_bkGRbU-PElF4r_0I0dP6DAJa_dd_c0VLmyZadeKNaaCssi4bJNnTY4vlDg",@"txsig":
               @{@"v":@28,@"r":@"i+t2rOwZGZiaooevO9ftIo+gQqjRPsyE4G7sc1x5jrI=",@"s":@"fIxfJr0+rNzGrJOKCzX5o6/ohjYoC6DqORpoqVfI8h8="
                 }
             },
           @{@"privateKey":@"c87645ab6c562e4eccb6637a70750bb79e751ea68910b1dcbc49d6ccab721e2b",@"publicKey":@"04b33a561ed4be3f832a07d7073933e1e108e31a3b1ed6942d918c63bdd5783a14a8228e04ea37b42cce8f17c63611bc1edfc820bf19166094c63c7da0bc0f24b2",@"address":@"0x4edd332bd5aabc51a7305f8c0b6220a3ce438c83",@"jwtsig":@"Rknuj10koIStG1Yj7ePzsaM3LIUlECK1O_oW3CsMbbHwfUK5LemfliZBGHAsyY-l_IeTRVucwlldc-W59Xui3w",@"txsig":
               @{@"v":@27,@"r":@"zQaCs3ADBkU21CHa1R1a8e55wI2E6m5Kk5zmMZI9Jm0=",@"s":@"WaF9VnW7dHPlpvXCus0/q2yASg/KxXN/SgsiAQdL6RQ="
                 }
             },
           @{@"privateKey":@"c69522947b9a0e9ee3151d207ce4c8273f14e2862f8957d128f4a54e7248e31c",@"publicKey":@"044eb40819ad5c62f1791058d66402956e09e534bec8879c9b7c9fc5ba37874af8308f7b6b4d4bed395d50a7893cd040214b8febf6c6cefe69ac95b570f5cc8ffe",@"address":@"0x2a5c2ae9941f4cedb047289e2b9f3357b16baa0c",@"jwtsig":@"5JAjO5oKXaZUkQ8Ae6SmyVTP4lIBm4k2KNnzcwfbhylXzC6PbrX2aPm6YfaTU0ZyghMFLFOw6ElOMuOmMH3jsw",@"txsig":
               @{@"v":@27,@"r":@"fKWGAz9Muzz0p/2WQywx2wWaK6lAXAnQrsdYLqVScNQ=",@"s":@"QEHoyPgUb1u9u9oqQcc9l5eKBjB6YHFFmsXv/TCe68s="
                 }
             },
           @{@"privateKey":@"221c52e66ac846058181aea5e1d6379c4daa39887c744e03e0c1bf6b893f4375",@"publicKey":@"04807b83b8dcd5868465d67efa75bed4264f20cbef57380d76a9ff501cb42f5655a98287cc5b7f8597473b53e168f72f6157220bdf7c99bcaec39de30bf5df79a5",@"address":@"0x44ab6c23c05f227447196356d7a8ba8f5f5ccfd0",@"jwtsig":@"q9X7DkW2nNxhBUDhb8h-wfQ8yDEu49WZjvQbeHCusPPSVGc6IeRiDIgPyAuqjQ7TheNVQwXfjDYZNn34MIZx-w",@"txsig":
               @{@"v":@27,@"r":@"3Hl4C5z9aHWeqzmFoB4RqEslaaTAzNfFbjKVoV2POqA=",@"s":@"KCrNtGK7Xv0DsNgAsJjrI+GVsMGlbfrAufCEMbx8Z5I="
                 }
             },
           @{@"privateKey":@"0b6bf54bec26d47b5313e725a3dd9fd39162d64b37d6fd773b0e789bd33b8b0d",@"publicKey":@"0495fd48c4702c7e0e813663147d9d8ee255ceb18f657f7777371ba50a7048a7f082f73d2461b7de2f7c15cb6330d8fd15f937500ac32bcbdb313b59436f183a4e",@"address":@"0xfcaee7e3d0786365eb2917d3bb1fa6392444387a",@"jwtsig":@"w1V0LeVBDhTC5nOB65a8SJzM5_Z5_jJkJZZVE0G64RPLIE1SYCSeF2wFDBNmSHZBAX5MQPMyjV3POkNVLvfs5g",@"txsig":
               @{@"v":@27,@"r":@"JRXIRog2SYeudMIllMCDtxZ28kTeNGYPGAuVt9ccxaM=",@"s":@"IcA+VeL5NK6BuIvf/hwyXADWKzzTf0iQl/IoGFWzjo0="
                 }
             },
           @{@"privateKey":@"17c7465cd05dba8fea7045cba4ec344f1bfc2b03cdc6927dfeced97126a84f82",@"publicKey":@"04b076bd9254aa310c885b770fc077c454f43e81669fe7666851909253b1710ad3059bb480cef5426ab8ec69cb7bba3c3ee625cf94b3d0c13156363e427d24f262",@"address":@"0xde3700766d266524bfb1bc0d8d5e077fb6f65a42",@"jwtsig":@"lqSEFF-Mv3uQhB-Swx9yRgK1Cp5V77LLTKi9b9-opZpCOsapzjH8GzMgNnNUEJcO-EvF40_hlxzWykz3pm4qHQ",@"txsig":
               @{@"v":@28,@"r":@"3DjCVrKJgwtFyUHRrondYjk23bDjEgqJAR+BHIDYM48=",@"s":@"VzQzMEpyO5yXgwwFB1oFG1vTFNp/OMdT66iuQ1UNScg="
                 }
             },
           @{@"privateKey":@"72255262378a076f766cd17ff015174df23f5c532a937c9bc03aa5b4e9afead8",@"publicKey":@"040bdd7d98b734dbd6247c67a837b33ee74401c4c38201437262d0c7fdfc111c01405916defec76762e51a50c4b09fe351b1a93ac3611b1d4c7ecff4f480b70d28",@"address":@"0xc92a4bbb46f48fed7cd154a71afa755732e460eb",@"jwtsig":@"wzCVKbqYbNmeyFNN86TrlLESCh8q4pUZl7FqaW38DY50a3J_N7_1QVUrUTO6Nof-cpfl3gR3KqBz4ejTHWBCEg",@"txsig":
               @{@"v":@28,@"r":@"YBDkYIYyOe8ynqdqsmIZUFpGctcrufMeNQgLFjvLZyE=",@"s":@"Ys1iqiBu2lEHbDbn92xxLfWPDu7XyShtUyGXqgAD5Qw="
                 }
             },
           @{@"privateKey":@"92465e3f17be18e01509254a10dff6ddf18d8651e091f3a045332cf896dda240",@"publicKey":@"0416e6e2cb9628899517eccde44441a051d16453d4e3c3bf89286f2fc8d14b63566af4ce44a519102691fa5382d11f64bda3ba44f5046875273cb1e75a4e756bb7",@"address":@"0xb8489af2cb572304c607f14c991efa83517da888",@"jwtsig":@"Y03oDOsmltbseap8QuIUFM_lDzu2o7QolEXxwV5tlArlhxO9mAzcLSM7zJKYz0L74cPZoQiMiZaeKM1ohYgz0Q",@"txsig":
               @{@"v":@27,@"r":@"WW5ASMv5cMrXo94I2nqOAHDT6yArkG4+Zi9/VX76JGQ=",@"s":@"OWwuNMQ/nknmfcYBxsQIpLfPdX/SwO/RhZZkFVlRLvs="
                 }
             },
           @{@"privateKey":@"73391c9fbb1b79f7a53614a2ac13058bf08e62d299fe0afb48337be4f98d33ab",@"publicKey":@"04fc5f09a8fc15e19a813883b1c2aeee1931b560d3490c31409aa64f7bff5176a42805f02cfdd4758e065bd4d47181b9d08109f6254fa4aa8f785ed8f0d7ae3234",@"address":@"0xe398a7b24b6931ff34b557ae14db3117dd51fbc7",@"jwtsig":@"2WH02NgmsZgPawIKXTLsz99JqTiyrQ2FXsNJBwyMNkQ3_XTK-tqc6BMU3XP2mg2CXs2RHEZSwn1GnJfP1VOomQ",@"txsig":
               @{@"v":@27,@"r":@"MDcNPEbo2UzVJeah0IVnp+CEJirkrdfQ2Xad2Ca3SQw=",@"s":@"N2K+BWZEDC8V76w1HnnL6GFKqHW3vRtUf+wyrdesDsE="
                 }
             },
           @{@"privateKey":@"d602f2d7c4845a7b64fede9c79eb7367661e2299b877457cf957095c38ab1d9f",@"publicKey":@"0428fee3f420827ca6f6918d2781e84159b0e8255870465e6095ee382e3d51e44a0780bac78b0d0862fd0911bc3c0efc826e015ff596beda60a55aa5588d7d9731",@"address":@"0xd972ed893a96444bd27ac6e21d8de4f12608e4d4",@"jwtsig":@"ZwnD-zdlXtmclgb4kxwrHjghiu_RiNAhvpcMtBg4dD2Tif60MCeg7Gf0LVbhnt-MWoHXDD0BKKqurawzAaTV0w",@"txsig":
               @{@"v":@28,@"r":@"x/Wa9zE1gEgHBceTTjoNHkGMXl+jzavoHWf/T9N5tIw=",@"s":@"fq8vzjGLlcPjZmX47uoom6jqethXVDzgPfE9/vISXAc="
                 }
             },
           @{@"privateKey":@"1e029460a97d52117f66b09e25d69eaf0a03cceefd160c089ef067b6708d014b",@"publicKey":@"04ab498637325d94e623ee92976281635706c8d92548d38617031a38f06fdebc769fc2044c24d5741765af76cc5740996238e06e6dfc80f839639c325d0fe2ac4d",@"address":@"0x30fde40c45959274e8da4f16e641936c492fce2f",@"jwtsig":@"090Wgb_MnL1Ei5ZYwJBYTZtKx4KV2wN7Ar1r-jIl2gMWpiRgC3TztCQbxlrukAmvq9XyEmbnn8NaVDpDDEkZSQ",@"txsig":
               @{@"v":@27,@"r":@"BYeNaKRco0ngGgdpn8rHxpDtLEN4ZPoCisYfp1aFIZw=",@"s":@"QgJuTHJASMS3eRS/9Wh3wrdZrSxr+eZ7ZS4mr88It2U="
                 }
             },
           @{@"privateKey":@"5499ea955c098840775cd627ea4fc93d8f3de17f8721a93be3ebe3b7b70b4fcc",@"publicKey":@"046ec4a7100970431fd24200a7187b3a92ccb7ea4d8a9de36fe8952a37c2c2f77be895e730043ee2068f4632dc1dd1e04a53f23bcc3e02f562f21645097906c346",@"address":@"0xd4318fab9656eb478b63caf458262ca95e914e78",@"jwtsig":@"yj3ebIZQQpX_TmZeKUxSzAmUib9PAAmI8DdshnrVpLDAY3eYb6rFnDtUgMf7Unz0ALXUfqvc0JFNKNDJK_WwXw",@"txsig":
               @{@"v":@28,@"r":@"N3CIZNI0Cbma3HvyFwNjj+wTlt3FdMHqEgTkPJxjC+c=",@"s":@"CiDhJ1ZOvJVdMsW98Z03EcNFlr/eecOBUsgmcIC5wDM="
                 }
             },
           @{@"privateKey":@"818b285cf19c5fbd3d5a02b307d05132ef204d60dae8eff59535d03cbb63c932",@"publicKey":@"0420a1b63c6e56e27412daf040304d371032d866707aa0be103b8ed5b83ce7c785000e908fdbe9ae673d97202d8b6659c82fd11ffa89b403309b388282a62b8aad",@"address":@"0xde7c3bffe1205adc8c2dd654ecf8dece33efdb54",@"jwtsig":@"-99We6jDdOZwfYj_1N1a5VCX-X1brrcKRKZbG5LQDhYTU_2ObTuBRBU5gk0zG7hb5yizZiYUR0CS1y3Zt0H-yQ",@"txsig":
               @{@"v":@27,@"r":@"QWv2w5Mma5RncmBJst1UsBtA8IwWJV4UI9V9AqETcqI=",@"s":@"PZrS9WhDochBeH6DqlCgnqb2tHmIjIZjm8+Av0Lxr/0="
                 }
             }];
};

- (void)testCheckWithReferenceData {
//  NSLog(@"testCheckWithReferenceData <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
  NSArray *keyPairs = referenceKeyPairs();
  XCTestExpectation *kpExpectations = [self expectationWithDescription:@"finished keypair"];
  kpExpectations.expectedFulfillmentCount = [keyPairs count];
  NSString *txData = @"9oCFC6Q7dACDL+/YlJ4gaMziLeTh6A8Vy3HvQ1ogo7N8iA3gtrOnZAAAiQq83vASNFZ4kByAgA==";
  NSData *jwtData = [[NSData alloc] initWithBase64EncodedString:@"ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOa3NpZlEuZXlKcGMzTWlPaUl6TkhkcWMzaDNkbVIxWVc1dk4wNUdRemgxYWs1S2JrWnFZbUZqWjFsbFYwRTRiU0lzSW1saGRDSTZNVFE0TlRNeU1URXpNeXdpWTJ4aGFXMXpJanA3SW01aGJXVWlPaUpDYjJJaWZTd2laWGh3SWpveE5EZzFOREEzTlRNemZR" options:0];
  
  for (NSDictionary *kp in keyPairs) {
//    NSLog(@"Keypair %@ --------------------------------------------", kp[@"address"]);
    NSData *privateKeyData32Bytes = [UPTEthSigner dataFromHexString:kp[@"privateKey"]];
    XCTAssertEqual(privateKeyData32Bytes.length, 32, @"decoded private key has correct length");
    BTCKey *keyPair = [[BTCKey alloc] initWithPrivateKey:privateKeyData32Bytes];
    XCTAssertEqualObjects(privateKeyData32Bytes, keyPair.privateKey, @"private data keys dont match" );
    
    NSString *hexPublicKeyRecreation = [UPTEthSigner hexStringWithDataKey:keyPair.publicKey];
    XCTAssertEqualObjects(hexPublicKeyRecreation, kp[@"publicKey"], @"public key generation incorrect" );
    
    NSString *ethAddress = [UPTEthSigner ethAddressWithPublicKey:keyPair.publicKey];
    XCTAssertEqualObjects(ethAddress, kp[@"address"], @"address generation incorrect" );
    
    NSString *hexPrivateKeyRecreation = [UPTEthSigner hexStringWithDataKey:keyPair.privateKey];
//    NSLog( @"privatekey reference: %@ and generated privateKey: %@", kp[@"privateKey"], hexPrivateKeyRecreation);
    XCTAssertEqualObjects(hexPrivateKeyRecreation, kp[@"privateKey"], @"hex generation of private key did not match");
    
    [UPTEthSigner saveKey:privateKeyData32Bytes protectionLevel:UPTEthKeychainProtectionLevelNormal result:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
      if (error) {
        XCTAssertNil(error, @"error saving private key: %@", error);
        [kpExpectations fulfill];
      } else {
        XCTAssertEqualObjects(ethAddress, kp[@"address"], @"eth addresses did not match");
        
        NSString *refPublicKey = [[UPTEthSigner dataFromHexString:kp[@"publicKey"]] base64EncodedStringWithOptions:0];
        XCTAssertEqualObjects(publicKey, refPublicKey, @"public key generation incorrect" );
        
        [UPTEthSigner signTransaction:kp[@"address"] data:txData userPrompt:@"signing test" result:^(NSDictionary *signature, NSError *error) {
          if ( !error ) {
//            NSLog(@"signature: %@", signature);
            XCTAssertEqualObjects(signature[@"r"], kp[@"txsig"][@"r"], @"signature r value did not match");
            XCTAssertEqualObjects(signature[@"s"], kp[@"txsig"][@"s"], @"signature s value did not match");
            XCTAssertEqualObjects(signature[@"v"], kp[@"txsig"][@"v"], @"signature v value did not match");
            [UPTEthSigner signJwt:kp[@"address"] userPrompt:@"test signing data" data:jwtData result:^(NSDictionary *signature, NSError *error) {
              XCTAssertNil(error, @"error signing transaction: %@", error);
              XCTAssertEqualObjects(signature, kp[@"jwtsig"], @"signature did not match");
              [kpExpectations fulfill];
            }];
          } else {
//            NSLog(@"error signing transaction : %@", error);
            XCTAssertNil(error, @"error signing transaction: %@", error);
            [kpExpectations fulfill];
          }
        }];
      }
    }];
  }
  [self waitForExpectationsWithTimeout:10 handler:^(NSError *error) {
    NSLog(@"error running full tests : %@", error);
  }];
//  NSLog(@"FINISHED testCheckWithReferenceData <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
}



@end
