import { ArFS, BiFrost, Drive } from 'arfs-js'

export class ArFSSingleton {
  driveInstance: Drive | null = null
  bifrostInstance: BiFrost | null = null
  arfsInstance: ArFS | null = null

  constructor() {}

  getInstance() {
    return this
  }

  getBifrostInstance() {
    return this.bifrostInstance
  }

  getArfsInstance() {
    return this.arfsInstance
  }

  getDriveInstance() {
    return this.driveInstance
  }

  setDrive(drive: Drive) {
    this.driveInstance = drive
  }

  setBifrost(bifrost: BiFrost) {
    this.bifrostInstance = bifrost
  }

  setArFS(arfs: ArFS) {
    this.arfsInstance = arfs
  }
}
