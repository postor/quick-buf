export function bits2bytes(bits: boolean[]) {
  let size = Math.ceil(bits.length / 8)
  let bytes = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < 8; j++) {
      let k = i * 8 + j
      if (k == bits.length) break
      bytes[i] |= bits[k] ? 1 << j : 0
    }
  }
  return bytes
}

export class BitReader {
  private index = 0
  constructor(private bytes: Uint8Array) { }
  read() {
    let j = this.index % 8
    let i = (this.index - j) / 8
    this.index++
    return this.bytes[i] & (1 << j)
  }
}