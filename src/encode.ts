import { bits2bytes } from "./bits"
import { ParseConfig, Structure, StructureMeta } from "./Structure"
import { concatBuf, TypeClasses, TypeSizes, TypeValues } from "./util"
import { writeUint as writeUint1 } from "./VUint"

const UTF8 = new TextEncoder()
// export const EncodeUints: number[] = []
// let logs: string[] = []
/**
 * 
 * @param data 
 * @param structure  
 */
export function encode(data: any, structure?: Structure | ParseConfig): ArrayBuffer {
  let arrs: any[][] = new Array(13).fill(0).map(_ => []),
    stringIndex = 0,
    stringDic: { [key: string]: number } = {}

  let struct = structure
    ? structure instanceof Structure
      ? structure
      : Structure.parse(structure)
    : Structure.detect(data) as Structure
  // console.log({ structure, struct })
  if (!structure) writeStructure(struct)
  // console.log(arrs[TypeValues.string])
  writeData(data, struct)

  let bitMask = arrs.map((x, i) => x.length ? 1 << i : 0).reduce((a, b) => a + b)
  // console.log({bitMask})
  arrs[TypeValues.UInt32] = [
    bitMask,
    ...TypeSizes.map((x, i) => arrs[i].length).filter(x => x),
    arrs[TypeValues.boolean].length,
    arrs[TypeValues.string].reduce((p, n) => p + n.length, 0) // string total bytes
  ].concat(arrs[TypeValues.UInt32] as []) // [bitmask,...typecounts,...uint32s]
  // let decoder = new TextDecoder()
  // console.log(arrs[TypeValues.string].map(x=>decoder.decode(x)))
  // console.log(stringDic, arrs[TypeValues.boolean])
  return arrs2buffer(arrs)

  function arrs2buffer(arrs: any): ArrayBuffer {
    let bufs = []
    for (let i = 0; i < 10; i++) {
      if (arrs[i].length) {
        let t = new TypeClasses[i](arrs[i])
        bufs.push(t.buffer)
      }
    }
    bufs.push(new Uint8Array(bits2bytes(arrs[TypeValues.boolean])).buffer)

    bufs = bufs.concat(arrs[TypeValues.string].map((x: Uint8Array) => x.buffer))
    // console.log({ uintStart: concatBuf(bufs).byteLength }, arrs[TypeValues.uint],
    //   arrs[TypeValues.uint].length, new Uint8Array(arrs[TypeValues.uint]).buffer)
    bufs.push(new Uint8Array(arrs[TypeValues.uint]).buffer)

    return concatBuf(bufs)
  }

  function writeData(data: any, struct: Structure) {
    switch (struct.type) {
      case 'array': return writeArray(data, struct.contents as Structure, struct.arrLength)
      case 'object': return writeObj(data, struct.contents as Structure[])
      case 'bigint':
      case 'string': return writeString(data)
      case 'number':
      case 'Double': return arrs[TypeValues.Float64].push(data)
      case 'Float':
      case 'float':
        return arrs[TypeValues.Float32].push(data)
      case 'uint':
        return writeUint(data)
      default: {
        if (undefined === arrs[TypeValues[struct.type]]) {
          // console.log(logs)
          throw `undefined arr ${struct.type}|${TypeValues[struct.type]}`
        }
        // logs.push(`writing ${struct.type}|${TypeValues[struct.type]}|${data}`)
        // logs.length = 10
        // console.log(struct, data)
        return arrs[TypeValues[struct.type]].push(data)
      }
    }

    function writeArray(arr: any[], itemStruct: Structure, length = 0) {
      if (length == 0) writeUint(arr.length)
      for (let i = 0; i < (length == 0 ? arr.length : length); i++) {
        writeData(arr[i], itemStruct)
      }
    }

    function writeObj(obj: any, fields: Structure[]) {
      for (let field of fields) {
        // writeString(field.name)
        writeData(obj[field.name], field)
      }
    }

    function writeString(str: string = '') {
      // console.log({ writeString: str })
      if (typeof str != 'string') str = '' + str

      arrs[TypeValues.boolean].push(!!stringDic[str])
      if (!str.length) return writeUint(0)

      if (stringDic[str]) {
        return writeUint(stringDic[str])
      }

      let bytes = UTF8.encode(str)
      writeUint(bytes.length)
      arrs[TypeValues.string].push(bytes)
      stringDic[str] = stringIndex
      stringIndex++
    }
  }

  function writeUint(n = 0) {
    writeUint1(n, arrs[TypeValues.uint])
  }

  function writeStructure(struct: Structure) {
    let arr = flat(struct)
    writeData(arr.map(([s, i]) => ({
      name: s.name,
      type: TypeValues[s.type],
      parent: i,
      arrLength: s.arrLength
    })), StructureMeta)

    function flat(struct: Structure) {
      let arr: [Structure, number][] = [], q = [[struct, 0]]
      while (q.length) {
        let id = arr.length, [s, i] = q.shift() as [Structure, number]
        arr.push([s, i])
        if (s.type == 'array') {
          q.push([s.contents as Structure, id])
        }
        if (s.type == 'object') {
          for (let s1 of s.contents as Structure[]) {
            q.push([s1, id])
          }
        }
      }
      return arr
    }
  }
}
