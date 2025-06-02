'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Recipe } from '@/types/recipe';
import { RecipeCard } from './RecipeCard';

interface Message {
  type: 'user' | 'assistant';
  content: string;
  recipes?: Recipe[];
  containsRecipe?: boolean;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/create-recipe`, {
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
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold">Assistant Recettes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-lg rounded-tr-none'
                  : 'bg-gray-100 text-gray-800 rounded-lg rounded-tl-none'
              } p-3`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.recipes && message.recipes.map((recipe, idx) => (
                  <div key={idx} className="mt-4 bg-white rounded-lg p-4 shadow">
                    <RecipeCard recipe={recipe} />
                    <button
                      onClick={() => handleCreateRecipe(recipe)}
                      className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Créer cette recette
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Décrivez vos ingrédients ou demandez une recette..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
      </div>
    </>
  );
} 