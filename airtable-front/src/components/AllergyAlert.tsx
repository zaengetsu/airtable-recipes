'use client';

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';

interface Allergy {
  id: string;
  name: string;
  description?: string;
  keywords?: string[];
}

interface AllergyAlertProps {
  userAllergies: string[];
  recipeIngredients: string[];
  className?: string;
}

export default function AllergyAlert({ userAllergies, recipeIngredients, className = '' }: AllergyAlertProps) {
  const [allergiesData, setAllergiesData] = useState<Allergy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données d'allergies depuis la BDD
  useEffect(() => {
    const loadAllergies = async () => {
      try {
        const response = await fetch('/api/allergies');
        if (response.ok) {
          const data = await response.json();
          setAllergiesData(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des allergies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllergies();
  }, []);

  // Normaliser les listes pour la comparaison
  const normalizeText = (text: string) => text.toLowerCase().trim();
  
  const normalizedUserAllergies = userAllergies.map(normalizeText);
  const normalizedIngredients = recipeIngredients.map(normalizeText);
  
  // Trouver les allergènes présents dans la recette
  const findMatchingAllergens = () => {
    const foundAllergens: string[] = [];
    
    // Vérifier chaque allergie de l'utilisateur
    normalizedUserAllergies.forEach(userAllergy => {
      // Recherche directe dans les ingrédients
      const directMatch = normalizedIngredients.some(ingredient => 
        ingredient.includes(userAllergy) || userAllergy.includes(ingredient)
      );
      
      if (directMatch) {
        foundAllergens.push(userAllergy);
        return;
      }
      
      // Recherche dans les données d'allergies de la BDD
      const allergyData = allergiesData.find(allergy => 
        normalizeText(allergy.name) === userAllergy
      );
      
      if (allergyData) {
        // Vérifier les mots-clés de l'allergie (si disponibles)
        const keywords = allergyData.keywords || [];
        const hasKeywordMatch = keywords.some(keyword => 
          normalizedIngredients.some(ingredient => 
            ingredient.includes(normalizeText(keyword))
          )
        );
        
        if (hasKeywordMatch) {
          foundAllergens.push(userAllergy);
        }
      }
      
      // Fallback : mappings statiques pour les allergies courantes
      const staticMappings: { [key: string]: string[] } = {
        'gluten': ['blé', 'farine', 'pain', 'pâtes', 'semoule', 'couscous', 'orge', 'seigle', 'avoine'],
        'lactose': ['lait', 'crème', 'beurre', 'fromage', 'yaourt', 'lactose'],
        'œuf': ['œuf', 'oeuf', 'jaune', 'blanc d\'œuf', 'blanc d\'oeuf'],
        'arachides': ['arachide', 'cacahuète', 'cacahuete', 'peanut'],
        'noix': ['noix', 'amande', 'noisette', 'pistache', 'noix de cajou', 'noix de pécan'],
        'poisson': ['poisson', 'saumon', 'thon', 'cabillaud', 'morue', 'sardine'],
        'mollusques': ['mollusque', 'moule', 'huître', 'huitre', 'palourde', 'coquille saint-jacques'],
        'soja': ['soja', 'soya', 'tofu', 'sauce soja'],
        'céleri': ['céleri', 'celeri'],
        'moutarde': ['moutarde'],
        'sésame': ['sésame', 'sesame', 'tahini'],
        'sulfites': ['sulfite', 'sulfite de sodium', 'métabisulfite'],
      };
      
      const staticKeywords = staticMappings[userAllergy];
      if (staticKeywords) {
        const hasStaticMatch = staticKeywords.some(keyword => 
          normalizedIngredients.some(ingredient => 
            ingredient.includes(normalizeText(keyword))
          )
        );
        
        if (hasStaticMatch && !foundAllergens.includes(userAllergy)) {
          foundAllergens.push(userAllergy);
        }
      }
    });
    
    return foundAllergens;
  };
  
  const foundAllergens = findMatchingAllergens();
  
  if (isLoading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
          <span className="text-sm text-gray-600">Vérification des allergènes...</span>
        </div>
      </div>
    );
  }
  
  if (foundAllergens.length === 0) {
    return null;
  }
  
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            ⚠️ Attention : Allergènes détectés
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="mb-2">
              Cette recette contient des ingrédients auxquels vous êtes allergique :
            </p>
            <ul className="list-disc list-inside space-y-1">
              {foundAllergens.map((allergen: string, index: number) => (
                <li key={index} className="font-medium">
                  {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-red-600">
              Consultez la liste complète des ingrédients et consultez un professionnel de santé si nécessaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 