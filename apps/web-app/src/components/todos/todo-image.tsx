import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon } from 'lucide-react';

interface TodoImageProps {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

export function TodoImage({ imageUrl, alt = 'Todo image', className = '', onClick }: TodoImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (!imageUrl) {
    return (
      <div className={`bg-muted rounded-md overflow-hidden flex items-center justify-center ${className}`}>
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted rounded-md overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover rounded-md ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
        onClick={onClick}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        style={{ display: error ? 'none' : 'block' }}
      />
      {error && (
        <div className="bg-muted rounded-md overflow-hidden flex items-center justify-center w-full h-full">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}