export interface Recipe {
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