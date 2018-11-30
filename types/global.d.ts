interface Contact {
  did: string,
  name?: string,
  firstName?: string,
  lastName?: string,
  profileImage?: string,
  backgroundImage?: string,
}

interface VerifiableClaim {
  rowId: number,
  issuedAt: Date,
  expiresAt?: Date,
  claim: any,
  jwt: string,
  issuer: Contact,
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
  payload: JwtPayload
}