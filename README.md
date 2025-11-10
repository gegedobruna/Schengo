# SCHENGO: A Schengen 90/180 Planner

A Vue 3 + TypeScript application for planning and tracking Schengen area stays while staying compliant with the 90/180 day rule.

## Features

- 🎯 **Dual Mode System**: 
  - **Planning Mode**: Calculate remaining days for a future trip
  - **Inside Mode**: Track your current stay if you're already in the Schengen zone
- 📅 **Stay Tracking**: Record and manage your past Schengen area visits
- ⏰ **90/180 Rule Calculator**: Automatic calculation of remaining days within any 180-day rolling period
- ✅ **Compliance Check**: Real-time validation to prevent overstaying with error messages
- 🌍 **Bilingual Support**: Available in English and Albanian
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Glassmorphic design with smooth animations

## Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript + Vite
- **Styling**: Tailwind CSS with custom color palette
- **Date Picker**: @vuepic/vue-datepicker
- **Date Formatting**: date-fns (for locale-aware formatting)
- **Testing**: Vitest
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

## Project Structure

```
src/
├── App.vue              # Main application component (single-page app)
├── main.ts              # Application entry point
├── style.css            # Global styles and Tailwind directives
├── env.d.ts             # TypeScript declarations
├── utils/
│   ├── schengen.ts      # Core Schengen calculation logic
│   ├── translations.ts  # i18n translations (English/Albanian)
│   └── background/      # Assets (logo, background images)
└── tests/
    └── schengen.spec.ts # Unit tests for calculation logic
```

## About the 90/180 Rule

The Schengen 90/180 rule means that you can stay in the Schengen area for a maximum of 90 days within any 180-day period. This rule applies to non-EU citizens who don't need a visa to enter the Schengen area.

### Key Points:
- 90 days maximum in any 180-day rolling period
- The 180-day window is calculated backwards from any given date
- Days are counted from your entry date
- Includes all Schengen countries
- Overlapping stays are automatically merged to prevent double-counting

### Schengen Countries:
Austria, Belgium, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Portugal, Slovakia, Slovenia, Spain, Sweden, Switzerland

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

This project is deployed to GitHub Pages via GitHub Actions. The deployment workflow is configured for manual triggering (workflow_dispatch) to prevent automatic deployments on every push.

## Support

If you have any questions or need help, please open an issue on GitHub.

---

**Note**: This tool is for informational purposes only. Always verify your visa requirements and stay limits with official sources before traveling.
