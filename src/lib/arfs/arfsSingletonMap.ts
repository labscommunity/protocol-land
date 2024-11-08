import { ArFSSingleton } from './arfsSingleton'

let instance: ArFSSingletonMap
const map: Map<string, ArFSSingleton> = new Map()

export class ArFSSingletonMap {
  constructor() {
    if (instance) {
      throw new Error('You can only create one instance!')
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    instance = this
  }

  getInstance() {
    return this
  }

  getArFSSingleton(key: string) {
    if (!map.has(key)) {
      throw new Error('Singleton Instance not found.')
    }

    return map.get(key)
  }

  setArFSSingleton(key: string, arfsSingleton: ArFSSingleton) {
    map.set(key, arfsSingleton)
  }

  getAllArFSSingletons() {
    return map
  }
}

const arfsSingletonMap = Object.freeze(new ArFSSingletonMap())

export default arfsSingletonMap
