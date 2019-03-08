import EthrDID, { createKeyPair } from 'ethr-did'
import { DIDManager } from 'uport-graph-api'

export class MobileDidManager implements DIDManager {

  private ethrDids: { [key:string]: any } = {}

  constructor() {
    const keypair = EthrDID.createKeyPair()
    console.log({keypair, EthrDID})
    const did = new EthrDID({...keypair})
    this.ethrDids[did.did] = did
  }

  getDids() {
    return Object.keys(this.ethrDids)
  }

  newDid() {
    const keypair = EthrDID.createKeyPair()
    const did = new EthrDID({...keypair})
    this.ethrDids[did.did] = did
    return did.did
  }

  signJWT(obj: string, did: string) {
    return this.ethrDids[did].signJWT(obj)
  }

}

const didManager = new MobileDidManager()
export default didManager