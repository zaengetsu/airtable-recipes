import { tables } from '../lib/airtable';

export const nutritionalAnalysisService = {
  async getNutritionalAnalysis(recipeId: string) {
    const record = await tables.recipes.find(recipeId);
    return record?.fields.nutritionalAnalysis || null;
  },

  async createNutritionalAnalysis(data: any) {
    return await tables.recipes.create(data);
  },

  async updateNutritionalAnalysis(id: string, data: any) {
    return await tables.recipes.update(id, data);
  },

  async deleteNutritionalAnalysis(id: string) {
    return await tables.recipes.destroy(id);
  }
}; 