import { BasicType, MixType, TypeValues, ValueTypes } from "./util"

export type ParseConfig = ObjLike | ArrLike | BasicType | [ParseConfig, number]
interface ObjLike {
  [key: string]: ParseConfig
}
interface ArrLike {
  [key: number]: ParseConfig
}

export type StructureMetaItem = { name: string, type: number, parent: number, arrlength: number }

export class Structure {
  type: MixType
  name: string
  arrLength: number
  contents?: Structure | Structure[]

  constructor(type: MixType, name: string, contents?: Structure | Structure[], arrLength = 0) {
    this.type = type
    this.name = name
    this.contents = contents
    this.arrLength = arrLength
  }

  static detect(data: any, name = ''): Structure | undefined {
    if (Array.isArray(data)) {
      return new Structure('array', name, Structure.detect(data[0]))
    }
    let type = typeof data
    if (type == 'object') {
      let contents: Structure[] = []
      for (let k in data) {
        let v = Structure.detect(data[k], k)
        v && contents.push(v)
      }
      if (!contents.length) return undefined
      return new Structure(type, name, contents)
    }
    if (type == 'function' || type == 'symbol') return undefined
    return new Structure(type, name)
  }

  static parse(data: ParseConfig, name = ''): Structure {
    if (Array.isArray(data)) {
      return new Structure('array', name, Structure.parse(data[0]), data[1])
    }
    let type = typeof data
    if (type == 'object') {
      let d = data as ObjLike
      let contents: Structure[] = []
      for (let k in d) {
        let v = Structure.parse(d[k], k)
        v && contents.push(v)
      }
      return new Structure(type, name, contents)
    }
    return new Structure(data as BasicType, name)
  }


  unparse(): ParseConfig {
    switch (this.type) {
      case 'array': {
        let c = this.contents as Structure
        return this.arrLength == 0
          ? [c.unparse()]
          : [c.unparse(), this.arrLength]
      }
      case 'object': {
        let obj: ObjLike = {}
        for (let c of this.contents as Structure[]) {
          obj[c.name] = c.unparse()
        }
        return obj
      }
      default: return this.type
    }
  }

  static restruct(data: StructureMetaItem[]) {
    let structs = data.map(({ name, type, arrlength }) =>
      new Structure(ValueTypes[type], name, type == TypeValues.object ? [] : undefined, arrlength))
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
}

export const StructureMeta = Structure.parse([{ name: 'string', type: 'uint', parent: 'uint', arrLength: 'uint' }])

