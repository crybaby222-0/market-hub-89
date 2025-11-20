import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

interface CreateStoreDialogProps {
  onStoreCreated?: () => void;
  children?: React.ReactNode;
}

export function CreateStoreDialog({ onStoreCreated, children }: CreateStoreDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      let logoUrl = '';
      
      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('store-logos')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('store-logos')
          .getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('stores')
        .insert([
          {
            seller_id: user.id,
            name: formData.name,
            description: formData.description,
            slug: slug,
            logo_url: logoUrl || null,
            is_active: true,
          },
        ]);

      if (error) throw error;

      toast.success('Loja criada com sucesso!');
      setOpen(false);
      setFormData({ name: '', description: '' });
      setLogoFile(null);
      setLogoPreview('');
      onStoreCreated?.();
    } catch (error: any) {
      console.error('Error creating store:', error);
      toast.error(error.message || 'Erro ao criar loja');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Criar Loja</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Loja</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Loja</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Digite o nome da sua loja"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva sua loja"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo da Loja</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                />
              </div>
              {logoPreview && (
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                  <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG, WEBP</p>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Criando...' : 'Criar Loja'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
