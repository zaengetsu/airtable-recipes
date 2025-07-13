'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, error, isLoading } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || []);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(username, allergies);
      setMessage('Profil mis à jour avec succès');
    } catch (error) {
      // L'erreur est déjà gérée dans le contexte d'authentification
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Mot de passe mis à jour avec succès');
    } catch (error) {
      // L'erreur est déjà gérée dans le contexte d'authentification
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {message && (
                <div className="mb-6 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-12">
                  <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base/7 font-semibold text-gray-900">Profil</h2>
                    <p className="mt-1 text-sm/6 text-gray-600">
                      Ces informations seront affichées publiquement, soyez prudent avec ce que vous partagez.
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-4">
                        <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                          Nom d'utilisateur
                        </label>
                        <div className="mt-2">
                          <input
                            id="username"
                            name="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="col-span-full">
                        <label htmlFor="allergies" className="block text-sm/6 font-medium text-gray-900">
                          Allergies
                        </label>
                        <div className="mt-2">
                          <textarea
                            id="allergies"
                            name="allergies"
                            rows={3}
                            value={allergies.join(', ')}
                            onChange={(e) => setAllergies(e.target.value.split(',').map(a => a.trim()))}
                            placeholder="Séparez les allergies par des virgules"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                        <p className="mt-3 text-sm/6 text-gray-600">Listez vos allergies alimentaires pour des recommandations personnalisées.</p>
                      </div>

                      <div className="col-span-full">
                        <label htmlFor="photo" className="block text-sm/6 font-medium text-gray-900">
                          Photo de profil
                        </label>
                        <div className="mt-2 flex items-center gap-x-3">
                          <UserCircleIcon aria-hidden="true" className="size-12 text-gray-300" />
                          <button
                            type="button"
                            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            Changer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base/7 font-semibold text-gray-900">Informations personnelles</h2>
                    <p className="mt-1 text-sm/6 text-gray-600">Utilisez une adresse permanente où vous pouvez recevoir du courrier.</p>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
                          Prénom
                        </label>
                        <div className="mt-2">
                          <input
                            id="first-name"
                            name="first-name"
                            type="text"
                            autoComplete="given-name"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900">
                          Nom de famille
                        </label>
                        <div className="mt-2">
                          <input
                            id="last-name"
                            name="last-name"
                            type="text"
                            autoComplete="family-name"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                          Adresse email
                        </label>
                        <div className="mt-2">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={user?.email}
                            disabled
                            className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-500 outline outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="country" className="block text-sm/6 font-medium text-gray-900">
                          Pays
                        </label>
                        <div className="mt-2 grid grid-cols-1">
                          <select
                            id="country"
                            name="country"
                            autoComplete="country-name"
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          >
                            <option>France</option>
                            <option>Belgique</option>
                            <option>Suisse</option>
                            <option>Canada</option>
                            <option>États-Unis</option>
                          </select>
                          <ChevronDownIcon
                            aria-hidden="true"
                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                          />
                        </div>
                      </div>

                      <div className="col-span-full">
                        <label htmlFor="street-address" className="block text-sm/6 font-medium text-gray-900">
                          Adresse
                        </label>
                        <div className="mt-2">
                          <input
                            id="street-address"
                            name="street-address"
                            type="text"
                            autoComplete="street-address"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 sm:col-start-1">
                        <label htmlFor="city" className="block text-sm/6 font-medium text-gray-900">
                          Ville
                        </label>
                        <div className="mt-2">
                          <input
                            id="city"
                            name="city"
                            type="text"
                            autoComplete="address-level2"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="region" className="block text-sm/6 font-medium text-gray-900">
                          Région / Département
                        </label>
                        <div className="mt-2">
                          <input
                            id="region"
                            name="region"
                            type="text"
                            autoComplete="address-level1"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="postal-code" className="block text-sm/6 font-medium text-gray-900">
                          Code postal
                        </label>
                        <div className="mt-2">
                          <input
                            id="postal-code"
                            name="postal-code"
                            type="text"
                            autoComplete="postal-code"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base/7 font-semibold text-gray-900">Sécurité</h2>
                    <p className="mt-1 text-sm/6 text-gray-600">
                      Changez votre mot de passe pour sécuriser votre compte.
                    </p>

                    <div className="mt-10 space-y-6">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm/6 font-medium text-gray-900">
                          Mot de passe actuel
                        </label>
                        <div className="mt-2">
                          <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm/6 font-medium text-gray-900">
                          Nouveau mot de passe
                        </label>
                        <div className="mt-2">
                          <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-gray-900">
                          Confirmer le nouveau mot de passe
                        </label>
                        <div className="mt-2">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button 
                    type="button" 
                    className="text-sm/6 font-semibold text-gray-900"
                    onClick={() => {
                      setUsername(user?.username || '');
                      setAllergies(user?.allergies || []);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
                  >
                    {isLoading ? 'Mise à jour...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 