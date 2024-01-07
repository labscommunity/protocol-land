export function getArrayBufSize(arrayBuffer: ArrayBuffer): GetArrayBufSizeReturnType {
  const byteSize = arrayBuffer.byteLength

  if (byteSize >= 1073741824) {
    return {
      size: (byteSize / 1073741824).toFixed(2),
      unit: 'B'
    }
  } else if (byteSize >= 1048576) {
    return {
      size: (byteSize / 1048576).toFixed(2),
      unit: 'MB'
    }
  } else if (byteSize >= 1024) {
    return {
      size: (byteSize / 1024).toFixed(2),
      unit: 'KB'
    }
  } else {
    return {
      size: byteSize.toString(),
      unit: 'B'
    }
  }
}

export type GetArrayBufSizeReturnType = {
  size: string
  unit: 'B' | 'KB' | 'MB' | 'GB'
}
