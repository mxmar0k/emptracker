const inquirer = require("inquirer");
const mysql = require("mysql2");

// the first thing we have to do is create the conection for mysql

const connection = mysql.createConnection({
    host: "localhost",
    port: 3001,
    user: "root",
    password: "",
    database: "employee_db"
    //this is what we named the db in schema
})

// database connection
connection.connect((err)=>{
    if (err) throw err;
    console.log("Connected to DB")
    start();
});

//close connection

process.on("exit", ()=>{
    connection.end();
})