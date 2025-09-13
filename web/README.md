# TradeByBarter Web App

A modern Next.js TypeScript web application for the TradeByBarter Nigerian barter marketplace platform.

##  Features

- **Next.js 15**: React framework with App Router and Server Components
- **TypeScript**: Full type safety and modern JavaScript features
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Responsive Design**: Mobile-first responsive design approach
- **SEO Optimized**: Built-in SEO features with Next.js
- **Progressive Web App (PWA)**: Offline-first web app capabilities
- **Authentication**: Secure user authentication with NextAuth.js
- **Image Optimization**: Automatic image optimization with Next.js Image
- **Performance**: Optimized for Core Web Vitals and speed
- **Testing**: Unit and integration tests with Jest and Testing Library
- **Code Quality**: ESLint, Prettier, and strict TypeScript configuration
- **Git Hooks**: Pre-commit hooks for code quality enforcement

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (>= 18.0.0)
- **npm** (>= 9.0.0)
- **Git**

##  Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit the `.env.local` file with your actual configuration values:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
   # ... other variables
   ```

##  Running the Application

### Development Mode
```bash
npm run dev
```
The web app will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npm run type-check
```

##  Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint and fix issues |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |
| `npm run check-emojis` | Scan codebase for emoji violations |
| `npm run validate` | Run all validation checks |

##  Project Structure

```
web/
├── src/
│   ├── app/                   # App Router pages and layouts
│   │   ├── (auth)/           # Authentication pages group
│   │   ├── (dashboard)/      # Dashboard pages group
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout component
│   │   ├── page.tsx          # Home page
│   │   └── loading.tsx       # Loading UI
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   ├── forms/           # Form components
│   │   ├── layout/          # Layout components
│   │   └── common/          # Common components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries and configurations
│   │   ├── auth.ts          # Authentication configuration
│   │   ├── db.ts            # Database utilities
│   │   ├── utils.ts         # General utilities
│   │   └── validations.ts   # Form validation schemas
│   ├── styles/              # Additional stylesheets
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/                  # Static assets
│   ├── images/             # Image assets
│   ├── icons/              # Icon assets
│   └── manifest.json       # PWA manifest
├── scripts/                # Utility scripts
├── .env.example            # Environment variables template
├── .eslintrc.js           # ESLint configuration
├── .prettierrc.js         # Prettier configuration
├── .commitlintrc.js       # Commit message linting
├── tailwind.config.ts     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
└── README.md              # This file
```

##  Styling

### Tailwind CSS
This project uses Tailwind CSS for styling. Key features:

- **Utility-first**: Build designs directly in your markup
- **Responsive**: Mobile-first responsive design
- **Dark mode**: Built-in dark mode support
- **Custom theme**: Customized color palette and spacing
- **Component classes**: Reusable component styles

### Design System
The project follows a consistent design system with:
- Predefined color palette
- Typography scale
- Spacing system
- Component variants
- Animation utilities

##  Authentication

Authentication is handled by NextAuth.js with support for:

- **Email/Password**: Traditional authentication
- **OAuth Providers**: Google, Facebook, etc.
- **JWT Tokens**: Secure session management
- **Role-based Access**: User roles and permissions
- **Session Management**: Automatic session handling

### Setting up OAuth
1. Configure OAuth providers in `src/lib/auth.ts`
2. Set environment variables for each provider
3. Configure callback URLs in provider dashboards

##  Progressive Web App (PWA)

The web app includes PWA features:

- **Offline Support**: Works without internet connection
- **Install Prompt**: Can be installed on devices
- **Push Notifications**: Real-time notifications
- **Background Sync**: Sync data when connection resumes
- **App-like Experience**: Native app feel

##  Performance Optimization

### Next.js Features
- **Server Components**: Reduced client-side JavaScript
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic code splitting
- **Bundle Analyzer**: Analyze bundle size
- **Static Generation**: Pre-rendered pages for speed

### Best Practices
- Lazy loading components
- Optimized images with next/image
- Minimal JavaScript bundles
- Efficient CSS delivery
- Core Web Vitals optimization

##  Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Stack
- **Jest**: Testing framework
- **Testing Library**: React component testing
- **MSW**: API mocking for tests
- **Playwright**: E2E testing (optional)

##  Analytics & Monitoring

### Integrated Services
- **Google Analytics**: Web analytics
- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error monitoring and reporting
- **Core Web Vitals**: Performance metrics

##  Code Quality & Standards

### Zero Emoji Policy
This project enforces a **ZERO-TOLERANCE policy for emojis** in the codebase. All commits are automatically scanned for emoji characters and will be rejected if any are found.

### Code Style
- **ESLint**: Enforces coding standards and catches errors
- **Prettier**: Ensures consistent code formatting
- **TypeScript**: Strict mode enabled for maximum type safety
- **Conventional Commits**: Standardized commit message format

### Pre-commit Hooks
Before each commit, the following checks are automatically run:
- Emoji detection and rejection
- ESLint validation
- TypeScript compilation check
- Commit message format validation

### Commit Message Format
```
type(scope): Description

Examples:
feat(ui): Add product card component
fix(auth): Resolve login redirect issue
style(components): Update button styling
docs(readme): Update setup instructions
```

##  Deployment

### Vercel (Recommended)
1. Connect your Git repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push

### Manual Deployment
```bash
npm run build
npm start
```

### Environment Variables
Set the following environment variables in your deployment platform:
- `NEXTAUTH_URL`: Your production URL
- `NEXTAUTH_SECRET`: Secure random string
- `NEXT_PUBLIC_API_URL`: Backend API URL
- Other API keys and configuration

##  Key Libraries

| Library | Purpose |
|---------|---------|
| Next.js | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| NextAuth.js | Authentication |
| React Hook Form | Form handling |
| Zod | Schema validation |
| React Query | Data fetching |
| Zustand | State management |
| Framer Motion | Animations |

##  Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes following the coding standards
4. Ensure all tests pass: `npm run test`
5. Run validation checks: `npm run validate`
6. Commit using conventional commit format
7. Push to your branch: `git push origin feat/amazing-feature`
8. Create a Pull Request

##  License

This project is proprietary software. All rights reserved.

##  Support

For support and questions, contact the development team at `dev@tradebybarter.com`
