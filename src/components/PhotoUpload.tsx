import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { X, Upload, Loader2 } from 'lucide-react';

type PhotoUploadProps = {
  bucket: 'diary-photos' | 'wardrobe-photos' | 'user-files';
  onUploaded: (path: string, url: string) => void;
  existingPaths?: string[];
  maxFiles?: number;
  label?: string;
};

export default function PhotoUpload({ bucket, onUploaded, maxFiles = 5, label = 'Photos' }: PhotoUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      for (const p of paths) {
        const { data } = await supabase.storage.from(bucket).createSignedUrl(p, 3600);
        if (data?.signedUrl) setPreviews((prev) => [...prev, data.signedUrl]);
      }
    })();
  }, [paths, bucket]);

  const handleFiles = async (files: FileList) => {
    if (!user || uploading) return;
    const remaining = maxFiles - paths.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploading(true);
    for (const file of toUpload) {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (!error) {
        const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
        if (data?.signedUrl) {
          setPreviews((prev) => [...prev, data.signedUrl]);
          setPaths((prev) => [...prev, path]);
          onUploaded(path, data.signedUrl);
        }
      }
    }
    setUploading(false);
  };

  const removePhoto = (index: number) => {
    const path = paths[index];
    if (path) supabase.storage.from(bucket).remove([path]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setPaths((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-3">
        {previews.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-cream-200 group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {paths.length < maxFiles && (
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-cream-300 flex flex-col items-center justify-center cursor-pointer hover:border-sage-400 hover:bg-cream-50 transition-all">
            {uploading ? (
              <Loader2 size={18} className="animate-spin text-ink-400" />
            ) : (
              <>
                <Upload size={16} className="text-ink-400" />
                <span className="text-[10px] text-ink-400 mt-1">Add</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
