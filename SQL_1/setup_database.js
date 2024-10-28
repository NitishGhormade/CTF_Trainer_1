const mysql = require('mysql2/promise');

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root'
  });

  try {
    // Create database
    await connection.execute('CREATE DATABASE IF NOT EXISTS AARAHANT_DB');
    await connection.query('USE AARAHANT_DB'); 

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `);

    // Insert sample users
    const users = [
      { username: 'admin', password: 'AARHANT_THM{You_cracked_the_SQLi}' },
      { username: 'user1', password: 'user1' },
      { username: 'user2', password: 'user2' },
      { username: 'user3', password: 'user3' }
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT IGNORE INTO users (username, password) VALUES (?, ?)',
        [user.username, user.password] 
      );
    }

    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();