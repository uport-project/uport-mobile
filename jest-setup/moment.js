const moment = require.requireActual('moment-timezone');
jest.doMock('moment', () => {
  moment.tz.setDefault('America/New_York')
  return moment
})
