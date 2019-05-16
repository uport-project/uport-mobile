import disclosureRequestModel from '.././DisclosureRequestModel'

const CreateAccountProps = {
  actType: 'keypair',
  account: null,
  accountAuthorized: false,
  client: {
    avatar: '',
    bannerImage: '',
    name: 'Uport Test Labs',
  },
}
const ShareLoginProps = {
  actType: 'none',
  account: true,
  accountAuthorized: true,
  client: {
    avatar: '',
    bannerImage: '',
    name: 'Uport Test Labs',
  },
}

const CreateAccountModel = {
  title: 'Create Account',
  description: 'You need to create an ethereum account to interact with Uport Test Labs',
  actionButton: {
    text: 'Create',
  },
  cancelButton: {
    text: 'Cancel',
  },
}

const ShareAccountModel = {
  title: 'Share to login',
  description: null,
  actionButton: {
    text: 'Login',
  },
  cancelButton: {
    text: 'Cancel',
  },
}

describe('Disclosure Request Model', () => {
  it('Create Account: creates a data model for disclosure request', () => {
    const requestModel = disclosureRequestModel(CreateAccountProps)

    expect(requestModel && requestModel.title).toEqual(CreateAccountModel.title)
    expect(requestModel && requestModel.description).toEqual(CreateAccountModel.description)
    expect(requestModel && requestModel.actionButton.text).toEqual(CreateAccountModel.actionButton.text)
    expect(requestModel && requestModel.cancelButton.text).toEqual(CreateAccountModel.cancelButton.text)
  })

  it('Share Account: creates a data model for disclosure request', () => {
    const requestModel = disclosureRequestModel(ShareLoginProps)

    expect(requestModel && requestModel.title).toEqual(ShareAccountModel.title)
    expect(requestModel && requestModel.description).toEqual(ShareAccountModel.description)
    expect(requestModel && requestModel.actionButton.text).toEqual(ShareAccountModel.actionButton.text)
    expect(requestModel && requestModel.cancelButton.text).toEqual(ShareAccountModel.cancelButton.text)
  })
})
