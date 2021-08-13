import { encode, decode } from "../index"
import deepEqual from 'deep-equal'
import fs from 'fs-extra'
import { join } from 'path'
import { Structure } from "../Structure"


it('large file', async () => {
  let val = await fs.readJSON(join(__dirname, 'large-file.json'))
  let buf = encode(val)
  expect(buf.byteLength).not.toBe(0)
  await fs.writeFile(join(__dirname, 'buf.data'), new Uint8Array(buf))
  let decoded = decode(buf)
  await fs.writeJSON(join(__dirname, 'decoded.json'), decoded)
  expect(deepEqual(decoded, val)).toBe(true)
})


it('large file with structure', async () => {
  let val = await fs.readJSON(join(__dirname, 'large-file.json'))
  // let meta = Structure.unparse(Structure.detect(val) as Structure)
  // await writeJSON(join(__dirname, 'large-file.meta.json'), meta)
  let structure = Structure.parse(await fs.readJSON(join(__dirname, 'large-file.meta.json')))
  let buf = encode(val, structure)
  expect(buf.byteLength).not.toBe(0)
  await fs.writeFile(join(__dirname, 'buf-without-structure.data'), new Uint8Array(buf))
  let decoded = decode(buf, structure)
  await fs.writeJSON(join(__dirname, 'decoded-with-structure.json'), decoded)
  expect(deepEqual(decoded, val)).toBe(true)
})

it('large file with structure in json obj', async () => {
  let val = await fs.readJSON(join(__dirname, 'large-file.json'))
  let structure = await fs.readJSON(join(__dirname, 'large-file.meta.json'))
  let buf = encode(val, structure)
  expect(buf.byteLength).not.toBe(0)
  await fs.writeFile(join(__dirname, 'buf-without-structure.data'), new Uint8Array(buf))
  let decoded = decode(buf, structure)
  await fs.writeJSON(join(__dirname, 'with-structure.decoded.json'), decoded)
  expect(deepEqual(decoded, val)).toBe(true)
})