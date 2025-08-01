import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, Mail, Lock } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SigninFormData = z.infer<typeof signinSchema>;

export function SigninForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGuestLogin = async () => {
    try {
      setIsLoading(true);
      const result = await signIn.anonymous();
      
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      
      navigate({ to: '/todos' });
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SigninFormData) => {
    try {
      setIsLoading(true);
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/todos',
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

  return (
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
      
      <Button 
        type="button"
        variant="outline" 
        onClick={handleGuestLogin}
        className="w-full"
        disabled={isLoading}
      >
        <UserCheck className="h-4 w-4 mr-2" />
        {isLoading ? 'Signing in...' : 'Continue as Guest'}
      </Button>
    </form>
  );
}