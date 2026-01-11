import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  PieChart, 
  FileText, 
  User, 
  Info, 
  LogOut, 
  Menu, 
  X,
  Wallet as WalletIcon
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'ড্যাশবোর্ড', path: '/' },
    { icon: WalletIcon, label: 'ওয়ালেট', path: '/wallets' },
    { icon: PieChart, label: 'চার্ট', path: '/charts' },
    { icon: FileText, label: 'রিপোর্ট', path: '/reports' },
    { icon: Info, label: 'সম্পর্কে', path: '/about' },
    { icon: User, label: 'প্রোফাইল', path: '/profile' }, 
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {profile?.image_url ? (
              <img 
                src={profile.image_url} 
                alt={profile.name || 'User'} 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = 'flex';
                }}
              />
            ) : null}
            {!profile?.image_url && (
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground" style={{ display: 'none' }}>
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold">ক্যাশ বুক</h1>
              {profile?.name && (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {profile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="hidden lg:flex gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              লগআউট
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 sm:top-16 z-40 bg-background/95 backdrop-blur">
          <nav className="container px-4 py-4">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 text-base h-12"
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-base h-12 text-destructive hover:text-destructive"
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="w-5 h-5" />
                লগআউট
              </Button>
            </div>
          </nav>
        </div>
      )}

      <div className="flex">
        <aside className="hidden lg:block w-64 border-r bg-card/50 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                className="w-full justify-start gap-3 text-sm"
                onClick={() => navigate(item.path)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 container px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {children}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
        <div className="grid grid-cols-6 gap-1 p-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="lg:hidden h-20"></div>
    </div>
  );
}