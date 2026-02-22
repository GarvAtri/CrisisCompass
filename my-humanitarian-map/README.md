# My Humanitarian Map

A React-based interactive mapping application for visualizing and analyzing humanitarian crisis data in real-time.

## Overview

My Humanitarian Map is a modern web application that provides interactive mapping capabilities combined with data visualization tools to help users understand and respond to humanitarian crises. Built with React, TypeScript, and Leaflet, it offers a responsive and intuitive interface for exploring crisis data.

## Features

### 🗺️ Interactive Mapping
- Real-time crisis location visualization
- Custom markers and popups with detailed information
- Multi-layer map support (base maps, overlays)
- Zoom and pan controls with smooth animations

### 📊 Data Visualization
- Dynamic charts and graphs using Recharts
- Statistical dashboards for crisis analysis
- Time-series data visualization
- Export capabilities for reports

### 🎨 Modern UI/UX
- Responsive design for desktop and mobile
- Clean, intuitive interface using Tailwind CSS
- Icon library (Lucide React) for consistent visual elements
- Accessibility-focused design

### ⚡ Performance
- Fast loading with Vite build system
- Optimized bundle size
- Efficient state management
- Smooth animations and transitions

## Installation

### Prerequisites
- Node.js 18.0 or higher
- npm 9.0 or higher

### Setup Instructions

1. **Clone the repository** (if not already done):
```bash
git clone <repository-url>
cd CrisisCompass/my-humanitarian-map
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open your browser** and navigate to `http://localhost:5173`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (TypeScript compilation + Vite build) |
| `npm run lint` | Run ESLint for code quality checks |
| `npm run preview` | Preview production build locally |

## Project Structure

```
my-humanitarian-map/
├── public/                     # Static assets
│   ├── index.html             # HTML template
│   └── ...                    # Other static files
├── src/                       # Source code
│   ├── components/            # React components
│   ├── pages/                 # Page components
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   ├── types/                 # TypeScript type definitions
│   ├── styles/                # CSS/Tailwind styles
│   ├── App.tsx               # Main application component
│   └── main.tsx              # Application entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TypeScript config
├── tsconfig.node.json        # Node.js TypeScript config
├── vite.config.ts            # Vite build configuration
├── eslint.config.js           # ESLint configuration
└── README.md                 # This file
```

## Technology Stack

### Core Technologies
- **React 19.2.0** - Modern UI framework with concurrent features
- **TypeScript 5.9.3** - Type-safe JavaScript development
- **Vite 7.3.1** - Fast build tool and development server

### Mapping & Visualization
- **Leaflet 1.9.4** - Open-source interactive maps
- **@types/leaflet 1.9.21** - TypeScript definitions for Leaflet
- **Recharts 3.7.0** - Composable charting library

### Styling & UI
- **Tailwind CSS 4.2.0** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing and optimization
- **Autoprefixer 10.4.24** - CSS vendor prefixing
- **Lucide React 0.487.0** - Beautiful icon library

### Development Tools
- **ESLint 9.39.1** - Code linting and formatting
- **@eslint/js 9.39.1** - ESLint JavaScript configuration
- **eslint-plugin-react-hooks 7.0.1** - React hooks linting
- **eslint-plugin-react-refresh 0.4.24** - React refresh linting
- **TypeScript ESLint 8.48.0** - TypeScript-specific ESLint rules

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow React functional component patterns
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Write meaningful commit messages

### Component Structure
- Keep components small and focused
- Use custom hooks for complex logic
- Implement proper TypeScript types
- Add JSDoc comments for complex functions
- Follow accessibility best practices

### Performance Considerations
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with dynamic imports
- Use lazy loading for heavy components
- Monitor and optimize render performance

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Run linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Open a Pull Request

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
VITE_MAP_API_KEY=your_map_api_key_here
VITE_API_BASE_URL=https://your-api-endpoint.com
```

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Deployment

### Static Hosting
The application can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Server Deployment
For server-side deployment, ensure the build artifacts are served correctly and routing is configured for single-page applications.

## Troubleshooting

### Common Issues

1. **Map not loading**: Check API keys and network connectivity
2. **Build errors**: Ensure all dependencies are installed and TypeScript is configured correctly
3. **Styling issues**: Verify Tailwind CSS is properly configured and imported

### Getting Help

- Check the browser console for error messages
- Review the TypeScript compilation output
- Ensure all environment variables are set correctly
- Verify network connectivity for external APIs

## License

This project is part of the CrisisCompass initiative and is licensed under the MIT License.

## Support

For technical support or questions:
- Create an issue in the repository
- Check the documentation for common solutions
- Join our community discussions

