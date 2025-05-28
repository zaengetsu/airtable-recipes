import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/error.types';

export const validateRecipe = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, ingredients, instructions, servings, preparationTime, cookingTime, difficulty, category } = req.body;

  if (!name || typeof name !== 'string' || name.length < 3) {
    throw new ValidationError('Le nom de la recette est requis et doit faire au moins 3 caractères');
  }

  if (!description || typeof description !== 'string' || description.length < 10) {
    throw new ValidationError('La description est requise et doit faire au moins 10 caractères');
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new ValidationError('Au moins un ingrédient est requis');
  }

  if (!instructions || typeof instructions !== 'string' || instructions.length < 20) {
    throw new ValidationError('Les instructions sont requises et doivent faire au moins 20 caractères');
  }

  if (!servings || typeof servings !== 'number' || servings < 1) {
    throw new ValidationError('Le nombre de portions doit être un nombre positif');
  }

  if (!preparationTime || typeof preparationTime !== 'number' || preparationTime < 0) {
    throw new ValidationError('Le temps de préparation doit être un nombre positif');
  }

  if (!cookingTime || typeof cookingTime !== 'number' || cookingTime < 0) {
    throw new ValidationError('Le temps de cuisson doit être un nombre positif');
  }

  if (!difficulty || !['Facile', 'Moyen', 'Difficile'].includes(difficulty)) {
    throw new ValidationError('La difficulté doit être Facile, Moyen ou Difficile');
  }

  if (!category || typeof category !== 'string') {
    throw new ValidationError('La catégorie est requise');
  }

  next();
};

export const validateNutritionalAnalysis = (req: Request, res: Response, next: NextFunction) => {
  const { totalCalories, totalProteins, totalCarbs, totalFats, vitamins, minerals, allergens } = req.body;

  if (typeof totalCalories !== 'number' || totalCalories < 0) {
    throw new ValidationError('Les calories totales doivent être un nombre positif');
  }

  if (typeof totalProteins !== 'number' || totalProteins < 0) {
    throw new ValidationError('Les protéines totales doivent être un nombre positif');
  }

  if (typeof totalCarbs !== 'number' || totalCarbs < 0) {
    throw new ValidationError('Les glucides totaux doivent être un nombre positif');
  }

  if (typeof totalFats !== 'number' || totalFats < 0) {
    throw new ValidationError('Les lipides totaux doivent être un nombre positif');
  }

  if (!vitamins || typeof vitamins !== 'object') {
    throw new ValidationError('Les vitamines sont requises');
  }

  if (!minerals || typeof minerals !== 'object') {
    throw new ValidationError('Les minéraux sont requis');
  }

  if (!Array.isArray(allergens)) {
    throw new ValidationError('Les allergènes doivent être un tableau');
  }

  next();
}; 