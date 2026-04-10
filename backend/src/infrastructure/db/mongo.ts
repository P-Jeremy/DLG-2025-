import mongoose from 'mongoose';

const MONGO_LOG_PREFIX = '[MongoDB]';
const SERVER_SELECTION_TIMEOUT_MS = 15_000;
const SOCKET_TIMEOUT_MS = 45_000;
const HEARTBEAT_FREQUENCY_MS = 10_000;

function logMongo(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${MONGO_LOG_PREFIX} [${level}] ${message}`;
  level === 'ERROR' ? console.error(line) : console.log(line);
}

function registerConnectionEvents(): void {
  mongoose.connection.on('connected', () => logMongo('INFO', 'Connection established'));
  mongoose.connection.on('disconnected', () => logMongo('WARN', 'Disconnected — Mongoose will retry'));
  mongoose.connection.on('reconnected', () => logMongo('INFO', 'Reconnected'));
  mongoose.connection.on('error', (err: Error) => logMongo('ERROR', `Connection error — ${err.name}`));
  mongoose.connection.on('close', () => logMongo('WARN', 'Connection closed'));
}

export async function connectMongo(uri: string): Promise<void> {
  registerConnectionEvents();

  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS: SOCKET_TIMEOUT_MS,
    heartbeatFrequencyMS: HEARTBEAT_FREQUENCY_MS,
  };

  try {
    logMongo('INFO', 'Connecting...');
    await mongoose.connect(uri, options);
  } catch {
    logMongo('ERROR', 'Initial connection failed — check MONGO_URI');
    process.exit(1);
  }
}
