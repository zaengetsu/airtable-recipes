'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UsersIcon, 
  BookOpenIcon, 
  ChartBarIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  UserGroupIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalRecipes: number;
  totalIngredients: number;
  recentRecipes: number;
  isLoading: boolean;
  error: string | null;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRecipes: 0,
    totalIngredients: 0,
    recentRecipes: 0,
    isLoading: true,
    error: null
  });

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

    // Charger les statistiques
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, isLoading: true, error: null }));

        // Récupérer les recettes
        const recipesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes`);
        const recipes = await recipesResponse.json();



        // Récupérer les utilisateurs (nécessite une route admin)
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        let users = [];
        if (usersResponse.ok) {
          users = await usersResponse.json();
        }

        // Calculer les recettes récentes (créées dans les 7 derniers jours)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const recentRecipes = recipes.filter((recipe: any) => {
          const recipeDate = new Date(recipe.createdAt);
          return recipeDate > oneWeekAgo;
        }).length;

        setStats({
          totalUsers: users.filter((user: any) => user.role === 'user').length,
          totalRecipes: recipes.length,
          totalIngredients: 0,
          recentRecipes,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors du chargement des données'
        }));
      }
    };

    fetchStats();
  }, [user, router, authLoading]);

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
      {stats.isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du tableau de bord...</p>
          </div>
        </div>
      ) : stats.error ? (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{stats.error}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tableau de bord d'administration
              </h1>
              <p className="text-gray-600">
                Gestion et statistiques de la plateforme de recettes
              </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Utilisateurs */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              {/* Recettes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpenIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recettes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRecipes}</p>
                  </div>
                </div>
              </div>

              {/* Recettes récentes */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Nouvelles recettes (7 derniers jours)</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recentRecipes}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Actions rapides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gestion des utilisateurs */}
                <Link
                  href="/admin/users"
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <UserGroupIcon className="h-8 w-8 text-white" />
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Gestion des clients
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Consultez et gérez les comptes clients et leurs profils
                    </p>
                    <div className="flex items-center text-sm text-blue-600 font-medium">
                      <span>{stats.totalUsers} client(s)</span>
                    </div>
                  </div>
                </Link>

                {/* Gestion des recettes */}
                <Link
                  href="/admin/recipes"
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                        <BookOpenIcon className="h-8 w-8 text-white" />
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Gestion des recettes
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Consultez toutes les recettes créées et gérez leur visibilité
                    </p>
                    <div className="flex items-center text-sm text-green-600 font-medium">
                      <span>{stats.totalRecipes} recette(s)</span>
                    </div>
                  </div>
                </Link>

                {/* Gestion des ingrédients */}
                <Link
                  href="/admin/ingredients"
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                        <PuzzlePieceIcon className="h-8 w-8 text-white" />
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Gestion des ingrédients
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Consultez la base de données des ingrédients et leurs propriétés
                    </p>
                    <div className="flex items-center text-sm text-purple-600 font-medium">
                      <span>Base de données</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 