/* eslint-env mocha */
'use strict'

require('./helpers/setup')

var wd = require('wd')
var _ = require('underscore')
var serverConfigs = require('./helpers/appium-servers')

describe('create uport', function () {
  this.timeout(300000)
  var driver
  var allPassed = true

  before(function () {
    var serverConfig = process.env.npm_package_config_sauce ? serverConfigs.sauce : serverConfigs.local
    driver = wd.promiseChainRemote(serverConfig)
    require('./helpers/logging').configure(driver)

    var desired = _.clone(require('./helpers/caps').ios101)
    desired.app = require('./helpers/apps').iosTestApp
    /*  if (process.env.npm_package_config_sauce) {
      desired.name = 'ios - simple';
      desired.tags = ['sample'];
    } */
    return driver.init(desired)
  })

  after(function () {
    return driver
      .quit()
      .finally(function () {
        /*  if (process.env.npm_package_config_sauce) {
              return driver.sauceJobStatus(allPassed);
            }
        */
      })
  })

  afterEach(function () {
    allPassed = allPassed && this.currentTest.state === 'passed'
  })

  it('Displays disclaimer modal', function () {
    return driver
      .waitForElementById('createUport').then(function (el) {
        return el.click().sleep(1000).then()
        .waitForElementById('disclaimerModal').then(function (element) {
          if (element) {
            return true
          } else {
            return false
          }
        })
      }).should.eventually.be.ok
  })
})
