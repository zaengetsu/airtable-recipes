import { FieldSet } from 'airtable';

export class AirtableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AirtableError';
  }
}

export interface AirtableUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  allergies: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AirtableRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
  instructions: string[];
  servings: number;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  imageUrl?: string;
  isPublic: boolean;
  authorID: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  nutritionalAnalysis?: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    vitamins: string[];
    minerals: string[];
  };
}

export interface AirtableIngredient {
  id: string;
  name: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  vitamins: string[];
  minerals: string[];
  allergens: string[];
  unit: string;
}

export interface AirtableNutritionalAnalysis {
  id: string;
  recipeID: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  vitamins: string[];
  minerals: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AirtableAllergy {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
} 