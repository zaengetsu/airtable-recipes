import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/error.types';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Erreur Airtable
  if (err.name === 'AirtableError') {
    return res.status(500).json({
      status: 'error',
      message: 'Erreur lors de l\'interaction avec Airtable',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // Erreur par défaut
  return res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 