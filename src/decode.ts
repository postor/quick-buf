import { BitReader } from "./bits"
import { Structure, StructureMeta } from "./Structure"
import { TypeClasses, TypeSizes, TypeValues, ValueTypes } from "./util"
import { VUintReader } from "./VUint"

const UTF8 = new TextDecoder()

export function decode(buf: ArrayBuffer, structure?: Structure): any {
  // bitmask, type counts, string total bytes
  let cur = 0
  let ui32 = () => {
    let rtn = buffReader<number>(buf, Uint32Array, cur, 1)()
    cur += 4
    return rtn
  }
  let bitmask = ui32(), arrsCounts = new Array(10).fill(0)
  // console.log({ bitmask })
  for (let i = 0; i < arrsCounts.length; i++) {
    if (bitmask & (1 << i)) {
      arrsCounts[i] = ui32()
    }
  }
  let booleanSize = (bitmask & (1 << 11)) && ui32(), stringTotalSize = (bitmask & (1 << 12)) && ui32()
  // console.log(arrsCounts.concat([booleanSize, stringTotalSize]), bitmask.toString(2))

  // init readers
  let arrs = arrsCounts.map((x, i) => {
    let size = TypeSizes[i] * x
    let reader = buffReader(buf, TypeClasses[i], cur, x)
    cur += size
    return reader
  })

  arrs[TypeValues.boolean] = getBooleanReader()
  arrs[TypeValues.string] = getStringReader()
  arrs[TypeValues.uint] = getUintReader()

  // 
  const struct = (structure || readStructure()) as Structure
  return readData(struct)

  function readStructure(): Structure {
    let data = readData(StructureMeta) as { name: string, type: number, parent: number }[]
    // console.log(data)
    let structs = data.map(({ name, type }) =>
      new Structure(ValueTypes[type], name, type == TypeValues.object ? [] : undefined))
    for (let i = 0; i < data.length; i++) {
      let { parent } = data[i]
      if (parent == i) continue
      let s = structs[parent]
      if (s.type == 'object') {
        (s.contents as Structure[]).push(structs[i])
      } else {
        s.contents = structs[i]
      }
    }
    return structs[0]
  }

  function readData(struct: Structure) {
    switch (struct.type) {
      case 'array': return readArray(struct.contents as Structure)
      case 'object': return readObj(struct.contents as Structure[])
      case 'bigint':
      case 'string': return arrs[TypeValues.string]()
      case 'number':
      case 'Double': return arrs[TypeValues.Float64]()
      case 'Float': return arrs[TypeValues.Float32]()
      default: return arrs[TypeValues[struct.type]]()
    }

    function readObj(structs: Structure[]): any {
      let obj: { [key: string]: any } = {}
      for (let s of structs) {
        obj[s.name] = readData(s)
      }
      // console.log(structs, obj)
      return obj
    }

    function readArray(struct: Structure): any {
      let arr = [], length = arrs[TypeValues.uint]() as number
      for (let i = 0; i < length; i++) {
        arr.push(readData(struct))
      }
      return arr
    }
  }

  function getUintReader() {
    let reader = new VUintReader(new Uint8Array(buf, cur))
    return () => reader.read()
  }

  function getStringReader() {
    let strOffset = cur
    cur += stringTotalSize
    return () => {
      let length = arrs[TypeValues.uint]() as number
      // console.log(`read string`, { length })
      if (!length) return ''
      let rtn = UTF8.decode(new Uint8Array(buf, strOffset, length))
      strOffset += length
      return rtn
    }
  }

  function getBooleanReader() {
    let size = Math.ceil(booleanSize / 8),
      reader = new BitReader(new Uint8Array(buf, cur, size))
    cur += size
    return () => reader.read()
  }
}

function buffReader<T>(buf: ArrayBuffer, TypeClass: any, offset: number, length?: number) {
  let i = 0, arr = new TypeClass(buf, offset, length)
  return () => arr[i++] as T
}

