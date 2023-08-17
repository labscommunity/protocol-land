declare module 'warp-contracts' {
  const WarpFactory: any
}

declare module 'warp-contracts-plugin-signature' {
  const InjectedArweaveSigner: any
}

declare module 'warp-contracts-plugin-deploy' {
  const DeployPlugin: any
}

type ApiStatus = 'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'