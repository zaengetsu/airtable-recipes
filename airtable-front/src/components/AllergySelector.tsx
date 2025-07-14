'use client';

import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/20/solid';

interface Allergy {
  id: string;
  name: string;
  description?: string;
}

interface AllergySelectorProps {
  selectedAllergies: string[];
  onAllergiesChange: (allergies: string[]) => void;
  placeholder?: string;
}

export default function AllergySelector({ 
  selectedAllergies, 
  onAllergiesChange, 
  placeholder = "Rechercher une allergie..." 
}: AllergySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Allergy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customAllergy, setCustomAllergy] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Charger les suggestions depuis l'API
  const loadSuggestions = async (query?: string) => {
    setIsLoading(true);
    try {
      const url = query && query.length >= 2 
        ? `${process.env.NEXT_PUBLIC_API_URL}/allergies?search=${encodeURIComponent(query)}`
        : `${process.env.NEXT_PUBLIC_API_URL}/allergies`;
      
      console.log('Chargement allergies:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Allergies trouvées:', data);
        
        // Filtrer les allergies déjà sélectionnées
        const filteredData = data.filter((allergy: Allergy) => 
          !selectedAllergies.includes(allergy.name)
        );
        console.log('Allergies filtrées:', filteredData);
        setSuggestions(filteredData);
      } else {
        console.error('Erreur API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des allergies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger toutes les allergies au focus
  const handleInputFocus = () => {
    setShowSuggestions(true);
    if (suggestions.length === 0) {
      loadSuggestions();
    }
  };

  // Recherche avec debounce
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        loadSuggestions(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (searchTerm.length === 0 && showSuggestions) {
      loadSuggestions();
    }
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

  const addAllergy = (allergyName: string) => {
    if (allergyName.trim() && !selectedAllergies.includes(allergyName.trim())) {
      onAllergiesChange([...selectedAllergies, allergyName.trim()]);
    }
    setSearchTerm('');
    setCustomAllergy('');
    setShowSuggestions(false);
  };

  const removeAllergy = (allergyToRemove: string) => {
    onAllergiesChange(selectedAllergies.filter(allergy => allergy !== allergyToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      addAllergy(searchTerm);
    }
  };

  const handleCustomAllergySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAllergy.trim()) {
      addAllergy(customAllergy);
    }
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim()) {
      addAllergy(customAllergy);
    }
  };

  return (
    <div className="space-y-3">
      {/* Étiquettes des allergies sélectionnées */}
      {selectedAllergies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAllergies.map((allergy) => (
            <span
              key={allergy}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 border border-red-200"
            >
              {allergy}
              <button
                type="button"
                onClick={() => removeAllergy(allergy)}
                className="text-red-600 hover:text-red-800"
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
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && (
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
                {suggestions.map((allergy) => (
                  <button
                    key={allergy.id}
                    type="button"
                    onClick={() => addAllergy(allergy.name)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{allergy.name}</div>
                    {allergy.description && (
                      <div className="text-xs text-gray-500">{allergy.description}</div>
                    )}
                  </button>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                Aucune allergie trouvée pour "{searchTerm}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Formulaire pour ajouter une allergie personnalisée */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customAllergy}
          onChange={(e) => setCustomAllergy(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomAllergy();
            }
          }}
          placeholder="Mon allergie n'est pas dans la liste..."
          className="flex-1 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
        />
        <button
          type="button"
          onClick={handleAddCustomAllergy}
          disabled={!customAllergy.trim()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter
        </button>
      </div>
    </div>
  );
} 