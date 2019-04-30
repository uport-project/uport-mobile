jest.mock('../lib/helpers/authorize', () => {
  return function authorize () { return true }
})
