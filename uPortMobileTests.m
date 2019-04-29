/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>

#import "RCTLog.h"
#import "RCTRootView.h"

#define TIMEOUT_SECONDS 600
#define TEXT_TO_LOOK_FOR @"Welcome to React Native!"

@interface uPortMobileTests : XCTestCase

@end

@implementation uPortMobileTests

/**
 *  Tests if app booted via checking if the rootViewController has a view. If so,
 *  AppDelegate:application: didFinishLaunchingWithOptions: was called
 */
- (void)testAppBooted
{
  UIViewController *rootViewController = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
  XCTAssertTrue([rootViewController view], @"app has a root view controller with a view");
}


@end
