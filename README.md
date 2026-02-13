# Red Pen 🖊️

A Figma plugin that validates design system compliance and provides component usage insights.

## ✨ Features

- **🔗 Color Token Validation**: Ensures colors are properly bound to variables/styles (not hardcoded)
- **📊 Component Metrics**: Shows component usage statistics and breakdown
- **📍 Visual Annotations**: Failed frames get red annotations on the canvas
- **🎯 Design System Focus**: Helps maintain consistency in design systems

## 🚀 Installation

### Option 1: Development Install (Recommended)

1. **Download the plugin files**:
   - Clone this repo or download as ZIP
   - Extract to a local folder

2. **Import to Figma**:
   - Open Figma Desktop App
   - Go to `Plugins` → `Development` → `Import plugin from manifest`
   - Select the `manifest.json` file from the plugin folder
   - Plugin is now ready to use!

### Option 2: From Figma Community (Coming Soon)

Will be available on Figma Community once published.

## 🎯 How to Use

1. **Select frames** you want to validate in your Figma file
2. **Run the plugin**: `Plugins` → `Development` → `Red Pen`
3. **Click "Validate Selection"**
4. **Review the results** in the plugin panel
5. **Check your canvas** - frames with issues get red annotations

## 🔍 What It Validates & Reports

### Color Token Compliance ✅❌
- **Validates**: Colors are bound to variables or styles (not hardcoded)
- **Purpose**: Ensures consistent use of design tokens
- **Flags**: Hardcoded hex values that should use design system colors
- **Shows**: Specific layers and colors that need fixing

### Component Usage Metrics 📊
- **Counts**: Total component instances in the frame
- **Lists**: Breakdown of each component and usage frequency  
- **Tracks**: Unique components vs total instances
- **Purpose**: Understanding component adoption and consistency

## 🎨 Visual Feedback

**Annotations**: Frames with color issues automatically get red annotations showing:
- Frame name
- Number of hardcoded colors found
- Visual indicator on the canvas

## ⚙️ Customization

### Modify Color Validation

Edit the `hasUnboundColors` function in `code.js` to adjust what counts as "bound":

```javascript
// Current logic checks for:
const hasBoundStyle = 'fillStyleId' in node && node.fillStyleId !== '';
const hasBoundVariable = fill.boundVariables && 'color' in fill.boundVariables;
```

### Add Custom Metrics

Extend the `countComponents` function to track additional metrics like:
- Text styles usage
- Spacing consistency
- Icon usage patterns

## 🏗️ Development

### Prerequisites

- Figma Desktop App
- Node.js (for development/building)

### Setup

```bash
npm install
```

### Build TypeScript (Optional)

```bash
npm run build
```

### Lint Code

```bash
npm run lint
npm run lint:fix
```

## 📁 File Structure

```
├── code.js          # Main plugin logic (JavaScript)
├── code.ts          # TypeScript source (optional)
├── ui.html          # Plugin interface with results display
├── manifest.json    # Plugin configuration
├── icon.png         # Plugin icon
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## 🎯 Design Philosophy

**Focus on what matters**: 
- Validates actual design system compliance (token binding)
- Provides actionable component insights
- Doesn't flag things that aren't necessarily problems
- Gives metrics for understanding design consistency

**Non-intrusive**:
- Only marks actual errors with annotations
- Shows metrics as information, not failures
- Helps designers understand their design patterns

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created by **Yaosamo** (Yaroslav Samoylov)

---

## 🔗 Related

- [Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
- [Design Systems Best Practices](https://www.designsystems.com/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)

---

*Keep your design system consistent and your tokens properly bound!* 🎨✨