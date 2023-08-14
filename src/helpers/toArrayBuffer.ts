export function toArrayBuffer(data: any) {
  return new Promise((resolve, _) => {
    const fr = new FileReader()
    fr.readAsArrayBuffer(data)
    fr.addEventListener('loadend', (evt) => {
      resolve(evt.target!.result)
    })
  })
}
