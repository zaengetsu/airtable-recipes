"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import {
  Bars3Icon,
  BookOpenIcon,
  XMarkIcon,
  UserCircleIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Gestionnaire de clic global pour fermer le popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  if (isLoading) {
    return (
      <header className="bg-white">
        <nav className="mx-auto max-w-7xl p-6">
          <span>Chargement...</span>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <span className="sr-only">AirCook - Recettes de cuisine</span>
            <img 
              src="/aircooklogo.png" 
              alt="AirCook Logo" 
              className="h-12 w-auto"
            />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <PopoverGroup className="hidden lg:flex lg:gap-x-12"> 
          {/* Rien ici, menu supprimé */}
        </PopoverGroup>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-4">
          {user && (
            <Link
              href="/create-recipe"
              className="rounded-md bg-[#3A94A5] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2d7a87] transition-colors"
            >
              Nouvelle recette
            </Link>
          )}
          {user ? (
            <div ref={popoverRef} className="relative">
              <button
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-800"
              >
                <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                <span className="hidden sm:block">{user.username}</span>
                <ChevronDownIcon 
                  className={`h-5 w-5 flex-none transition duration-150 ease-in-out ${
                    isPopoverOpen ? 'text-gray-600' : 'text-gray-400'
                  }`} 
                  aria-hidden="true" 
                />
              </button>
              <Transition
                show={isPopoverOpen}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <div className="absolute right-0 top-full z-10 mt-3 w-48 overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsPopoverOpen(false)}
                      className="flex items-center rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100 transition duration-150 ease-in-out"
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      Mon profil
                    </Link>
                    <Link
                      href="/create-recipe"
                      onClick={() => setIsPopoverOpen(false)}
                      className="flex items-center rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100 transition duration-150 ease-in-out"
                    >
                      <BookOpenIcon className="h-4 w-4 mr-3" />
                      Créer une recette
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsPopoverOpen(false)}
                        className="flex items-center rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-100 transition duration-150 ease-in-out"
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={() => { 
                        setIsPopoverOpen(false);
                        logout(); 
                        router.refresh(); 
                      }}
                      className="flex items-center w-full rounded-lg px-3 py-2 text-left text-sm font-semibold leading-6 text-red-600 hover:bg-red-50 transition duration-150 ease-in-out"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-3" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          ) : (
            <div className="flex items-center gap-x-4">
              <Link href="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-800">
                Connexion
              </Link>
              <Link 
                href="/register" 
                className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
              >
                Inscription
              </Link>
            </div>
          )}
        </div>
      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center">
              <span className="sr-only">AirCook - Recettes de cuisine</span>
              <img 
                src="/aircooklogo.png" 
                alt="AirCook Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Fermer le menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                    Menu
                    <ChevronDownIcon className="h-5 w-5 flex-none" aria-hidden="true" />
                  </DisclosureButton>
                </Disclosure>
              </div>
              <div className="py-6">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Connecté en tant que {user.email}
                    </div>
                    <Link
                      href="/profile"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Mon profil
                    </Link>
                    <Link
                      href="/recipes/new"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Créer une recette
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                        router.refresh();
                      }}
                      className="-mx-3 block w-full rounded-lg px-3 py-2.5 text-left text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
