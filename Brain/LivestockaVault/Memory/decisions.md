# Key Decisions

- **Tech Stack**: Single-page Nuxt 3 application using Vue 3, TypeScript, and Tailwind CSS for the frontend; Supabase (PostgreSQL, Auth, Storage) as the backend.
- **Architecture**: Frontend and backend are decoupled; authentication is handled by Supabase Auth; data access is protected by Row‑Level Security.
- **Deployment**: Vercel hosts the Nuxt app; Supabase hosts the database.
- **Security Model**: All tables enforce RLS to ensure users can only view or modify their own farm data.
- **Feature Prioritization**: Core features (auth, cow CRUD, health records, reproduction workflow, milk logging, responsive UI) are complete. Remaining polish work, accessibility audit, PWA support, data export/import, multi‑user RBAC, AI assistance, and other advanced features are in backlog.
- **AI Integration**: AI may be leveraged for code suggestions, documentation generation, defect prediction, and possibly for user-facing assistance. The exact scope will be decided after reviewing user needs and compliance.
