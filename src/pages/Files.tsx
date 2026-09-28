import { useState, useRef } from 'react';
import { Upload, Trash2, FileText, Image as ImageIcon, FolderOpen } from 'lucide-react';
import type { View } from '@/lib/supabase';
import { formatRelative, formatFileSize } from '@/lib/utils';
import { loadList, saveList, uid, nowISO, STORAGE_KEYS } from '@/lib/storage';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';

type FileItem = {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  data_url: string | null;
  created_at: string;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export default function Files() {
  const [files, setFiles] = useState<FileItem[]>(() => loadList<FileItem>(STORAGE_KEYS.files));
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persist = (next: FileItem[]) => {
    setFiles(next);
    saveList(STORAGE_KEYS.files, next);
  };

  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    const newFiles: FileItem[] = [];

    for (const file of Array.from(fileList)) {
      if (file.size > MAX_FILE_SIZE) {
        const fileType = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'document';
        newFiles.push({
          id: uid(), name: file.name, file_type: fileType, file_size: file.size, mime_type: file.type,
          data_url: null, created_at: nowISO(),
        });
        continue;
      }

      const data_url = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      const fileType = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'document';
      newFiles.push({
        id: uid(), name: file.name, file_type: fileType, file_size: file.size, mime_type: file.type,
        data_url, created_at: nowISO(),
      });
    }

    persist([...newFiles, ...files]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteFile = (id: string) => {
    persist(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-5 animate-fade-in md:pt-0 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{files.length} file{files.length !== 1 ? 's' : ''} stored</p>
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <Upload size={18} /> Upload
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
        </label>
      </div>

      {uploading && (
        <div className="card p-4 text-center text-sm text-ink-500 animate-fade-in">Processing files...</div>
      )}

      {files.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No files yet"
          message="Upload documents, PDFs, notes, or images. Files under 2MB are stored locally in your browser; larger files store metadata only."
          action={
            <label className="btn-primary flex items-center gap-2 cursor-pointer">
              <Upload size={16} /> Upload File
              <input type="file" multiple className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
            </label>
          } />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="card overflow-hidden group hover:shadow-hover transition-all">
              {file.file_type === 'image' && file.data_url ? (
                <div className="h-32 overflow-hidden bg-cream-100">
                  <img src={file.data_url} alt={file.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center bg-cream-100">
                  {file.file_type === 'pdf' ? <FileText size={32} className="text-blush-400" /> : <FileText size={32} className="text-ink-300" />}
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-700 truncate">{file.name}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{formatFileSize(file.file_size)} - {formatRelative(file.created_at)}</p>
                    {!file.data_url && file.file_type !== 'image' && (
                      <p className="text-[10px] text-ink-400 mt-1">Metadata only (file too large for local storage)</p>
                    )}
                  </div>
                  <button onClick={() => setDeleteId(file.id)} className="opacity-0 group-hover:opacity-100 text-ink-400 hover:text-blush-500 p-1 rounded transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && deleteFile(deleteId)} title="Delete File" message="This file will be permanently deleted from your local storage." />
    </div>
  );
}
