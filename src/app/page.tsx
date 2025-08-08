import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { auth, signIn, signOut } from "~/server/auth";
import { 
  Bot, 
  FileText, 
  Search, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Database,
  MessageSquare,
  Upload,
  LogIn,
  LogOut,
  User
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">RAG Assistant</span>
          </div>
          <nav className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Welcome,</span>
                  <span className="font-medium">{session.user.name}</span>
                </div>
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin Panel
                  </Button>
                </Link>
                <form action={async () => {
                  "use server";
                  await signOut();
                }}>
                  <Button variant="ghost" size="sm" type="submit">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <form action={async () => {
                  "use server";
                  await signIn("discord");
                }}>
                  <Button size="sm" type="submit">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </form>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {session?.user ? (
              // Logged in user view
              <div className="space-y-6">
                <div className="space-y-4">
                  <Badge variant="secondary" className="mb-4">
                    Welcome back!
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Hello, <span className="text-primary">{session.user.name?.split(' ')[0]}</span>!
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Ready to explore your documents? Upload new content or start a conversation 
                    with your existing knowledge base.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/chat">
                    <Button size="lg" className="text-lg px-8">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Start Chatting
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button variant="outline" size="lg" className="text-lg px-8">
                      <Upload className="mr-2 h-5 w-5" />
                      Manage Documents
                    </Button>
                  </Link>
                </div>

                {/* Quick Stats for logged in users */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <FileText className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-sm text-muted-foreground">Documents</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <MessageSquare className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-sm text-muted-foreground">Conversations</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center space-y-2">
                      <Search className="h-8 w-8 text-primary mx-auto" />
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-sm text-muted-foreground">Queries</p>
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
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Intelligent Document 
                  <span className="text-primary block">Assistant</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Upload your documents and get instant, accurate answers. Our RAG-powered system 
                  understands your content and provides intelligent responses based on your data.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <form action={async () => {
                    "use server";
                    await signIn("discord");
                  }}>
                    <Button size="lg" className="text-lg px-8" type="submit">
                      <LogIn className="mr-2 h-5 w-5" />
                      Get Started
                    </Button>
                  </form>
                  <p className="text-sm text-muted-foreground">
                    Sign in with Discord to start using RAG Assistant
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for intelligent document processing and AI-powered conversations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Document Upload</CardTitle>
                <CardDescription>
                  Support for PDF, DOCX, TXT, CSV, and Markdown files up to 20MB each
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Search className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Intelligent Search</CardTitle>
                <CardDescription>
                  Advanced vector search through your documents with semantic understanding
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <CardTitle>AI Conversations</CardTitle>
                <CardDescription>
                  Natural language conversations powered by your uploaded documents
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Fast Processing</CardTitle>
                <CardDescription>
                  Quick document indexing and real-time responses for seamless interaction
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure Storage</CardTitle>
                <CardDescription>
                  Your documents are safely stored with enterprise-grade security measures
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>
                  Comprehensive admin panel for managing users, documents, and system settings
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-semibold">Upload Documents</h3>
                <p className="text-muted-foreground">
                  Upload your PDF, DOCX, or text files through our simple drag-and-drop interface
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-semibold">AI Processing</h3>
                <p className="text-muted-foreground">
                  Our system automatically processes and indexes your documents for intelligent search
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-semibold">Start Asking</h3>
                <p className="text-muted-foreground">
                  Ask questions about your documents and get accurate, contextual answers instantly
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            {session?.user ? (
              // Logged in user CTA
              <>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Keep Exploring!
                </h2>
                <p className="text-xl text-muted-foreground">
                  Your RAG Assistant is ready. Upload more documents or continue your conversations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/admin">
                    <Button size="lg" className="text-lg px-8">
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Documents
                    </Button>
                  </Link>
                  <Link href="/chat">
                    <Button variant="outline" size="lg" className="text-lg px-8">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Start Chatting
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              // Non-logged in user CTA
              <>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Transform Your Documents?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Join thousands of users who are already using AI to unlock insights from their documents
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <form action={async () => {
                    "use server";
                    await signIn("discord");
                  }}>
                    <Button size="lg" className="text-lg px-8" type="submit">
                      <LogIn className="mr-2 h-5 w-5" />
                      Get Started Now
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold">RAG Assistant</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/admin" className="hover:text-foreground transition-colors">
                Admin Panel
              </Link>
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
