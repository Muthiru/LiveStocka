# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Introduction
This is a codebase for LiveStocka - Cattle Management System.

## Getting Started
To get started with this project, follow these steps:
1. Clone the repository
2. Install the dependencies
3. Run the application

## Commonly Used Commands
* `git status`: Check the status of the repository
* `git add .`: Stage all changes
* `git commit -m "commit message"`: Commit changes with a meaningful message
* `git push`: Push changes to the remote repository
* `npm run build`: Build the application
* `npm run lint`: Run linting checks
* `npm run test`: Run all tests
* `npm run test:unit`: Run unit tests
* `npm run test:integration`: Run integration tests

## Code Architecture
The codebase is organized into the following directories:
* `src`: Source code for the application
* `tests`: Unit tests and integration tests
* `docs`: Documentation for the application

## Important Information
* The application uses Nuxt 3, Vue 3, TypeScript, and Tailwind CSS for the frontend, and Supabase (PostgreSQL, Auth, Storage) for the backend.
* The database schema is defined in `packages/database/`.
* The API endpoints are documented in `docs/TODO.md`.
* The project uses Row Level Security (RLS) to ensure users can only access their own farm data.
* The application is deployed to Vercel and Supabase.
* The project is licensed under the MIT License.
* For detailed setup and development guides, see the documentation files listed above.
* Project Status: 70% Complete (Active Development)
* Last Updated: February 9, 2026