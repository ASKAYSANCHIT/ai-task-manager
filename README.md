# AI Task Manager 🤖

🚀 Live Demo: (https://ai-task-manager-beryl-delta.vercel.app/)

💻 GitHub Repository: https://github.com/ASKAYSANCHIT/ai-task-manager

AI-powered task management application using Next.js, Groq LLM, Supabase, TypeScript and natural language task parsing.

## What it does

- Type tasks naturally like "Call client before Friday, high priority"
- AI automatically extracts title, priority, and due date
- Tasks are saved and synced with Supabase
- Filter by priority, sort by date, mark as done

## Tech Stack

- **Frontend** — Next.js 14, TypeScript
- **AI** — Groq API (Llama 3.3 70b) for natural language parsing
- **Database** — Supabase (PostgreSQL)
- **Deployment** — Vercel

## Run Locally

```bash
git clone https://github.com/yourusername/ai-task-manager
cd ai-task-manager
npm install
```

Add your keys to `.env.local`:
```
GROQ_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

```bash
npm run dev
```

Open http://localhost:3000
