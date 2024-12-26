"use client";

import Link from "next/link";
import { SignInButton } from "../auth/SignInButton";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CartSheet } from "../cart/CartSheet";
import { SearchResults } from '../search/SearchResults';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b sticky top-0 bg-white z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Vibly
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              All Products
            </Link>
            <Link
              href="/products?gender=men"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Men
            </Link>
            <Link
              href="/products?gender=women"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Women
            </Link>
            <Link
              href="/products?gender=unisex"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Unisex
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="w-full pl-10 bg-gray-50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
              />
              {isSearchOpen && (
                <SearchResults 
                  query={searchQuery} 
                  onClose={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user?.role === "admin" && (
              <Link
                href="/admin/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Admin Panel
              </Link>
            )}
            {session ? <CartSheet /> : <div className="w-10 h-10"></div>}
            <SignInButton />
          </div>
        </div>
      </div>
    </header>
  );
}
