interface Identity {
  did: string
}

interface Account {
  address: string,
  owner: string,
  deviceAddress?: string,
  network?: string,
  signerType?: string,
  balance?: number
}

interface Contact extends Identity {
  did: string,
  name?: string,
  firstName?: string,
  lastName?: string,
  profileImage?: string,
  backgroundImage?: string,
  url?: string,
  description?: string,
}

interface VerifiableClaim {
  rowId: number,
  issuedAt?: Date,
  expiresAt?: Date,
  claim: any,
  jwt: string,
  iss?: string,
  sub?: string,
  issuer?: Contact,
  subject?: Contact,
  claimType: string,
  claimValue: string,
}

interface JwtPayload {
  iss: string,
  sub: string,
  iat?: number,
  exp?: number,
  claim?: any,
}

interface JwtDetails {
  jwt: string,
  payload: JwtPayload,
}

interface ProfilesTableRow {
  sub: string,
  firstName?: string,
  lastName?: string,
  name?: string,
  profileImage?: string,
  url?: string,
  description?: string,
}

interface ProfileDataTableRow {
  parent_id: number,
  _value: string,
  iss: string,
  sub: string,
  claim_type: string,
  claim_value: string,
  jwt: string,
}

interface ReducerState {
  jwt: JwtDetails[], // Old data store
  contactList: Contact[],
  contactDetails: {
    [did: string]: VerifiableClaim[],
  }
}
