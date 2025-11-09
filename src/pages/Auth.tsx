import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // Handle specific error cases with user-friendly messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email address before logging in.');
          } else {
            throw error;
          }
        }

        if (data.session) {
          toast({ title: "Welcome back! 💚", description: "Logged in successfully" });
          navigate('/');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) {
          // Handle signup-specific errors
          if (error.message.includes('already registered')) {
            throw new Error('This email is already registered. Try logging in instead.');
          } else if (error.message.includes('Password should be')) {
            throw new Error('Password must be at least 6 characters long.');
          } else {
            throw error;
          }
        }

        if (data.user) {
          setShowInstructions(true);
          toast({ 
            title: "Account created! 🎉", 
            description: "You can now log in and start tracking your expenses"
          });
          setTimeout(() => navigate('/'), 3000);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: isLogin ? "Login Failed" : "Sign Up Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 rounded-xl bg-gradient-mint w-fit mb-4">
              <Wallet className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome! 🌱</CardTitle>
            <CardDescription className="text-lg mt-4">
              Recommended to use every day for best results
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Tracking your spending daily helps you understand your habits better and make mindful decisions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 rounded-xl bg-gradient-mint w-fit mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Where'd My Money Go?</CardTitle>
          <CardDescription>
            {isLogin ? "Welcome back! Log in to continue" : "Create an account to start tracking"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Log In" : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
