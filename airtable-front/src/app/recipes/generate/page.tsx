'use client';

import React from 'react';
import RecipeGenerator from '@/components/RecipeGenerator';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function GenerateRecipePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <RecipeGenerator />
      </div>
    </ProtectedRoute>
  );
} 