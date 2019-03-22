import { Types } from 'uport-graph-api'

export class WebDidManager implements Types.DIDManager {

  private ethrDids: { [key:string]: any } = {}
  private keyPairs: { [key:string]: any } = {}

  async init() {
  }

  getDids() {
    return []
  }

  newDid() {

    return ''
  }

  removeDid(did: string) {
  }

  async signJWT(obj: string, did: string) {
    return 'JWT'
  }

}

const didManager = new WebDidManager()
didManager.init()
export default didManager