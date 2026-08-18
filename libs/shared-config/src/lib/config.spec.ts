import {
  getRediConnectLocationDetails,
  getRediLocationMatchingPool,
} from './config'

describe('ReDI location configuration', () => {
  it.each([
    ['BERLIN', ['BERLIN', 'HAMBURG', 'MUNICH', 'NRW', 'CYBERSPACE']],
    ['MALMO', ['MALMO']],
    ['COPENHAGEN', ['COPENHAGEN']],
  ])('resolves the matching pool for %s', (location, expectedPool) => {
    expect(getRediLocationMatchingPool(location)).toEqual(expectedPool)
  })

  it('does not resolve an unknown matching pool', () => {
    expect(getRediLocationMatchingPool('UNKNOWN')).toBeUndefined()
  })

  it('provides Copenhagen-specific Connect details', () => {
    expect(getRediConnectLocationDetails('COPENHAGEN')).toEqual(
      expect.objectContaining({
        senderName: 'ReDI Copenhagen Team',
        contactEmail: 'vibe@redi-school.org',
        websiteUrl: 'https://www.redi-school.org/redi-school-copenhagen',
      })
    )
  })
})
