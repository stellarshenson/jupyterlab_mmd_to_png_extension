import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';


/**
 * Convert SVG element to PNG blob
 */
async function svgToPng(svgElement: SVGElement, targetDPI: number = 600, sourceImgElement?: HTMLImageElement): Promise<Blob> {
  // console.log('[MMD Extension] svgToPng - SVG element:', svgElement.tagName);
  // console.log('[MMD Extension] svgToPng - width attr:', svgElement.getAttribute('width'));
  // console.log('[MMD Extension] svgToPng - height attr:', svgElement.getAttribute('height'));
  // console.log('[MMD Extension] svgToPng - viewBox attr:', svgElement.getAttribute('viewBox'));
  // console.log('[MMD Extension] svgToPng - style attr:', svgElement.getAttribute('style'));

  // if (sourceImgElement) {
  //   console.log('[MMD Extension] svgToPng - IMG naturalWidth:', sourceImgElement.naturalWidth);
  //   console.log('[MMD Extension] svgToPng - IMG naturalHeight:', sourceImgElement.naturalHeight);
  //   console.log('[MMD Extension] svgToPng - IMG width:', sourceImgElement.width);
  //   console.log('[MMD Extension] svgToPng - IMG height:', sourceImgElement.height);
  // }

  // Get SVG dimensions - prioritize element attributes over getBBox
  let width = 800;
  let height = 600;

  // If we have the source IMG element, use its natural dimensions (most reliable for viewer mode)
  if (sourceImgElement && sourceImgElement.naturalWidth && sourceImgElement.naturalHeight) {
    width = sourceImgElement.naturalWidth;
    height = sourceImgElement.naturalHeight;
    // console.log('[MMD Extension] Using IMG naturalWidth/Height:', width, 'x', height);
  } else {
    // Try to get from width/height attributes
    const widthAttr = svgElement.getAttribute('width');
    const heightAttr = svgElement.getAttribute('height');

    if (widthAttr && heightAttr) {
      // Remove any unit suffixes (px, em, etc.)
      width = parseFloat(widthAttr.replace(/[^\d.]/g, ''));
      height = parseFloat(heightAttr.replace(/[^\d.]/g, ''));
      // console.log('[MMD Extension] Using SVG width/height attributes:', width, 'x', height);
    } else {
      // Try viewBox
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/);
        // console.log('[MMD Extension] ViewBox parts:', parts);
        if (parts.length === 4) {
          width = parseFloat(parts[2]);
          height = parseFloat(parts[3]);
          // console.log('[MMD Extension] Using SVG viewBox dimensions:', width, 'x', height);
        }
      } else {
        // Fall back to getBBox - but need to temporarily add to DOM
        try {
          svgElement.style.position = 'absolute';
          svgElement.style.visibility = 'hidden';
          document.body.appendChild(svgElement);

          const graphicsElement = svgElement as unknown as SVGGraphicsElement;
          const bbox = graphicsElement.getBBox();
          width = bbox.width || 800;
          height = bbox.height || 600;
          // console.log('[MMD Extension] Using getBBox dimensions:', width, 'x', height, 'bbox:', bbox);

          document.body.removeChild(svgElement);
        } catch (e) {
          console.error('[MMD Extension] Error getting getBBox:', e);
        }
      }
    }
  }

  // console.log('[MMD Extension] Final dimensions for canvas:', width, 'x', height);

  // Create high-resolution canvas at target DPI
  // SVG native resolution calibrated to match Adobe converter output
  const sourceDPI = 11.5;
  const scale = targetDPI / sourceDPI;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  // Calculate expected print dimensions
  // const printWidthInches = canvas.width / targetDPI;
  // const printHeightInches = canvas.height / targetDPI;

  // console.log('[MMD Extension] svgToPng - Configuration:');
  // console.log('  Source dimensions:', width, 'x', height, 'pixels');
  // console.log('  Source DPI:', sourceDPI);
  // console.log('  Target DPI:', targetDPI);
  // console.log('  Scale factor:', scale);
  // console.log('  Output dimensions:', canvas.width, 'x', canvas.height, 'pixels');
  // console.log('  Print size at', targetDPI, 'DPI:', printWidthInches.toFixed(2), 'x', printHeightInches.toFixed(2), 'inches');

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Configure high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Transparent background - canvas is transparent by default

  // Convert SVG to data URL (using data URI instead of blob URL to avoid CORS/tainted canvas)
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const base64Data = btoa(unescape(encodeURIComponent(svgData)));
  const dataUrl = `data:image/svg+xml;base64,${base64Data}`;

  // Load SVG as image
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  // Draw image directly at scaled dimensions (no context scaling)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Convert canvas to PNG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Convert IMG element directly to PNG (simpler approach for data URIs)
 */
async function imgToPng(imgElement: HTMLImageElement, targetDPI: number = 600): Promise<Blob> {
  // console.log('[MMD Extension] imgToPng - IMG naturalWidth:', imgElement.naturalWidth);
  // console.log('[MMD Extension] imgToPng - IMG naturalHeight:', imgElement.naturalHeight);
  // console.log('[MMD Extension] imgToPng - IMG width:', imgElement.width);
  // console.log('[MMD Extension] imgToPng - IMG height:', imgElement.height);

  // Use natural dimensions (actual image size) or displayed dimensions
  const width = imgElement.naturalWidth || imgElement.width || 800;
  const height = imgElement.naturalHeight || imgElement.height || 600;

  // console.log('[MMD Extension] imgToPng - Using dimensions:', width, 'x', height);

  // Create high-resolution canvas at target DPI
  // SVG native resolution calibrated to match Adobe converter output
  const sourceDPI = 11.5;
  const scale = targetDPI / sourceDPI;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  // Calculate expected print dimensions
  // const printWidthInches = canvas.width / targetDPI;
  // const printHeightInches = canvas.height / targetDPI;

  // console.log('[MMD Extension] imgToPng - Configuration:');
  // console.log('  Source dimensions:', width, 'x', height, 'pixels');
  // console.log('  Source DPI:', sourceDPI);
  // console.log('  Target DPI:', targetDPI);
  // console.log('  Scale factor:', scale);
  // console.log('  Output dimensions:', canvas.width, 'x', canvas.height, 'pixels');
  // console.log('  Print size at', targetDPI, 'DPI:', printWidthInches.toFixed(2), 'x', printHeightInches.toFixed(2), 'inches');

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Configure high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Transparent background - no fill needed

  // Draw image at scaled dimensions (no context scaling - draw directly at target size)
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

  // console.log('[MMD Extension] imgToPng - Canvas dimensions:', canvas.width, 'x', canvas.height);

  // Convert to PNG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        // console.log('[MMD Extension] imgToPng - Blob size:', blob.size);
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Copy PNG blob to clipboard
 */
async function copyPngToClipboard(blob: Blob): Promise<void> {
  const clipboardItem = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([clipboardItem]);
}

/**
 * Generate simple hash from string (for deterministic filenames)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to base36 and take first 8 characters
  return Math.abs(hash).toString(36).substring(0, 8).padStart(8, '0');
}

/**
 * Generate filename for downloaded PNG based on source file and content hash
 */
function generateFilename(app: JupyterFrontEnd, content: string): string {
  // Try to get current document name
  const widget = app.shell.currentWidget;
  let baseName = 'diagram';

  if (widget) {
    // Check for title property (most widgets have this)
    const title = (widget as any)?.title?.label;
    if (title) {
      // Remove file extension
      baseName = title.replace(/\.(md|markdown)$/i, '');
    }
  }

  // Generate deterministic hash from content
  const contentHash = simpleHash(content);

  return `mermaid-${baseName}-${contentHash}.png`;
}

/**
 * Download PNG blob as file
 */
function downloadPng(blob: Blob, filename: string = 'mermaid-diagram.png'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Initialization data for the jupyterlab_mmd_to_png_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_mmd_to_png_extension:plugin',
  description:
    'Jupyterlab extension for markdown files with Mermaid diagrams to allow copying of mermaid diagrams as PNG images',
  autoStart: true,
  optional: [ICommandPalette, ISettingRegistry],
  activate: async (app: JupyterFrontEnd, palette: ICommandPalette | null, settingRegistry: ISettingRegistry | null) => {
    // console.log('[MMD Extension] ===== ACTIVATION STARTED =====');

    // Load settings
    let targetDPI = 600; // Default value
    if (settingRegistry) {
      try {
        const settings = await settingRegistry.load(plugin.id);
        targetDPI = settings.get('targetDPI').composite as number;
        // console.log('[MMD Extension] Loaded target DPI from settings:', targetDPI);

        // Listen for settings changes
        settings.changed.connect(() => {
          targetDPI = settings.get('targetDPI').composite as number;
          // console.log('[MMD Extension] Target DPI changed to:', targetDPI);
        });
      } catch (error) {
        console.error('[MMD Extension] Failed to load settings:', error);
      }
    } else {
      // console.log('[MMD Extension] Settings registry not available, using default DPI:', targetDPI);
    }
    // console.log('[MMD Extension] App:', app);
    // console.log('[MMD Extension] Palette:', palette);

    const { commands, contextMenu } = app;
    // console.log('[MMD Extension] Commands registry:', commands);
    // console.log('[MMD Extension] Context menu:', contextMenu);

    // Track last right-click target for viewer mode
    let lastContextMenuTarget: EventTarget | null = null;
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      lastContextMenuTarget = e.target;
      // console.log('[MMD Extension] Context menu target:', e.target);
    });

    // Command to copy Mermaid diagram as PNG
    const copyMermaidCommand = 'mermaid:copy-as-png';
    // console.log('[MMD Extension] Registering command:', copyMermaidCommand);

    commands.addCommand(copyMermaidCommand, {
      label: 'Copy as PNG',
      caption: 'Copy Mermaid diagram as PNG image',
      isEnabled: () => {
        // console.log('[MMD Extension] isEnabled called');

        // Only enable in viewer mode - check if right-clicked on SVG or IMG with SVG data URI
        // console.log('[MMD Extension] Checking viewer mode, last target:', lastContextMenuTarget);
        if (lastContextMenuTarget) {
          const target = lastContextMenuTarget as HTMLElement;
          // console.log('[MMD Extension] Target tag:', target.tagName);
          // console.log('[MMD Extension] Target className:', target.className);
          // console.log('[MMD Extension] Target id:', target.id);

          // Check for IMG tag with SVG data URI (JupyterLab's Mermaid rendering)
          if (target.tagName === 'IMG') {
            const imgElement = target as HTMLImageElement;
            const src = imgElement.src || '';
            // console.log('[MMD Extension] IMG src starts with data:image/svg:', src.startsWith('data:image/svg+xml'));
            if (src.startsWith('data:image/svg+xml')) {
              // console.log('[MMD Extension] Found Mermaid as IMG with SVG data URI');
              return true;
            }
          }

          // Check if target is inline SVG or contains/is contained by SVG
          const svgElement = target.closest('svg') || target.querySelector('svg');
          // console.log('[MMD Extension] Found inline SVG in viewer:', !!svgElement);

          if (svgElement) {
            // console.log('[MMD Extension] SVG id:', svgElement.id);
            // console.log('[MMD Extension] SVG aria-roledescription:', svgElement.getAttribute('aria-roledescription'));
            // console.log('[MMD Extension] SVG closest .jp-RenderedMarkdown:', !!svgElement.closest('.jp-RenderedMarkdown'));

            // Check if it's a Mermaid diagram (has mermaid-related attributes or classes)
            const isMermaid = svgElement.id?.includes('mermaid') ||
                             svgElement.getAttribute('aria-roledescription') === 'mermaid' ||
                             svgElement.closest('.jp-RenderedMarkdown') !== null;
            // console.log('[MMD Extension] Is Mermaid SVG:', isMermaid);
            return isMermaid;
          }
        }

        // console.log('[MMD Extension] Not enabled - no editor or SVG found');
        return false;
      },
      execute: async () => {
        // console.log('[MMD Extension] Execute called');

        try {
          // Viewer mode - convert already-rendered SVG or IMG with SVG data URI
          // console.log('[MMD Extension] Viewer mode execution');
          if (lastContextMenuTarget) {
            const target = lastContextMenuTarget as HTMLElement;

            // Handle IMG tag with SVG data URI
            if (target.tagName === 'IMG') {
              const imgElement = target as HTMLImageElement;
              const src = imgElement.src || '';

              if (src.startsWith('data:image/svg+xml')) {
                // console.log('[MMD Extension] Converting IMG directly to PNG...');
                const pngBlob = await imgToPng(imgElement, targetDPI);
                await copyPngToClipboard(pngBlob);
                // console.log('[MMD Extension] Mermaid diagram copied to clipboard as PNG (viewer IMG mode)');
                return;
              }
            }

            // Handle inline SVG element
            const svgElement = target.closest('svg') || target.querySelector('svg');
            if (svgElement) {
              // console.log('[MMD Extension] Converting inline SVG to PNG...');
              const pngBlob = await svgToPng(svgElement as SVGElement, targetDPI);
              await copyPngToClipboard(pngBlob);
              // console.log('[MMD Extension] Mermaid diagram copied to clipboard as PNG (viewer SVG mode)');
              return;
            }
          }

          console.error('[MMD Extension] No Mermaid diagram found');
        } catch (error) {
          console.error('[MMD Extension] Error converting Mermaid to PNG:', error);
        }
      }
    });

    // console.log('[MMD Extension] Command registered successfully');

    // Add to context menu only for rendered markdown content
    // console.log('[MMD Extension] Adding context menu item');
    contextMenu.addItem({
      command: copyMermaidCommand,
      selector: '.jp-RenderedMarkdown',  // Only show in markdown viewer
      rank: 10
    });
    // console.log('[MMD Extension] Context menu item added');

    // Add to command palette if available
    if (palette) {
      // console.log('[MMD Extension] Adding to command palette');
      palette.addItem({
        command: copyMermaidCommand,
        category: 'Markdown'
      });
      // console.log('[MMD Extension] Added to command palette');
    }

    // Command to download Mermaid diagram as PNG
    const downloadMermaidCommand = 'mermaid:download-as-png';
    // console.log('[MMD Extension] Registering download command:', downloadMermaidCommand);

    commands.addCommand(downloadMermaidCommand, {
      label: 'Save as PNG',
      caption: 'Save Mermaid diagram as PNG file',
      isEnabled: () => {
        // console.log('[MMD Extension] Download isEnabled called');

        // Only enable in viewer mode - check if right-clicked on SVG or IMG with SVG data URI
        // console.log('[MMD Extension] Download: Checking viewer mode, last target:', lastContextMenuTarget);
        if (lastContextMenuTarget) {
          const target = lastContextMenuTarget as HTMLElement;

          // Check for IMG tag with SVG data URI (JupyterLab's Mermaid rendering)
          if (target.tagName === 'IMG') {
            const imgElement = target as HTMLImageElement;
            const src = imgElement.src || '';
            if (src.startsWith('data:image/svg+xml')) {
              // console.log('[MMD Extension] Download: Found Mermaid as IMG with SVG data URI');
              return true;
            }
          }

          // Check if target is inline SVG or contains/is contained by SVG
          const svgElement = target.closest('svg') || target.querySelector('svg');
          if (svgElement) {
            const isMermaid = svgElement.id?.includes('mermaid') ||
                             svgElement.getAttribute('aria-roledescription') === 'mermaid' ||
                             svgElement.closest('.jp-RenderedMarkdown') !== null;
            return isMermaid;
          }
        }

        // console.log('[MMD Extension] Download: Not enabled');
        return false;
      },
      execute: async () => {
        // console.log('[MMD Extension] Download execute called');

        try {
          // Viewer mode - convert already-rendered SVG or IMG with SVG data URI
          // console.log('[MMD Extension] Download: Viewer mode execution');
          if (lastContextMenuTarget) {
            const target = lastContextMenuTarget as HTMLElement;

            // Handle IMG tag with SVG data URI
            if (target.tagName === 'IMG') {
              const imgElement = target as HTMLImageElement;
              const src = imgElement.src || '';

              if (src.startsWith('data:image/svg+xml')) {
                // console.log('[MMD Extension] Download: Converting IMG directly to PNG...');

                // Extract SVG content for hashing
                const svgData = decodeURIComponent(src.replace('data:image/svg+xml,', ''));

                const pngBlob = await imgToPng(imgElement, targetDPI);
                const filename = generateFilename(app, svgData);
                // console.log('[MMD Extension] Download: Generated filename:', filename);
                downloadPng(pngBlob, filename);
                // console.log('[MMD Extension] Download: Mermaid diagram downloaded (viewer IMG mode)');
                return;
              }
            }

            // Handle inline SVG element
            const svgElement = target.closest('svg') || target.querySelector('svg');
            if (svgElement) {
              // console.log('[MMD Extension] Download: Converting inline SVG to PNG...');

              // Serialize SVG for hashing
              const svgData = new XMLSerializer().serializeToString(svgElement as SVGElement);

              const pngBlob = await svgToPng(svgElement as SVGElement, targetDPI);
              const filename = generateFilename(app, svgData);
              // console.log('[MMD Extension] Download: Generated filename:', filename);
              downloadPng(pngBlob, filename);
              // console.log('[MMD Extension] Download: Mermaid diagram downloaded (viewer SVG mode)');
              return;
            }
          }

          console.error('[MMD Extension] Download: No Mermaid diagram found');
        } catch (error) {
          console.error('[MMD Extension] Download: Error converting Mermaid to PNG:', error);
        }
      }
    });

    // console.log('[MMD Extension] Download command registered successfully');

    // Add download to context menu only for rendered markdown content
    // console.log('[MMD Extension] Adding download context menu item');
    contextMenu.addItem({
      command: downloadMermaidCommand,
      selector: '.jp-RenderedMarkdown',  // Only show in markdown viewer
      rank: 11  // Right after copy command
    });
    // console.log('[MMD Extension] Download context menu item added');

    // Add download to command palette if available
    if (palette) {
      // console.log('[MMD Extension] Adding download to command palette');
      palette.addItem({
        command: downloadMermaidCommand,
        category: 'Markdown'
      });
      // console.log('[MMD Extension] Download added to command palette');
    }

    // console.log('[MMD Extension] ===== ACTIVATION COMPLETED =====');
    console.log('JupyterLab extension jupyterlab_mmd_to_png_extension is activated!');
  }
};

export default plugin;
