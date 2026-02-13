# Figma Red Pen 🖊️

A Figma plugin that validates your designs against design system requirements. Catch inconsistencies before they ship!

## ✨ Features

- **🎨 Color Token Validation**: Checks if all colors exist in your connected design system libraries
- **🔗 Token Binding**: Validates colors are properly bound to tokens (not hardcoded hex values)  
- **📝 Naming Convention**: Ensures layer names follow kebab-case convention (`button-primary`, `icon-home`)
- **📍 Visual Annotations**: Failed frames get red annotations showing which requirements failed
- **📚 Design System Integration**: Works with both local and remote design system libraries

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
4. **Review the checklist** results in the plugin panel
5. **Check your canvas** - failed frames automatically get red annotations showing issues

## 🔍 What It Validates

### Color Token Compliance
- ✅ Colors exist in connected design system libraries
- ✅ Colors are bound to styles/variables (not hardcoded)
- ✅ Supports both local and remote design tokens
- 📝 Lists any non-compliant colors with suggestions

### Layer Naming
- ✅ All layer names follow kebab-case format
- ✅ **Valid**: `button-primary`, `icon-search`, `card-header`  
- ❌ **Invalid**: `Button Primary`, `icon_search`, `Card Header`

## ⚙️ Customization

### Change Naming Convention

Edit the `isValidLayerName` function in `code.js`:

```javascript
function isValidLayerName(name) {
  // Example: PascalCase
  const pascalCase = /^[A-Z][a-zA-Z0-9]*$/;
  return pascalCase.test(name);
  
  // Example: snake_case  
  const snakeCase = /^[a-z0-9]+(_[a-z0-9]+)*$/;
  return snakeCase.test(name);
}
```

### Add Custom Validations

Add new validation functions to `validateFrame()` in `code.js` and update the UI accordingly.

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
├── ui.html          # Plugin interface with checklist UI
├── manifest.json    # Plugin configuration
├── icon.png         # Plugin icon
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

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

---

*Keep your designs consistent and your design system happy!* 🎨✨