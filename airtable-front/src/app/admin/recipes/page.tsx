'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  BookOpenIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  servings: number;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  isPublic: boolean;
  authorID: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
}

export default function AdminRecipesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  // Fonction pour basculer la visibilité d'une recette
  const toggleRecipeVisibility = async (recipeId: string, newVisibility: boolean) => {
    try {
      // Ajouter le loader
      setLoadingActions(prev => new Set(prev).add(recipeId));
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic: newVisibility }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la recette');
      }

      // Mettre à jour l'état local
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isPublic: newVisibility }
            : recipe
        )
      );
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la mise à jour de la recette');
    } finally {
      // Retirer le loader
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };


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

    // Charger les recettes
    const fetchRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes`);

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des recettes');
        }

        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors du chargement des recettes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [user, router, authLoading]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenu && !(event.target as Element).closest('.menu-container')) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenu]);



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
            <div className="flex items-center mb-4">
              <Link
                href="/admin"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Gestion des recettes
                </h1>
                <p className="text-gray-600">
                  {recipes.length} recette(s) créée(s) sur la plateforme
                </p>
              </div>
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
                        Recette
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difficulté
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Temps
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Portions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créée le
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-300 flex items-center justify-center">
                                <BookOpenIcon className="h-6 w-6 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {recipe.name}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                                {recipe.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {recipe.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            recipe.difficulty === 'Facile' 
                              ? 'bg-green-100 text-green-800'
                              : recipe.difficulty === 'Moyen'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {recipe.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {recipe.preparationTime + recipe.cookingTime} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            {recipe.servings}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            recipe.isPublic 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {recipe.isPublic ? 'Public' : 'Privé'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(recipe.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap relative">
                          <div className="relative menu-container">
                            <button
                              onClick={() => setOpenMenu(openMenu === recipe.id ? null : recipe.id)}
                              disabled={loadingActions.has(recipe.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                loadingActions.has(recipe.id)
                                  ? 'cursor-not-allowed'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {loadingActions.has(recipe.id) ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              ) : (
                                <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            
                            {openMenu === recipe.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      toggleRecipeVisibility(recipe.id, !recipe.isPublic);
                                      setOpenMenu(null);
                                    }}
                                    disabled={loadingActions.has(recipe.id)}
                                    className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                                      loadingActions.has(recipe.id)
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                  >
                                    {loadingActions.has(recipe.id) ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 mr-3 border-b-2 border-gray-400"></div>
                                        Mise à jour...
                                      </>
                                    ) : recipe.isPublic ? (
                                      <>
                                        <EyeSlashIcon className="h-4 w-4 mr-3 text-red-500" />
                                        Rendre privé
                                      </>
                                    ) : (
                                      <>
                                        <EyeIcon className="h-4 w-4 mr-3 text-green-500" />
                                        Rendre public
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {recipes.length === 0 && (
                <div className="text-center py-8">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Aucune recette créée
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Aucune recette n'est disponible pour le moment.
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