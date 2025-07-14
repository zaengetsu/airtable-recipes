import { AirtableError, AirtableAllergy } from '../types/airtable';
import { tables } from '../lib/airtable';

export const allergyService = {
  async getAllAllergies(): Promise<AirtableAllergy[]> {
    try {
      const records = await tables.allergies.select().all();
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
      const record = await tables.allergies.find(id);
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
}; 