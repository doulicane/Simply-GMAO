/**
 * =============================================================================
 * Configuration Swagger / OpenAPI
 * =============================================================================
 * Documentation interactive de l'API accessible sur /api/docs
 * =============================================================================
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GMAO Simply GMAO API',
      version: '1.0.0',
      description: 'API de gestion de maintenance assistee par ordinateur (GMAO) pour Simply GMAO.',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Serveur de developpement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentification et gestion des tokens' },
      { name: 'Equipements', description: 'Gestion des equipements industriels' },
      { name: 'Bons de travail', description: 'Work orders (BT) — creation, assignation, workflow' },
      { name: 'Stocks', description: 'Articles de stock et mouvements' },
      { name: 'Planification', description: 'Plans preventifs et calendrier' },
      { name: 'Preventif', description: 'Maintenance preventive' },
      { name: 'Documents', description: 'Documents et pieces jointes' },
      { name: 'Notifications', description: 'Notifications et alertes' },
      { name: 'Dashboard', description: 'KPIs et rapports' },
      { name: 'Audit', description: 'Journaux d\'audit' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
