// Figma Plugin: Red Pen
// Validates design system compliance and provides component usage metrics

figma.showUI(__html__, { width: 320, height: 480 });

// Convert RGB to Hex
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
}

// Check if a color is a universal exception (pure white or black)
function isUniversalColor(hex) {
  return hex === '#ffffff' || hex === '#000000';
}

// Check if a node is using bound styles/variables (not hardcoded)
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
            // Skip universal colors (pure white and black)
            if (!isUniversalColor(hex)) {
              unboundColors.push(`${n.name}: ${hex}`);
            }
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
            // Skip universal colors (pure white and black)
            if (!isUniversalColor(hex)) {
              unboundColors.push(`${n.name}: ${hex} (stroke)`);
            }
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

// Count component instances used in a frame
function countComponents(node) {
  const componentInstances = [];
  
  function traverseNode(n) {
    if (n.type === 'INSTANCE') {
      const componentName = n.mainComponent ? n.mainComponent.name : 'Unknown Component';
      componentInstances.push(componentName);
    }
    
    if ('children' in n) {
      n.children.forEach(child => traverseNode(child));
    }
  }
  
  traverseNode(node);
  
  // Count occurrences of each component
  const componentCounts = {};
  componentInstances.forEach(name => {
    componentCounts[name] = (componentCounts[name] || 0) + 1;
  });
  
  return {
    totalInstances: componentInstances.length,
    uniqueComponents: Object.keys(componentCounts).length,
    componentBreakdown: componentCounts
  };
}

// Create annotation on frame for validation results
async function addAnnotation(frame, message, isSuccess = false) {
  try {
    // Create a text node as annotation
    const annotation = figma.createText();
    
    // Load font first
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    
    const annotationName = isSuccess ? '✅ Red Pen: Validated' : '⚠️ Red Pen: Issues Found';
    annotation.name = annotationName;
    annotation.characters = message;
    annotation.fontSize = 12;
    annotation.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    
    // Style the annotation box
    annotation.textAlignHorizontal = 'LEFT';
    annotation.textAlignVertical = 'TOP';
    
    // Add background with appropriate color
    const background = figma.createRectangle();
    background.name = 'annotation-bg';
    background.resize(320, annotation.height + 24);
    
    if (isSuccess) {
      // Green background for success
      background.fills = [{ type: 'SOLID', color: { r: 0.06, g: 0.66, b: 0.35 } }];
    } else {
      // Red background for issues
      background.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.26, b: 0.13 } }];
    }
    background.cornerRadius = 8;
    
    // Create a frame to group them
    const annotationGroup = figma.createFrame();
    annotationGroup.name = annotationName;
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
      node.name.startsWith('⚠️ Red Pen:') || node.name.startsWith('✅ Red Pen:')
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
  const unboundColors = hasUnboundColors(frame);
  const componentStats = countComponents(frame);
  
  const results = {
    frameName: frame.name,
    allColorsBound: unboundColors.length === 0,
    unboundColors: unboundColors,
    componentStats: componentStats
  };
  
  // Add annotation if requested
  if (addAnnotations) {
    removeAnnotations(frame); // Remove old annotations first
    
    const hasColorIssues = !results.allColorsBound;
    
    if (hasColorIssues) {
      // Add failure annotation
      const issues = [];
      
      if (!results.allColorsBound) {
        issues.push(`❌ ${unboundColors.length} hardcoded color(s)`);
      }
      
      const message = `${frame.name}\n\n${issues.join('\n')}`;
      await addAnnotation(frame, message, false);
    } else {
      // Add success annotation
      const components = componentStats.totalInstances;
      const message = `${frame.name}\n\n✅ All colors properly bound to design tokens\n📊 ${components} component instances used`;
      await addAnnotation(frame, message, true);
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