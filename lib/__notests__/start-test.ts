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

jest.mock('../store/store', () => {
  return {}
})
jest.mock('../utilities/requestQueue', () => {
  return () => null
})
jest.mock('../../node_modules/react-native-camera/src/index.js', () => {
  return {
    RNCamera: {
      constants: {
        Aspect: {
          fill: true
        }
      }  
    }
  }
})

import { startMain, startOnboarding } from 'uPortMobile/lib/start'
import { Navigation } from 'react-native-navigation'

describe('start', () => {
  it('starts the main application', () => {
    Navigation.startSingleScreenApp = jest.fn()
    startMain()
    expect(Navigation.startSingleScreenApp).toHaveBeenCalled()
  })

  it('starts the onboarding flow', () => {
    Navigation.startSingleScreenApp = jest.fn()
    startOnboarding()
    expect(Navigation.startSingleScreenApp).toHaveBeenCalled()
  })
})
