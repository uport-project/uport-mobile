// This file is part of the uPort Mobile App.

// The uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// The uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with The uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.

// (C) Copyright 2016-2018 ConsenSys AG

import {authorizePhotos, authorizeCamera} from '../authorizationActions.js'

it('creates a AUTHORIZE_PHOTOS action', () => {
  expect(authorizePhotos('authorized')).toMatchSnapshot()
})

it('creates a AUTHORIZE_CAMERA action', () => {
  expect(authorizeCamera('done')).toMatchSnapshot()
})
