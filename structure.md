# format | 格式说明

```

+--- uint32
|       +--- [0] bitmask show [boolean,int32.....string] exists or not
+--- varuint(not fixed size)
|       +--- [1...n] n=count(exists) the number of items of each type
|       +--- [n+1....m] m=n+[number of uint32]
+--- boolean: use uint8 internally 
+--- int32
+--- ...
+--- string: each string pick a uint32 as length

```

encode

```
- write(bitmask:uint32) write(typeCounts:uint32[]) write(stringTotalBytes:uint32)  write(containStructure:boolean)
- if(containStructure) write(structureLength:varuint) write(structure:{name:string,type:varint,parent:varint}[])
- write(data) // order based on structure
```

decode

```
- read(bitmask:uint32) read(typeCounts:uint32[]) read(stringTotalBytes:uint32)  read(containStructure:boolean)
- if(containStructure) read(structureLength:varuint) read(structure:{name:string,type:varint,parent:varint}[])
- read(data) // order based on structure
```