import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, FileText, Film } from 'lucide-react';
import { Button } from './Button';
import { LazyImage } from './LazyImage';
import { supabase, SUPABASE_MEDIA_BUCKET } from '../../lib/supabase';

interface FileUploadProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
}

export function FileUpload({
  onUpload,
  maxFiles = 1,
  acceptedFileTypes = ['image/*']
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    
    // Generate previews for images
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => {
      // Revoke old preview URLs to prevent memory leaks
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
    
    setError(null);
  }, [files, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map(rejection => rejection.errors[0].message);
      setError(errors.join(', '));
    },
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from(SUPABASE_MEDIA_BUCKET)
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from(SUPABASE_MEDIA_BUCKET)
            .getPublicUrl(filePath);

          return publicUrl;
        })
      );

      onUpload(uploadedUrls);
      setFiles([]);
      setPreviews([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Film className="w-6 h-6 text-purple-500" />;
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  // Clean up previews when component unmounts
  React.useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {file.type.startsWith('image/') ? (
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <LazyImage
                        src={previews[index]}
                        alt={file.name}
                        aspectRatio="square"
                        objectFit="cover"
                      />
                    </div>
                  ) : (
                    getFileIcon(file)
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      )}
    </div>
  );
}