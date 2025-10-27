# JupyterLab Mermaid to PNG Extension

![GitHub Actions](https://github.com/stellarshenson/jupyterlab_mmd_to_png_extension/actions/workflows/build.yml/badge.svg)
[![npm version](https://badge.fury.io/js/jupyterlab_mmd_to_png_extension.svg)](https://www.npmjs.com/package/jupyterlab_mmd_to_png_extension)
[![PyPI version](https://badge.fury.io/py/jupyterlab-mmd-to-png-extension.svg)](https://pypi.org/project/jupyterlab-mmd-to-png-extension/)
![PyPI downloads](https://img.shields.io/pypi/dm/jupyterlab-mmd-to-png-extension?label=PyPI%20downloads)
![JL4 Ready](https://img.shields.io/badge/Jupyterlab%204-ready-blue)

JupyterLab extension enabling export of Mermaid diagrams from markdown files to high-resolution PNG images with configurable DPI settings.

![Extension Screenshot](.resources/screenshot.png)

## Features

- Export Mermaid diagrams as PNG with configurable DPI (72-1200, default 300)
- Context menu integration in both editor and viewer modes
- Transparent backgrounds for exported images
- Deterministic filenames based on source file and diagram content
- Self-contained client-side rendering (no external dependencies)
- Zero configuration required

## Requirements

- JupyterLab >= 4.0.0

## Installation

Install via pip:

```bash
pip install jupyterlab_mmd_to_png_extension
```

Install via npm (for development):

```bash
npm install jupyterlab_mmd_to_png_extension
```

After installation, restart JupyterLab or refresh the browser.

## Usage

1. Open a markdown file containing Mermaid diagrams
2. Right-click on any rendered Mermaid diagram
3. Select "Copy Mermaid Diagram as PNG"
4. The PNG is downloaded with filename: `mermaid-<filename>-<hash>.png`

**Configure DPI**: Settings -> Advanced Settings Editor -> Mermaid to PNG Extension -> Target DPI (default: 300, maximum: 1200)

## Example

Create a Mermaid diagram in markdown:

```markdown
```mermaid
graph TD
    A[Start] -> B[Process]
    B -> C[End]
```
```

Right-click the rendered diagram and export as PNG at your configured DPI setting.

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_mmd_to_png_extension
```

## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_mmd_to_png_extension directory
# Install package in development mode
pip install -e ".[test]"
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Server extension must be manually installed in develop mode
jupyter server extension enable jupyterlab_mmd_to_png_extension
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
# Server extension must be manually disabled in develop mode
jupyter server extension disable jupyterlab_mmd_to_png_extension
pip uninstall jupyterlab_mmd_to_png_extension
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab_mmd_to_png_extension` within that folder.

### Testing the extension

#### Server tests

This extension is using [Pytest](https://docs.pytest.org/) for Python code testing.

Install test dependencies (needed only once):

```sh
pip install -e ".[test]"
# Each time you install the Python package, you need to restore the front-end extension link
jupyter labextension develop . --overwrite
```

To execute them, run:

```sh
pytest -vv -r ap --cov jupyterlab_mmd_to_png_extension
```

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
