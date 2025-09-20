import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoHeaderProps {
  className?: string;
}

export default function LogoHeader({ className = '' }: LogoHeaderProps) {
  return (
    <div className={`flex justify-center py-4 ${className}`}>
      <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
        <div className="relative w-64 h-20">
          <Image
            src="/assets/images/logo-achivio.png"
            alt="Achivio Logo"
            fill
            className="object-contain"
          />
        </div>
      </Link>
    </div>
  );
}
