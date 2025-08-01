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
import { SignupForm } from '@/components/auth/signup-form';

export const Route = createFileRoute('/(auth)/sign-up')({
  component: SignUp,
});

function SignUp() {
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
              <Logo className="mx-auto" />
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Join TodoApp and start organizing your tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}