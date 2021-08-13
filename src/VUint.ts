// import { EncodeUints } from "./encode"
// let history: number[] = [], index = 0

const mask = 0b1111111, b = 0b10000000
export function writeUint(num: number, bytes: number[]) {
  let t = num, arr = []
  while (t) {
    arr.unshift(t & mask | b)
    t = t >> 7
  }
  if (!arr.length) arr.push(0)
  arr[arr.length - 1] &= mask
  bytes.splice(bytes.length, 0, ...arr)
  // history.push(num)
}

export class VUintReader {
  private offset = 0
  constructor(private bytes: Uint8Array) { }
  read() {
    let rtn = 0
    while (true) {
      rtn = rtn << 7
      rtn |= mask & this.bytes[this.offset]
      this.offset++
      if (!(this.bytes[this.offset - 1] & b)) break
    }
    // if (rtn != history[index++]) {
    //   console.log(history, { index, rtn, offset: this.offset }, this.bytes)
    //   throw 'mismath!'
    // }
    return rtn
  }
}