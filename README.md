# quick-buf

**注意：**尝试做一个易用版的 protobuf，但压缩比并不高，gzip 后可能比 json 大，谨慎使用 | **notice:**trying to make an easier protobuf, but not as good, because small compression rate and might bigger than json after gzip

此库适用于布尔、结构定义、重复字符串较多的情况 | this lib suites cases contain many booleans or structure definitions or repeated strings

## 使用 | usage

```
import {encode,decode} from 'quick-buf'

let data = [{a:1},[a:2]]

// auto detect 
let buf = encode(data)
let decodedData = decode(buf)

// define structure and types
let structure = [{a:'number'}]
let buf = encode(data,structure)
let decodedData = decode(buf,structure)
```

使用示例 | example: [express-app](./examples/express-app)

