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

// https://github.com/wix/react-native-navigation/issues/993#issuecomment-294400316

class NavigationActionsClass {
  
      setNavigator(navigator) {
        this.navigator = navigator
      }
      push = (params) => this.navigator && this.navigator.push(params)
      pop = (params) => this.navigator && this.navigator.pop(params)
      popToRoot = (params) => this.navigator && this.navigator.popToRoot(params)
      resetTo = (params) => this.navigator && this.navigator.resetTo(params)
      toggleDrawer = (params) => this.navigator && this.navigator.toggleDrawer(params)
      showModal = (params) => this.navigator && this.navigator.showModal(params)
      dismissModal = () => this.navigator && this.navigator.dismissModal()
      showLightBox = (params) => this.navigator && this.navigator.showLightBox(params)
      dismissLightBox = () => this.navigator && this.navigator.dismissLightBox()
      switchToTab = (params) => this.navigator && this.navigator.switchToTab(params)
  }
  
  export const NavigationActions = new NavigationActionsClass()