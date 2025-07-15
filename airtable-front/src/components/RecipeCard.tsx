'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, HeartIcon, ClockIcon, UserGroupIcon, FireIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Recipe } from '@/types/recipe';
import { useAuth } from '@/contexts/AuthContext';
import AllergyAlert from './AllergyAlert';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe;
  onAnalyze?: (recipe: Recipe) => void;
  open?: boolean;
  onOpenDetails?: () => void;
  onCloseDetails?: () => void;
}

const PLACEHOLDER_IMAGES = [
  'https://placehold.co/400x300/FF5733/FFFFFF/png?text=Recette+1',
  'https://placehold.co/400x300/33FF57/FFFFFF/png?text=Recette+2',
  'https://placehold.co/400x300/3357FF/FFFFFF/png?text=Recette+3',
];

// Fonction pour obtenir les couleurs selon la catégorie
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

export function RecipeCard({ recipe, onAnalyze, open, onOpenDetails, onCloseDetails }: RecipeCardProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const { user } = useAuth();
  
  // États pour les likes
  const [likesCount, setLikesCount] = useState(recipe.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikingLoading, setIsLikingLoading] = useState(false);
  
  // Extraire les noms d'ingrédients pour la vérification d'allergies
  const ingredientNames = recipe.ingredients.map(ing => ing.name || ing.toString());

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Charger le statut de like et le nombre de likes au montage
  useEffect(() => {
    const loadLikeData = async () => {
      if (user?.id) {
        try {
          // Récupérer le statut de like
          const likeStatusResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/recipes/${recipe.id}/like-status`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            }
          );
          
          if (likeStatusResponse.ok) {
            const { liked } = await likeStatusResponse.json();
            setIsLiked(liked);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du statut de like:', error);
        }
      }

      // Récupérer le nombre de likes
      try {
        const likesCountResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recipes/${recipe.id}/likes-count`
        );
        
        if (likesCountResponse.ok) {
          const { likesCount } = await likesCountResponse.json();
          setLikesCount(likesCount);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de likes:', error);
      }
    };

    loadLikeData();
  }, [recipe.id, user?.id]);

  // Fonction pour gérer le toggle du like
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user?.id) {
      // Rediriger vers la connexion ou afficher un message
      alert('Vous devez être connecté pour liker une recette');
      return;
    }

    setIsLikingLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes/${recipe.id}/like`,
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % PLACEHOLDER_IMAGES.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + PLACEHOLDER_IMAGES.length) % PLACEHOLDER_IMAGES.length);
  };

  const handleOpen = () => {
    if (onOpenDetails) onOpenDetails();
    else setInternalOpen(true);
  };
  const handleClose = () => {
    if (onCloseDetails) onCloseDetails();
    else setInternalOpen(false);
  };

  const categoryColors = getCategoryColors(recipe.category);

  return (
    <>
      <div
        onClick={handleOpen}
        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="relative">
          <img
            src={PLACEHOLDER_IMAGES[0]}
            alt={recipe.name}
            className="w-full h-48 object-cover"
          />
          <button
            onClick={handleLikeToggle}
            disabled={isLikingLoading}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-white transition-colors disabled:opacity-50"
          >
            {isLiked ? (
              <HeartIconSolid className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6 text-red-500" />
            )}
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-xl text-gray-900">{recipe.name}</h3>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${categoryColors}`}>
              {recipe.category}
            </span>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{recipe.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4" />
              <span>{recipe.preparationTime} min</span>
            </div>
            <div className="flex items-center space-x-2">
              <FireIcon className="h-4 w-4" />
              <span>{recipe.difficulty}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="h-4 w-4" />
              <span>{recipe.servings} pers.</span>
            </div>
          </div>
          
          {/* Affichage du nombre de likes */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-4 w-4 text-red-500" />
              <span className="text-sm text-gray-600">{likesCount} like{likesCount > 1 ? 's' : ''}</span>
            </div>
          </div>
          
          {onAnalyze && (
            <button
              onClick={(e) => { e.stopPropagation(); onAnalyze?.(recipe); }}
              className="w-full mt-2 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
            >
              Analyse nutritionnelle
            </button>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        {/* ...existing modal code... */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel className="pointer-events-auto w-screen max-w-2xl bg-gradient-to-br from-white via-gray-50 to-gray-200 shadow-2xl rounded-l-3xl border-l border-gray-200">
                <div className="flex h-full flex-col overflow-y-scroll">
                  {/* Header */}
                  <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-gray-100 via-white to-gray-50 rounded-tl-3xl">
                    <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900">
                      {recipe.name}
                    </DialogTitle>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none shadow"
                    >
                      <span className="sr-only">Fermer</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="relative flex-1 px-6 sm:px-8 pb-8">
                    {/* Image Carousel */}
                    <div className="relative aspect-w-16 aspect-h-9 mb-6 rounded-xl overflow-hidden">
                      <img
                        src={PLACEHOLDER_IMAGES[currentImageIndex]}
                        alt={recipe.name}
                        className="w-full h-80 object-cover"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Recipe Info avec likes */}
                    <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
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
                        <button
                          onClick={handleLikeToggle}
                          disabled={isLikingLoading}
                          className="flex items-center space-x-2 hover:bg-gray-100 rounded-md p-1 transition-colors disabled:opacity-50"
                        >
                          {isLiked ? (
                            <HeartIconSolid className="h-5 w-5 text-red-500" />
                          ) : (
                            <HeartIcon className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm text-gray-600">
                            {likesCount} like{likesCount > 1 ? 's' : ''}
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    {/* ...rest of existing modal content... */}
                    {/* Alerte d'allergies */}
                    {user && user.allergies && user.allergies.length > 0 && (
                      <div className="mb-6">
                        <AllergyAlert
                          userAllergies={user.allergies}
                          recipeIngredients={ingredientNames}
                        />
                      </div>
                    )}

                    {/* Bouton Analyse nutritionnelle */}
                    {onAnalyze && (
                      <div className="mb-6">
                        <button
                          onClick={() => { onAnalyze?.(recipe); window.location.hash = `details?recipeId=${recipe.id}`; }}
                          className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
                        >
                          Analyse nutritionnelle
                        </button>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{recipe.description}</p>
                    </div>

                    {/* Ingredients */}
                    <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingrédients</h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center space-x-2 text-gray-600">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <span>{ingredient.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
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

                    {/* Additional Info */}
                    <div className="border-t border-gray-200 pt-6">
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
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}