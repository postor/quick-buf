const express = require('express')
const { join } = require('path')
const { readFileSync } = require('fs')
const { encode, decode } = require('quick-buf')
const compression = require('compression')

const data = JSON.parse(readFileSync(join(__dirname, 'large-file.json'), 'utf-8'))

const app = express()
const port = 3000

app.use(compression({ filter: () => true }))

app.use('/', express.static(join(__dirname, 'public')))

app.get('/api/json', (req, res) => {
  res.json(data)
})

app.get('/api/buf1', (req, res) => {
  res.setHeader('Content-Type', 'application/x-quickbuf')
  let arraybuf = encode(data)
  res.end(Buffer.from(arraybuf))
})


app.get('/api/buf2', (req, res) => {
  res.setHeader('Content-Type', 'application/x-quickbuf')
  let arraybuf = encode(data, getStructure())
  res.end(Buffer.from(arraybuf))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

function getStructure() {
  return {
    "source": "string",
    "feeds": [
      {
        "c_d0_method": "string",
        "gps_lat": "number",
        "gps_num": "uint",
        "s_d1": "uint",
        "name": "string",
        "s_t0": "number",
        "area": "string",
        "SiteName": "string",
        "timestamp": "string",
        "app": "string",
        "gps_fix": "uint",
        "gps_lon": "number",
        "SiteAddr": "string",
        "time": "string",
        "s_d0": "uint",
        "gps_alt": "uint",
        "date": "string",
        "s_d2": "uint",
        "s_h0": "uint",
        "c_d0": "number",
        "device_id": "string"
      }
    ],
    "version": "string",
    "descriptions": {
      "gps_lat": "string",
      "gps_num": "string",
      "s_g8": "string",
      "s_b0": "string",
      "FAKE_GPS": "string",
      "s_t0": "string",
      "gps_alt": "string",
      "lon": "string",
      "gps_lon": "string",
      "s_d2": "string",
      "s_g8e": "string",
      "s_d0": "string",
      "s_d1": "string",
      "lat": "string",
      "s_h0": "string",
      "s_gg": "string",
      "c_d0": "string",
      "c_d0_method": "string"
    },
    "num_of_records": "uint"
  }
}