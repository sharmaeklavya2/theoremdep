# TheoremDep

This repository contains source files for [TheoremDep](https://sharmaeklavya2.github.io/theoremdep/),
a website to track dependencies between theorems.

These files are supposed to be fed to [ConcepDAG](https://github.com/sharmaeklavya2/concepdag),
a static site generator which tracks dependencies between things.

Command to create the website:

    path_to_concepdag/main.py --debug . intermediate output

If you want to add a theorem, send me a pull request.
You do not need to write the proof yourself; you can just link to a well-written proof.
Make sure you mention all dependencies.

## Freedom to use

&copy; 2022 Eklavya Sharma

All content (except `make_node.py`) is licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode).
This roughly means that you are free to use, modify and distribute it.
