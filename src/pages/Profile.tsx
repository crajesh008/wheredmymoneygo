import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NotificationSettings } from '@/components/NotificationSettings';
import { ArrowLeft, LogOut, User, Mail, Upload, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const Profile = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [budgetRating, setBudgetRating] = useState<any>(null);
  const [loadingRating, setLoadingRating] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUserEmail(session.user.email || '');
        fetchProfile(session.user.id);
        fetchBudgetRating();
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUserEmail(session.user.email || '');
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setDisplayName(data.display_name || '');
      setAvatarUrl(data.avatar_url || '');
    }
  };

  const fetchBudgetRating = async () => {
    setLoadingRating(true);
    try {
      const { data, error } = await supabase.functions.invoke('budget-rating');
      
      if (!error && data) {
        setBudgetRating(data);
      }
    } catch (error) {
      console.error('Error fetching budget rating:', error);
    } finally {
      setLoadingRating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max size is 2MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", variant: "destructive" });
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
    const newAvatarUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, avatar_url: newAvatarUrl });

    if (!updateError) {
      setAvatarUrl(newAvatarUrl);
      toast({ title: "Avatar updated!", description: "Your profile picture has been updated." });
    }

    setIsUploading(false);
  };

  const handleSaveName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, display_name: displayName });

    if (!error) {
      toast({ title: "Name updated!", description: "Your display name has been updated." });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "See you soon! 👋",
    });
    navigate('/auth');
  };

  const getRatingColor = (score: number) => {
    if (score >= 80) return 'hsl(160 65% 45%)';
    if (score >= 60) return 'hsl(40 95% 55%)';
    return 'hsl(0 70% 60%)';
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-mint flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-foreground" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Upload className="w-4 h-4 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
                <Button onClick={handleSaveName}>Save</Button>
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-foreground">{userEmail}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Budget Rating Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Budget Analysis
            </h3>
            <Button 
              onClick={fetchBudgetRating} 
              size="sm"
              disabled={loadingRating}
            >
              {loadingRating ? 'Analyzing...' : 'Refresh'}
            </Button>
          </div>

          {budgetRating ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Budget Adherence Score</span>
                  <span className="text-2xl font-bold" style={{ color: getRatingColor(budgetRating.score) }}>
                    {budgetRating.score}%
                  </span>
                </div>
                <Progress value={budgetRating.score} className="h-2" />
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">{budgetRating.rating}</p>
              </div>

              {budgetRating.totalSpent !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent: ${budgetRating.totalSpent.toFixed(2)}</span>
                  <span className="text-muted-foreground">Budget: ${budgetRating.monthlyBudget.toFixed(2)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {loadingRating ? 'Analyzing your budget...' : 'Click refresh to get your AI budget analysis'}
            </p>
          )}
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
