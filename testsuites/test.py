#!/usr/bin/env python
# -*- coding: utf-8 -*- 

from appium import webdriver
from appium.webdriver.common.touch_action import TouchAction
from support.common_methods import select_element, find_uportapp
from os.path import expanduser

import unittest
import os
import glob
import shutil


class identityTests(unittest.TestCase):

    def test_createIdentity(self):
        this_dir =  os.path.abspath(os.path.dirname(__file__))
        print this_dir + " **file directory"
        #uportapp = find_uportapp()
        desired_caps = {}
        desired_caps['platformName'] = 'iOS'
        desired_caps['platformVersion'] = '12.1'
        desired_caps['deviceName'] = 'iPhone XR' # Run on simulator
        cwd = os.getcwd()
        print cwd + " **current directory"
        current_dir =  os.path.abspath(os.path.dirname(__file__))
        desired_caps['app'] = os.path.join(os.path.abspath(current_dir + "/../"),"ios", "build", "uPortMobile", "Build", "Products", "Debug-iphonesimulator", "uPort.app")  
    
        #desired_caps['fullReset'] = 'true'
        desired_caps['automationName'] = "XCUITest"
        self.wd = webdriver.Remote('http://0.0.0.0:4723/wd/hub', desired_caps)

        self.wd.implicitly_wait(10)
        #screenshot
        directory = '%s/' % os.getcwd()
        file_name = 'screenshot.png'
        self.wd.save_screenshot(directory + file_name)

        self.assertTrue(select_element(self.wd, "Dismiss All").is_displayed()) #dismiss 
        select_element(self.wd, "Dismiss All").click()
        
        self.assertTrue(select_element(self.wd, "ONBOARDING_GET_STARTED").is_displayed()) #select onboarding
        select_element(self.wd, "ONBOARDING_GET_STARTED").click()

        self.assertTrue(select_element(self.wd, "ONBOARDING_LEARN_CONTINUE").is_displayed()) #select onboarding
        select_element(self.wd, "ONBOARDING_LEARN_CONTINUE").click()

        #type in uport user and press enter ("\n")
        self.wd.find_element_by_id("Enter name or username").send_keys('Sanaa'+"\n")
        
        self.wd.implicitly_wait(5)

        self.assertTrue(select_element(self.wd, "ONBOARDING_TERMS_RADIO").is_displayed()) #terms
        select_element(self.wd, "ONBOARDING_TERMS_RADIO").click()

      
        self.assertTrue(select_element(self.wd, "ONBOARDING_PRIVACY_RADIO").is_displayed()) #terms
        select_element(self.wd, "ONBOARDING_PRIVACY_RADIO").click()

        self.assertTrue(select_element(self.wd, "ONBOARDING_CREATE_IDENTITY").is_displayed()) #create identity
        select_element(self.wd, "ONBOARDING_CREATE_IDENTITY").click()
        

         # notifications permissions
        if self.assertFalse(select_element(self.wd, "Allow").is_displayed()): 
            select_element(self.wd, "").click()
        else:
            select_element(self.wd, "Allow").click()
          

        #verify did is created
        #self.assertTrue(select_element(self.wd, "uPort ID ").is_displayed()) 
        #select_element(self.wd, "uPort ID ").click()
       
        #self.assertTrue(select_element(self.wd, "DID did:ethr:0x6...").is_displayed()) 
        #select_element(self.wd, "DID did:ethr:0x6...").click()

              
      
       
                
        

if __name__ == '__main__':
  unittest.main()
