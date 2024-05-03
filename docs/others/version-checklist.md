# Version packaging and publishing

In order to deliver a new version of the software, there are a number of steps
to perform including:

1. change the contract version (not yet available)
2. build and version the contract at the project root with the command below

```shell
npm run build:scarb && npm run artifacts
```

3. generate the ABI for all the files

```shell
npm run build:abi
```

4. make sure all the tests are passing, including the experiments

```shell
npm run test -ws
npm run test:scarb
```

5. adding the version in the package.json

```shell
npm run update-version -- 0.1.6
```

6. Merge all the changes to the `develop` branch of the repository

7. tag the version on github with `v` followed by the new version number in semver

8. provide a description of the version, a changelog and release the project

9. switch to develop and pull to the `tag`. You should be able to publish
   the artifact to npmjs.org

```shell
git fetch -p
git checkout develop
git pull
git reset --hard v0.1.6
npm run registry
```

10. review the documentation and make sure it is still up to date
