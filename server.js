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

// start the app with inquierer

function start(){
    inquirer
    .prompt({
        type:"list",
        name: "action",
        message: "Please choose an option",
        choices:[
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a  department",
            "Add a role",
            "Add an employee",
            "Update and employee role",
            "Update employee managers",
            "View employees by manager",
            "View employees by department",
            "Delete departments, roles, and employees",
            "View the total utilized budget of a department&mdash;in other words, the combined salaries of all employees in that department.",
            "Exit",

        ],
    })
    .then((answer) => {
        switch (answer.action) {
            case "View all departments":
                viewAllDepartments();
                break;
            case "View all roles":
                viewAllRoles();
                break;
            case "View all employees":
                viewAllEmployees();
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update an employee role":
                updateEmployeeRole();
                break;
            case "Update employee managers":
                updateEmployeeManagers();
                break;
            case "View employees by manager":
                viewEmployeesByManager();
                break;
            case "View employees by department":
                viewEmployeesByDepartment();
                break;
            case "Delete departments, roles, and employees":
                deleteDepartmentsRolesEmployees();
                break;
            case "View the total utilized budget of a department":
                viewTotalUtilizedBudgetOfDepartment();
                break;
            case "Exit":
                connection.end();
                console.log("Goodbye!");
                break;
        }
    });
}

// next we have to use a function to each of the cases :(

//first function to view all departments 
async function viewAllDepartments() {
    try {
        const [departments] = await connection.promise().query("SELECT * FROM department");
        console.table(departments);
    } catch (error) {
        console.error("An error occurred:", error);
    }
    start();
}


//next we have to view all roles
async function viewAllRoles() {
    try {
        const query = `
            SELECT roles.title, roles.id, departments.department_name, roles.salary
            FROM roles
            JOIN departments ON roles.department_id = departments.id
        `;
        
        const [rows] = await connection.promise().query(query);
        console.table(rows);

        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}
