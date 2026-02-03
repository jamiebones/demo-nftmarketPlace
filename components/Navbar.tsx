'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Gallery' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/my-nfts', label: 'My NFTs' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:scale-105 transition-transform">
            <span className="text-3xl">🐓</span>
            <span>Rooster Fighters</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-all hover:text-orange-200 ${
                    pathname === link.href
                      ? 'text-white border-b-2 border-white pb-1'
                      : 'text-orange-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
