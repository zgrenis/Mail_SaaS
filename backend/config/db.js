const { Pool } = require('pg');   // pg: PostgreSQL client for Node.js
require('dotenv').config();

// WHY POOL?
// The server keeps default 10 connections open all the time. 
// New requests wait in a queue and are processed one by one. 
// This prevents overload and keeps the system stable.

//? dev env
/*
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: { 
    rejectUnauthorized: false 
  }
});
*/

//? prod env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_INTERNAL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: { 
    rejectUnauthorized: false 
  }
});


module.exports = pool;