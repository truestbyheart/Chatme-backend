import { Client } from 'pg';
import { config } from 'dotenv';
import { DATABASE_URL } from '../Config';

config();

const client = new Client({ connectionString: DATABASE_URL });
client.connect();

export default client;
