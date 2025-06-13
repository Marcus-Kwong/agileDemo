var mysql = require('mysql2');

// var con = mysql.createConnection({
// host: "localhost",
// user: "user99",
// password: "user99",
// database: "comp7780"
// });

const con = mysql.createConnection({
	host: process.env.DB_HOST || "mysql",     
  user: process.env.DB_USER || "user99",
  password: process.env.DB_PASSWORD || "user99",
  database: process.env.DB_NAME || "comp7780"
    });

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	con.end();
});
