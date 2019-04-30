import FakeNavigator from 'uPortMobile/lib/components/testHelpers/FakeNavigator'
import configureStore from 'redux-mock-store'
const middlewares = []
global.mockStore = configureStore(middlewares)
global.FakeNavigator = FakeNavigator
