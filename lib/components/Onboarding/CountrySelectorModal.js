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
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import ClosableModal from '../shared/ClosableModal'
import CountrySelector from '../shared/CountrySelector'

// Actions
import { addData } from 'uPortMobile/lib/actions/onboardingActions'

export class CountrySelectorModal extends Component {
  static navigatorStyle = {
    navBarHidden: true,
    statusBarHideWithNavBar: false,
  }

  render () {
    const props = this.props
    return (
      <ClosableModal
        navigator={props.navigator}
        title='Select your country'
      >
        <CountrySelector
          selectedCountry={props.selectedCountry}
          onSelect={code => {
            props.onSelect && props.onSelect(code)
            props.navigator && props.navigator.dismissModal()
          }}
        />
      </ClosableModal>
    )
  }
}

CountrySelectorModal.propTypes = {
  title: PropTypes.string,
  selectedCountry: PropTypes.string,
  onSelect: PropTypes.func,
  onClose: PropTypes.func
}

const mapStateToProps = (state) => {
  return {
    selectedCountry: state.onboarding.userData.country
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    onSelect: (country) => {
      dispatch(addData({country}))
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CountrySelectorModal)
