import { AirtableError, AirtableRecipe } from '../types/airtable.types';
import { tables } from '../lib/airtable';

const parseIngredients = (ingredientsString: string) => {
  if (!ingredientsString) return [];
  return ingredientsString.split(', ').map(ing => ({
    id: '',
    name: ing,
    quantity: 0,
    unit: ''
  }));
};

export const recipeService = {
  async getAllRecipes(): Promise<AirtableRecipe[]> {
    try {
      const records = await tables.recipes.select().all();
      return records.map(record => {
        const ingredients = parseIngredients(record.get('ingredients') as string);
        const instructions = (record.get('instructions') as string).split('\n');
        return {
          id: record.id,
          name: record.get('name') as string,
          description: record.get('description') as string,
          ingredients: ingredients,
          instructions: instructions,
          servings: record.get('servings') as number,
          preparationTime: record.get('preparationTime') as number,
          cookingTime: record.get('cookingTime') as number,
          difficulty: record.get('difficulty') as 'Facile' | 'Moyen' | 'Difficile',
          category: record.get('category') as string,
          imageUrl: record.get('imageUrl') as string | undefined,
          isPublic: record.get('isPublic') as boolean,
          authorID: record.get('authorID') as string,
          createdAt: record.get('createdAt') as string,
          updatedAt: record.get('updatedAt') as string,
          likes: record.get('likes') as number,
          nutritionalAnalysis: undefined
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new AirtableError(`Erreur lors de la récupération des recettes: ${errorMessage}`);
    }
  },

  async getRecipeById(id: string): Promise<AirtableRecipe | null> {
    try {
      const record = await tables.recipes.find(id);
      return {
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        ingredients: parseIngredients(record.get('ingredients') as string),
        instructions: JSON.parse(record.get('instructions') as string || '[]'),
        servings: record.get('servings') as number,
        preparationTime: record.get('preparationTime') as number,
        cookingTime: record.get('cookingTime') as number,
        difficulty: record.get('difficulty') as 'Facile' | 'Moyen' | 'Difficile',
        category: record.get('category') as string,
        imageUrl: record.get('imageUrl') as string | undefined,
        isPublic: record.get('isPublic') as boolean,
        authorID: record.get('authorID') as string,
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
        likes: record.get('likes') as number,
        nutritionalAnalysis: record.get('nutritionalAnalysis') ? JSON.parse(record.get('nutritionalAnalysis') as string) : undefined,
      };
    } catch (error) {
      if ((error as any).error === 'NOT_FOUND') {
        return null;
      }
      throw new AirtableError('Error fetching recipe');
    }
  },

  async createRecipe(recipe: Omit<AirtableRecipe, 'id' | 'createdAt' | 'updatedAt' | 'likes'>): Promise<AirtableRecipe> {
    try {
      // Préparer les ingrédients comme une chaîne simple
      const ingredientsField = recipe.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join(', ');
      // Utiliser l'authorID de l'utilisateur connecté ou "chef" par défaut
      const authorID = "chef";
      const record = await tables.recipes.create({
        name: recipe.name,
        description: recipe.description,
        ingredients: ingredientsField,
        instructions: JSON.stringify(recipe.instructions),
        servings: recipe.servings,
        preparationTime: recipe.preparationTime,
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        category: recipe.category,
        imageUrl: recipe.imageUrl,
        isPublic: recipe.isPublic,
        authorID: authorID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        nutritionalAnalysis: recipe.nutritionalAnalysis ? JSON.stringify(recipe.nutritionalAnalysis) : undefined,
      });
      return {
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        ingredients: parseIngredients(record.get('ingredients') as string),
        instructions: JSON.parse(record.get('instructions') as string || '[]'),
        servings: record.get('servings') as number,
        preparationTime: record.get('preparationTime') as number,
        cookingTime: record.get('cookingTime') as number,
        difficulty: record.get('difficulty') as 'Facile' | 'Moyen' | 'Difficile',
        category: record.get('category') as string,
        imageUrl: record.get('imageUrl') as string | undefined,
        isPublic: record.get('isPublic') as boolean,
        authorID: record.get('authorID') as string,
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
        likes: record.get('likes') as number,
        nutritionalAnalysis: record.get('nutritionalAnalysis') ? JSON.parse(record.get('nutritionalAnalysis') as string) : undefined,
      };
    } catch (error) {
      throw new AirtableError('Erreur lors de la création de la recette');
    }
  },

  async updateRecipe(id: string, data: Partial<AirtableRecipe>): Promise<AirtableRecipe> {
    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.ingredients) updateData.ingredients = data.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join(', ');
      if (data.instructions) updateData.instructions = JSON.stringify(data.instructions);
      if (data.servings) updateData.servings = data.servings;
      if (data.preparationTime) updateData.preparationTime = data.preparationTime;
      if (data.cookingTime) updateData.cookingTime = data.cookingTime;
      if (data.difficulty) updateData.difficulty = data.difficulty;
      if (data.category) updateData.category = data.category;
      if (data.imageUrl) updateData.imageUrl = data.imageUrl;
      if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
      if (data.authorID) updateData.authorID = data.authorID;
      if (data.nutritionalAnalysis) updateData.nutritionalAnalysis = JSON.stringify(data.nutritionalAnalysis);
      const record = await tables.recipes.update(id, updateData);
      return {
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        ingredients: parseIngredients(record.get('ingredients') as string),
        instructions: JSON.parse(record.get('instructions') as string || '[]'),
        servings: record.get('servings') as number,
        preparationTime: record.get('preparationTime') as number,
        cookingTime: record.get('cookingTime') as number,
        difficulty: record.get('difficulty') as 'Facile' | 'Moyen' | 'Difficile',
        category: record.get('category') as string,
        imageUrl: record.get('imageUrl') as string | undefined,
        isPublic: record.get('isPublic') as boolean,
        authorID: record.get('authorID') as string,
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
        likes: record.get('likes') as number,
        nutritionalAnalysis: record.get('nutritionalAnalysis') ? JSON.parse(record.get('nutritionalAnalysis') as string) : undefined,
      };
    } catch (error) {
      throw new AirtableError('Error updating recipe');
    }
  },

  async deleteRecipe(id: string): Promise<void> {
    try {
      await tables.recipes.destroy(id);
    } catch (error) {
      throw new AirtableError('Erreur lors de la suppression de la recette');
    }
  },

  async searchRecipes(query: string): Promise<AirtableRecipe[]> {
    try {
      const records = await tables.recipes.select({
        filterByFormula: `OR(
          FIND('${query}', {name}) > 0,
          FIND('${query}', {description}) > 0,
          FIND('${query}', {ingredients}) > 0,
          FIND('${query}', {category}) > 0
        )`
      }).all();
      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        ingredients: parseIngredients(record.get('ingredients') as string),
        instructions: JSON.parse(record.get('instructions') as string || '[]'),
        servings: record.get('servings') as number,
        preparationTime: record.get('preparationTime') as number,
        cookingTime: record.get('cookingTime') as number,
        difficulty: record.get('difficulty') as 'Facile' | 'Moyen' | 'Difficile',
        category: record.get('category') as string,
        imageUrl: record.get('imageUrl') as string | undefined,
        isPublic: record.get('isPublic') as boolean,
        authorID: record.get('authorID') as string,
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
        likes: record.get('likes') as number,
        nutritionalAnalysis: record.get('nutritionalAnalysis') ? JSON.parse(record.get('nutritionalAnalysis') as string) : undefined,
      }));
    } catch (error) {
      throw error;
    }
  },

  async getRecipesByCategory(category: string): Promise<AirtableRecipe[]> {
    try {
      const records = await tables.recipes.select({
        filterByFormula: `{category} = '${category}'`
      }).all();
      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        ingredients: parseIngredients(record.get('ingredients') as string),
        instructions: JSON.parse(record.get('instructions') as string || '[]'),
        servings: record.get('servings') as number,
        preparationTime: record.get('preparationTime') as number,
        cookingTime: record.get('cookingTime') as number,
        difficulty: record.get('difficulty') as 'Facile' | 'Moyen' | 'Difficile',
        category: record.get('category') as string,
        imageUrl: record.get('imageUrl') as string | undefined,
        isPublic: record.get('isPublic') as boolean,
        authorID: record.get('authorID') as string,
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
        likes: record.get('likes') as number,
        nutritionalAnalysis: record.get('nutritionalAnalysis') ? JSON.parse(record.get('nutritionalAnalysis') as string) : undefined,
      }));
    } catch (error) {
      throw error;
    }
  },

  async getRecipesByDifficulty(difficulty: string): Promise<AirtableRecipe[]> {
    try {
      const records = await tables.recipes.select({
        filterByFormula: `{difficulty} = '${difficulty}'`
      }).all();
      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        ingredients: parseIngredients(record.get('ingredients') as string),
        instructions: JSON.parse(record.get('instructions') as string || '[]'),
        servings: record.get('servings') as number,
        preparationTime: record.get('preparationTime') as number,
        cookingTime: record.get('cookingTime') as number,
        difficulty: record.get('difficulty') as 'Facile' | 'Moyen' | 'Difficile',
        category: record.get('category') as string,
        imageUrl: record.get('imageUrl') as string | undefined,
        isPublic: record.get('isPublic') as boolean,
        authorID: record.get('authorID') as string,
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
        likes: record.get('likes') as number,
        nutritionalAnalysis: record.get('nutritionalAnalysis') ? JSON.parse(record.get('nutritionalAnalysis') as string) : undefined,
      }));
    } catch (error) {
      throw error;
    }
  },
}; 