# Installing SDKs

SDKs are provided as NPM packages for an easy use. If you plan to use them, you
should have a Javascript or Typescript project.

## Create a typescript project

If not already done the script below shows how to create a minimalistic
typescript project to use:

```shell
mkdir documentation-examples && cd documentation-examples
npm init -y
git init
npm install typescript --save-dev
npx tsc --init
```

Obviously you might want to adapt the script to your requirements and that is
out of the scope of this documentation...

The rest of the documentation assume typescript is used and the javascript
file are generated in the `dist` directory. To change the default settings
and get this configuration, add the following line to your `tsconfig.json`:

```json
"outDir": "./dist/",
```

Then create a simple `src` directory with a index.ts file in it:

```shell
mkdir -p src
echo 'console.log("success");' > src/index.ts
```

To transpile typescript in javascript, run:

```shell
npx tsc --build
```

To run the output, run:

```shell
node dist/index.js
```

## Install the Modular Account SDK

The modular account SDK is named `@0xknwn/starknet-modular-account`. To add it
to your project, run the command below:

```shell
npm install --save @0xknwn/starknet-modular-account

npm install --save starknet@6.8.0
```

## Install the SessionKey Module SDK

If you plan to use the sessionkey module, you will need the
`@0xknwn/starknet-module-sessionkey` SDK but very likely also the `@0xknwn/starknet-modular-account` SDK. To install the 2 packages, run the command below:

```shell
npm install --save \
  @0xknwn/starknet-modular-account \
  @0xknwn/starknet-module-sessionkey

npm install --save starknet@6.8.0
```
