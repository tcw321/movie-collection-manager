# Movie Collection Manager

## Project Overview
A web application to catalog and manage my personal movie collection. Built as a learning project to explore Vite, React, TypeScript, Tailwind CSS, and AWS S3 deployment.

## Goals
- Get a working application quickly
- Learn modern web development stack
- Deploy to AWS S3 static hosting
- Keep it simple and maintainable

## Core Features (MVP)

### Movie Management
- Add new movies with details:
  - Title (required)
  - Year
  - Genre
  - Personal rating (1-5 stars or 1-10)
  - Watched status (yes/no)
  - Notes/comments
- View all movies in a list or grid view
- Edit movie details
- Delete movies

### Search & Filter
- Search movies by title
- Filter by:
  - Genre
  - Watched/unwatched status
  - Rating
- Sort by title, year, or rating

### Data Persistence
- Store data in browser localStorage initially
- Export/import capability (JSON file) for backup

## Technical Stack

### Frontend
- **Vite** - Build tool
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library for professional UI

### Testing
- **Vitest** - Unit/component testing (add after core features work)
- Focus on testing critical paths:
  - Add/edit/delete operations
  - Search and filter logic
  - Data validation

### Deployment
- Build static site with `npm run build`
- Deploy to AWS S3 bucket with static website hosting enabled
- Manual upload initially (can automate later)

## Design Requirements
- Modern, clean, professional appearance
- Card-based layout for movie displays
- Responsive design (desktop and mobile)
- Color scheme: [TBD - will prototype in Claude.ai first]
- Clear visual hierarchy and generous whi