import React from 'react';
import { RecipeCard } from '@/components/RecipeCard';
import { Recipe } from '@/types/recipe';
import Header from '@/components/Header';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function getRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${API_URL}/recipes`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Recettes de cuisine</h1>
          <Link 
            href="/recipes/new"
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Créer une recette
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </main>
    </div>
  );
}
