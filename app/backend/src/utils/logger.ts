/**
 * =============================================================================
 * Logger — Configuration Winston
 * =============================================================================
 * Logger structure avec rotation et niveaux de log configurables.
 * Formats :
 *   - Console : colore, lisible pour le developpement
 *   - Fichier : JSON, pour l'aggregation et l'analyse
 * =============================================================================
 */

import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, json, printf, colorize, errors } = format;

// ---------------------------------------------------------------------------
// Format personnalise pour la console
// ---------------------------------------------------------------------------
const consoleFormat = printf(
  ({ level, message, timestamp: ts, stack, ...metadata }) => {
    let msg = `${ts} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    if (stack) {
      msg += `\n${stack}`;
    }
    return msg;
  }
);

// ---------------------------------------------------------------------------
// Configuration du logger
// ---------------------------------------------------------------------------
const logLevel = process.env.LOG_LEVEL ?? 'info';

export const logger: Logger = createLogger({
  level: logLevel,
  defaultMeta: {
    service: 'gmao-ramondin-api',
    env: process.env.NODE_ENV ?? 'development',
  },
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    // Fichier JSON (production)
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10 Mo
      maxFiles: 5,
    }),
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10 Mo
      maxFiles: 5,
    }),
  ],
});

// ---------------------------------------------------------------------------
// Console en mode developpement
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    })
  );
}

export default logger;
