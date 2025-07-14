'use client';

import React, { useState } from 'react';
import { RecipeCard } from '@/components/RecipeCard';
import { Recipe } from '@/types/recipe';
import ChatDrawer from '@/components/ChatDrawer';
import { LifebuoyIcon, NewspaperIcon, PhoneIcon, SparklesIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/20/solid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const features = [
  {
    name: 'Recettes Personnalisées',
    description: 'Découvrez des recettes adaptées à vos goûts et préférences alimentaires grâce à notre IA intelligente.',
    icon: SparklesIcon,
  },
  {
    name: 'Communauté Active',
    description: 'Partagez vos créations culinaires avec une communauté passionnée de cuisiniers du monde entier.',
    icon: UserGroupIcon,
  },
  {
    name: 'Temps de Préparation',
    description: 'Trouvez des recettes qui s\'adaptent à votre emploi du temps avec des temps de préparation optimisés.',
    icon: ClockIcon,
  },
];

const stats = [
  { id: 1, name: 'Recettes disponibles', value: '500+' },
  { id: 2, name: 'Utilisateurs actifs', value: '10,000+' },
  { id: 3, name: 'Temps moyen de préparation', value: '25 min' },
  { id: 4, name: 'Note moyenne', value: '4.8/5' },
];

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [recipeToAnalyze, setRecipeToAnalyze] = useState<Recipe | null>(null);
  const [openedRecipeId, setOpenedRecipeId] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch(`${API_URL}/recipes`, {
          cache: 'no-store'
        });
        if (!res.ok) throw new Error('Failed to fetch recipes');
        const data = await res.json();
        setRecipes(data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Ouvre le drawer si l'URL contient #details?recipeId=...
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#details?recipeId=')) {
        const recipeId = hash.split('=')[1];
        const found = recipes.find(r => r.id === recipeId);
        if (found) {
          setRecipeToAnalyze(found);
          setIsChatOpen(true);
          setOpenedRecipeId(null); // Ferme la modale de détails
        }
      }
    }
  }, [recipes]);

  const handleAnalyze = (recipe: Recipe) => {
    setRecipeToAnalyze(recipe);
    setIsChatOpen(true);
    setOpenedRecipeId(null); // Ferme la modale de détails
    window.location.hash = `details?recipeId=${recipe.id}`;
  };

  const handleOpenDetails = (recipeId: string) => {
    setOpenedRecipeId(recipeId);
    setRecipeToAnalyze(null); // Ferme le drawer d'analyse
    setIsChatOpen(false);
    window.location.hash = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        <img
          alt="Cuisine moderne"
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-y=.8&w=2830&h=1500&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
          className="absolute inset-0 -z-10 size-full object-cover object-right md:object-center"
        />
        <div className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl">
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          />
        </div>
        <div className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu">
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-[#ff4694] to-[#776fff] opacity-20"
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">Découvrez la cuisine autrement</h2>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
              Créez, partagez et découvrez des recettes délicieuses avec notre communauté de passionnés de cuisine. 
              L'IA vous aide à personnaliser vos plats selon vos goûts et préférences.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Créer ma recette
              </button>
              <a href="#recettes" className="text-sm font-semibold leading-6 text-black hover:text-gray-800">
                Voir les recettes <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex gap-x-4 rounded-xl bg-white/5 p-6 ring-1 ring-inset ring-white/5 backdrop-blur"
              >
                <feature.icon aria-hidden="true" className="h-7 w-5 flex-none text-indigo-400" />
                <div className="text-base/7">
                  <h3 className="font-semibold text-white">{feature.name}</h3>
                  <p className="mt-2 text-gray-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                AirCook en chiffres
              </h2>
              <p className="mt-4 text-lg/8 text-gray-600">Une communauté grandissante de passionnés de cuisine</p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.id} className="flex flex-col bg-gray-400/5 p-8">
                  <dt className="text-sm/6 font-semibold text-gray-600">{stat.name}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Recipes Section */}
      <div id="recettes" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Dernières recettes
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Découvrez les créations de notre communauté
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64 mt-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onAnalyze={handleAnalyze}
                  open={openedRecipeId === recipe.id}
                  onOpenDetails={() => handleOpenDetails(recipe.id)}
                  onCloseDetails={() => setOpenedRecipeId(null)}
                />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Créer ma propre recette
            </button>
          </div>
        </div>
      </div>
      <ChatDrawer isOpen={isChatOpen} onClose={() => { setIsChatOpen(false); setRecipeToAnalyze(null); window.location.hash = ''; }} recipeToAnalyze={recipeToAnalyze} />
    </div>
  );
}
