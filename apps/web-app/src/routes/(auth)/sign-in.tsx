import { createFileRoute, Navigate, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { Logo } from '@/components/layout/logo';
import { SigninForm } from '@/components/auth/signin-form';

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
});

function SignIn() {
  const session = useSession();

  if (session.data) {
    return <Navigate to="/todos" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Home Button */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Logo width={220} height={220} className="mx-auto" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your todo dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SigninForm />
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}