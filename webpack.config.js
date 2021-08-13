const { join } = require('path')
module.exports = {
  entry: './dist/decode.js',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'quick-buf.umd.js',
    library: {
      name: 'QuickBuf',
      type: 'umd',
    },
  }
}