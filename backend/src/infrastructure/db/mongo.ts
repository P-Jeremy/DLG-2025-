import mongoose from 'mongoose';

const MONGO_LOG_PREFIX = '[MongoDB]';

function logMongo(level: 'INFO' | 'WARN' | 'ERROR', message: string, detail?: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${MONGO_LOG_PREFIX} [${level}] ${message}${detail ? `: ${detail}` : ''}`;
  level === 'ERROR' ? console.error(line) : console.log(line);
}

function registerConnectionEvents(): void {
  mongoose.connection.on('connected', () => logMongo('INFO', 'Connection established'));
  mongoose.connection.on('disconnected', () => logMongo('WARN', 'Disconnected — Mongoose will retry'));
  mongoose.connection.on('reconnected', () => logMongo('INFO', 'Reconnected'));
  mongoose.connection.on('error', (err: Error) => logMongo('ERROR', 'Connection error', err.message));
  mongoose.connection.on('close', () => logMongo('WARN', 'Connection closed'));
}

export async function connectMongo(uri: string): Promise<void> {
  registerConnectionEvents();

  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
  };

  try {
    logMongo('INFO', 'Connecting...');
    await mongoose.connect(uri, options);
  } catch (error) {
    logMongo('ERROR', 'Initial connection failed', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
