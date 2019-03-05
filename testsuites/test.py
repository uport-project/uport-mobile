#!/usr/bin/env python
# -*- coding: utf-8 -*- 

from appium import webdriver
from appium.webdriver.common.touch_action import TouchAction
from support.common_methods import select_element, find_uportapp
from os.path import expanduser

import unittest
import os
import glob


class identityTests(unittest.TestCase):

    def test_createIdentity(self):
        this_dir =  os.path.abspath(os.path.dirname(__file__))
        print this_dir + " **file directory"
        uportapp = find_uportapp()
        desired_caps = {}
        desired_caps['platformName'] = 'iOS'
        desired_caps['platformVersion'] = '12.1'
        desired_caps['deviceName'] = 'iPhone XR' # Run on simulator
        cwd = os.getcwd()
        print cwd + " **current directory"
        desired_caps['app'] = os.path.abspath('/Users/distiller/uport-mobile/ios/build/Build/Products/Debug-iphonesimulator/uPort.app') # Path to target .app
        #desired_caps['fullReset'] = 'true'
        desired_caps['automationName'] = "XCUITest"
        self.wd = webdriver.Remote('http://0.0.0.0:4723/wd/hub', desired_caps)

        self.wd.implicitly_wait(10)
        self.assertTrue(select_element(self.wd, "Create Identity").is_displayed()) #select create identity
        select_element(self.wd, "Create Identity").click()

        self.assertTrue(select_element(self.wd, "Accept").is_displayed()) #  terms
        select_element(self.wd, "Accept").click()

        self.assertTrue(select_element(self.wd, "Agree").is_displayed())
        select_element(self.wd, "Agree").click()
        
        self.assertTrue(select_element(self.wd, "Continue").is_displayed()) # verify Identity is created
        select_element(self.wd, "Continue").click()
        self.wd.implicitly_wait(10)
        
        self.assertTrue(select_element(self.wd, "menu_bar").is_displayed()) #select left hand menu bar
        select_element(self.wd, "menu_bar").click()
        self.wd.implicitly_wait(10)
        
        self.assertTrue(select_element(self.wd, "Try uPort ").is_displayed()) # navigate to demo
        select_element(self.wd, "Try uPort ").click()
        self.wd.implicitly_wait(10)

        self.assertTrue(select_element(self.wd, "Interactive Demo https://demo.uport.me... ").is_displayed()) #select interactive demo
        select_element(self.wd, "Interactive Demo https://demo.uport.me... ").click()
        self.wd.implicitly_wait(70)
        
        self.assertTrue(select_element(self.wd, "Connect with uPort").is_displayed())
        select_element(self.wd, "Connect with uPort").click()
        self.wd.implicitly_wait(30)
        
        self.assertTrue(select_element(self.wd, "Open").is_displayed())
        select_element(self.wd, "Open").click()
        self.wd.implicitly_wait(60)

        self.assertTrue(select_element(self.wd, "Allow").is_displayed())
        select_element(self.wd, "Allow").click()

        self.assertTrue(select_element(self.wd, "Login ").is_displayed())
        select_element(self.wd, "Login ").click()

        self.wd.implicitly_wait(60)
        
        self.assertTrue(select_element(self.wd, " CREATE NEW ACCOUNT ").is_displayed())
        select_element(self.wd, " CREATE NEW ACCOUNT ").click()

        self.wd.implicitly_wait(10)
        self.assertTrue(select_element(self.wd, " SHARE YOUR INFORMATION ").is_displayed())
        select_element(self.wd, " SHARE YOUR INFORMATION ").click()

        self.wd.implicitly_wait(10)

        #scroll down
        el = self.wd.find_element_by_id('Next')
        self.wd.execute_script('mobile: scroll', {"element": el, "toVisible": True})

        self.wd.implicitly_wait(10)

        
        self.assertTrue(select_element(self.wd, "Next").is_displayed())
        TouchAction(self.wd).tap(None, 138, 792, 1).perform()

        #nextButton.click()

        self.wd.implicitly_wait(10)
        
        #tap textfield
       # TouchAction(self.wd).tap(None, 163, 371, 1).perform()
        

        #self.wd.implicitly_wait(10)

        #self.wd.sendeys
        #shares = TouchAction(self.wd).tap(None, 163, 371, 1)
        #actions = ActionChains(self.wd)
        #shares.send_keys("1")

        #self.wd.find_element_by_id("WebView").send_keys(1)

        #self.wd.execute_script("mobile: key_event", 1)

        directory = '%s/' % os.getcwd()
        file_name = 'screenshot.png'

        self.wd.save_screenshot(directory + file_name)
        


if __name__ == '__main__':
  unittest.main()
