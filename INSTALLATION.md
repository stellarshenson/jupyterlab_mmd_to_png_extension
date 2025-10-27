# Installation and Build Instructions

## Prerequisites

This extension is fully self-contained with no external dependencies beyond JupyterLab itself. All Mermaid diagram rendering and PNG conversion happens client-side in the browser.

### Requirements

- Node.js (for building TypeScript frontend)
- Python >= 3.9
- JupyterLab >= 4.0.0

## Development Installation

### 1. Install Python dependencies

```bash
pip install -e ".[test]"
```

### 2. Install TypeScript dependencies

```bash
jlpm install
```

### 3. Link the extension with JupyterLab

```bash
jupyter labextension develop . --overwrite
```

### 4. Enable the server extension

```bash
jupyter server extension enable jupyterlab_mmd_to_png_extension
```

### 5. Build the extension

```bash
jlpm build
```

## Development Workflow

### Watch mode (auto-rebuild on changes)

In one terminal, watch the TypeScript source:

```bash
jlpm watch
```

In another terminal, run JupyterLab:

```bash
jupyter lab
```

### Manual rebuild

After making changes to TypeScript files:

```bash
jlpm build
```

Then refresh your browser in JupyterLab.

## Testing

### Verify server extension is enabled

```bash
jupyter server extension list
```

You should see `jupyterlab_mmd_to_png_extension` in the list.

### Verify frontend extension is installed

```bash
jupyter labextension list
```

You should see `jupyterlab_mmd_to_png_extension` in the list.

### Test the functionality

1. Open JupyterLab
2. Create or open a markdown file (.md)
3. Add a Mermaid diagram:

```markdown
# Test Mermaid Diagram

```mermaid
graph TD
    A[Start] -> B[Process]
    B -> C[End]
```
```

4. Place your cursor inside the Mermaid code block
5. Right-click to open context menu
6. Select "Copy Mermaid Diagram as PNG"
7. Paste into an image editor or document to verify the PNG was copied

## Running Tests

### Python tests

```bash
pytest -vv -r ap --cov jupyterlab_mmd_to_png_extension
```

### TypeScript tests

```bash
jlpm test
```

## Production Build

```bash
jlpm build:prod
```

## How It Works

This extension uses a fully client-side approach:

1. **Detection**: Detects when cursor is inside a Mermaid code block in markdown files
2. **Rendering**: Uses Mermaid.js library (bundled) to render diagram to SVG in-browser
3. **Conversion**: Converts SVG to PNG using HTML5 Canvas API
4. **Clipboard**: Copies PNG blob directly to system clipboard

No server-side processing, no external tools required. Everything happens in the browser.

## Troubleshooting

### Context menu item not appearing

- Ensure cursor is inside a Mermaid code block (between \`\`\`mermaid and \`\`\`)
- Check browser console for errors (F12)
- Verify the file is opened in the editor (not preview mode)

### PNG conversion fails

- Check browser console (F12) for JavaScript errors
- Ensure browser supports Canvas API and Clipboard API
- Try with a simpler Mermaid diagram to isolate syntax issues
- Verify Mermaid syntax is valid

### Extension not loading

- Rebuild: `jlpm build`
- Clear browser cache and hard refresh (Ctrl+Shift+R)
- Restart JupyterLab server
- Verify extension is installed: `jupyter labextension list`
