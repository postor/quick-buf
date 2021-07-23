import { encode, decode } from "../index"
import deepEqual from 'deep-equal'
import fs from 'fs-extra'
import { join } from 'path'

it('auto detect', () => {
  let val = {
    name: 'abc',
    age: 12,
    friends: [
      {
        name: 'd',
        age: 11
      }, {
        name: 'e',
        age: 12
      }, {
        name: 'f',
        age: 13
      }
    ]
  }
  let buf = encode(val)
  expect(buf.byteLength).not.toBe(0)
  let decoded = decode(buf)
  expect(deepEqual(decoded, val)).toBe(true)
})


it('large file', async () => {
  let val = await fs.readJSON(join(__dirname, 'large-file.json'))
  let buf = encode(val)
  expect(buf.byteLength).not.toBe(0)
  await fs.writeFile(join(__dirname, 'buf.data'), new Uint8Array(buf))
  let decoded = decode(buf)
  await fs.writeJSON(join(__dirname, 'decoded.json'), decoded)
  expect(deepEqual(decoded, val)).toBe(true)
})