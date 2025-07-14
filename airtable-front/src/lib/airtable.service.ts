import Airtable from 'airtable';
import { Recipe } from '@/types/recipe';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

export const airtableService = {
  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      const records = await base('Recipes')
        .select({
          filterByFormula: `OR(
            SEARCH(LOWER("${query}"), LOWER({name})) > 0,
            SEARCH(LOWER("${query}"), LOWER({description})) > 0,
            SEARCH(LOWER("${query}"), LOWER({ingredients})) > 0
          )`,
          maxRecords: 5
        })
        .all();

      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        ingredients: JSON.parse(record.get('ingredients') as string),
        instructions: JSON.parse(record.get('instructions') as string || '[]'),
        servings: record.get('servings') as number,
        preparationTime: record.get('preparationTime') as number,
        cookingTime: record.get('cookingTime') as number,
        difficulty: record.get('difficulty') as 'Facile' | 'Moyen' | 'Difficile',
        category: record.get('category') as string,
        imageUrl: record.get('imageUrl') as string,
        isPublic: record.get('isPublic') as boolean,
        authorID: record.get('authorID') as string,
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
        likes: record.get('likes') as number,
        nutritionalAnalysis: record.get('nutritionalAnalysis') ? JSON.parse(record.get('nutritionalAnalysis') as string) : undefined
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche de recettes:', error);
      throw new Error('Erreur lors de la recherche de recettes');
    }
  },

  async getAllIngredients() {
    try {
      const records = await base('Ingredients').select().all();
      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        calories: record.get('calories') as number,
        proteins: record.get('proteins') as number,
        carbs: record.get('carbs') as number,
        fats: record.get('fats') as number,
        vitamins: (record.get('vitamins') as string).split(','),
        minerals: (record.get('minerals') as string).split(','),
        allergens: (record.get('allergens') as string).split(','),
        unit: record.get('unit') as string
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des ingrédients:', error);
      throw new Error('Erreur lors de la récupération des ingrédients');
    }
  },

  async createRecipe(recipe: Omit<Recipe, 'id'>) {
    try {
      const record = await base('Recipes').create({
        name: recipe.name,
        description: recipe.description,
        ingredients: JSON.stringify(recipe.ingredients),
        instructions: JSON.stringify(recipe.instructions),
        servings: recipe.servings,
        preparationTime: recipe.preparationTime,
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        category: recipe.category,
        imageUrl: recipe.imageUrl,
        isPublic: recipe.isPublic,
        authorID: recipe.authorID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        nutritionalAnalysis: recipe.nutritionalAnalysis ? JSON.stringify(recipe.nutritionalAnalysis) : null
      });

      return {
        id: record.id,
        ...recipe
      };
    } catch (error) {
      console.error('Erreur lors de la création de la recette:', error);
      throw new Error('Erreur lors de la création de la recette');
    }
  }
}; 