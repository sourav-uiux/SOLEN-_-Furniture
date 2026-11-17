import React, { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EAE6DE] via-[#DFD8CA] to-[#CFC5B4] text-[#242421] p-6 text-center ${className}`}
      >
        <span className="font-editorial text-lg tracking-wide">{fallbackTitle || alt}</span>
        <span className="text-xs text-[#737767] mt-1">Solen Architectural Archive</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
