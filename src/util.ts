export type BasicType = 'boolean' | 'number' | 'string' |
  'Double' | 'Float' | 'bigint' | 'undefined' | 'uint' |
  'BigInt64' | 'Int8' | 'Int16' | 'Int32' | 'Float32' |
  'BigUint64' | 'UInt8' | 'UInt16' | 'UInt32' | 'Float64' | 'float' | string

export type MixType = BasicType | 'array' | 'object'

//'uint32' 'boolean' 'int32' 'uint16' 'int16' 'uint8' 'int8' 'ubigint64' 'bigint64' 'float32' 'float64'  'string'
export const TypeValues: { [key: string]: number } = {
  UInt32: 0,
  Int32: 1,
  UInt16: 2,
  Int16: 3,
  Int8: 4,
  UInt8: 5,
  BigUint64: 6,
  BigInt64: 7,
  Float32: 8,
  Float64: 9,
  boolean: 10,
  string: 11,
  uint: 12,

  array: 13,
  object: 14,
  number: 15,
  Double: 16,
  Float: 17,
  bigint: 18,
  undefined: 19,
  float: 20,
}

export const ValueTypes = []
for (let k in TypeValues) {
  // @ts-ignore
  ValueTypes[TypeValues[k]] = k
}


export const TypeClasses = [
  Uint32Array,
  Int32Array,
  Uint16Array,
  Int16Array,
  Int8Array,
  Uint8Array,
  BigUint64Array,
  BigInt64Array,
  Float32Array,
  Float64Array,
]

export const TypeSizes = [
  32 / 8,
  32 / 8,
  16 / 8,
  16 / 8,
  8 / 8,
  8 / 8,
  64 / 8,
  64 / 8,
  32 / 8,
  64 / 8,
]

export function toBuf(type: MixType, arr: any) {
  if (type == 'boolean') {
    return boolsToBuf(arr)
  }
  if (TypeValues[type] === undefined || TypeValues[type] > 10) throw `not supported type: ${type}`

  return arr.buffer
}

function boolsToBuf(arr: boolean[]): ArrayBuffer {
  let length = Math.ceil(arr.length / 8)
  let bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < 8; j++) {
      let k = i * 8 + j
      if (k == arr.length) break
      bytes[i] |= arr[k] ? 1 << j : 0
    }
  }
  return bytes.buffer
}

export function concatBuf(arr: ArrayBuffer[]) {
  let total = arr.reduce((v, n) => v + n.byteLength, 0)
  let rtn = new Uint8Array(total), cur = 0
  for (let buf of arr) {
    let t = new Uint8Array(buf)
    rtn.set(t, cur)
    // console.log({cur})
    cur += t.length
  }
  return rtn.buffer
}

