<!-- Import workspace-level CLAUDE.md configuration -->
<!-- See /home/lab/workspace/.claude/CLAUDE.md for complete rules -->

# Project-Specific Configuration

This file extends workspace-level configuration with project-specific rules.

## Project Context

**Project Type**: JupyterLab Extension (Hybrid Python/TypeScript)

**Purpose**: JupyterLab extension enabling export of Mermaid diagrams from markdown files to PNG images

**Technology Stack**:
- **Frontend**: TypeScript, JupyterLab 4.0+, NPM/Yarn
- **Backend**: Python 3.x server extension
- **Testing**: Jest (frontend), Pytest (backend), Playwright/Galata (integration)
- **Build Tools**: jlpm (JupyterLab's pinned yarn), Node.js

**Key Characteristics**:
- Dual-component architecture: Python server extension + TypeScript frontend extension
- Tightly integrated with JupyterLab extension ecosystem
- Focuses on Mermaid diagram rendering and export functionality

## Development Conventions

**Package Naming**:
- Python package: `jupyterlab_mmd_to_png_extension`
- NPM package: `jupyterlab_mmd_to_png_extension`
- Extension identifier: `jupyterlab_mmd_to_png_extension`

**Development Workflow**:
- Use `jlpm` command (not npm/yarn directly) for frontend builds
- Server extension requires manual enable/disable during development
- Development mode uses `pip install -e ".[test]"` for editable install
- Frontend changes require `jlpm build` or `jlpm watch` for live rebuilding

**Testing Strategy**:
- Unit tests: Jest for TypeScript, Pytest for Python
- Integration tests: Playwright via Galata framework
- Test coverage required for Python backend (`pytest --cov`)

## Mermaid Diagram Standards

Given this extension's core purpose of exporting Mermaid diagrams, adhere strictly to workspace Mermaid standards:
- Standard color palette (light blue, amber, green, purple, red, dark blue, gray)
- Transparent backgrounds for exported PNGs
- No custom themes (avoid `%%{init: {'theme':'neutral'}}%%`)
- High-resolution output (2400px width recommended)
- Proper stroke widths (3px primary, 2px secondary)
