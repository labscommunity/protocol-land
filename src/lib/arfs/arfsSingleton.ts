import { ArFS, BiFrost, Drive } from 'arfs-js'

let instance: ArFSSingleton
let driveInstance: Drive | null = null
let bifrostInstance: BiFrost | null = null
let arfsInstance: ArFS | null = null

class ArFSSingleton {
  driveInstance: Drive | null = null
  bifrostInstance: BiFrost | null = null
  arfsInstance: ArFS | null = null

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

  getBifrostInstance() {
    return bifrostInstance
  }

  getArfsInstance() {
    return arfsInstance
  }

  getDriveInstance() {
    return driveInstance
  }

  setDrive(drive: Drive) {
    driveInstance = drive
  }

  setBifrost(bifrost: BiFrost) {
    bifrostInstance = bifrost
  }

  setArFS(arfs: ArFS) {
    arfsInstance = arfs
  }
}

const singletonArfs = Object.freeze(new ArFSSingleton())
export default singletonArfs
