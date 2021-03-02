import { Client } from 'pg';
import { config } from 'dotenv';

config();
const { DATABASE_URL } = process.env;

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
client.connect();

export default client;
