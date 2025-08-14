import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { LogoutDialog } from "~/components/logout-dialog";
import { auth } from "~/server/auth";
import {
  Moon,
  FileText,
  Search,
  Zap,
  Shield,
  Users,
  MessageSquare,
  Upload,
  LogIn,
  User,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Moon className="text-primary h-6 w-6" />
            <span className="text-lg font-semibold">KuruBot</span>
          </div>
          <nav className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground">Welcome,</span>
                  <span className="font-medium">{session.user.name}</span>
                </div>
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin Panel
                  </Button>
                </Link>
                <LogoutDialog />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            {session?.user ? (
              // Logged in user view
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-4">
                    Welcome back!
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    Hello,{" "}
                    <span className="text-primary">
                      {session.user.name?.split(" ")[0]}
                    </span>
                    !
                  </h1>
                  <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed">
                    Ready to explore your documents? Upload new content or start
                    a conversation with your existing knowledge base.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href="/chat">
                    <Button size="lg" className="px-8 text-lg">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Start Chatting
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 text-lg"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Manage Documents
                    </Button>
                  </Link>
                </div>

                {/* Quick Stats for logged in users */}
                <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-3">
                  <Card className="p-4">
                    <div className="space-y-2 text-center">
                      <FileText className="text-primary mx-auto h-8 w-8" />
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-muted-foreground text-sm">Documents</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="space-y-2 text-center">
                      <MessageSquare className="text-primary mx-auto h-8 w-8" />
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-muted-foreground text-sm">
                        Conversations
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="space-y-2 text-center">
                      <Search className="text-primary mx-auto h-8 w-8" />
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-muted-foreground text-sm">Queries</p>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              // Non-logged in user view
              <div className="space-y-4">
                <Badge variant="secondary" className="mb-4">
                  Powered by AI
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                  Meet
                  <span className="text-primary block">KuruBot</span>
                </h1>
                <p className="text-muted-foreground mx-auto max-w-2xl text-xl leading-relaxed">
                  Upload your documents and get instant, accurate answers.
                  KuruBot&apos;s RAG-powered system understands your content and
                  provides intelligent responses based on your data.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="px-8 text-lg">
                      <LogIn className="mr-2 h-5 w-5" />
                      Get Started
                    </Button>
                  </Link>
                  <p className="text-muted-foreground text-sm">
                    Sign in to start using KuruBot
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Powerful Features
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Everything you need for intelligent document processing and
              AI-powered conversations
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:border-primary/50 border-2 transition-colors">
              <CardHeader>
                <FileText className="text-primary mb-4 h-12 w-12" />
                <CardTitle>Document Upload</CardTitle>
                <CardDescription>
                  Support for PDF, DOCX, TXT, CSV, and Markdown files up to 20MB
                  each
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50 border-2 transition-colors">
              <CardHeader>
                <Search className="text-primary mb-4 h-12 w-12" />
                <CardTitle>Intelligent Search</CardTitle>
                <CardDescription>
                  Advanced vector search through your documents with semantic
                  understanding
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50 border-2 transition-colors">
              <CardHeader>
                <MessageSquare className="text-primary mb-4 h-12 w-12" />
                <CardTitle>AI Conversations</CardTitle>
                <CardDescription>
                  Natural language conversations powered by your uploaded
                  documents
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50 border-2 transition-colors">
              <CardHeader>
                <Zap className="text-primary mb-4 h-12 w-12" />
                <CardTitle>Fast Processing</CardTitle>
                <CardDescription>
                  Quick document indexing and real-time responses for seamless
                  interaction
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50 border-2 transition-colors">
              <CardHeader>
                <Shield className="text-primary mb-4 h-12 w-12" />
                <CardTitle>Secure Storage</CardTitle>
                <CardDescription>
                  Your documents are safely stored with enterprise-grade
                  security measures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:border-primary/50 border-2 transition-colors">
              <CardHeader>
                <Users className="text-primary mb-4 h-12 w-12" />
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>
                  Comprehensive admin panel for managing users, documents, and
                  system settings
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                How It Works
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
                Get started in three simple steps
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
              <div className="space-y-4 text-center">
                <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold">Upload Documents</h3>
                <p className="text-muted-foreground">
                  Upload your PDF, DOCX, or text files through our simple
                  drag-and-drop interface
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold">AI Processing</h3>
                <p className="text-muted-foreground">
                  Our system automatically processes and indexes your documents
                  for intelligent search
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold">Start Asking</h3>
                <p className="text-muted-foreground">
                  Ask questions about your documents and get accurate,
                  contextual answers instantly
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-2xl space-y-8">
            {session?.user ? (
              // Logged in user CTA
              <>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Keep Exploring!
                </h2>
                <p className="text-muted-foreground text-xl">
                  Your KuruBot is ready. Upload more documents or continue your
                  conversations.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Link href="/admin">
                    <Button size="lg" className="px-8 text-lg">
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Documents
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8 text-lg"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Start Chatting
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              // Non-logged in user CTA
              <>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Ready to Transform Your Documents?
                </h2>
                <p className="text-muted-foreground text-xl">
                  Join thousands of users who are already using AI to unlock
                  insights from their documents
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Link href="/login">
                    <Button size="lg" className="px-8 text-lg">
                      <LogIn className="mr-2 h-5 w-5" />
                      Get Started Now
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Moon className="text-primary h-5 w-5" />
              <span className="font-semibold">KuruBot</span>
            </div>
            <div className="text-muted-foreground flex items-center gap-6 text-sm">
              <Link
                href="/admin"
                className="hover:text-foreground transition-colors"
              >
                Admin Panel
              </Link>
              <Link
                href="/docs"
                className="hover:text-foreground transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
