'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import IngredientSelector from '@/components/IngredientSelector';

interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
}

interface RecipeFormData {
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  servings: number;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  imageUrl: string;
  isPublic: boolean;
}

const CATEGORIES = [
  'Plat principal',
  'Entrée',
  'Dessert',
  'Soupe',
  'Salade',
  'Boisson',
  'Apéritif',
  'Petit déjeuner',
  'Snack'
];

const DIFFICULTIES = ['Facile', 'Moyen', 'Difficile'] as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function CreateRecipePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    description: '',
    ingredients: [{ id: '', name: '', quantity: 1, unit: '' }],
    instructions: [''],
    servings: 2,
    preparationTime: 15,
    cookingTime: 30,
    difficulty: 'Facile',
    category: 'Plat principal',
    imageUrl: '',
    isPublic: true
  });

  const steps = [
    { id: 1, name: 'Informations de base', description: 'Nom et description' },
    { id: 2, name: 'Ingrédients', description: 'Liste des ingrédients' },
    { id: 3, name: 'Instructions', description: 'Étapes de préparation' },
    { id: 4, name: 'Détails', description: 'Temps et difficulté' },
    { id: 5, name: 'Finalisation', description: 'Vérification et publication' }
  ];

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: '', name: '', quantity: 1, unit: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const handleIngredientsChange = (selectedIngredients: Ingredient[]) => {
    // Convertir les ingrédients sélectionnés au format attendu avec quantité
    const ingredientsWithQuantity: RecipeIngredient[] = selectedIngredients.map(ing => ({
      ...ing,
      quantity: 1 // Quantité par défaut
    }));
    
    setFormData(prev => ({
      ...prev,
      ingredients: ingredientsWithQuantity
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.ingredients.every(ing => ing.name.trim() !== '');
      case 3:
        return formData.instructions.every(inst => inst.trim() !== '');
      case 4:
        return formData.servings > 0 && formData.preparationTime > 0 && formData.cookingTime > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('=== FRONTEND CRÉATION RECETTE ===');
      console.log('Form data:', JSON.stringify(formData, null, 2));
      console.log('User:', user);
      
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      // Nettoyer les ingrédients en générant des id temporaires
      const cleanedIngredients = formData.ingredients.map((ing, index) => ({
        id: `temp_${Date.now()}_${index}`,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit
      }));

      const requestBody = {
        ...formData,
        ingredients: cleanedIngredients,
        authorID: user?.id
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      console.log('API_URL value:', API_URL);
      console.log('process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
      
      // Use the environment variable correctly, handling trailing slash
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
              const apiUrl = `${baseUrl}/recipes`;
      console.log('Final API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Response error:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la création de la recette');
      }

      const recipe = await response.json();
      console.log('Recipe created:', recipe);
      router.push(`/recipe/${recipe.id}`);
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Nom de la recette *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                placeholder="Ex: Pâtes Carbonara"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                placeholder="Décrivez votre recette..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sélection des ingrédients</h3>
              <p className="text-sm text-gray-600 mb-4">
                Recherchez et sélectionnez les ingrédients de votre recette. Vous pouvez aussi ajouter des ingrédients personnalisés.
              </p>
              
              <IngredientSelector
                selectedIngredients={formData.ingredients}
                onIngredientsChange={handleIngredientsChange}
                placeholder="Rechercher un ingrédient..."
              />
            </div>

            {/* Section pour ajuster les quantités */}
            {formData.ingredients.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Ajuster les quantités</h4>
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900">
                        {ingredient.name}
                      </label>
                    </div>
                    <div className="w-20">
                      <label className="block text-sm font-medium text-gray-900">Qté</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-900">Unité</label>
                      <input
                        type="text"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                        placeholder="g, ml, etc."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Instructions</h3>
              <button
                type="button"
                onClick={addInstruction}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-black hover:bg-gray-800"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter
              </button>
            </div>

            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Étape {index + 1} *
                  </label>
                  <textarea
                    rows={2}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    placeholder="Décrivez cette étape..."
                  />
                </div>
                {formData.instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-900">
                Nombre de personnes *
              </label>
              <input
                type="number"
                id="servings"
                min="1"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-900">
                Catégorie
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-900">
                Temps de préparation (min) *
              </label>
              <input
                type="number"
                id="preparationTime"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-900">
                Temps de cuisson (min) *
              </label>
              <input
                type="number"
                id="cookingTime"
                min="0"
                value={formData.cookingTime}
                onChange={(e) => setFormData(prev => ({ ...prev, cookingTime: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-900">
                Difficulté
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'Facile' | 'Moyen' | 'Difficile' }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-900">
                URL de l'image (optionnel)
              </label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  Rendre cette recette publique
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Récapitulatif</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{formData.name}</h4>
                  <p className="text-gray-600">{formData.description}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900">Ingrédients ({formData.ingredients.length})</h5>
                  <ul className="mt-2 space-y-1">
                    {formData.ingredients.map((ing, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {ing.quantity} {ing.unit} {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900">Instructions ({formData.instructions.length} étapes)</h5>
                  <p className="text-sm text-gray-600 mt-2">
                    Temps total: {formData.preparationTime + formData.cookingTime} min 
                    ({formData.preparationTime} min prép + {formData.cookingTime} min cuisson)
                  </p>
                </div>

                <div className="flex gap-4 text-sm">
                  <span className="px-2 py-1 bg-gray-200 rounded-full">{formData.category}</span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full">{formData.difficulty}</span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full">{formData.servings} pers.</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Créer une nouvelle recette</h1>
                <p className="text-gray-600">Suivez les étapes pour créer votre recette</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <h4 className="sr-only">Progression</h4>
                <p className="text-sm font-medium text-gray-900">
                  Étape {currentStep} sur {steps.length}: {steps[currentStep - 1].name}
                </p>
                <div aria-hidden="true" className="mt-6">
                  <div className="overflow-hidden rounded-full bg-gray-200">
                    <div 
                      style={{ width: `${(currentStep / steps.length) * 100}%` }} 
                      className="h-2 rounded-full bg-black transition-all duration-300"
                    />
                  </div>
                  <div className="mt-6 hidden grid-cols-5 text-sm font-medium text-gray-600 sm:grid">
                    {steps.map((step, index) => (
                      <div 
                        key={step.id} 
                        className={`text-center ${index < currentStep ? 'text-black' : ''}`}
                      >
                        {step.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Step Content */}
              <div className="mb-8">
                {renderStep()}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !validateStep(currentStep)}
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Création...' : 'Créer la recette'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 