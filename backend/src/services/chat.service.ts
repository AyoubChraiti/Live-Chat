import { initDb } from '../db/sqlite';

export const saveMessage = async (sender: string, content: string) => {
  const db = await initDb();
  await db.run(
    'INSERT INTO messages (sender, content) VALUES (?, ?)',
    [sender, content]
  );
};

export const getMessages = async () => {
  const db = await initDb();
  return db.all('SELECT * FROM messages ORDER BY timestamp ASC');
};
