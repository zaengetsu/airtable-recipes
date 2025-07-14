import Airtable, { FieldSet, Record as AirtableRecord } from 'airtable';
import { AirtableError, AirtableUser, AirtableRecipe, AirtableIngredient, AirtableNutritionalAnalysis, AirtableAllergy } from '../types/airtable.types';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

console.log('Initialisation Airtable avec :');
console.log('API Key:', process.env.AIRTABLE_API_KEY ? 'Présente' : 'Manquante');
console.log('Base ID:', process.env.AIRTABLE_BASE_ID ? 'Présent' : 'Manquant');

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Configuration Airtable manquante. Vérifiez votre fichier .env.local');
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

// Fonction helper pour traiter les ingrédients
const parseIngredients = (ingredientsString: string) => {
  if (!ingredientsString) return [];
  return ingredientsString.split(', ').map(ing => ({
    id: '',
    name: ing,
    quantity: 0,
    unit: ''
  }));
};

// Vérifier la connexion à la base
base('Recipes').select({ maxRecords: 1 }).firstPage()
  .then(records => {
    console.log('Connexion à Airtable réussie');
    console.log('Nombre de tables accessibles:', records.length);
    console.log('Structure de la table Recipes:', records[0]?.fields);
  })
  .catch(error => {
    console.error('Erreur de connexion à Airtable:', error);
  });

export const airtableService = {
  // Recettes
  async getAllRecipes(): Promise<AirtableRecipe[]> {
    try {
      console.log('Tentative de récupération des recettes...');
      const records = await base('Recipes').select().all();
      console.log('Nombre de recettes trouvées:', records.length);
      
      return records.map(record => {
        try {
          const ingredients = parseIngredients(record.get('ingredients') as string);
          const instructions = (record.get('instructions') as string).split('\\n');
          
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
        } catch (parseError) {
          console.error('Erreur lors du parsing de la recette:', record.id, parseError);
          throw parseError;
        }
      });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new AirtableError(`Erreur lors de la récupération des recettes: ${errorMessage}`);
    }
  },

  async getRecipeById(id: string): Promise<AirtableRecipe | null> {
    try {
      const record = await base('Recipes').find(id);
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
      console.log('=== AIRTABLE CREATE RECIPE ===');
      console.log('Recipe data received:', JSON.stringify(recipe, null, 2));
      
      // Préparer les ingrédients comme une chaîne simple
      const ingredientsField = recipe.ingredients.map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`).join(', ');

      console.log('Ingrédients à envoyer:', ingredientsField);

      // Utiliser l'authorID de l'utilisateur connecté ou "chef" par défaut
      const authorID = "chef"; // Utiliser une valeur qui existe dans les options du Multiple Select

      const record = await base('Recipes').create({
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
      
      console.log('Airtable record created:', record.id);
      
      const createdRecipe = {
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
      
      console.log('Recipe object created:', createdRecipe.id);
      return createdRecipe;
    } catch (error) {
      console.error('Airtable createRecipe error:', error);
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

      const record = await base('Recipes').update(id, updateData);
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
      await base('Recipes').destroy(id);
    } catch (error) {
      throw new AirtableError('Erreur lors de la suppression de la recette');
    }
  },

  // Ingrédients
  async getAllIngredients(): Promise<AirtableIngredient[]> {
    try {
      console.log('=== GET ALL INGREDIENTS ===');
      console.log('Tentative d\'accès à la table Ingredients...');
      
      const records = await base('Ingredients').select().all();
      console.log('Records récupérés:', records.length);
      
      const ingredients = records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        calories: record.get('calories') as number,
        proteins: record.get('proteins') as number,
        carbs: record.get('carbs') as number,
        fats: record.get('fats') as number,
        vitamins: JSON.parse(record.get('vitamins') as string || '[]'),
        minerals: JSON.parse(record.get('minerals') as string || '[]'),
        allergens: JSON.parse(record.get('allergens') as string || '[]'),
        unit: record.get('unit') as string,
      }));
      
      console.log('Ingrédients mappés:', ingredients.length);
      return ingredients;
    } catch (error) {
      console.error('Erreur détaillée getAllIngredients:', error);
      throw new AirtableError('Erreur lors de la récupération des ingrédients');
    }
  },

  async getIngredientById(id: string): Promise<AirtableIngredient | null> {
    try {
      const record = await base('Ingredients').find(id);
      return {
        id: record.id,
        name: record.get('name') as string,
        calories: record.get('calories') as number,
        proteins: record.get('proteins') as number,
        carbs: record.get('carbs') as number,
        fats: record.get('fats') as number,
        vitamins: JSON.parse(record.get('vitamins') as string || '[]'),
        minerals: JSON.parse(record.get('minerals') as string || '[]'),
        allergens: JSON.parse(record.get('allergens') as string || '[]'),
        unit: record.get('unit') as string,
      };
    } catch (error) {
      if ((error as any).error === 'NOT_FOUND') {
        return null;
      }
      throw new AirtableError('Error fetching ingredient');
    }
  },

  async getIngredientByName(name: string): Promise<AirtableIngredient | null> {
    try {
      const records = await base('Ingredients')
        .select({
          filterByFormula: `{name} = '${name}'`,
          maxRecords: 1,
        })
        .firstPage();

      if (records.length === 0) {
        return null;
      }

      const record = records[0];
      return {
        id: record.id,
        name: record.get('name') as string,
        calories: record.get('calories') as number,
        proteins: record.get('proteins') as number,
        carbs: record.get('carbs') as number,
        fats: record.get('fats') as number,
        vitamins: JSON.parse(record.get('vitamins') as string || '[]'),
        minerals: JSON.parse(record.get('minerals') as string || '[]'),
        allergens: JSON.parse(record.get('allergens') as string || '[]'),
        unit: record.get('unit') as string,
      };
    } catch (error) {
      throw new AirtableError('Error fetching ingredient by name');
    }
  },

  // Utilisateurs
  async getUserByEmail(email: string): Promise<AirtableUser | null> {
    try {
      const records = await base('Users')
        .select({ filterByFormula: `{email} = '${email}'` })
        .firstPage();
      if (records.length === 0) {
        return null;
      }
      const record = records[0];
      return {
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      throw new AirtableError('Erreur lors de la récupération de l\'utilisateur');
    }
  },

  async createUser(user: Omit<AirtableUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AirtableUser> {
    try {
      const record = await base('Users').create({
        username: user.username,
        email: user.email,
        password: user.password,
        role: user.role,
        allergies: JSON.stringify(user.allergies),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return {
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      console.error('Erreur détaillée lors de la création de l\'utilisateur Airtable:', error);
      throw new AirtableError('Erreur lors de la création de l\'utilisateur');
    }
  },

  async getUserById(id: string): Promise<AirtableUser | null> {
    try {
      const record = await base('Users').find(id);
      return {
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      if ((error as any).error === 'NOT_FOUND') {
        return null;
      }
      throw new AirtableError('Error fetching user');
    }
  },

  async updateUser(id: string, data: Partial<AirtableUser>): Promise<AirtableUser> {
    try {
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (data.username) updateData.username = data.username;
      if (data.email) updateData.email = data.email;
      if (data.password) updateData.password = data.password;
      if (data.role) updateData.role = data.role;
      if (data.allergies) updateData.allergies = JSON.stringify(data.allergies);

      const record = await base('Users').update(id, updateData);
      return {
        id: record.id,
        username: record.get('username') as string,
        email: record.get('email') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'user' | 'admin',
        allergies: JSON.parse(record.get('allergies') as string || '[]'),
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      throw new AirtableError('Error updating user');
    }
  },

  // Allergies
  async getAllAllergies(): Promise<AirtableAllergy[]> {
    try {
      const records = await base('Allergies').select().all();
      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        keywords: record.get('keywords') ? JSON.parse(record.get('keywords') as string) : [],
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      }));
    } catch (error) {
      throw new AirtableError('Erreur lors de la récupération des allergies');
    }
  },

  async getAllergyById(id: string): Promise<AirtableAllergy | null> {
    try {
      const record = await base('Allergies').find(id);
      return {
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        keywords: record.get('keywords') ? JSON.parse(record.get('keywords') as string) : [],
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      };
    } catch (error) {
      if ((error as any).error === 'NOT_FOUND') {
        return null;
      }
      throw new AirtableError('Erreur lors de la récupération de l\'allergie');
    }
  },

  // Rechercher des recettes
  async searchRecipes(query: string): Promise<AirtableRecipe[]> {
    try {
      const records = await base('Recipes').select({
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
      console.error('Erreur lors de la recherche des recettes:', error);
      throw error;
    }
  },

  // Récupérer les recettes par catégorie
  async getRecipesByCategory(category: string): Promise<AirtableRecipe[]> {
    try {
      const records = await base('Recipes').select({
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
      console.error('Erreur lors de la récupération des recettes par catégorie:', error);
      throw error;
    }
  },

  // Récupérer les recettes par difficulté
  async getRecipesByDifficulty(difficulty: string): Promise<AirtableRecipe[]> {
    try {
      const records = await base('Recipes').select({
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
      console.error('Erreur lors de la récupération des recettes par difficulté:', error);
      throw error;
    }
  },

  async getNutritionalAnalysis(recipeId: string) {
    const record = await base('Recipes').find(recipeId);
    return record?.fields.nutritionalAnalysis || null;
  },

  async createNutritionalAnalysis(data: any) {
    return await base('Recipes').create(data);
  },

  async updateNutritionalAnalysis(id: string, data: any) {
    return await base('Recipes').update(id, data);
  },

  async deleteNutritionalAnalysis(id: string) {
    return await base('Recipes').destroy(id);
  }
}; 