# StudyWise AI

**StudyWise AI** is your personal AI-powered study assistant. Transform any text, topic, or video into comprehensive study materials instantly.

![StudyWise AI Banner](src/app/ico.svg)

## 🚀 Features

StudyWise AI offers a suite of tools designed to help you learn faster and retain more information:

- **📝 Smart Notes**: Generate structured, comprehensive notes from text, PDFs, or YouTube videos.
- **🗂️ AI Flashcards**: Automatically create flashcards to test your knowledge and improve retention.
- **🧠 Quiz Generator**: Generate multiple-choice quizzes with adjustable difficulty levels.
- **👶 ELI5 (Explain Like I'm 5)**: Simplify complex concepts into easy-to-understand explanations.
- **🗺️ Concept Maps**: Visualize relationships between topics with interactive concept maps.
- **🎓 Exam Prep**: Simulate full exams to assess your readiness for upcoming tests.
- **📊 Progress Tracking**: Track your study streaks, quiz scores, and learning milestones.
- **🏆 Gamification**: Earn badges and achievements as you master new subjects.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **AI Engine**: [Genkit](https://firebase.google.com/docs/genkit) (Google AI SDK)
- **State Management**: React Hooks
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

Follow these steps to set up the project locally:

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/studywise-ai.git
   cd studywise-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add the following variables:
   
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   GOOGLE_GENAI_API_KEY=your_google_ai_key
   unsplash_access_key=your_unsplash_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤖 AI Flows

The application uses Genkit for AI operations. The flows are defined in `src/ai/flows/`:

- `generate-notes.ts`: Structured note generation
- `generate-quiz.ts`: MCQ generation
- `generate-flashcards.ts`: Q&A flashcard pairs
- `eli5.ts`: Simplified explanations

To run the Genkit developer UI:

```bash
npm run genkit:dev
```

## 📱 Mobile Support

StudyWise AI is fully responsive and optimized for mobile devices, featuring a touch-friendly navigation drawer and adaptive layouts.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
