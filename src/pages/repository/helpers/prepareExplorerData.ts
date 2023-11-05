class ExplorerItem {
  id: number
  name: string
  isFolder: boolean
  items: Array<ExplorerItem>
  parent: ExplorerItem | null
  constructor(id: number, name: string, isFolder: boolean) {
    this.id = id
    this.name = name
    this.isFolder = isFolder
    this.items = []
    this.parent = null
  }
}

export function prepareExplorerData(filesList: string[]) {
  const explorer: ExplorerItem = {
    id: 1,
    name: 'root',
    isFolder: true,
    items: [],
    parent: null
  }

  let idCounter = 2

  for (let i = 0; i < filesList.length; i++) {
    const path = filesList[i]
    const pathSplit = path.split('/')
    if (pathSplit.length > 1) {
      let firstItem: ExplorerItem | null = null
      let prevItem: ExplorerItem | null = null
      pathSplit.forEach((item, idx, arr) => {
        const isFolder = idx !== arr.length - 1
        const newItem = new ExplorerItem(idCounter, item, isFolder)
        idCounter++
        if (!prevItem && !firstItem) {
          firstItem = newItem
          prevItem = newItem
          prevItem.parent = newItem
        } else {
          newItem.parent = prevItem
          prevItem!.items.push(newItem)
          prevItem = newItem
        }
      })

      if (firstItem) explorer.items.push(firstItem)
    } else {
      const newItem = new ExplorerItem(idCounter, pathSplit[0], false)
      idCounter++
      explorer.items.push(newItem)
    }
  }

  return explorer
}
