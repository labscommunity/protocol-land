export function toArrayBuffer(data: any) {
  return new Promise((resolve, _) => {
    const fr = new FileReader()

    fr.onload = function () {
      resolve(this.result)
    }

    fr.readAsArrayBuffer(data)
  })
}
