# Mockify-AI

A professional AI interview practice platform built with Next.js 16 (App Router), Tailwind CSS, and Framer Motion.

## Features
- **Frontend-Only Architecture**: Runs entirely on the client side using `localStorage` and `URL.createObjectURL`.
- **Dynamic Question Generator**: A library of 70+ technical questions across JavaScript, React, System Design, and more.
- **Resume-Tailored Path**: Upload your resume to unlock specialized role confirmations and skill analysis.
- **Dual Mode Practice**: 
  - **Text Mode**: Traditional Q&A with real-time word counting and auto-save.
  - **Voice Mode**: Siri-styled interface using the Web Speech API for real-time transcription and conversational practice.
- **Intelligent Scoring**: Keyword-matching algorithm that computes your technical depth per answer.
- **Premium UI**: Stripe-inspired minimalist white theme with glassmorphic elements and professional typography.
- **Butter-Smooth Animations**: Global page transitions and micro-interactions powered by Framer Motion.

## Tech Stack
- **Framework**: Next.js 16 (App Router, JavaScript)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **File Handling**: React Dropzone
- **Persistence**: LocalStorage

## Future Scalability (Roadmap)
While this version is a full frontend demo, it is designed for seamless backend integration:
1. **API Integration**: Swap `lib/storage.js` with calls to a backend service like Supabase or a Node.js API.
2. **AI Integration**: Replace the keyword-matching scorer in `app/result/page.js` with an LLM-based evaluator (e.g., GPT-4 or Gemini) via Server Actions.
3. **Database Persistence**: Store user histories and detailed feedback in a real database.
4. **Auth**: Add Clerk or NextAuth for personalized user accounts.

## Running Locally
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.
