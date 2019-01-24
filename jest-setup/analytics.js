jest.mock('uPortMobile/lib/utilities/analytics', () => {
  return {
    identify: () => ({}),
    screen: () => ({}),
    track: () => true
  }
})
