'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  BeakerIcon, 
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  caloriesPer100g?: number;
  proteinsPer100g?: number;
  carbsPer100g?: number;
  fatsPer100g?: number;
  allergens?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminIngredientsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Attendre que l'authentification soit chargée
    if (authLoading) {
      return;
    }

    // Vérifier si l'utilisateur est admin
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    // Charger les ingrédients
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ingredients`);

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des ingrédients');
        }

        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement des ingrédients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIngredients();
  }, [user, router, authLoading]);

  // Filtrer les ingrédients selon la recherche
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Afficher un loader pendant le chargement de l'authentification
  if (authLoading) {
    return (
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rediriger si pas admin
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Gestion des ingrédients
                </h1>
                <p className="text-gray-600">
                  {ingredients.length} ingrédient(s) disponible(s) sur la plateforme
                </p>
              </div>
              <Link
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retour au dashboard
              </Link>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, catégorie ou unité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tableau */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingrédient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calories (100g)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Allergènes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créé le
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIngredients.map((ingredient) => (
                      <tr key={ingredient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-purple-300 flex items-center justify-center">
                                <BeakerIcon className="h-6 w-6 text-purple-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {ingredient.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {ingredient.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {ingredient.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <ScaleIcon className="h-4 w-4 mr-1" />
                            {ingredient.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ingredient.caloriesPer100g ? `${ingredient.caloriesPer100g} kcal` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ingredient.allergens && ingredient.allergens.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {ingredient.allergens.map((allergen, index) => (
                                <span
                                  key={index}
                                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                                >
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500">Aucun</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(ingredient.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredIngredients.length === 0 && (
                <div className="text-center py-8">
                  <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucun ingrédient trouvé
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Aucun ingrédient disponible.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 