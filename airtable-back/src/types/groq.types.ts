export interface NutritionalAnalysis {
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  vitamins: string[];
  minerals: string[];
  allergens: string[];
}

export interface GeneratedRecipe {
  name: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: string;
  servings: number;
  preparationTime: number;
  cookingTime: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
} 