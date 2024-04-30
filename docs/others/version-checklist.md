# Version packaging and publishing

In order to deliver a new version of the software, there are a number of steps
to perform including:

- adding the version to the contracts
- build the contract and store them in the repository
- generate the ABI for all the files
- make sure all the tests are passing, including the experiments
- adding the version in the package.json
- build the artifacts for the SDKs
- publish the artifact to npmjs.org
- replay the documentation to make sure it is passing with the artifacts, not
  just from the project.
- provide a description of the version and a changelog as part of the project
- tag the project with the version and add the description in github.

