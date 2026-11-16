import React, { useState } from 'react';
import { Car } from 'lucide-react';
import { getCarImage } from '../utils/carImages';

interface CarImageFrameProps {
  imageKey: string;
  alt: string;
  className?: string;
}

export const CarImageFrame: React.FC<CarImageFrameProps> = ({
  imageKey,
  alt,
  className = 'w-full h-48',
}) => {
  const [failed, setFailed] = useState(false);
  const src = getCarImage(imageKey);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EFECE6] text-[#5A5F6B] ${className}`}
      >
        <Car className="w-8 h-8 mb-1.5 opacity-60" />
        <span className="text-xs font-medium px-3 text-center truncate max-w-full">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover bg-[#EFECE6] ${className}`}
    />
  );
};
