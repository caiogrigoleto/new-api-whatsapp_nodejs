const connection = require('./connection');

const getAllInstances = async () => {
  const result = await connection.query('SELECT * FROM instancias_whatsapp');
  return result;
}

module.exports = getAllInstances;