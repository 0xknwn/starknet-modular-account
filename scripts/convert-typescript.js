const fs = require("fs");

function splitString(string, size) {
  var re = new RegExp(".{1," + size + "}", "g");
  return string.match(re);
}

const { argv } = require("node:process");

if (argv.length !== 4) {
  console.log("Usage: node convert.js <source> <destination>");
  process.exit(1);
}

const source = argv[2];
const destination = argv[3];

const buffer = fs.readFileSync(source, "utf-8");

let split = splitString(Buffer.from(buffer).toString("base64"), 80);
let lineNum = 0;
fs.writeFileSync(destination, "export const data = `");

for (line of split) {
  if (lineNum !== 0) {
    fs.appendFileSync(destination, "\n");
  }
  lineNum++;
  fs.appendFileSync(destination, line);
}

fs.appendFileSync(destination, "`;");
