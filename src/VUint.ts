

const mask = 0b1111111, b = 0b10000000
export function writeUint(num: number, bytes: number[]) {
  let t = num, arr = []
  while (t) {
    arr.unshift(t & mask | b)
    t = t >> 7
  }
  arr[arr.length - 1] &= mask
  bytes.splice(bytes.length, 0, ...arr)
}

export class VUintReader {
  private offset = 0
  constructor(private bytes: Uint8Array) { }
  read() {
    let rtn = 0, loop = 1
    while (loop) {
      rtn *= mask
      rtn += mask & this.bytes[this.offset]
      loop = b & this.bytes[this.offset]
      this.offset++
    }
    // console.log({ readUint: rtn })
    return rtn
  }
}