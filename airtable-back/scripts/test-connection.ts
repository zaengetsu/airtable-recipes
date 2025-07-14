import Airtable from 'airtable';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

// Initialiser Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID || '');

async function testConnection() {
  try {
    console.log('Test de connexion à Airtable...');
    
    // Tenter d'accéder à une table pour tester la connexion
    const testTable = base('Users');
    const records = await testTable.select({ maxRecords: 1 }).all();
    console.log('Connexion réussie !');
    console.log('Table Users accessible, nombre d\'enregistrements :', records.length);
    
  } catch (error) {
    console.error('Erreur de connexion :', error);
    console.log('Vérifiez que :');
    console.log('1. Votre clé API est correcte');
    console.log('2. L\'ID de la base est correct');
    console.log('3. Les variables sont bien définies dans .env.local');
  }
}

// Exécuter le test
testConnection(); 