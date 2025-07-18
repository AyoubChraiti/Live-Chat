import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs';
import path from 'path';

export const initDb = async () => {
  const db = await open({
    filename: './chat.db',
    driver: sqlite3.Database,
  });

  // Run schema.sql to create tables
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await db.exec(schema);

  return db;
};
