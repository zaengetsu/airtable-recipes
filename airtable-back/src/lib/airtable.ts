import Airtable, { Base } from 'airtable';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

console.log('Initialisation Airtable avec :');
console.log('API Key:', process.env.AIRTABLE_API_KEY ? 'Présente' : 'Manquante');
console.log('Base ID:', process.env.AIRTABLE_BASE_ID ? 'Présent' : 'Manquant');

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  throw new Error('Configuration Airtable manquante. Vérifiez votre fichier .env.local');
}

// Instance unique de la base Airtable
const base: Base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

export const testConnection = async (): Promise<boolean> => {
  try {
    await base('Recipes').select({ maxRecords: 1 }).firstPage();
    console.log('✅ Connexion à Airtable réussie');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à Airtable:', error);
    return false;
  }
};

export const tables = {
  recipes: base('Recipes'),
  users: base('Users'),
  ingredients: base('Ingredients'),
  allergies: base('Allergies'),
  nutritionalAnalysis: base('NutritionalAnalysis'),
  projects: base('Projects'),
  comments: base('Comments')
};

export default base;

testConnection();