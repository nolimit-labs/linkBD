import { createFileRoute, Navigate, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { Logo } from '@/components/layout/logo';
import { SigninForm } from '@/components/auth/signin-form';

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignIn,
});

function SignIn() {
  const { data: session } = useSession();

  if (session) {
    if (session.user.role === 'admin') {
      return <Navigate to="/users" />
    } else {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <h1 className="text-2xl font-bold"> You must be an admin to access this page </h1>
        </div>
      )
    }
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
            <div className="flex flex-col items-center justify-center mb-2">
              <Logo className="mx-auto" textSize='text-5xl'/>
              <Badge className="px-4 py-1 rounded-full mt-4 bg-primary text-primary-foreground text-lg">
                Admin Panel
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SigninForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}