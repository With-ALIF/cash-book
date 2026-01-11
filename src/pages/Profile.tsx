import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Image, Download } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { profile, updateProfile, updatePassword, isUpdatingProfile, isUpdatingPassword } = useProfile();
  
  const [name, setName] = useState(profile?.name || '');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(profile?.image_url || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setImagePreview(profile.image_url || '');
    }
  }, [profile]);

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    if (url.trim()) {
      setImagePreview(url.trim());
    } else if (profile?.image_url) {
      setImagePreview(profile.image_url);
    } else {
      setImagePreview('');
    }
  };

  const handleUpdateImage = async () => {
    if (imageUrl.trim()) {
      await updateProfile({ image_url: imageUrl.trim() });
      setImageUrl('');
    }
  };

  const handleUpdateName = async () => {
    if (name.trim()) {
      await updateProfile({ name: name.trim() });
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    
    if (newPassword.length < 6) {
      setPasswordError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('পাসওয়ার্ড মিলছে না');
      return;
    }
    
    await updatePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    const parent = target.parentElement;
    target.style.display = 'none';
    if (parent) {
      const fallback = parent.querySelector('.fallback-icon');
      if (fallback) {
        (fallback as HTMLElement).style.display = 'flex';
      }
    }
  };

  const handleDownloadData = () => {
    const accountData = {
      user: {
        id: user?.id,
        email: user?.email,
      },
      profile: {
        name: profile?.name,
        image_url: profile?.image_url,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
      },
      exported_at: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(accountData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `account-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">প্রোফাইল</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                প্রোফাইল তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-3 pb-4 border-b">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border relative">
                  {imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      <User className="w-12 h-12 text-muted-foreground fallback-icon" style={{ display: 'none', position: 'absolute' }} />
                    </>
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  প্রোফাইল ছবি
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  ছবির লিংক
                </Label>
                <div className="flex gap-2">
                  <Input 
                    value={imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
                    type="url"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpdateImage}
                    disabled={isUpdatingProfile || !imageUrl.trim()}
                    size="default"
                  >
                    {isUpdatingProfile ? 'সেভ হচ্ছে...' : 'সেভ'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ইমেইল <span className="text-xs text-muted-foreground font-normal">(পরিবর্তনযোগ্য নয়)</span></Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>নাম</Label>
                <div className="flex gap-2">
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার নাম লিখুন"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpdateName}
                    disabled={isUpdatingProfile || !name.trim()}
                    size="default"
                  >
                    {isUpdatingProfile ? 'সেভ হচ্ছে...' : 'সেভ'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                পাসওয়ার্ড পরিবর্তন
              </CardTitle>
              <CardDescription>নতুন পাসওয়ার্ড সেট করুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>নতুন পাসওয়ার্ড</Label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড"
                />
              </div>
              <div className="space-y-2">
                <Label>পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="আবার লিখুন"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              <Button 
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {isUpdatingPassword ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              ডেটা ডাউনলোড
            </CardTitle>
            <CardDescription>আপনার সম্পূর্ণ একাউন্ট তথ্য ডাউনলোড করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleDownloadData}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              JSON ফরম্যাটে ডাউনলোড করুন
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}