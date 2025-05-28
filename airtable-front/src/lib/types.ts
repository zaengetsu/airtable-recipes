export interface Recipe {
  recipeID: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  servings: number;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  authorID: string;
  likes: number;
}

export interface Ingredient {
  ingredientID: string;
  name: string;
  category: string;
  unit: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  vitamins: string[];
  minerals: string[];
}

export interface NutritionalAnalysis {
  analysisID: string;
  recipeID: string;
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
  allergens: string[];
}

export interface User {
  userID: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  allergies: string[];
  createdAt: string;
}

export interface Allergy {
  allergyID: string;
  name: string;
  description: string;
  severity: 'Léger' | 'Modéré' | 'Sévère';
} 