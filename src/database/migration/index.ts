import { Pool } from 'pg';
import { config } from 'dotenv';
import migrations from './create-table';

config();
const { DATABASE_URL } = process.env;
const client = new Pool({ connectionString: DATABASE_URL });

// loop through the array of sql query and execute individual queries
for (const sql of migrations) {
  (async () => {
    try {
      await client.query('BEGIN');
      console.log('Executing:', sql);
      await client.query(sql);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  })().catch((e) => console.error(e.stack));
}
