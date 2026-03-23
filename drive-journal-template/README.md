# Drive Journal - Standalone App Template

This template provides everything you need to create a standalone Drive Journal app based on the PADDOCK20 platform's Drive Journal functionality. The Drive Journal allows automotive enthusiasts to record, track, and analyze their driving experiences with detailed metrics, weather impact analysis, and performance tracking.

## Features

- **Drive Entry Management**: Create, view, edit, and delete drive journal entries
- **Mood & Energy Tracking**: Track driver mood and energy levels throughout drives
- **Route Analytics**: Analyze altitude profiles and route characteristics
- **Enhanced Drive Telemetry**: Monitor vehicle performance settings and adjustments
- **Weather Impact Analysis**: Understand how weather conditions affect your driving experience
- **F1-Inspired UI**: Professional dark carbon-fiber theme with Carolina blue (#1982FC) and GoTime green (#08c519) accents

## Getting Started

### Method 1: Using this Template Directly

1. Create a new Replit project using the Node.js template
2. Copy all files from this `drive-journal-template` directory to your new project
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Method 2: Manual Setup

If you prefer to set up the project manually, follow these steps:

1. Create a new Replit project using the Node.js template
2. Initialize your project:
   ```bash
   npm init -y
   ```
3. Install required dependencies:
   ```bash
   npm install react react-dom @tanstack/react-query express express-session drizzle-orm drizzle-zod date-fns wouter cors
   npm install -D typescript @types/react @types/react-dom @types/express @types/express-session vite @vitejs/plugin-react tailwindcss postcss autoprefixer drizzle-kit
   ```
4. Copy the key files from this template to your project, especially:
   - `/client/src/pages/drive-journal-page.tsx`
   - `/client/src/components/` directory
   - `/shared/schema.ts`
   - `/server/` directory

## Project Structure

```
drive-journal/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── styles/      # CSS and styles
│   │   ├── hooks/       # Custom React hooks
│   │   └── App.tsx      # Main React component
│   ├── package.json     # Client dependencies
│   └── vite.config.ts   # Vite configuration
├── server/              # Backend Node.js/Express application
│   ├── db.ts            # Database connection
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Data storage service
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Data schema definitions
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── drizzle.config.ts    # Drizzle ORM configuration
```

## Database Setup

By default, the template uses an in-memory storage implementation that doesn't require a database connection. When you're ready to use a persistent database:

1. Create a PostgreSQL database (on Neon, Supabase, or your preferred provider)
2. Add the database connection string to your environment variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```
3. Uncomment the database connection code in `server/db.ts`
4. Run the database migration to create the required tables:
   ```bash
   npm run db:push
   ```

## Customization

### Styling

The app uses Tailwind CSS with a custom motorsport racing-inspired theme:

- **Primary Color**: Carolina/Paddock Blue (#1982FC)
- **Secondary Color**: GoTime Green (#08c519)
- **Accent Color**: GoTime Gray (#797979)
- **Background**: Dark carbon-fiber theme with blue carbon styling

You can customize the theme by editing:
- `tailwind.config.js` - for color definitions and theme settings
- `client/src/styles/index.css` - for global styles and carbon-fiber background

### Adding Features

To extend the Drive Journal functionality:

1. **New Data Models**: Update `shared/schema.ts` with new entities
2. **New API Endpoints**: Add routes in `server/routes.ts`
3. **New UI Components**: Add components in the `client/src/components` directory
4. **New Pages**: Create page components in `client/src/pages` and update routing in `client/src/App.tsx`

## Deployment

To deploy your Drive Journal app:

1. Build the project:
   ```bash
   npm run build
   ```
2. This creates production-ready files in:
   - `dist/server/` for the backend
   - `client/dist/` for the frontend

3. Start the production server:
   ```bash
   npm start
   ```

## Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `PORT`: Server port (default: 5000)
- `SESSION_SECRET`: Secret for session encryption (default: "drive-journal-dev-secret")
- `NODE_ENV`: Environment (development/production)

## Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

## License

This template is for your personal use to create a standalone Drive Journal application.

---

*Extracted from the PADDOCK20 platform - an advanced automotive lifestyle platform for enthusiasts*