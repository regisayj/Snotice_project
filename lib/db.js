
var mysql = require('mysql');
//DB接続
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Rladydgns(1',
    database : 'opentutorials'
  });
db.connect();

module.exports = db;
