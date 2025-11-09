import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { NotificationSettings } from '@/components/NotificationSettings';
import { ArrowLeft, LogOut, User, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUserEmail(session.user.email || '');
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUserEmail(session.user.email || '');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "See you soon! 👋",
    });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* User Info Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-mint flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Account</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <p className="text-sm">{userEmail}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Notifications</h3>
          <NotificationSettings />
        </Card>

        {/* Actions Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Actions</h3>
          <div className="space-y-3">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
