# Canvas Image Slider

A smooth, responsive image slider built with HTML5 Canvas and vanilla JavaScript. Features drag-to-navigate functionality with keyboard support and touch compatibility.

## 🚀 Quick Start (No Build Required)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pakinamelbanna/canva-slider.git
   cd canva-slider
   ```
2. **Serve the built files:**

   ```bash
   npx serve dist/
   ```

3. **Open in browser:**
   go to http://localhost:3000

````markdown
# Canvas Image Slider

A smooth, responsive image slider built with HTML5 Canvas and vanilla JavaScript. Features drag-to-navigate functionality with keyboard support and touch compatibility.

## 🚀 Quick Start (No Build Required)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pakinamelbanna/canva-slider.git
   cd canva-slider
   ```
````

2. **Serve the built files:**

   ```bash
   # Using npx (recommended)
   npx serve dist/

   # Or using Python
   python -m http.server 8000 -d dist/

   # Or using Node.js http-server
   npx http-server dist/
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

## 🎯 Features

- **Canvas-based rendering** - Smooth, hardware-accelerated graphics
- **Drag navigation** - Mouse and touch support for intuitive sliding
- **Keyboard navigation** - Arrow keys for accessibility
- **Responsive design** - Adapts to different screen sizes
- **Image optimization** - Automatic scaling and aspect ratio handling
- **Error handling** - Graceful fallback for failed image loads
- **Memory management** - Lazy loading and cleanup for performance

## 🎮 Controls

- **Mouse:** Drag left or right to navigate between images
- **Keyboard:** Use ← → arrow keys to navigate (when canvas is focused)
- **Focus (Click or Tab):** Click the canvas or press Tab until it is focused, then use ← → arrow keys to navigate

## 🛠️ Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Watch tests during development
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## 🏗️ Architecture

```
src/
├── canvas.js           # Main canvas initialization and event handling
├── slides.js           # Image URLs and configuration
└── utils/
    ├── canvasUtils.js  # Canvas setup and geometry calculations
    ├── imageUtils.js   # Image loading and drawing utilities
    ├── memoryUtils.js  # Performance optimization utilities
    └── scheduleUtils.js # Animation scheduling utilities
```

### Key Components

- **Canvas Manager** - Handles canvas setup, device pixel ratio, and rendering
- **Image Loader** - Asynchronous image loading with retry logic and fallbacks
- **Gesture Handler** - Pointer events for drag navigation with momentum
- **Memory Manager** - Lazy loading and cleanup for optimal performance

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests** - Individual utility functions and components
- **Integration Tests** - Full slider interaction scenarios
- **CI/CD Pipeline** - Automated testing on every push

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode during development
npm run test:watch
```

## 🚢 Deployment

### Automatic Deployment (Vercel)

This project is configured for automatic deployment to Vercel:

- Push to `main` branch triggers automatic deployment
- Tests run before deployment (deployment blocked if tests fail)
- Live demo: [https://canva-slider.vercel.app](https://canva-slider.vercel.app)

### Manual Deployment

The dist folder contains prebuilt files that can be deployed to any static hosting service:

- Netlify
- GitHub Pages
- AWS S3
- Any static file server

## 🔧 Configuration

### Adding Images

Update slides.js to add or modify images:

```javascript
export const slideUrls = [
  "/images/your-image-1.jpg",
  "/images/your-image-2.jpg",
  // Add more images...
];
```

### Performance Tuning

Adjust settings in utility files:

- Image loading batch size in `memoryUtils.js`
- Animation frame scheduling in `scheduleUtils.js`
- Canvas rendering options in `canvasUtils.js`
