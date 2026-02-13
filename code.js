// Figma Plugin: Frame Validator
// Checks selected frames for color token compliance and layer naming conventions

figma.showUI(__html__, { width: 320, height: 480 });

// Get all color styles/variables from the document (including connected design systems)
function getColorTokens() {
  const tokens = new Set();
  
  try {
    // Get local color styles
    const localStyles = figma.getLocalPaintStyles();
    localStyles.forEach(style => {
      style.paints.forEach(paint => {
        if (paint.type === 'SOLID') {
          const rgb = paint.color;
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          tokens.add(hex);
        }
      });
    });
  } catch (e) {
    console.error('Error loading paint styles:', e);
  }
  
  try {
    // Get all available color variables (includes remote/library variables)
    if (figma.variables) {
      const allVariables = figma.variables.getLocalVariables('COLOR');
      allVariables.forEach(variable => {
        Object.values(variable.valuesByMode).forEach(value => {
          if (typeof value === 'object' && 'r' in value) {
            const hex = rgbToHex(value.r, value.g, value.b);
            tokens.add(hex);
          }
        });
      });
      
      // Get remote variables from connected libraries
      const collections = figma.variables.getLocalVariableCollections();
      collections.forEach(collection => {
        // Check if collection has remote variables
        if (collection.remote) {
          const collectionVariables = figma.variables.getVariablesInCollection(collection.id);
          collectionVariables.forEach(variable => {
            if (variable.resolvedType === 'COLOR') {
              Object.values(variable.valuesByMode).forEach(value => {
                if (typeof value === 'object' && 'r' in value) {
                  const hex = rgbToHex(value.r, value.g, value.b);
                  tokens.add(hex);
                }
              });
            }
          });
        }
      });
    }
  } catch (e) {
    console.error('Error loading variables:', e);
  }
  
  return tokens;
}

// Convert RGB to Hex
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}

// Check if layer name follows convention (kebab-case)
function isValidLayerName(name) {
  // Check for kebab-case: lowercase letters, numbers, and hyphens
  const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return kebabCase.test(name);
}

// Extract all colors from a node and its children
function extractColors(node, colors = new Set()) {
  if ('fills' in node && Array.isArray(node.fills)) {
    node.fills.forEach(fill => {
      if (fill.type === 'SOLID' && fill.visible !== false) {
        const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
        colors.add(hex);
      }
    });
  }
  
  if ('strokes' in node && Array.isArray(node.strokes)) {
    node.strokes.forEach(stroke => {
      if (stroke.type === 'SOLID' && stroke.visible !== false) {
        const hex = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
        colors.add(hex);
      }
    });
  }
  
  if ('children' in node) {
    node.children.forEach(child => extractColors(child, colors));
  }
  
  return colors;
}

// Check if a node is using bound styles/variables (not just matching colors)
function hasUnboundColors(node) {
  const unboundColors = [];
  
  function checkNode(n) {
    // Check fills
    if ('fills' in n && Array.isArray(n.fills)) {
      n.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.visible !== false) {
          // Check if fill is bound to a style or variable
          const hasBoundStyle = 'fillStyleId' in n && n.fillStyleId !== '';
          const hasBoundVariable = fill.boundVariables && 'color' in fill.boundVariables;
          
          if (!hasBoundStyle && !hasBoundVariable) {
            const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
            unboundColors.push(`${n.name}: ${hex}`);
          }
        }
      });
    }
    
    // Check strokes
    if ('strokes' in n && Array.isArray(n.strokes)) {
      n.strokes.forEach(stroke => {
        if (stroke.type === 'SOLID' && stroke.visible !== false) {
          const hasBoundStyle = 'strokeStyleId' in n && n.strokeStyleId !== '';
          const hasBoundVariable = stroke.boundVariables && 'color' in stroke.boundVariables;
          
          if (!hasBoundStyle && !hasBoundVariable) {
            const hex = rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
            unboundColors.push(`${n.name}: ${hex} (stroke)`);
          }
        }
      });
    }
    
    if ('children' in n) {
      n.children.forEach(child => checkNode(child));
    }
  }
  
  checkNode(node);
  return unboundColors;
}

// Collect all layer names from a node and its children
function collectLayerNames(node, names = []) {
  names.push(node.name);
  
  if ('children' in node) {
    node.children.forEach(child => collectLayerNames(child, names));
  }
  
  return names;
}

// Create annotation on frame for failed checks
async function addAnnotation(frame, message) {
  try {
    // Create a text node as annotation
    const annotation = figma.createText();
    
    // Load font first
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    
    annotation.name = '⚠️ Validation: Issues Found';
    annotation.characters = message;
    annotation.fontSize = 12;
    annotation.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    
    // Style the annotation box
    annotation.textAlignHorizontal = 'LEFT';
    annotation.textAlignVertical = 'TOP';
    
    // Add background
    const background = figma.createRectangle();
    background.name = 'annotation-bg';
    background.resize(320, annotation.height + 24);
    background.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.26, b: 0.13 } }];
    background.cornerRadius = 8;
    
    // Create a frame to group them
    const annotationGroup = figma.createFrame();
    annotationGroup.name = '⚠️ Validation: Issues Found';
    annotationGroup.resize(320, annotation.height + 24);
    annotationGroup.fills = [];
    
    // Add children
    annotationGroup.appendChild(background);
    annotationGroup.appendChild(annotation);
    
    // Position elements within group
    background.x = 0;
    background.y = 0;
    annotation.x = 12;
    annotation.y = 12;
    
    // Position group above frame
    annotationGroup.x = frame.x;
    annotationGroup.y = frame.y - annotationGroup.height - 16;
    
    // Add to same parent as the frame
    if (frame.parent && 'appendChild' in frame.parent) {
      frame.parent.appendChild(annotationGroup);
    }
  } catch (error) {
    console.error('Error creating annotation:', error);
  }
}

// Remove all validation annotations from a frame
function removeAnnotations(frame) {
  if (frame.parent && 'findAll' in frame.parent) {
    const annotations = frame.parent.findAll(node => 
      node.name.startsWith('⚠️ Validation:')
    );
    
    annotations.forEach(annotation => {
      // Check if this annotation is near our frame
      if ('x' in annotation && 'y' in annotation) {
        const isNearFrame = 
          Math.abs(annotation.x - frame.x) < 50 && 
          annotation.y < frame.y && 
          annotation.y > frame.y - 200;
        
        if (isNearFrame) {
          annotation.remove();
        }
      }
    });
  }
}

async function validateFrame(frame, addAnnotations = false) {
  const colorTokens = getColorTokens();
  const usedColors = extractColors(frame);
  const layerNames = collectLayerNames(frame);
  const unboundColors = hasUnboundColors(frame);
  
  // Check colors match tokens
  const unmatchedColors = [];
  usedColors.forEach(color => {
    if (!colorTokens.has(color)) {
      unmatchedColors.push(color);
    }
  });
  
  // Check layer names
  const invalidNames = [];
  layerNames.forEach(name => {
    if (!isValidLayerName(name)) {
      invalidNames.push(name);
    }
  });
  
  const results = {
    frameName: frame.name,
    allColorsInTokens: unmatchedColors.length === 0,
    unmatchedColors: unmatchedColors,
    allColorsBound: unboundColors.length === 0,
    unboundColors: unboundColors,
    allLayerNamesValid: invalidNames.length === 0,
    invalidNames: invalidNames,
    totalColors: usedColors.size,
    totalLayers: layerNames.length
  };
  
  // Add annotation if requested and validation failed
  if (addAnnotations) {
    removeAnnotations(frame); // Remove old annotations first
    
    const hasIssues = !results.allColorsInTokens || !results.allColorsBound || !results.allLayerNamesValid;
    
    if (hasIssues) {
      const issues = [];
      
      if (!results.allColorsInTokens) {
        issues.push(`❌ ${unmatchedColors.length} color(s) not in design system`);
      }
      if (!results.allColorsBound) {
        issues.push(`❌ ${unboundColors.length} hardcoded color(s)`);
      }
      if (!results.allLayerNamesValid) {
        issues.push(`❌ ${invalidNames.length} invalid layer name(s)`);
      }
      
      const message = `${frame.name}\n\n${issues.join('\n')}`;
      await addAnnotation(frame, message);
    }
  }
  
  return results;
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'validate') {
    try {
      const selection = figma.currentPage.selection;
      
      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Please select at least one frame'
        });
        return;
      }
      
      const frames = selection.filter(node => node.type === 'FRAME');
      
      if (frames.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Please select a frame (not other node types)'
        });
        return;
      }
      
      const addAnnotations = msg.addAnnotations !== false; // Default to true
      const results = [];
      
      for (const frame of frames) {
        const result = await validateFrame(frame, addAnnotations);
        results.push(result);
      }
      
      figma.ui.postMessage({
        type: 'results',
        data: results
      });
    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: 'Error during validation: ' + error.message
      });
      console.error('Validation error:', error);
    }
  }
  
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
