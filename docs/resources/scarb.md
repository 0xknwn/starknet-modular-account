## scarb

scarb is the package manager, the compiler and the language server for cairo.
If you want to know more about it, check the
[website](https://docs.swmansion.com/scarb/) that includes the procedure to
install it. You should also refer to the
[documentation](https://docs.swmansion.com/scarb/docs) to understand what are
the various options and how to use the tool. 

### How to add openzeppelin to the project

The command below adds openzeppelin to the project:

```shell
scarb add openzeppelin \
  --git https://github.com/OpenZeppelin/cairo-contracts \
  --tag v0.10.0
```

It actually adds the library to the `Scarb.toml` file.