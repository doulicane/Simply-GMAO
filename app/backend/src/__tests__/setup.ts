/**
 * Setup global pour les tests Vitest backend
 */

import { config } from 'dotenv';
import path from 'path';

// Charger .env.test AVANT tout import qui touche env.ts
config({ path: path.resolve(__dirname, '../../.env.test') });

// S'assurer que NODE_ENV est 'test'
process.env.NODE_ENV = 'test';
