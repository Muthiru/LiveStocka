# LiveStocka - Cattle Management System

A comprehensive cattle tracking solution for farmers and ranchers with advanced breeding, health, and milk production management.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- Supabase account (free tier available)

### 2. Setup
```bash
# Install dependencies
cd apps/web && npm install

# Configure environment
cp .env.example .env
# Add your Supabase URL and anon key to .env

# Run development server
npm run dev
```

### 3. Database Setup
See [DATABASE.md](DATABASE.md) for complete database setup instructions.

---

## 📁 Project Structure

```
LiveStocka/
├── apps/
│   ├── web/              # Nuxt 3 web application
│   └── mobile/           # Capacitor mobile app (future)
├── packages/
│   ├── database/         # SQL migrations and schemas
│   └── shared/           # Shared types and utilities
├── supabase/
│   └── functions/        # Edge functions
└── docs/                 # Additional documentation
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[REQUIREMENTS.md](REQUIREMENTS.md)** - Feature specifications
- **[DATABASE.md](DATABASE.md)** - Database setup and maintenance
- **[heat-breeding-genetics-fullstack-agent-guide.md](heat-breeding-genetics-fullstack-agent-guide.md)** - Development guide
- **[TODO.md](TODO.md)** - Feature roadmap and progress

---

## ✨ Features

### Core Features (Completed)
- ✅ User authentication (email/password + OAuth)
- ✅ Cow profiling and management
- ✅ Health records tracking
- ✅ Dashboard with real-time statistics
- ✅ TypeScript migration (100% type-safe)

### Advanced Features (In Progress)
- 🔧 Milk production tracking
- 🔧 Heat detection and breeding management
- 🔧 Pregnancy tracking
- 🔧 Genetic lineage tracking
- 🔧 Automated breeding alerts

### Planned Features
- 📋 Reports and analytics
- 📋 Photo uploads
- 📋 CSV import/export
- 📋 Mobile app
- 📋 Multi-user support

---

## 🛠️ Tech Stack

- **Frontend:** Nuxt 3, Vue 3, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Mobile:** Capacitor (planned)
- **Deployment:** Vercel (web), Supabase (database)

---

## 🔒 Security

All database tables use Row Level Security (RLS) to ensure users can only access their own farm data. See [DATABASE.md](DATABASE.md) for security configuration details.

---

## 📦 Deployment

### Web Application
Deploy to Vercel:
1. Connect your GitHub repository
2. Set environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
3. Deploy from `apps/web` directory

### Database
Use Supabase (free tier):
1. Create project at [supabase.com](https://supabase.com)
2. Run migrations from `packages/database/`
3. Configure RLS policies (see [DATABASE.md](DATABASE.md))

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For detailed setup and development guides, see the documentation files listed above.

**Project Status:** 70% Complete (Active Development)
**Last Updated:** February 9, 2026