declare enum Types {
    DISCLOSURE_REQUEST = "shareReq",
    DISCLOSURE_RESPONSE = "shareResp",
    TYPED_DATA_SIGNATURE_REQUEST = "eip712Req",
    VERIFICATION_SIGNATURE_REQUEST = "verReq",
    ETH_TX_REQUEST = "ethtx",
    PERSONAL_SIGN_REQUEST = "personalSigReq"
}
interface Network {
    registry: string;
    rpcUrl: string;
}
export interface Networks {
    [net: string]: Network;
}
export interface EcdsaSignature {
    r: string;
    s: string;
    recoveryParam: number;
}
export declare type Signer = (data: string) => Promise<EcdsaSignature>;
export interface Settings {
    did?: string;
    address?: string;
    privateKey?: string;
    signer?: Signer;
    networks?: Networks;
    registry?: (mnid: string) => Promise<object>;
    ethrConfig?: any;
}
export interface Identity {
    did: string;
    privateKey: string;
}
export interface JWTPayload {
    iss?: string;
    sub?: string;
    aud?: string;
    iat?: number;
    type?: string;
    exp?: number;
}
export interface ClaimSpec {
    essential?: boolean;
    reason?: string;
}
export interface IssuerSpec {
    did: string;
    url?: string;
}
export interface VerifiableClaimSpec extends ClaimSpec {
    iss: IssuerSpec[];
}
export interface VerifiableClaimsSpec {
    [claimType: string]: VerifiableClaimSpec;
}
export interface UserInfoSpec {
    [claimType: string]: ClaimSpec | null;
}
export interface ClaimsSpec {
    verifiable: VerifiableClaimsSpec;
    user_info: UserInfoSpec;
}
export interface UserInfo {
    [claimType: string]: any;
};
export interface DisclosureRequestParams {
    claims?: ClaimsSpec;
    requested?: string[];
    verified?: string[];
    notifications?: boolean;
    callbackUrl?: string;
    networkId?: string;
    rpcUrl?: string;
    vc?: string[];
    exp?: number;
    accountType?: 'none' | 'segregated' | 'keypair' | 'none';
}
export interface DisclosureResponsePayload extends JWTPayload {
    req?: string;
    own?: any;
    verified?: string[];
    nad?: string;
    dad?: string;
    boxPub?: string;
    capabilities?: string[];
}

export interface DisclosurePayload {
    payload: DisclosureResponsePayload;
    doc: any;
}
export interface DisclosureResponse {
    own: any;
    capabilities: string[];
    aud?: string;
    req?: string;
    iat: number;
    exp?: number;
    type: Types.DISCLOSURE_RESPONSE;
    mnid?: string;
    address?: string;
    pushToken?: string;
    deviceKey?: string;
    did: string;
    verified?: Verification[];
    invalid?: string[];
    boxPub?: string;
}
export interface Verification extends JWTPayload {
    claims: any;
    jwt?: string;
}
export interface VerificationParam {
    sub: string;
    claim: any;
    exp?: number;
    vc?: string[];
    callbackUrl?: string;
}
export interface VerificationRequest {
    aud?: string;
    sub: string;
    riss?: string;
    expiresIn?: number;
    vc?: string[];
    callbackUrl?: string;
}
// export interface EIP712Domain {
//     name: string;
//     version: string;
//     chainId?: number;
//     verifyingContract?: string;
//     salt?: string;
// }
// export interface EIP712Types {
//     EIP712Domain: AbiParam[];
//     [name: string]: AbiParam[];
// }
// export interface EIP712Object {
//     types: EIP712Types;
//     domain: EIP712Domain;
//     primaryType: string;
//     message: any;
// }
export interface NetworkRequest {
    from?: string;
    net?: string;
    callback?: string;
}
export interface TxReqOptions {
    callbackUrl?: string;
    exp?: number;
    networkId?: string;
    label?: string;
}
