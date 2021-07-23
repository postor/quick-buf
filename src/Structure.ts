import { BasicType, MixType } from "./util"

type ParseConfig = ObjLike | ArrLike | BasicType
interface ObjLike {
  [key: string]: ParseConfig
}
interface ArrLike {
  [key: number]: ParseConfig
}

export class Structure {
  type: MixType
  name: string
  contents?: Structure | Structure[]

  constructor(type: MixType, name: string, contents?: Structure | Structure[]) {
    this.type = type
    this.name = name
    this.contents = contents
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
      return new Structure('array', name, Structure.parse(data[0]))
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
}

export const StructureMeta = Structure.parse([{ name: 'string', type: 'uint', parent: 'uint' }])