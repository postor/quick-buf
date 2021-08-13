import { encode, decode } from "../index"
import deepEqual from 'deep-equal'
import fs, { readJSON, writeJSON } from 'fs-extra'
import { join } from 'path'
import { Structure } from "../Structure"

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

it('structure', () => {
  let val = {
    name: 'abc',
    lat: 12.02012,
    friends: [
      {
        name: 'd',
        lat: 12.02012,
        age: 11
      }, {
        name: 'e',
        lat: 12.02012,
        age: 12
      }, {
        name: 'f',
        lat: 12.02012,
        age: 13
      }
    ]
  }, structure = Structure.parse({
    name: 'string',
    lat: 'Float64',
    friends: [{ name: 'string', lat: 'Float64', age: 'uint' }]
  })

  let buf = encode(val, structure)
  expect(buf.byteLength).not.toBe(0)
  let decoded = decode(buf, structure)
  // console.log(decoded, new Uint8Array(buf))
  expect(deepEqual(decoded, val)).toBe(true)
})