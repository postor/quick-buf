import { VUintReader, writeUint } from "../VUint";


it('works', () => {
  let arr: number[] = [], t = 1
  while (t < 1<<50) {
    writeUint(t, arr)
    t = t << 1
  }
  let uint8arr = new Uint8Array(arr)
  // console.log(arr.map(x => x.toString(2)))
  // console.log(arr.map((x, i) => x == uint8arr[i]))

  let reader = new VUintReader(uint8arr)
  t = 1
  while (t < 1<<50) {
    // console.log(t)
    // if(t==32768) console.log(reader)
    let t1 = reader.read()
    // if(t==32768) console.log(reader)
    expect(t1).toBe(t)
    t = t << 1
  }
})