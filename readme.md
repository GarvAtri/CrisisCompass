# CrisisCompass

A comprehensive humanitarian crisis mapping and response platform designed to provide real-time visualization and analysis of crisis situations worldwide.

## Overview

CrisisCompass is an open-source platform that combines interactive mapping, data visualization, and crisis management tools to help humanitarian organizations, emergency responders, and the public better understand and respond to crisis situations.

## Features

- **Interactive Crisis Mapping**: Real-time visualization of crisis locations and affected areas
- **Data Analytics**: Comprehensive dashboards with charts and statistics
- **Multi-layer Support**: Overlay different data types (population, infrastructure, resources)
- **Responsive Design**: Accessible on desktop and mobile devices
- **Open Source**: Built with modern web technologies for transparency and collaboration

## Project Structure

```
CrisisCompass/
├── my-humanitarian-map/          # Main web application
│   ├── src/                      # React application source code
│   ├── public/                   # Static assets
│   ├── package.json              # Dependencies and scripts
│   └── README.md                 # Application-specific documentation
├── Works_try.ipynb               # Data analysis and development notebook
├── .gitignore                    # Git ignore configuration
└── readme.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CrisisCompass
```

2. Navigate to the web application:
```bash
cd my-humanitarian-map
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet** - Interactive maps
- **Recharts** - Data visualization charts
- **Lucide React** - Icon library

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **TypeScript Compiler** - Type checking

## Contributing

We welcome contributions from the humanitarian tech community! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Ensure code passes ESLint checks
- Test your changes thoroughly
- Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions, suggestions, or support:
- Create an issue in this repository
- Join our community discussions
- Contact the maintainers directly

## Acknowledgments

- Built for the humanitarian community
- Thanks to all contributors and volunteers
- Inspired by global crisis mapping initiatives

---

**Note**: For detailed information about the web application, please refer to the [my-humanitarian-map README](./my-humanitarian-map/README.md).
