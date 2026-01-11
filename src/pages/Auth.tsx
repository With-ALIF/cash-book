import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "লগইন ব্যর্থ",
            description: error.message === 'Invalid login credentials' 
              ? "ইমেইল অথবা পাসওয়ার্ড ভুল" 
              : error.message,
            variant: "destructive",
          });
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "রেজিস্ট্রেশন ব্যর্থ",
            description: error.message.includes('already registered')
              ? "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে"
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "সফল!",
            description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে। অ্যাকাউন্ট ভেরিফাই করার জন্য ইমেইল চেক করুন।",
          });
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-lg mb-4 overflow-hidden">
            <img 
              src="https://github.com/With-ALIF/cash-book/blob/main/picture/logo.png?raw=true" 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground">ক্যাশ বুক</h1>
          <p className="text-muted-foreground mt-2">আপনার খরচ সহজেই ট্র্যাক করুন</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isLogin ? 'লগইন করুন' : 'নতুন অ্যাকাউন্ট'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' 
                : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  ইমেইল
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  পাসওয়ার্ড
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'লগইন' : 'রেজিস্টার'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin 
                  ? 'অ্যাকাউন্ট নেই? রেজিস্টার করুন' 
                  : 'অ্যাকাউন্ট আছে? লগইন করুন'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}