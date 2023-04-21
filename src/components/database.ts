import sqlite from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export async function init_Db() {
  const dbPath = './database.sqlite';

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      display_name TEXT DEFAULT NULL,
      password TEXT NOT NULL DEFAULT "",
      api_key TEXT NOT NULL UNIQUE
    )
  `);

  db.on('insert', async (table: string, row: any) => {
    if (table === 'users') {
      console.log('Updating display name...');
      await db.run(
        'UPDATE users SET display_name = ? WHERE id = ?',
        row.name,
        row.id
      );
    }

    if (table === 'users' && !row.api_key) {
      console.log('Updating API key...');
      const apiKey = uuidv4();

      await db.run(
        'UPDATE users SET api_key = ? WHERE id = ?',
        apiKey,
        row.id
      );
    }
  });

  const users = await db.all('SELECT * FROM users');

  if (users.length === 0) {
    const apiKey = uuidv4();
    const passwordHash = await bcrypt.hash('admin', 10); // Hash the password

    await db.run(
      'INSERT INTO users (name, password, api_key) VALUES (?, ?, ?)', // Add password field to the INSERT statement
      'admin',
      passwordHash, // Store the hashed password in the password field
      apiKey
    );

    const adminUser = await db.get(
      'SELECT * FROM users WHERE name=?',
      'admin'
    );

    // Update the admin user's display_name to the same value as name
    await db.run(
      'UPDATE users SET display_name=? WHERE id=?',
      adminUser.name,
      adminUser.id
    );
  }

  // Hash the passwords for any users that don't have a hash yet
  const usersWithMissingHash = await db.all(
    'SELECT id, password FROM users WHERE password NOT LIKE "$2b$%"'
  ) as { id: number; password: string }[];

  for (const user of usersWithMissingHash) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await db.run('UPDATE users SET password=? WHERE id=?', passwordHash, user.id);
  }

  return db;
}