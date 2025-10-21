# Schengen 90/180 Planner

A production-ready Vue 3 + TypeScript application for planning and tracking Schengen area stays while staying compliant with the 90/180 day rule.

## Features

- 📅 **Stay Tracking**: Record and manage your Schengen area visits
- ⏰ **90/180 Rule Calculator**: Automatic calculation of remaining days within any 180-day period
- ✅ **Compliance Check**: Real-time validation to prevent overstaying
- 🚨 **Warnings**: Alerts when approaching the 90-day limit
- 📊 **Visual Progress**: Clear progress bars and status indicators
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router (Hash History)
- **Validation**: vee-validate + Zod
- **Date Handling**: Luxon
- **Testing**: Vitest + Vue Testing Library
- **Linting**: ESLint + Prettier
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gegedobruna/Schengo.git
cd Schengo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run format` - Format code
- `npm run deploy` - Deploy to GitHub Pages

## Project Structure

```
src/
├── components/          # Vue components
│   ├── AlreadyInsideMode.vue
│   ├── PlannerMode.vue
│   └── StayEditor.vue
├── composables/         # Vue composables
│   └── usePlanner.ts
├── lib/                 # Core business logic
│   └── schengen.ts
├── pages/               # Page components
│   ├── Home.vue
│   ├── Inside.vue
│   └── Plan.vue
├── router/              # Vue Router configuration
│   └── index.ts
├── stores/              # Pinia stores
│   └── trips.ts
├── utils/               # Utility functions
│   └── stays.ts
├── App.vue
├── main.ts
├── style.css
└── types.ts
```

## About the 90/180 Rule

The Schengen 90/180 rule means that you can stay in the Schengen area for a maximum of 90 days within any 180-day period. This rule applies to non-EU citizens who don't need a visa to enter the Schengen area.

### Key Points:
- 90 days maximum in any 180-day period
- Days are counted from your first entry
- Includes all Schengen countries
- Reset happens automatically after 180 days

### Schengen Countries:
Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovakia, Slovenia, Spain, Sweden, Switzerland

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

This project is automatically deployed to GitHub Pages when changes are pushed to the `master` branch. The deployment is handled by GitHub Actions.

## Support

If you have any questions or need help, please open an issue on GitHub.

---

**Note**: This tool is for informational purposes only. Always verify your visa requirements and stay limits with official sources before traveling.
