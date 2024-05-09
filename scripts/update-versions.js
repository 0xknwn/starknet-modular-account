const fs = require("fs");

const { argv } = require("node:process");

if (argv.length !== 3) {
  console.log("Usage: node update-versions.js <version>");
  process.exit(1);
}

const version = argv[2];

for (package of [
  "package.json",
  "sdks/account/package.json",
  "sdks/module-sessionkey/package.json",
  "sdks/module/package.json",
  "sdks/__tests__/helpers/package.json",
]) {
  const mainPackage = fs.readFileSync(package, "utf-8");
  const mainPackageJson = JSON.parse(mainPackage);
  mainPackageJson.version = version;
  fs.writeFileSync(package, JSON.stringify(mainPackageJson, null, 2));
}
