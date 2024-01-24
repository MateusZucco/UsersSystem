const mysql = require("mysql2/promise");

module.exports = {
  connect: async function () {
    if (global.connection && global.connection.state !== "disconnected")
      return global.connection;

    const connection = await mysql.createConnection({
      host: process.env.dbHost || "localhost",
      port: process.env.dbPort || "3333",
      user: process.env.dbUser || "root",
      password: process.env.dbPass || "root",
      database: process.env.dbName || "users_schema",
    });

    await connection.connect((err) => {
      if (err) throw err;
      global.connection = connection;
    });

    return connection;
  },

  query: async function (query) {
    const conn = await this.connect();
    const [rows] = await conn.query(query);
    return rows;
  },

  transaction: async function (queries) {
    const conn = await this.connect();
    try {
      await conn.beginTransaction();
      const queryPromises = [];

      queries.forEach((query) => {
        queryPromises.push(conn.query(query));
      });
      const results = await Promise.all(queryPromises);
      await conn.commit();
      await conn.end();
      return results;
    } catch (err) {
      await connection.rollback();
      await connection.end();
      return Promise.reject(err);
    }
  },
};
