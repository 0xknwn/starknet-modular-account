# Installing SDKs

SDKs are provided as NPM packages for an easy use. If you plan to use them, you
should have a Javascript or Typescript project.

## Create a typescript project

If not already done the script below shows how to create a minimalistic
typescript project to use:

```shell
mkdir sample && cd sample
npm init -y
git init
npm install typescript --save-dev
npx tsc --init
```

Obviously you might want to adapt the script to your requirements and that is
out of the scope of this documentation

## Install the Modular Account SDK

The modular account SDK is named `@0xknwn/starknet-modular-account`. To add it
to your project, run the command below:

```shell
npm install --save @0xknwn/starknet-modular-account
```

## Install the SessionKey Module SDK

If you plan to use the sessionkey module, you will need the
`@0xknwn/starknet-module-sessionkey` SDK but very likely also the `@0xknwn/starknet-modular-account` SDK. To install the 2 packages, run the command below:

```shell
npm install --save \
  @0xknwn/starknet-modular-account \
  @0xknwn/starknet-module-sessionkey
```
