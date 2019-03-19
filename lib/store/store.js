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
import { createStore as reduxCreateStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import sagaPlugin from 'reactotron-redux-saga'
import Reactotron from 'reactotron-react-native'
import { reactotronRedux } from 'reactotron-redux'
import rootReducer from '../reducers'
import { stateSaverMiddleware } from '../sagas/stateSaver'
import rootSaga from '../sagas'
import {NativeModules} from 'react-native';

let createStore = reduxCreateStore
let sagaMiddlewarePlugins

if (global.__DEV__) {

  const scriptURL = NativeModules.SourceCode.scriptURL;
  const scriptHostname = scriptURL.split('://')[1].split(':')[0];
  
  Reactotron
    .configure({ name: 'uPortMobile', host: scriptHostname })
    .useReactNative()
    .use(sagaPlugin())
    .use(reactotronRedux())
    .connect()
    .clear()
  const sagaMonitor = Reactotron.createSagaMonitor()
  sagaMiddlewarePlugins = { sagaMonitor }
  createStore = Reactotron.createStore

  console.tron = Reactotron
}

// const logMiddleware = (store) => (next) => (action) => {
//   console.log(action.type)
//   return next(action)
// }
let composeEnhancers
if (typeof window !== 'undefined') {
  composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
} else {
  composeEnhancers = compose
}
function configureStore () {
  const sagaMiddleware = createSagaMiddleware(sagaMiddlewarePlugins)
  const store = createStore(rootReducer,
                            composeEnhancers(
                              applyMiddleware(
                                // logMiddleware,
                                stateSaverMiddleware,
                                sagaMiddleware
                              )
                            ))
  sagaMiddleware.run(rootSaga)
  return store
}

// We need to export the store and not the function as we still need to access store outside of the Compoment framework
const store = configureStore()

export default store
