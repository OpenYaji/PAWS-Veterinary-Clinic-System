'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href ? 'text-primary font-semibold' : 'text-foreground hover:text-primary';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/image.png"
            alt="PAWS Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold text-primary">PAWS VET CLINIC</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={`text-sm transition-colors ${isActive('/')}`}>
            Home
          </Link>
          <Link href="/services" className={`text-sm transition-colors ${isActive('/services')}`}>
            Services
          </Link>
          <Link href="/products" className={`text-sm transition-colors ${isActive('/products')}`}>
            Products
          </Link>
          <Link href="/about" className={`text-sm transition-colors ${isActive('/about')}`}>
            About
          </Link>
          <Link href="/faq" className={`text-sm transition-colors ${isActive('/faq')}`}>
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="hidden sm:inline-flex bg-transparent"
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/appointment">Book Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
