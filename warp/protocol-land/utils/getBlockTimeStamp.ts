declare const SmartWeave

export function getBlockTimeStamp() {
  return 1000 * +SmartWeave.block.timestamp
}
