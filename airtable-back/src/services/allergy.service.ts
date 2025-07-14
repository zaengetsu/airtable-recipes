import { AirtableError, AirtableAllergy } from '../types/airtable';
import { tables } from '../lib/airtable';

// Fonction utilitaire pour normaliser le texte (supprimer accents et caractères spéciaux)
const normalizeText = (text: string): string => {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae');
};

export const allergyService = {
  async getAllAllergies(search?: string): Promise<AirtableAllergy[]> {
    try {
      const records = await tables.allergies.select().all();
      
      let allergies = records.map(record => ({
        id: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        keywords: record.get('keywords') ? JSON.parse(record.get('keywords') as string) : [],
        createdAt: record.get('createdAt') as string,
        updatedAt: record.get('updatedAt') as string,
      }));
            
      if (search && search.trim()) {
        const normalizedSearch = normalizeText(search.trim());
        
        allergies = allergies.filter(allergy => {
          const nameMatch = normalizeText(allergy.name).includes(normalizedSearch);
          const descriptionMatch = normalizeText(allergy.description).includes(normalizedSearch);
          const keywordMatch = allergy.keywords.some((keyword: string) => 
            normalizeText(keyword).includes(normalizedSearch)
          );
          
          return nameMatch || descriptionMatch || keywordMatch;
        });
      }
      
      return allergies;
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