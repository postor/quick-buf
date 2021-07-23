import { bits2bytes } from "./bits"
import { Structure, StructureMeta } from "./Structure"
import { concatBuf, TypeClasses, TypeSizes, TypeValues } from "./util"
import { writeUint } from "./VUint"

const UTF8 = new TextEncoder()

/**
 * 
 * @param data 
 * @param structure  
 */
export function encode(data: any, structure?: Structure): ArrayBuffer {
  let arrs: any[][] = new Array(13).fill(0).map(_ => [])

  let struct = (structure || Structure.detect(data)) as Structure
  if (!structure) writeStructure(struct)
  // console.log(arrs[TypeValues.string])
  writeData(data, struct)

  let bitMask = arrs.map((x, i) => x.length ? 1 << i : 0).reduce((a, b) => a + b)
  // console.log({bitMask})
  arrs[TypeValues.UInt32] = [
    bitMask,
    ...TypeSizes.map((x, i) => arrs[i].length).filter(x => x),
    arrs[TypeValues.boolean].length,
    arrs[TypeValues.string].reduce((p, n) => p + n.length, 0)
  ].concat(arrs[TypeValues.UInt32] as [])
  // let decoder = new TextDecoder()
  // console.log(arrs[TypeValues.string].map(x=>decoder.decode(x)))

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
    bufs.push(new Uint8Array(arrs[TypeValues.uint]).buffer)

    return concatBuf(bufs)
  }

  function writeData(data: any, struct: Structure) {
    switch (struct.type) {
      case 'array': return writeArray(data, struct.contents as Structure)
      case 'object': return writeObj(data, struct.contents as Structure[])
      case 'bigint':
      case 'string': return writeString(data)
      case 'number':
      case 'Double': return arrs[TypeValues.Float64].push(data)
      case 'Float': return arrs[TypeValues.Float32].push(data)
      default: return arrs[TypeValues[struct.type]].push(data)
    }

    function writeArray(arr: any[], itemStruct: Structure) {
      writeUint(arr.length, arrs[TypeValues.uint])
      for (let item of arr) {
        writeData(item, itemStruct)
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
      if (!str.length) return arrs[TypeValues.uint].push(0)
      let bytes = UTF8.encode(str)
      arrs[TypeValues.uint].push(bytes.length)
      arrs[TypeValues.string].push(bytes)
    }
  }

  function writeStructure(struct: Structure) {
    let arr = flat(struct)
    // console.log(arr,arr.length)
    writeData(arr.map(([s, i]) => ({
      name: s.name,
      type: TypeValues[s.type],
      parent: i
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
