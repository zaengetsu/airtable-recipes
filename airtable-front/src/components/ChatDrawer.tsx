'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Recipe } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';
import TypingIndicator from './TypingIndicator';
import ReactMarkdown from 'react-markdown';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  recipes?: Recipe[];
  containsRecipe?: boolean;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToAnalyze?: Recipe | null;
}

export default function ChatDrawer({ isOpen, onClose, recipeToAnalyze }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  // Charger les messages depuis le localStorage au montage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Erreur lors du chargement des messages:', error);
        }
      }
    }
  }, []);

  // Sauvegarder les messages dans le localStorage à chaque changement
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Si une recette à analyser est passée, lancer l'analyse automatiquement
  useEffect(() => {
    if (isOpen && recipeToAnalyze) {
      setMessages([]);
      setAnalysisResult(null);
      (async () => {
        setIsLoading(true);
        try {
          // Analyser la nutrition via le backend (comme le chat)
          const ingredients = recipeToAnalyze.ingredients.map(ing => ing.name).join(', ');
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/ai/analyze-nutrition`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              recipeName: recipeToAnalyze.name,
              ingredients: ingredients
            })
          });

          if (!response.ok) throw new Error('Erreur lors de l\'analyse nutritionnelle');
          const data = await response.json();
          setAnalysisResult(data.analysis || 'Analyse nutritionnelle indisponible.');
        } catch (error) {
          console.error('Erreur analyse nutritionnelle:', error);
          
          let errorMessage = 'Erreur lors de l\'analyse nutritionnelle.';
          
          if (error instanceof Error) {
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
              errorMessage = `## ❌ **Erreur d'authentification**

La clé API Groq n'est pas valide ou a expiré.

**Solutions :**
1. Vérifiez votre clé API dans le fichier \`.env.local\`
2. Assurez-vous que la clé commence par \`gsk_\`
3. Régénérez une nouvelle clé sur https://console.groq.com/`;
            } else if (error.message.includes('429') || error.message.includes('rate limit')) {
              errorMessage = `## ⏱️ **Limite de requêtes atteinte**

Vous avez atteint la limite de requêtes de l'API Groq.

**Solutions :**
1. Attendez quelques minutes avant de réessayer
2. Vérifiez votre quota sur https://console.groq.com/
3. Passez à un plan payant si nécessaire`;
            } else if (error.message.includes('fetch')) {
              errorMessage = `## 🌐 **Erreur de connexion**

Impossible de se connecter à l'API Groq.

**Solutions :**
1. Vérifiez votre connexion internet
2. Vérifiez que l'API Groq est accessible
3. Réessayez dans quelques instants`;
            }
          }
          
          setAnalysisResult(errorMessage);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [isOpen, recipeToAnalyze]);

  // Message d'accueil automatique à la première ouverture
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: 'assistant',
          content: `Bonjour 👋 Je suis l’Assistant AirCook !\n\nPose-moi une question, décris-moi tes ingrédients ou demande-moi de t’inventer une recette personnalisée.\n\nJe peux aussi t’aider à améliorer une recette existante ou te donner des conseils culinaires. 🍳🥗`,
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: userMessage,
          conversationHistory: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la communication avec le serveur');

      const data = await response.json();
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: data.message,
        recipes: data.recipes,
        containsRecipe: data.containsRecipe
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecipe = async (recipeData: Recipe) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/ai/create-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeData })
      });

      if (!response.ok) throw new Error('Erreur lors de la création de la recette');

      const data = await response.json();
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Recette créée avec succès ! Vous pouvez la retrouver dans la liste des recettes.'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'Erreur lors de la création de la recette. Veuillez réessayer.'
      }]);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[700px] max-w-full bg-gradient-to-br from-white via-gray-50 to-gray-200 shadow-2xl rounded-l-3xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-gray-100 via-white to-gray-50 rounded-tl-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <img src="/aircooklogo.png" alt="AirCook Logo" className="h-10 w-auto" />
            Assistant Recettes
          </h2>
          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <button
                onClick={clearChatHistory}
                className="text-gray-400 hover:text-red-500 bg-gray-100 rounded-full p-2 transition-colors shadow"
                aria-label="Effacer l'historique"
                title="Effacer l'historique"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-2 transition-colors shadow"
              aria-label="Fermer le chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Card compacte de la recette à analyser */}
        {recipeToAnalyze && (
          <div className="p-6 border-b bg-white rounded-none flex items-center gap-6">
            <img src={recipeToAnalyze.imageUrl || '/aircooklogo.png'} alt={recipeToAnalyze.name} className="h-24 w-32 object-cover rounded-xl border" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{recipeToAnalyze.name}</h3>
              <div className="text-gray-600 text-sm mb-2 line-clamp-2">{recipeToAnalyze.description}</div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{recipeToAnalyze.preparationTime + recipeToAnalyze.cookingTime} min</span>
                <span>{recipeToAnalyze.servings} pers.</span>
                <span>{recipeToAnalyze.difficulty}</span>
              </div>
            </div>
          </div>
        )}
        {/* Résultat de l'analyse nutritionnelle */}
        {recipeToAnalyze && (
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center text-gray-500">Analyse en cours...</div>
            ) : (
              <div className="bg-gray-100 rounded-xl p-4 text-gray-900 max-w-none">
                <ReactMarkdown 
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold mb-2 mt-4">
                        {children}
                      </h2>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">
                        {children}
                      </strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 my-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 my-2">
                        {children}
                      </ol>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2">
                        {children}
                      </p>
                    )
                  }}
                >
                  {analysisResult}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
        {/* Chat classique si pas d'analyse */}
        {!recipeToAnalyze && (
          <>
            <div className="h-[calc(100%-10.5rem)] overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-black text-white rounded-2xl rounded-tr-none shadow-lg'
                      : 'bg-white/80 text-gray-900 rounded-2xl rounded-tl-none border border-gray-200 shadow'
                  } p-4`}> 
                    <div className="text-base leading-relaxed">
                      <ReactMarkdown 
                        components={{
                          table: ({ children }) => (
                            <table className="w-full border-collapse border border-gray-300 my-4 bg-white">
                              {children}
                            </table>
                          ),
                        th: ({ children }) => (
                          <th className="border border-gray-300 px-3 py-2 text-sm font-semibold bg-gray-50">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-gray-300 px-3 py-2 text-sm">
                            {children}
                          </td>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-bold mb-2 mt-4">
                            {children}
                          </h2>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">
                            {children}
                          </em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 my-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-1 my-2">
                            {children}
                          </ol>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    </div>
                    {message.recipes && message.recipes.map((recipe, idx) => (
                      <div key={idx} className="mt-4 bg-white rounded-xl p-4 shadow border border-gray-100">
                        <RecipeCard recipe={recipe} />
                        <button
                          onClick={() => handleCreateRecipe(recipe)}
                          className="mt-2 w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow"
                        >
                          Créer cette recette
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && <TypingIndicator isVisible={true} />}
              <div ref={messagesEndRef} />
            </div>
            {/* Input */}
            <form onSubmit={handleSubmit} className="p-6 border-t bg-gradient-to-r from-gray-100 via-white to-gray-50 rounded-bl-3xl">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Décrivez vos ingrédients ou demandez une recette..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white shadow-sm text-base"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow disabled:opacity-50"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
} 