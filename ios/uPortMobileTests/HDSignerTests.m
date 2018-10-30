//
//  HDSignerTests.m
//  uPortMobileTests
//
//  Created by josh on 1/9/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <XCTest/XCTest.h>
#import <CoreBitcoin/CoreBitcoin.h>
#import "UPTHDSigner+Utils.h"
#import "UPTHDSigner.h"

@interface HDSignerTests : XCTestCase

@end

@implementation HDSignerTests

- (void)testSeedCreationAndUsage {

    [UPTHDSigner createHDSeed:UPTHDSignerProtectionLevelNormal callback:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        XCTAssertNil(error);
        NSString *validAddressRegex = @"^0x[0-9a-fA-F]+$";
        NSPredicate *isAddressPredicate = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", validAddressRegex];
        XCTAssertTrue([isAddressPredicate evaluateWithObject: ethAddress] );
        NSData *publicKeyData = [[NSData alloc] initWithBase64EncodedString:publicKey options:NSDataBase64DecodingIgnoreUnknownCharacters];
        XCTAssertEqual(publicKeyData.length, 65 );
        NSData *dataHello = [@"hello" dataUsingEncoding:NSUTF8StringEncoding];
        NSString *base64Hello = [dataHello base64EncodedStringWithOptions:0];
        [UPTHDSigner signJWT:ethAddress derivationPath:@"m/0" data:base64Hello prompt:@"" callback:^(NSDictionary *signature, NSError *error) {
            XCTAssertNil(error);
        }];
    }];
}

- (void)testSeedImport {
    NSString *referenceSeedPhrase = @"vessel ladder alter error federal sibling chat ability sun glass valve picture";
    NSString *referenceAddress = @"0x794adde0672914159c1b77dd06d047904fe96ac8";
    NSString *referencePublicKey = @"BFcWkA3uvBb9nSyJmk5rJgx69UtlGN0zwDiNx5TcVmENEUcvF2V26GYP9/3HNE/7vquemm45hDYEqr1/Nph9aIE=";
    [UPTHDSigner importSeed:UPTHDSignerProtectionLevelNormal phrase:referenceSeedPhrase callback:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        XCTAssertNil(error);
        XCTAssertEqualObjects(ethAddress, referenceAddress);
        XCTAssertEqualObjects(referencePublicKey, publicKey);
    }];
}

- (void)testSeedImportAndUsage {
    NSString *referenceSeedPhrase = @"vessel ladder alter error federal sibling chat ability sun glass valve picture";
    NSString *referenceRootAddress = @"0x794adde0672914159c1b77dd06d047904fe96ac8";
//    NSString *referenceSignature = @"lnEso6Io2pJvlC6sWDLRkvxvpXqcUpZpvr4sdpHcTGA66Y1zher8KlrnWzQ2tt_lpxpx2YYdbfdtkfVmwjex2Q";
    NSDictionary *referenceSignature = @{
                                       @"r": @"19oGuThPgIlJ9Bq93/79CXL78eO/mDvUnlXvmKJck0g=",
                                       @"s": @"bwNq1IFx1OcoE1L2uCCfkr4ZvjOsFwL5K7m9hjv5KEg=",
                                       @"v": @27
                                       };
    NSData *dataHelloWorld = [@"Hello world" dataUsingEncoding:NSUTF8StringEncoding];
    NSString *base64HelloWorld = [dataHelloWorld base64EncodedStringWithOptions:0];

    [UPTHDSigner importSeed:UPTHDSignerProtectionLevelNormal phrase:referenceSeedPhrase callback:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        XCTAssertNil(error);
        XCTAssertEqualObjects(referenceRootAddress, ethAddress);
        [UPTHDSigner signJWT:referenceRootAddress derivationPath:UPORT_ROOT_DERIVATION_PATH data:base64HelloWorld prompt:@"" callback:^(NSDictionary *signature, NSError *jwtError) {
            XCTAssertNil(jwtError);
            XCTAssertEqualObjects(referenceSignature, signature);
        }];
    }];
}

- (void)testShowSeed {
    NSString *referenceSeedPhrase = @"idle giraffe soldier dignity angle tiger false finish busy glow ramp frog";
    NSString *referenceRootAddress = @"0xd2bf228f4bf45a9a3d2247d27235e4c07ff0c275";

    [UPTHDSigner importSeed:UPTHDSignerProtectionLevelNormal phrase:referenceSeedPhrase callback:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        XCTAssertNil(error);
        XCTAssertEqualObjects(referenceRootAddress, ethAddress);
        [UPTHDSigner showSeed:referenceRootAddress prompt:@"" callback:^(NSString *phrase, NSError *seedError) {
            XCTAssertNil(seedError);
            XCTAssertEqualObjects(referenceSeedPhrase, phrase);
        }];
    }];
}

- (void)testPrivateKeyExport {
    NSString *referenceSeedPhrase = @"vessel ladder alter error federal sibling chat ability sun glass valve picture";
    NSString *referenceSeedAddress = @"0x794adde0672914159c1b77dd06d047904fe96ac8";
    NSString *referencePrivateKey = @"ZfxnDZNRy4fR9WcC+1angyriqrNCe+lEq4yfKgq4eWA=";
    [UPTHDSigner importSeed:UPTHDSignerProtectionLevelNormal phrase:referenceSeedPhrase callback:^(NSString *ethAddress, NSString *publicKey, NSError *error) {
        XCTAssertNil(error);
        [UPTHDSigner privateKeyForPath:ethAddress derivationPath:UPORT_ROOT_DERIVATION_PATH prompt:@"" callback:^(NSString *privateKeyBase64, NSError *error) {
            XCTAssertEqualObjects(referencePrivateKey, privateKeyBase64);
        }];
    }];
}

#pragma mark - Basic tests

- (void)testThatEntropyAndWordsAreBidirectional {
    NSString *entropy = @"f585c11aec520db57dd353c69554b21a89b20fb0650966fa0a9d6f74fd989d8f";
    NSString *phrase = @"void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold";
    NSString *seed = @"01f5bced59dec48e362f2c45b5de68b9fd6c92c6634f44d6d40aab69056506f0e35524a518034ddc1192e1dacd32c1ed3eaa3c3b131c88ed8e7e54c49a5d0998";
    NSString *masterKey = @"xprv9s21ZrQH143K39rnQJknpH1WEPFJrzmAqqasiDcVrNuk926oizzJDDQkdiTvNPr2FYDYzWgiMiC63YmfPAa2oPyNB23r2g7d1yiK6WpqaQS";
    NSString *uportRoot = @"xprvA2GifNQTS6D2hS5DW29WckZ7zQ3KgT2dSWFBLXDMeHDmB4om7tyuXz6aSey473DopRsD86XaQb8G1oqoKbfd3ycXmqDqs3Nwo7LfKFFkdiH";
    NSString *password = @"TREZOR";

    NSArray<NSString *> *words = [UPTHDSigner wordsFromPhrase:phrase];
    BTCMnemonic *wordsMnemonic = [[BTCMnemonic alloc] initWithWords:words password:password wordListType:BTCMnemonicWordListTypeEnglish];
    NSLog( @"seed length -> %@, and seed itself-> %@", @(wordsMnemonic.seed.length), wordsMnemonic.seed );
    NSLog( @"seed entropy -> %@", wordsMnemonic.entropy );
    NSData *entropyData = BTCDataFromHex(entropy);
    BTCMnemonic *entropyMnemonic = [[BTCMnemonic alloc] initWithEntropy:entropyData password:password wordListType:BTCMnemonicWordListTypeEnglish];
    NSLog(@"entropyMnemonic phrase -> %@, entropyMnemonic seed -> %@", entropyMnemonic.words, entropyMnemonic.seed);
    XCTAssertEqualObjects( entropyMnemonic.seed, wordsMnemonic.seed );
}

- (void)testThatPriveKeyCanBeCreatedFromMnemonic {
    NSString *entropy = @"f585c11aec520db57dd353c69554b21a89b20fb0650966fa0a9d6f74fd989d8f";
    NSString *phrase = @"void come effort suffer camp survey warrior heavy shoot primary clutch crush open amazing screen patrol group space point ten exist slush involve unfold";
    NSString *seed = @"01f5bced59dec48e362f2c45b5de68b9fd6c92c6634f44d6d40aab69056506f0e35524a518034ddc1192e1dacd32c1ed3eaa3c3b131c88ed8e7e54c49a5d0998";
    NSString *masterKey = @"xprv9s21ZrQH143K39rnQJknpH1WEPFJrzmAqqasiDcVrNuk926oizzJDDQkdiTvNPr2FYDYzWgiMiC63YmfPAa2oPyNB23r2g7d1yiK6WpqaQS";
    NSString *uportRoot = @"xprvA2GifNQTS6D2hS5DW29WckZ7zQ3KgT2dSWFBLXDMeHDmB4om7tyuXz6aSey473DopRsD86XaQb8G1oqoKbfd3ycXmqDqs3Nwo7LfKFFkdiH";
    NSString *password = @"TREZOR";

    NSArray<NSString *> *words = [UPTHDSigner wordsFromPhrase:phrase];
    BTCMnemonic *wordsMnemonic = [[BTCMnemonic alloc] initWithWords:words password:password wordListType:BTCMnemonicWordListTypeEnglish];
    BTCKeychain *keychain = [[BTCKeychain alloc] initWithSeed:wordsMnemonic.seed];
    NSLog( @"keychain.key.pivateKey -> %@", keychain.key.privateKey );
    XCTAssertNotNil( keychain.key.privateKey );
}

- (void)testRandomEntropyProducesPhrase {
    NSData *randomEntropy = [UPTHDSigner randomEntropy];
    BTCMnemonic *mnemonic = [[BTCMnemonic alloc] initWithEntropy:randomEntropy password:@"" wordListType:BTCMnemonicWordListTypeEnglish];
    NSLog( @"random phrase -> %@", mnemonic.words );
    XCTAssertNotNil(mnemonic.words);
}

@end
