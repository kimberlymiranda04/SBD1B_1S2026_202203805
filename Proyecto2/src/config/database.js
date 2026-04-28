const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool;

async function initialize() {
    try {
        pool = await oracledb.createPool({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING,
            poolMin: 2,
            poolMax: 10,
            poolIncrement: 1
        });
        console.log('Connection pool created');
    } catch (err) {
        console.error('Error creating pool:', err);
        throw err;
    }
}

async function execute(sql, binds = []) {
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.execute(sql, binds, { autoCommit: true });
        return result;
    } catch (err) {
        console.error('Query error:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

async function close() {
    await pool.close();
    console.log('Connection pool closed');
}

module.exports = { initialize, execute, close };