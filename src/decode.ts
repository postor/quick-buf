import { BitReader } from "./bits"
// import { EncodeUints } from "./encode"
import { ParseConfig, Structure, StructureMeta, StructureMetaItem } from "./Structure"
import { TypeClasses, TypeSizes, TypeValues, ValueTypes } from "./util"
import { VUintReader } from "./VUint"

const UTF8 = new TextDecoder()
// let DecodeUints: number[] = []
// let _fixedArrayCount=0
// export const fixedArrayCount=()=>_fixedArrayCount

export function decode(buf: ArrayBuffer, structure?: Structure | ParseConfig): any {
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
  // console.log(arrsCounts)
  // init readers
  let arrs = arrsCounts.map((x, i) => {
    if (!x) return () => 0
    let size = TypeSizes[i] * x
    // console.log(`${TypeClasses[i]}`, { x, i, size, cur })
    let reader = buffReader(buf.slice(cur, cur + size), TypeClasses[i])
    cur += size
    return reader
  })

  arrs[TypeValues.boolean] = getBooleanReader()
  arrs[TypeValues.string] = getStringReader()
  arrs[TypeValues.uint] = getUintReader()

  // 
  const struct = structure
    ? structure instanceof Structure
      ? structure
      : Structure.parse(structure)
    : readStructure() as Structure
  // console.log({ struct, structure })
  return readData(struct)

  function readStructure(): Structure {
    let data = readData(StructureMeta) as StructureMetaItem[]
    // console.log({ structure: data })
    return Structure.restruct(data)
  }

  function readData(struct: Structure) {
    switch (struct.type) {
      case 'array': return readArray(struct.contents as Structure, struct.arrLength)
      case 'object': return readObj(struct.contents as Structure[])
      case 'bigint':
      case 'string': return arrs[TypeValues.string]()
      case 'number':
      case 'Double': return arrs[TypeValues.Float64]()
      case 'Float':
      case 'float':
        return arrs[TypeValues.Float32]()
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

    function readArray(struct: Structure, length = 0): any {
      // if(length) _fixedArrayCount++
      let arr = [], leng = length == 0 ? arrs[TypeValues.uint]() as number : length

      // console.log(`arr.lenght=${length}`)
      for (let i = 0; i < leng; i++) {
        arr.push(readData(struct))
      }
      return arr
    }
  }

  function getUintReader() {
    // console.log({ uintStartDecode: cur }, buf.slice(cur))
    let reader = new VUintReader(new Uint8Array(buf, cur))
    return () => {
      let tmp = reader.read()
      // DecodeUints.push(tmp)
      // if (DecodeUints[DecodeUints.length - 1] != EncodeUints[DecodeUints.length - 1]) {
      //   console.log(EncodeUints, DecodeUints, tmp, reader)
      //   throw 'mismatch!'
      // }
      return tmp
    }
  }

  function getStringReader() {
    let strOffset = cur
    cur += stringTotalSize
    return () => {
      let length = arrs[TypeValues.uint]() as number
      if (!length) return ''
      if (buf.byteLength < length + strOffset) {
        throw `out of range`
      }
      let rtn = UTF8.decode(new Uint8Array(buf, strOffset, length))

      // console.log(`read string`, { length, rtn })
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

function buffReader<T>(buf: ArrayBuffer, TypeClass: any, offset?: number, length?: number) {
  let i = 0, arr = new TypeClass(buf, offset, length)
  return () => arr[i++] as T
}

