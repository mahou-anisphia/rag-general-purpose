import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { auth, signIn } from "~/server/auth";
import { Moon, ArrowLeft } from "lucide-react";
import { SiDiscord } from "@react-icons/all-files/si/SiDiscord";
import { SiGoogle } from "@react-icons/all-files/si/SiGoogle";
import { SiGithub } from "@react-icons/all-files/si/SiGithub";
import { SiMicrosoft } from "@react-icons/all-files/si/SiMicrosoft";

export default async function LoginPage() {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="from-background via-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to home link */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        {/* Logo and title */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Moon className="text-primary h-8 w-8" />
              <span className="text-2xl font-bold">KuruBot</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            Sign in to access your documents and AI conversations
          </p>
        </div>

        {/* Login card */}
        <Card className="border-2">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discord Login */}
            <form
              action={async () => {
                "use server";
                await signIn("discord");
              }}
              className="w-full"
            >
              <Button
                type="submit"
                variant="outline"
                className="flex h-12 w-full items-center gap-3 text-base font-medium transition-all hover:border-[#5865F2] hover:bg-[#5865F2] hover:text-white"
              >
                <SiDiscord className="h-5 w-5" />
                Continue with Discord
              </Button>
            </form>

            {/* Placeholder for future SSO providers */}
            <div className="space-y-3">
              {/* Google - disabled for now */}
              <Button
                variant="outline"
                className="flex h-12 w-full cursor-not-allowed items-center gap-3 text-base font-medium opacity-50"
                disabled
              >
                <SiGoogle className="h-5 w-5" />
                Continue with Google
                <span className="text-muted-foreground ml-auto text-xs">
                  Coming Soon
                </span>
              </Button>

              {/* GitHub - disabled for now */}
              <Button
                variant="outline"
                className="flex h-12 w-full cursor-not-allowed items-center gap-3 text-base font-medium opacity-50"
                disabled
              >
                <SiGithub className="h-5 w-5" />
                Continue with GitHub
                <span className="text-muted-foreground ml-auto text-xs">
                  Coming Soon
                </span>
              </Button>

              {/* Microsoft - disabled for now */}
              <Button
                variant="outline"
                className="flex h-12 w-full cursor-not-allowed items-center gap-3 text-base font-medium opacity-50"
                disabled
              >
                <SiMicrosoft className="h-5 w-5" />
                Continue with Microsoft
                <span className="text-muted-foreground ml-auto text-xs">
                  Coming Soon
                </span>
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  Secure Authentication
                </span>
              </div>
            </div>

            <div className="text-muted-foreground text-center text-sm">
              <p>
                By signing in, you agree to our{" "}
                <Link href="/terms" className="hover:text-foreground underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="hover:text-foreground underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
