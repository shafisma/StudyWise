import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, FileText, FileQuestion, Layers } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-secondary/50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <BrainCircuit className="mx-auto h-20 w-20 text-primary mb-6" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
                Welcome to StudyWise AI
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Your personal AI-powered study assistant. Generate notes, quizzes, and flashcards from any text or topic in seconds.
              </p>
              <Link href="/notes" passHref>
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Features</h2>
              <p className="text-muted-foreground mt-2">Everything you need to supercharge your studies.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <FileText className="w-8 h-8 text-primary" />
                  <CardTitle>Notes Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Paste any text and get well-structured, summarized notes instantly. Perfect for quick reviews.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <FileQuestion className="w-8 h-8 text-primary" />
                  <CardTitle>Quiz Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Test your knowledge with auto-generated multiple-choice quizzes based on your study material.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Layers className="w-8 h-8 text-primary" />
                  <CardTitle>Flashcard Creation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Create interactive flashcards to memorize key concepts, definitions, and facts with ease.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted p-6 md:py-8 w-full">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">&copy; 2024 StudyWise AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
