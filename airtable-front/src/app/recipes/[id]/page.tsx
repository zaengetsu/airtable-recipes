'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import NutritionalAnalysis from '@/components/NutritionalAnalysis';

interface Recipes {
  id: string;
  name: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string[];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  category: string;
  imageUrl: string;
  isPublic: boolean;
  nutritionalAnalysis?: {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

export default function RecipePage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [recipe, setRecipe] = useState<Recipes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Recette non trouvée');
        }

        const data = await response.json();
        setRecipe(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [params.id, token]);

  const handleAnalysisComplete = async () => {
    // Rafraîchir les données de la recette après l'analyse
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recipes/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du rafraîchissement des données');
      }

      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-red-600 text-center">
          {error || 'Recette non trouvée'}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{recipe.name}</h1>
              <p className="text-gray-600 mb-6">{recipe.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Portions</div>
                  <div className="font-semibold">{recipe.servings}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Préparation</div>
                  <div className="font-semibold">{recipe.prepTime} min</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Cuisson</div>
                  <div className="font-semibold">{recipe.cookTime} min</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Difficulté</div>
                  <div className="font-semibold">{recipe.difficulty}</div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Ingrédients</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                        {index + 1}
                      </span>
                      <span>
                        {ingredient.quantity} {ingredient.unit} {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {recipe.nutritionalAnalysis ? (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Valeurs nutritionnelles</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Calories</div>
                      <div className="font-semibold">{recipe.nutritionalAnalysis.calories} kcal</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Protéines</div>
                      <div className="font-semibold">{recipe.nutritionalAnalysis.proteins}g</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Glucides</div>
                      <div className="font-semibold">{recipe.nutritionalAnalysis.carbohydrates}g</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">Lipides</div>
                      <div className="font-semibold">{recipe.nutritionalAnalysis.fats}g</div>
                    </div>
                  </div>
                </div>
              ) : (
                <NutritionalAnalysis recipeId={recipe.id} onAnalysisComplete={handleAnalysisComplete} />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 