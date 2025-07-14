'use client';

import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/20/solid';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
}

interface IngredientSelectorProps {
  selectedIngredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
  placeholder?: string;
}

export default function IngredientSelector({ 
  selectedIngredients, 
  onIngredientsChange, 
  placeholder = "Rechercher un ingrédient..." 
}: IngredientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customIngredient, setCustomIngredient] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Charger les suggestions depuis l'API
  const loadSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Recherche d\'ingrédients pour:', query);
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/ingredients?search=${encodeURIComponent(query)}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Ingrédients trouvés:', data);
        
        // Filtrer les ingrédients déjà sélectionnés
        const filteredData = data.filter((ingredient: Ingredient) => 
          !selectedIngredients.some(selected => selected.name === ingredient.name)
        );
        console.log('Ingrédients filtrés:', filteredData);
        setSuggestions(filteredData);
      } else {
        console.error('Erreur API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ingrédients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addIngredient = (ingredient: Ingredient) => {
    if (ingredient.name.trim() && !selectedIngredients.some(ing => ing.name === ingredient.name.trim())) {
      onIngredientsChange([...selectedIngredients, ingredient]);
    }
    setSearchTerm('');
    setCustomIngredient('');
    setCustomUnit('');
    setShowSuggestions(false);
  };

  const removeIngredient = (ingredientToRemove: Ingredient) => {
    onIngredientsChange(selectedIngredients.filter(ingredient => ingredient.name !== ingredientToRemove.name));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      // Si des suggestions sont disponibles, sélectionner la première
      if (suggestions.length > 0) {
        addIngredient(suggestions[0]);
      }
    }
  };

  const handleCustomIngredientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customIngredient.trim()) {
      const newIngredient: Ingredient = {
        id: `custom_${Date.now()}`,
        name: customIngredient.trim(),
        unit: customUnit.trim() || 'g'
      };
      addIngredient(newIngredient);
    }
  };

  const handleAddCustomIngredient = () => {
    if (customIngredient.trim()) {
      const newIngredient: Ingredient = {
        id: `custom_${Date.now()}`,
        name: customIngredient.trim(),
        unit: customUnit.trim() || 'g'
      };
      addIngredient(newIngredient);
    }
  };

  return (
    <div className="space-y-3">
      {/* Étiquettes des ingrédients sélectionnés */}
      {selectedIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIngredients.map((ingredient) => (
            <span
              key={ingredient.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
            >
              {ingredient.name} ({ingredient.unit})
              <button
                type="button"
                onClick={() => removeIngredient(ingredient)}
                className="text-blue-600 hover:text-blue-800"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input de recherche */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && (searchTerm.length >= 2 || isLoading) && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Chargement...
              </div>
            ) : suggestions.length > 0 ? (
              <div>
                {suggestions.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    onClick={() => addIngredient(ingredient)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-xs text-gray-500">
                      Unité: {ingredient.unit}
                      {ingredient.calories && ` • ${ingredient.calories} kcal/100g`}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Aucun ingrédient trouvé pour "{searchTerm}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Formulaire pour ajouter un ingrédient personnalisé */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customIngredient}
          onChange={(e) => setCustomIngredient(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomIngredient();
            }
          }}
          placeholder="Mon ingrédient n'est pas dans la liste..."
          className="flex-1 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
        />
        <input
          type="text"
          value={customUnit}
          onChange={(e) => setCustomUnit(e.target.value)}
          placeholder="Unité (g, ml, etc.)"
          className="w-24 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
        />
        <button
          type="button"
          onClick={handleAddCustomIngredient}
          disabled={!customIngredient.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter
        </button>
      </div>
    </div>
  );
} 