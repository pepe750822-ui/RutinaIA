const fs = require("fs")
const path = require("path")
const zlib = require("zlib")

function createPNG(width, height, r, g, b) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: RGB
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  // Raw image data: each row has a filter byte (0) + RGB pixels
  const rowSize = 1 + width * 3
  const raw = Buffer.alloc(height * rowSize)
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize
    raw[offset] = 0 // filter byte
    for (let x = 0; x < width; x++) {
      raw[offset + 1 + x * 3] = r
      raw[offset + 2 + x * 3] = g
      raw[offset + 3 + x * 3] = b
    }
  }

  const compressed = zlib.deflateSync(raw)

  function chunk(type, data) {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const typeBytes = Buffer.from(type, "ascii")
    const crcInput = Buffer.concat([typeBytes, data])
    const crc = crc32(crcInput)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc >>> 0)
    return Buffer.concat([len, typeBytes, data, crcBuf])
  }

  function crc32(buf) {
    let crc = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i]
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
      }
    }
    return (crc ^ 0xffffffff) >>> 0
  }

  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))])
}

const outDir = path.join(__dirname, "..", "public")

// Color: #00ff88 → r=0, g=255, b=136
fs.writeFileSync(path.join(outDir, "icon-192.png"), createPNG(192, 192, 0, 255, 136))
fs.writeFileSync(path.join(outDir, "icon-512.png"), createPNG(512, 512, 0, 255, 136))

console.log("Iconos generados: icon-192.png y icon-512.png")
