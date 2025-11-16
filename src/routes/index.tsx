import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  BookmarkIcon,
  TagIcon,
  FolderIcon,
  GithubIcon,
  ShieldCheckIcon,
  ZapIcon,
  LogInIcon,
  UserPlusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pb } from "@/lib/pocketbase";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: () => {
    if (pb.authStore.isValid) {
      throw redirect({ to: "/add" });
    }
  },
});

function RouteComponent() {
  const isLoggedIn = pb.authStore.isValid;

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="font-bold text-xl">URL Vault</div>
            <div className="flex gap-3">
              {isLoggedIn ? (
                <Button asChild>
                  <Link to="/bookmarks">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/signin">
                      <LogInIcon className="h-4 w-4 mr-2" />
                      Log In
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signin">
                      <UserPlusIcon className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <ShieldCheckIcon className="h-4 w-4" />
            <span>100% Free & Open Source</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">URL Vault</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your personal bookmark manager for storing and organizing internet bookmarks with ease
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="gap-2">
              <a href="https://github.com/lsherman98/url-vault" target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-5 w-5" />
                View on GitHub
              </a>
            </Button>
            {isLoggedIn ? (
              <Button asChild size="lg" variant="outline">
                <Link to="/bookmarks">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline">
                <Link to="/signin">
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Sign Up
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Organization Features</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to keep your bookmarks organized and accessible
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FolderIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Organize bookmarks into intuitive categories for quick access</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TagIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add multiple tags to bookmarks for flexible filtering and searching</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BookmarkIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Groups</CardTitle>
              <CardDescription>Create custom groups to bundle related bookmarks together</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Why URL Vault?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheckIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Self-Hosted & Private</h3>
                  <p className="text-muted-foreground">
                    Your bookmarks stay on your server. Complete control over your data with no third-party access.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ZapIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Fast & Lightweight</h3>
                  <p className="text-muted-foreground">
                    Built with modern technologies for a snappy, responsive experience on any device.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <GithubIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">100% Free & Open Source</h3>
                  <p className="text-muted-foreground">
                    Free forever with no subscription fees. Contribute, fork, or customize to fit your needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6 bg-primary/5 rounded-2xl p-12 border-2 border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground">
            Download URL Vault from GitHub and self-host it on your own server in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild size="lg" className="gap-2">
              <a href="https://github.com/lsherman98/url-vault" target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-5 w-5" />
                View on GitHub
              </a>
            </Button>
            {isLoggedIn ? (
              <Button asChild size="lg" variant="secondary">
                <Link to="/bookmarks">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="secondary">
                <Link to="/signin">
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Sign Up
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} URL Vault. Open source and free forever.
            </p>
            <div className="flex gap-6">
              <a
                href="https://github.com/lsherman98/url-vault"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
