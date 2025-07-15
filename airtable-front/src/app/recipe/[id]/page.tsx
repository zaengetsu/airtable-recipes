'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, HeartIcon, ClockIcon, UserGroupIcon, FireIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AllergyAlert from '@/components/AllergyAlert';
import ChatDrawer from '@/components/ChatDrawer';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  preparationTime: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  servings: number;
  category: string;
  likes: number;
  image?: string;
  author?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  authorID: string;
}

const PLACEHOLDER_IMAGES = [
  'https://placehold.co/400x300/FF5733/FFFFFF/png?text=Recette+1',
  'https://placehold.co/400x300/33FF57/FFFFFF/png?text=Recette+2',
  'https://placehold.co/400x300/3357FF/FFFFFF/png?text=Recette+3',
];

const getCategoryColors = (category: string) => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('plat') || categoryLower.includes('principal')) {
    return 'bg-orange-100 text-orange-800';
  }
  if (categoryLower.includes('dessert') || categoryLower.includes('sucré')) {
    return 'bg-pink-100 text-pink-800';
  }
  if (categoryLower.includes('entrée') || categoryLower.includes('apéritif')) {
    return 'bg-green-100 text-green-800';
  }
  if (categoryLower.includes('boisson') || categoryLower.includes('cocktail')) {
    return 'bg-blue-100 text-blue-800';
  }
  if (categoryLower.includes('salade') || categoryLower.includes('légume')) {
    return 'bg-emerald-100 text-emerald-800';
  }
  if (categoryLower.includes('soupe') || categoryLower.includes('potage')) {
    return 'bg-amber-100 text-amber-800';
  }
  if (categoryLower.includes('pizza') || categoryLower.includes('burger')) {
    return 'bg-red-100 text-red-800';
  }
  if (categoryLower.includes('pasta') || categoryLower.includes('pâtes')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  // Couleur par défaut
  return 'bg-gray-100 text-gray-800';
};

export default function RecipePage() {
  const params = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [recipeToAnalyze, setRecipeToAnalyze] = useState<Recipe | null>(null);
  
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikingLoading, setIsLikingLoading] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/recipes/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Recette non trouvée');
        }

        const data = await response.json();
        setRecipe(data);
        setLikesCount(data.likes || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la recette');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [params.id]);

  useEffect(() => {
    const loadLikeStatus = async () => {
      if (user?.id && params.id) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/recipes/${params.id}/like-status`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          if (response.ok) {
            const { liked } = await response.json();
            setIsLiked(liked);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du statut de like:', error);
        }
      }
    };

    loadLikeStatus();
  }, [user?.id, params.id]);

  const handleLikeToggle = async () => {
    if (!user?.id) {
      alert('Vous devez être connecté pour liker une recette');
      return;
    }

    if (!params.id) return;

    setIsLikingLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes/${params.id}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const { liked, likesCount: newLikesCount } = await response.json();
        setIsLiked(liked);
        setLikesCount(newLikesCount);
      } else {
        console.error('Erreur lors du toggle du like');
      }
    } catch (error) {
      console.error('Erreur lors du toggle du like:', error);
    } finally {
      setIsLikingLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenNutritionAnalysis = (event: CustomEvent) => {
      setRecipeToAnalyze(event.detail.recipe);
      setIsChatOpen(true);
    };

    window.addEventListener('openNutritionAnalysis', handleOpenNutritionAnalysis as EventListener);

    return () => {
      window.removeEventListener('openNutritionAnalysis', handleOpenNutritionAnalysis as EventListener);
    };
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % PLACEHOLDER_IMAGES.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + PLACEHOLDER_IMAGES.length) % PLACEHOLDER_IMAGES.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la recette...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recette non trouvée</h1>
          <p className="text-gray-600 mb-6">{error || 'Cette recette n\'existe pas.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const ingredientNames = recipe.ingredients.map(ing => ing.name || ing.toString());
  const categoryColors = getCategoryColors(recipe.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Retour à l'accueil
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
              <p className="text-gray-600 mb-4">{recipe.description}</p>
            </div>
            
            <button
              onClick={handleLikeToggle}
              disabled={isLikingLoading}
              className="ml-6 bg-white/90 rounded-full p-1 hover:bg-white transition-colors disabled:opacity-50"
            >
              {isLiked ? (
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-red-500" />
              )}
            </button>
          </div>
          
          <div className="text-xs text-gray-400">
            Créée par {recipe.author?.name || 'Utilisateur'} • {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
            <img
              src={PLACEHOLDER_IMAGES[currentImageIndex]}
              alt={recipe.name}
              className="w-full h-80 object-cover"
            />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-sm text-gray-600">
                {recipe.preparationTime + recipe.cookingTime} min
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-sm text-gray-600">
                {recipe.servings} pers.
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-600">
                {likesCount} like{likesCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {user && user.allergies && user.allergies.length > 0 && (
          <div className="mb-6">
            <AllergyAlert
              userAllergies={user.allergies}
              recipeIngredients={ingredientNames}
            />
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => {
              const event = new CustomEvent('openNutritionAnalysis', {
                detail: { recipe }
              });
              window.dispatchEvent(event);
            }}
            className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
          >
            Analyse nutritionnelle
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{recipe.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingrédients</h3>
            <ul className="grid grid-cols-1 gap-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center space-x-2 text-gray-600">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  <span>
                    {ingredient.quantity && `${ingredient.quantity} `}
                    {ingredient.name || ingredient.toString()}
                    {ingredient.unit && ` (${ingredient.unit})`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-600">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {recipe.difficulty}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors}`}>
                {recipe.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        recipeToAnalyze={recipeToAnalyze}
      />
    </div>
  );
}