import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Image as ImageIcon,
  Tv,
  Music,
  Cloud,
  Gamepad2,
  Code,
  Zap,
  Mail,
  Phone,
  Calendar,
  FileText,
  CreditCard,
  Shield,
  Globe,
  Users,
  Camera,
  Video,
  Headphones,
  Cpu,
  Database,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscriptionIconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (iconUrl: string, iconType: 'preset' | 'custom') => void;
  trigger?: React.ReactNode;
}

const presetIcons = [
  { id: 'netflix', Icon: Tv, name: 'Netflix', category: 'streaming' },
  { id: 'spotify', Icon: Music, name: 'Spotify', category: 'music' },
  { id: 'youtube', Icon: Video, name: 'YouTube', category: 'streaming' },
  { id: 'prime', Icon: Tv, name: 'Prime Video', category: 'streaming' },
  { id: 'disney', Icon: Tv, name: 'Disney+', category: 'streaming' },
  { id: 'hulu', Icon: Tv, name: 'Hulu', category: 'streaming' },
  { id: 'apple-music', Icon: Headphones, name: 'Apple Music', category: 'music' },
  { id: 'dropbox', Icon: Cloud, name: 'Dropbox', category: 'storage' },
  { id: 'google-drive', Icon: Cloud, name: 'Google Drive', category: 'storage' },
  { id: 'adobe', Icon: Code, name: 'Adobe CC', category: 'software' },
  { id: 'figma', Icon: Code, name: 'Figma', category: 'software' },
  { id: 'github', Icon: Code, name: 'GitHub', category: 'software' },
  { id: 'slack', Icon: Mail, name: 'Slack', category: 'communication' },
  { id: 'zoom', Icon: Video, name: 'Zoom', category: 'communication' },
  { id: 'office365', Icon: FileText, name: 'Office 365', category: 'productivity' },
  { id: 'notion', Icon: FileText, name: 'Notion', category: 'productivity' },
  { id: 'trello', Icon: Calendar, name: 'Trello', category: 'productivity' },
  { id: 'steam', Icon: Gamepad2, name: 'Steam', category: 'gaming' },
  { id: 'xbox', Icon: Gamepad2, name: 'Xbox Game Pass', category: 'gaming' },
  { id: 'playstation', Icon: Gamepad2, name: 'PlayStation Plus', category: 'gaming' },
  { id: 'aws', Icon: Database, name: 'AWS', category: 'software' },
  { id: 'vercel', Icon: Globe, name: 'Vercel', category: 'software' },
  { id: 'mailchimp', Icon: Mail, name: 'Mailchimp', category: 'communication' },
  { id: 'canva', Icon: Camera, name: 'Canva', category: 'software' },
];

export const SubscriptionIconSelector = ({ 
  selectedIcon, 
  onIconSelect, 
  trigger 
}: SubscriptionIconSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handlePresetIconSelect = (iconId: string) => {
    onIconSelect(iconId, 'preset');
    setOpen(false);
  };

  const handleCustomUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('subscription-icons')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('subscription-icons')
        .getPublicUrl(fileName);

      onIconSelect(data.publicUrl, 'custom');
      setOpen(false);
      toast({
        title: 'Icon uploaded',
        description: 'Your custom icon has been uploaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getPresetIcon = (iconId: string) => {
    const preset = presetIcons.find(icon => icon.id === iconId);
    return preset ? preset.Icon : ImageIcon;
  };

  const renderSelectedIcon = () => {
    if (!selectedIcon) {
      return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
    }

    if (selectedIcon.startsWith('http')) {
      return <img src={selectedIcon} alt="Selected icon" className="h-8 w-8 rounded object-cover" />;
    }

    const IconComponent = getPresetIcon(selectedIcon);
    return <IconComponent className="h-8 w-8 text-primary" />;
  };

  const categories = ['streaming', 'music', 'software', 'storage', 'communication', 'productivity', 'gaming'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="h-12 w-12 p-0">
            {renderSelectedIcon()}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Choose Subscription Icon</DialogTitle>
          <DialogDescription>
            Select a preset icon or upload your own custom image
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preset" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preset">Preset Icons</TabsTrigger>
            <TabsTrigger value="custom">Custom Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="preset" className="space-y-4 max-h-[400px] overflow-y-auto">
            {categories.map(category => {
              const categoryIcons = presetIcons.filter(icon => icon.category === category);
              if (categoryIcons.length === 0) return null;

              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium capitalize text-muted-foreground">
                    {category}
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {categoryIcons.map((icon) => (
                      <Button
                        key={icon.id}
                        variant="outline"
                        className={`h-12 w-12 p-0 ${
                          selectedIcon === icon.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handlePresetIconSelect(icon.id)}
                        title={icon.name}
                      >
                        <icon.Icon className="h-6 w-6" />
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-icon">Upload Custom Icon</Label>
                <div className="mt-2 flex items-center justify-center w-full">
                  <label
                    htmlFor="custom-icon"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 border-muted-foreground/25"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> your icon
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG or SVG (MAX. 5MB)</p>
                    </div>
                    <input
                      id="custom-icon"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCustomUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
              
              {uploading && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};