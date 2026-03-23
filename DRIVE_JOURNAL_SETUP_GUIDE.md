# Drive Journal Setup Guide

This guide will walk you through setting up a standalone Drive Journal app step by step.

## Step 1: Create a New Project

1. Go to [Replit](https://replit.com)
2. Click "Create" or "+ New repl"
3. Select "Node.js" template
4. Name it "DriveJournal" (or your preferred name)
5. Click "Create Repl"

## Step 2: Set Up Project Structure

In the Shell of your new project, run these commands to create the folder structure:

```bash
mkdir -p client/src/{components,pages,styles} server shared
```

## Step 3: Create Configuration Files

### Root Directory Files

Create the following files in the root directory:

#### package.json
```json
{
  "name": "drive-journal",
  "version": "1.0.0",
  "description": "A standalone Drive Journal application for automotive enthusiasts",
  "main": "server/index.ts",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "start": "NODE_ENV=production node dist/server/index.js",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.17.19",
    "axios": "^1.6.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "connect-pg-simple": "^9.0.1",
    "cors": "^2.8.5",
    "date-fns": "^3.3.0",
    "dotenv": "^16.4.1",
    "drizzle-orm": "^0.29.3",
    "drizzle-zod": "^0.5.1",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "lucide-react": "^0.312.0",
    "memorystore": "^1.6.7",
    "pg": "^8.11.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^2.12.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/node": "^20.11.5",
    "@types/pg": "^8.10.9",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "drizzle-kit": "^0.20.13",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["client/src/*"],
      "@assets/*": ["client/src/assets/*"],
      "@components/*": ["client/src/components/*"],
      "@hooks/*": ["client/src/hooks/*"],
      "@pages/*": ["client/src/pages/*"],
      "@styles/*": ["client/src/styles/*"],
      "@shared/*": ["shared/*"]
    }
  },
  "include": ["client/src", "shared"],
  "references": [{ "path": "./tsconfig.server.json" }]
}
```

#### tsconfig.server.json
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "outDir": "dist",
    "isolatedModules": false,
    "noEmit": false,
    "skipLibCheck": true
  },
  "include": ["server", "shared"]
}
```

#### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'paddock-blue': '#1982FC',
        'go-time-green': '#08c519',
        'go-time-gray': '#797979',
        border: "hsl(214.3 31.8% 91.4%)",
        input: "hsl(214.3 31.8% 91.4%)",
        ring: "hsl(222.2 84% 4.9%)",
        background: "hsl(0 0% 0%)",
        foreground: "hsl(210 40% 98%)",
        primary: {
          DEFAULT: "hsl(222.2 47.4% 11.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        destructive: {
          DEFAULT: "hsl(0 100% 50%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        accent: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 0%)",
          foreground: "hsl(210 40% 98%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 0%)",
          foreground: "hsl(210 40% 98%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### drizzle.config.ts
```typescript
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Using default SQLite database.");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "",
  },
});
```

#### .env.example
```
# Database Connection
# Uncomment and provide a valid PostgreSQL connection string to use a persistent database
# DATABASE_URL=postgresql://username:password@host:port/database

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
# Change this to a strong random string in production
SESSION_SECRET=drive-journal-dev-secret

# Optional API Keys for Weather Data (if implementing weather API)
# OPENWEATHER_API_KEY=your_api_key_here
```

## Step 4: Client Files

### client/package.json
```json
{
  "name": "drive-journal-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### client/vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

### client/src/styles/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Paddock20 Brand Colors */
  --paddock-blue: #1982FC;
  --go-time-green: #08c519;
  --go-time-gray: #797979;
}

body {
  font-family: 'Inter', sans-serif;
  @apply bg-black text-white;
}

/* Carbon fiber background */
.bg-carbon-fiber {
  background-color: #111111;
  background-image: 
    linear-gradient(45deg, rgba(25, 130, 252, 0.15) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(25, 130, 252, 0.15) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(25, 130, 252, 0.15) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(25, 130, 252, 0.15) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.font-orbitron {
  font-family: 'Orbitron', sans-serif;
}

/* Racing inspired styling */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-sm uppercase tracking-wider transition-colors;
}

.btn-secondary {
  @apply bg-green-700 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-sm uppercase tracking-wider transition-colors;
}

.btn-danger {
  @apply bg-red-700 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-sm uppercase tracking-wider transition-colors;
}

.panel {
  @apply bg-gray-900 bg-opacity-80 rounded-lg border border-blue-900/50 p-4;
}

.panel-header {
  @apply text-blue-400 font-orbitron text-lg uppercase mb-4 pb-2 border-b border-blue-900/50;
}

/* Animations */
.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

### client/src/App.tsx
```typescript
import React from 'react';
import { Route, Router, Switch } from 'wouter';
import DriveJournalPage from './pages/drive-journal-page';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black bg-carbon-fiber text-white">
        <Switch>
          <Route path="/" component={DriveJournalPage} />
          <Route path="/drive-journal/new">
            {() => <DriveJournalPage />}
          </Route>
          <Route>
            {() => (
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-blue-400 mb-4">404 - Not Found</h1>
                  <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                    Return to Drive Journal
                  </a>
                </div>
              </div>
            )}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
```

## Step 5: Server Files

(Add the detailed server files in the next section - the message was getting too long)

## Step 6: Install Dependencies and Run

Run these commands to install dependencies and start your app:

```bash
npm install
npm run dev
```

Your Drive Journal app should now be running!

## Next Steps

- Set up a persistent database by configuring DATABASE_URL in a .env file
- Add authentication for user management
- Extend the app with additional features like route planning, telemetry recording, etc.

---

*Note: The component files (PageHeader, MoodEnergyTracker, etc.) and server files will be provided in subsequent messages due to length constraints.*