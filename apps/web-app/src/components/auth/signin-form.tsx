import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';
import { GoogleIcon } from '@/lib/icons';
import { signIn } from '@/lib/auth-client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { env } from '@/lib/env';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SigninFormData = z.infer<typeof signinSchema>;

export function SigninForm() {
  const [isLoading, setIsLoading] = useState(false);
  
  const allowEmailAndPassword = env.isStaging || env.isDevelopment


  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });


  const onSubmit = async (data: SigninFormData) => {
    try {
      setIsLoading(true);
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/feed',
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {

    const result = await signIn.social({
      provider: 'google',
      callbackURL: '/feed',
    });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }
  };

  return (
    <div className="space-y-4">
      {allowEmailAndPassword && (
        <>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  {...form.register('password')}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-muted-foreground">Or sign in with</span>
            </div>
          </div>
        </>
      )}

      <Button type="button" variant="outline" className="w-full" disabled={isLoading} onClick={handleSignInWithGoogle}>
        <GoogleIcon className="mr-2 h-4 w-4" />
        {isLoading ? 'Signing in with Google...' : 'Sign In with Google'}
      </Button>
    </div>
  );
}