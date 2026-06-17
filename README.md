# Mockify-AI 🚀

A premium AI-powered interview preparation platform built with **Next.js 16 (App Router)**, **Tailwind CSS**, and **Framer Motion**. Mockify-AI leverages Groq LLMs for real-time resume analysis and features **Nova AI**, a high-fidelity bilingual voice interviewing experience.

## ✨ Core Features

- **Brain-Powered Resume Analysis**: Integrated with **Groq** (Llama 3.3) to provide deterministic role confirmation and skill extraction from any uploaded PDF.
- **Nova AI Voice Mode**: A premium, Siri-styled bilingual interface (Hinglish/English) with real-time speech recognition and synthesis.
- **Secure Text Interview**: Robust text-based practice with HTML sanitization, 5-word minimum quality gates, and auto-saving.
- **Cloud Persistence**: Reliable resume and session management powered by **Cloudinary** and **Supabase**.
- **Automated Cleanup**: Secure session termination that automatically purges your data from the cloud after practice.
- **Responsive Design**: Fully optimized for mobile and desktop with a focus on reachability and safe-area handling.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI Engine**: Groq (Llama 3.3 70B)
- **Database**: Supabase (PostgreSQL)
- **Cloud Storage**: Cloudinary (Resume Hosting)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- A Supabase project
- A Groq API Key
- A Cloudinary account

### 2. Environment Setup
Create a `.env.local` file in the root directory (copy from `.env.example`):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Groq
GROQ_API_KEY=your_groq_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
```

### 3. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start your session.

## 🏁 Deployment Checklist

1. **Database Schema**: Initialize your Supabase database using the schema provided in `/sql/mockify_schema.sql`.
2. **Environment Variables**: Add all keys from your `.env.local` to your hosting provider's dashboard (e.g., Vercel Project Settings).
3. **Build Command**:
   ```bash
   npm run build
   ```
4. **Production Start**:
   ```bash
   npm run start
   ```

---
Built with ❤️ for better career opportunities.
