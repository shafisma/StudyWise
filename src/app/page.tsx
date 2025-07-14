import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, FileText, FileQuestion, Layers, MessageCircleQuestion, PictureInPicture } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-br from-background to-secondary">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <BrainCircuit className="mx-auto h-20 w-20 text-primary mb-6" />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
                StudyWiseAI
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Welcome to StudyWise AI, your personal AI-powered study assistant. Transform any text or topic into clear notes, interactive quizzes, and effective flashcards in seconds.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/notes" passHref>
                  <Button size="lg">
                    Get Started
                  </Button>
                </Link>
                 <Link href="/eli5" passHref>
                  <Button size="lg" variant="outline">
                    Explain a Topic
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Everything You Need to Study Effectively</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Our suite of AI tools is designed to help you learn faster, retain more, and understand complex subjects with ease.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
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
              <Card className="hover:shadow-lg transition-shadow">
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
              <Card className="hover:shadow-lg transition-shadow">
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
               <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <MessageCircleQuestion className="w-8 h-8 text-primary" />
                  <CardTitle>Explain Like I'm 5</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Struggling with a tough concept? Get a super simple explanation for any topic.
                  </p>
                </CardContent>
              </Card>
                <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <PictureInPicture className="w-8 h-8 text-primary" />
                  <CardTitle>AI Image Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Generate a unique cover image for your study materials when you create them from a topic.
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
