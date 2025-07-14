import Airtable from 'airtable';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

// Mappings des mots-clés pour les allergies courantes
const allergyKeywords: { [key: string]: string[] } = {
  'Gluten': ['blé', 'farine', 'pain', 'pâtes', 'semoule', 'couscous', 'orge', 'seigle', 'avoine', 'boulgour', 'épeautre'],
  'Lactose': ['lait', 'crème', 'beurre', 'fromage', 'yaourt', 'lactose', 'lactosérum', 'caséine'],
  'Œuf': ['œuf', 'oeuf', 'jaune', 'blanc d\'œuf', 'blanc d\'oeuf', 'ovalbumine', 'ovomucoïde'],
  'Arachides': ['arachide', 'cacahuète', 'cacahuete', 'peanut', 'beurre de cacahuète'],
  'Noix': ['noix', 'amande', 'noisette', 'pistache', 'noix de cajou', 'noix de pécan', 'noix de macadamia', 'pignon'],
  'Poisson': ['poisson', 'saumon', 'thon', 'cabillaud', 'morue', 'sardine', 'maquereau', 'anchois'],
  'Mollusques': ['mollusque', 'moule', 'huître', 'huitre', 'palourde', 'coquille saint-jacques', 'bulot', 'bigorneau'],
  'Soja': ['soja', 'soya', 'tofu', 'sauce soja', 'miso', 'tempeh', 'edamame'],
  'Céleri': ['céleri', 'celeri', 'céleri-rave', 'celeri-rave'],
  'Moutarde': ['moutarde', 'graine de moutarde'],
  'Sésame': ['sésame', 'sesame', 'tahini', 'huile de sésame', 'graine de sésame'],
  'Sulfites': ['sulfite', 'sulfite de sodium', 'métabisulfite', 'dioxyde de soufre']
};

async function updateAllergiesKeywords() {
  try {
    console.log('Récupération des allergies existantes...');
    const records = await base('Allergies').select().all();
    
    console.log(`Trouvé ${records.length} allergies à mettre à jour`);
    
    for (const record of records) {
      const allergyName = record.get('name') as string;
      const keywords = allergyKeywords[allergyName];
      
      if (keywords) {
        console.log(`Mise à jour de "${allergyName}" avec ${keywords.length} mots-clés`);
        
        await base('Allergies').update(record.id, {
          keywords: JSON.stringify(keywords)
        });
      } else {
        console.log(`Aucun mot-clé trouvé pour "${allergyName}"`);
      }
    }
    
    console.log('Mise à jour terminée !');
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  }
}

// Exécuter le script
updateAllergiesKeywords(); 