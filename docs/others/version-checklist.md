# Version packaging and publishing

In order to deliver a new version of the software, there are a number of steps
to perform including:

1. change the contract version

> search for `fn get_version` in the .cairo files and change the content to
> the version you are interested in..

2. change the project version

> change the version in `Scarb.toml`

3. build and version the contract at the project root with the command below

```shell
npm run build:scarb && npm run artifacts
```

4. generate the ABI for all the files

```shell
npm run build:abi
```

5. make sure all the tests are passing, including the experiments

```shell
npm run test -ws
npm run test:scarb
```

6. adding the version in the package.json

```shell
npm run update-versions -- 0.1.9
```

7. Merge all the changes to the `develop` branch of the repository

8. tag the version on github with `v` followed by the new version number in semver

9. provide a description of the version, a changelog and release the project

10. switch to develop and pull to the `tag`. You should be able to publish
   the artifact to npmjs.org

```shell
git fetch -p
git checkout develop
git pull
git reset --hard v0.1.9
npm run registry
```

11. review the documentation and make sure it is still up to date
