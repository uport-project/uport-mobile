import * as parseClaims from '../parseClaims'

const verificationWithClaimType = {
  claimType: 'Test verification',
  claim: {
    'Test verification': {
      name: 'test',
    },
  },
}

const verificationWithSinglekey = {
  claim: {
    'Single key Claim': {
      location: 'Africa',
    },
  },
}

const simpleVerification = {
  claim: {
    name: 'Test',
    location: 'Spain',
    age: 100,
  },
}

const complexVerification = {
  claim: {
    'Complex Claim': {
      address: {
        street: '21 Testing Avenue',
        city: 'Test City',
      },
      cars: [
        {
          name: 'Audi',
          model: 'R8',
          used: false,
        },
        {
          name: 'Jaguar',
          model: 'Unknown',
          used: true,
        },
      ],
    },
  },
}

const credentialItems = {
  truthy: true,
  falsey: false,
  string: 'hello Credential item',
  image: 'https://aws.bucket.funnycats.jpg',
  number: 123,
  url: 'https://www.funnycats.com',
}

describe('Parse claims', () => {
  it('should return a claimtype', () => {
    const claimType = parseClaims.extractClaimType(verificationWithClaimType)
    expect(claimType).toEqual(verificationWithClaimType.claimType)
  })

  it('should return true for a topLevel single key claim', () => {
    const isTopLevel = parseClaims.isTopLevelSingleKey(verificationWithSinglekey, 0)
    expect(isTopLevel).toBeTruthy()
  })

  it('should return the string', () => {
    const item = parseClaims.renderCrendentialItem(credentialItems.string)
    expect(item).toEqual(credentialItems.string)
  })

  it('should convert true to Yes', () => {
    const item = parseClaims.renderCrendentialItem(credentialItems.truthy)
    expect(item).toEqual('Yes')
  })

  it('should convert false to No', () => {
    const item = parseClaims.renderCrendentialItem(credentialItems.falsey)
    expect(item).toEqual('No')
  })

  it('should return null for an image url', () => {
    const item = parseClaims.renderCrendentialItem(credentialItems.image)
    expect(item).toEqual(null)
  })

  it('should return input for url', () => {
    const item = parseClaims.renderCrendentialItem(credentialItems.url)
    expect(item).toEqual(credentialItems.url)
  })

  it('should normailse a simple claim', () => {
    const normalised = parseClaims.normaliseClaimTree(simpleVerification.claim)

    expect(normalised).toEqual([
      {
        level: 0,
        key: '00name',
        keyName: 'name',
        title: 'Name',
        hasChildren: false,
        isList: false,
        isListItem: false,
        hidden: false,
        value: 'Test',
      },
      {
        level: 0,
        key: '01location',
        keyName: 'location',
        title: 'Location',
        hasChildren: false,
        isList: false,
        isListItem: false,
        hidden: false,
        value: 'Spain',
      },
      {
        level: 0,
        key: '02age',
        keyName: 'age',
        title: 'Age',
        hasChildren: false,
        isList: false,
        isListItem: false,
        hidden: false,
        value: 100,
      },
    ])
  })

  it('should normailse a complex claim', () => {
    const normalised = parseClaims.normaliseClaimTree(complexVerification.claim)

    expect(normalised).toEqual([
      {
        level: 0,
        key: '00complex claim',
        keyName: 'Complex Claim',
        title: 'Complex Claim',
        hasChildren: true,
        isList: false,
        isListItem: false,
        hidden: false,
        value: [
          {
            level: 1,
            key: '10address',
            keyName: 'address',
            title: 'Address',
            hasChildren: true,
            isList: false,
            isListItem: false,
            hidden: false,
            value: [
              {
                level: 2,
                key: '20street',
                keyName: 'street',
                title: 'Street',
                hasChildren: false,
                isList: false,
                isListItem: false,
                hidden: false,
                value: '21 Testing Avenue',
              },
              {
                level: 2,
                key: '21city',
                keyName: 'city',
                title: 'City',
                hasChildren: false,
                isList: false,
                isListItem: false,
                hidden: false,
                value: 'Test City',
              },
            ],
          },
          {
            level: 1,
            key: '11cars',
            keyName: 'cars',
            title: 'Cars',
            hasChildren: true,
            isList: true,
            isListItem: false,
            hidden: false,
            value: [
              {
                level: 2,
                key: '200',
                keyName: '0',
                title: '0',
                hasChildren: true,
                isList: false,
                isListItem: false,
                hidden: false,
                value: [
                  {
                    level: 3,
                    key: '30name',
                    keyName: 'name',
                    title: 'Name',
                    hasChildren: false,
                    isList: false,
                    isListItem: false,
                    hidden: false,
                    value: 'Audi',
                  },
                  {
                    level: 3,
                    key: '31model',
                    keyName: 'model',
                    title: 'Model',
                    hasChildren: false,
                    isList: false,
                    isListItem: false,
                    hidden: false,
                    value: 'R8',
                  },
                  {
                    level: 3,
                    key: '32used',
                    keyName: 'used',
                    title: 'Used',
                    hasChildren: false,
                    isList: false,
                    isListItem: false,
                    hidden: false,
                    value: false,
                  },
                ],
              },
              {
                level: 2,
                key: '211',
                keyName: '1',
                title: '1',
                hasChildren: true,
                isList: false,
                isListItem: false,
                hidden: false,
                value: [
                  {
                    level: 3,
                    key: '30name',
                    keyName: 'name',
                    title: 'Name',
                    hasChildren: false,
                    isList: false,
                    isListItem: false,
                    hidden: false,
                    value: 'Jaguar',
                  },
                  {
                    level: 3,
                    key: '31model',
                    keyName: 'model',
                    title: 'Model',
                    hasChildren: false,
                    isList: false,
                    isListItem: false,
                    hidden: false,
                    value: 'Unknown',
                  },
                  {
                    level: 3,
                    key: '32used',
                    keyName: 'used',
                    title: 'Used',
                    hasChildren: false,
                    isList: false,
                    isListItem: false,
                    hidden: false,
                    value: true,
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
  })
})
