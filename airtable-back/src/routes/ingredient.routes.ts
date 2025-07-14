import express from 'express';
import { airtableService } from '../lib/airtable.service';

const router = express.Router();

// Récupérer tous les ingrédients ou rechercher des ingrédients
router.get('/', async (req, res) => {
  try {
    console.log('=== ROUTE INGRÉDIENTS ===');
    const { search } = req.query;
    console.log('Search query:', search);
    
    if (search && typeof search === 'string') {
      // Recherche par nom d'ingrédient
      console.log('Recherche d\'ingrédients pour:', search);
      const allIngredients = await airtableService.getAllIngredients();
      console.log('Tous les ingrédients récupérés:', allIngredients.length);
      const filteredIngredients = allIngredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(search.toLowerCase())
      );
      console.log('Ingrédients filtrés:', filteredIngredients.length);
      res.json(filteredIngredients);
    } else {
      // Retourner tous les ingrédients
      console.log('Récupération de tous les ingrédients');
      const ingredients = await airtableService.getAllIngredients();
      console.log('Nombre d\'ingrédients:', ingredients.length);
      res.json(ingredients);
    }
  } catch (error) {
    console.error('Erreur dans la route ingrédients:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    res.status(500).json({ error: 'Erreur lors de la récupération des ingrédients', details: errorMessage });
  }
});

export default router; 