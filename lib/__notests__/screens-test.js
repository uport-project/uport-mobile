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
import { registerScreens } from 'uPortMobile/lib/screens.js'
import FakeProvider from '../../testHelpers/FakeProvider'
import FakeStore from '../../testHelpers/FakeStore'
jest.mock('uPortMobile/lib/start/start', () => {
  return {
    startMain: () => true
  }
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

describe('registerScreens', () => {
  it('calls Navigation.registerComponent for each screen', () => {
    const navigator = jest.fn()
    navigator.registerComponent = jest.fn()
    registerScreens(null, null, navigator)
    expect(navigator.registerComponent).toHaveBeenCalled()
  })
})
