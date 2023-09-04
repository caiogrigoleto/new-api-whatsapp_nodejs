const connection = require('./connection');

const insertUser = async (data) => {
  const result = await connection.query('INSERT INTO instancias_whatsapp(instancia) VALUES (?)', data);
  return result;
}

module.exports = insertUser;