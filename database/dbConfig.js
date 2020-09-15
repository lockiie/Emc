'use strict';
var oracledb = require('oracledb')
const pool = oracledb.createPool({
  user: "ACADEMIA",
  password: "pechebelok",
  connectString: "127.0.0.1:1522/lucas",
  poolMin: 5,
  poolMax: 5,
  poolIncrement: 0,
  stmtCacheSize: 0
})

module.exports.pool == pool.getConnection

