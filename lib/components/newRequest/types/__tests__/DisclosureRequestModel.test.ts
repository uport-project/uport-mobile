import disclosureRequestModel from '.././DisclosureRequestModel'

describe('Disclosure Request Model', () => {
  it('Create Account: creates a data model for disclosure request', () => {
    const props = {
      actType: 'keypair',
      account: null,
      accountAuthorized: false,
      client: {
        avatar: '',
        bannerImage: '',
        name: 'Uport Test Labs',
      },
    }

    const model = {
      title: 'Create Account',
      description: 'You need to create an ethereum account to interact with Uport Test Labs',
      actionButton: {
        text: 'Create',
      },
      cancelButton: {
        text: 'Cancel',
      },
    }

    const requestModel = disclosureRequestModel(props)

    expect(requestModel && requestModel.title).toEqual(model.title)
    expect(requestModel && requestModel.description).toEqual(model.description)
    expect(requestModel && requestModel.actionButton.text).toEqual(model.actionButton.text)
    expect(requestModel && requestModel.cancelButton.text).toEqual(model.cancelButton.text)
    expect(requestModel && requestModel.requestItems).toEqual([])
    expect(requestModel).toMatchSnapshot()
  })

  it('Share Account: creates a data model for disclosure request', () => {
    const props = {
      actType: 'none',
      account: true,
      accountAuthorized: true,
      client: {
        avatar: '',
        bannerImage: '',
        name: 'Uport Test Labs',
      },
    }

    const model = {
      title: 'Share to login',
      description: null,
      actionButton: {
        text: 'Login',
      },
      cancelButton: {
        text: 'Cancel',
      },
    }

    const requestModel = disclosureRequestModel(props)

    expect(requestModel && requestModel.title).toEqual(model.title)
    expect(requestModel && requestModel.description).toEqual(model.description)
    expect(requestModel && requestModel.actionButton.text).toEqual(model.actionButton.text)
    expect(requestModel && requestModel.cancelButton.text).toEqual(model.cancelButton.text)
    expect(requestModel && requestModel.requestItems).toEqual([])
    expect(requestModel).toMatchSnapshot()
  })

  it('with user info', () => {
    const props = {
      actType: 'none',
      account: true,
      accountAuthorized: true,
      client: {
        avatar: '',
        bannerImage: '',
        name: 'Uport Test Labs',
      },
      requested: {
        name: 'Bob Smith',
        email: 'bob@email.com'
      }
    }

    const model = {
      title: 'Share to login',
      description: null,
      actionButton: {
        text: 'Login',
      },
      cancelButton: {
        text: 'Cancel',
      },
      requestItems: [{
        key: "0name",
        type: "Name",
        value: "Bob Smith"
      }, {
        key: '1email',
        type: 'Email',
        value: 'bob@email.com'
      }]
    }

    const requestModel = disclosureRequestModel(props)

    expect(requestModel && requestModel.title).toEqual(model.title)
    expect(requestModel && requestModel.description).toEqual(model.description)
    expect(requestModel && requestModel.actionButton.text).toEqual(model.actionButton.text)
    expect(requestModel && requestModel.cancelButton.text).toEqual(model.cancelButton.text)
    expect(requestModel && requestModel.requestItems).toEqual(model.requestItems)
    expect(requestModel).toMatchSnapshot()
  })

  it('with verified credentials', () => {
    const props = {
      actType: 'none',
      account: true,
      accountAuthorized: true,
      client: {
        avatar: '',
        bannerImage: '',
        name: 'Uport Test Labs',
      },
      verified: [
        { iss: '0x1a', issuer: {}, claimType: 'name' },
        { iss: '0x1b', issuer: {}, claimType: 'email' }
      ]
    }

    const model = {
      title: 'Share to login',
      description: null,
      actionButton: {
        text: 'Login',
      },
      cancelButton: {
        text: 'Cancel',
      },
      verifiedCredentials: [
        { iss: '0x1a', issuer: {}, claimType: 'name' },
        { iss: '0x1b', issuer: {}, claimType: 'email' }
      ]
    }

    const requestModel = disclosureRequestModel(props)

    expect(requestModel && requestModel.title).toEqual(model.title)
    expect(requestModel && requestModel.description).toEqual(model.description)
    expect(requestModel && requestModel.actionButton.text).toEqual(model.actionButton.text)
    expect(requestModel && requestModel.cancelButton.text).toEqual(model.cancelButton.text)
    expect(requestModel && requestModel.verifiedCredentials).toEqual(model.verifiedCredentials)
    expect(requestModel).toMatchSnapshot()
  })


  it('with missing credentials', () => {
    const props = {
      actType: 'none',
      account: true,
      accountAuthorized: true,
      client: {
        avatar: '',
        bannerImage: '',
        name: 'Uport Test Labs',
      },
      missing: [{
        claimType: 'name',
        essential: true,
        reason: 'We need this'
      },
      {
        claimType: 'email',
        reason: 'We dont need this'
      }]
    }

    const model = {
      title: 'Share to login',
      description: null,
      actionButton: {
        text: 'Login',
      },
      cancelButton: {
        text: 'Cancel',
      },
      missingCredentials: [{
        claimType: 'name',
        essential: true,
        reason: 'We need this'
      },
      {
        claimType: 'email',
        reason: 'We dont need this'
      }]
    }

    const requestModel = disclosureRequestModel(props)

    expect(requestModel && requestModel.title).toEqual(model.title)
    expect(requestModel && requestModel.description).toEqual(model.description)
    expect(requestModel && requestModel.actionButton.text).toEqual(model.actionButton.text)
    expect(requestModel && requestModel.cancelButton.text).toEqual(model.cancelButton.text)
    expect(requestModel && requestModel.missingCredentials).toEqual(model.missingCredentials)
    expect(requestModel).toMatchSnapshot()
  })

})
