import { encode, decode } from "../index"
import deepEqual from 'deep-equal'
import fs, { readJSON, writeJSON } from 'fs-extra'
import { join } from 'path'
import { Structure } from "../Structure"
// import { fixedArrayCount } from "../decode"

it('array with fixed length', async () => {
  let val = await fs.readJSON(join(__dirname, 'fix-length-array.json'))
  // val.CityObjects = Object.keys(val.CityObjects).map(id => ({ ...val.CityObjects[id], id }))
  // await writeJSON(join(__dirname, 'fix-length-array1.json'), val, { spaces: 2 })
  // let meta = (Structure.detect(val) as Structure).unparse()
  // await writeJSON(join(__dirname, 'fix-length-array.meta.json'), meta)
  let structure = Structure.parse(await readJSON(join(__dirname, 'fix-length-array.meta.json')))
  console.time('encode')
  let buf = encode(val, structure)
  console.timeEnd('encode')
  expect(buf.byteLength).not.toBe(0)
  await fs.writeFile(join(__dirname, 'fix-length-array.data'), new Uint8Array(buf))
  console.time('decode')
  let decoded = decode(buf, structure)
  console.timeEnd('decode')
  // console.log(`fixedArrayCount=`, fixedArrayCount())
  await fs.writeJSON(join(__dirname, 'fix-length-array.decoded.json'), decoded)
  expect(deepEqual(decoded, val)).toBe(true)
})