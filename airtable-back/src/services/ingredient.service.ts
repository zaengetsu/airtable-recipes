import { AirtableError, AirtableIngredient } from '../types/airtable.types';
import { tables } from '../lib/airtable';

export const ingredientService = {
  async getAllIngredients(): Promise<AirtableIngredient[]> {
    try {
      const records = await tables.ingredients.select().all();
      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        calories: record.get('calories') as number,
        proteins: record.get('proteins') as number,
        carbs: record.get('carbs') as number,
        fats: record.get('fats') as number,
        vitamins: record.get('vitamins') as string[] || [],
        minerals: record.get('minerals') as string[] || [],
        allergens: record.get('allergens') as string[] || [],
        unit: record.get('unit') as string,
      }));
    } catch (error) {
      throw new AirtableError('Erreur lors de la récupération des ingrédients');
    }
  },

  async getIngredientById(id: string): Promise<AirtableIngredient | null> {
    try {
      const record = await tables.ingredients.find(id);
      return {
        id: record.id,
        name: record.get('name') as string,
        calories: record.get('calories') as number,
        proteins: record.get('proteins') as number,
        carbs: record.get('carbs') as number,
        fats: record.get('fats') as number,
        vitamins: record.get('vitamins') as string[] || [],
        minerals: record.get('minerals') as string[] || [],
        allergens: record.get('allergens') as string[] || [],
        unit: record.get('unit') as string,
      };
    } catch (error) {
      if ((error as any).error === 'NOT_FOUND') {
        return null;
      }
      throw new AirtableError('Erreur lors de la récupération de l\'ingrédient');
    }
  },

  async getIngredientByName(name: string): Promise<AirtableIngredient | null> {
    try {
      const records = await tables.ingredients
        .select({ filterByFormula: `{name} = '${name}'`, maxRecords: 1 })
        .firstPage();
      if (records.length === 0) return null;
      const record = records[0];
      return {
        id: record.id,
        name: record.get('name') as string,
        calories: record.get('calories') as number,
        proteins: record.get('proteins') as number,
        carbs: record.get('carbs') as number,
        fats: record.get('fats') as number,
        vitamins: record.get('vitamins') as string[] || [],
        minerals: record.get('minerals') as string[] || [],
        allergens: record.get('allergens') as string[] || [],
        unit: record.get('unit') as string,
      };
    } catch (error) {
      throw new AirtableError('Erreur lors de la récupération de l\'ingrédient par nom');
    }
  },

  async searchIngredients(query: string): Promise<AirtableIngredient[]> {
    const allIngredients = await this.getAllIngredients();
    return allIngredients.filter(ingredient =>
      ingredient.name.toLowerCase().includes(query.toLowerCase())
    );
  },
}; 