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

/*    "View all departments",*
            "View all roles",*
            "View all employees"*,
            "Add a  department",*
            "Add a role",*
            "Add an employee",*
            "Update an employee role",
            "Update employee managers",
            "View employees by manager",
            "View employees by department",
            "Delete departments, roles, and employees",
            "View the total utilized budget of a department&mdash;in other words, the combined salaries of all employees in that department.",
            "Exit",*/

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

//next, view all employees

async function viewAllEmployees() {
    const query = `
    SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id;
    `;

    try {
        const [rows] = await connection.promise().query(query);
        console.table(rows);
    } catch (error) {
        console.error("An error occurred:", error);
    }
    
    start();
}

//next add a department

async function addDepartment() {
    try {
        const answer = await inquirer.prompt({
            type: "input",
            name: "name",
            message: "Enter the name of the department you want to add:",
        });

        const query = "INSERT INTO department (department_name) VALUES (?)";
        const [result] = await connection.promise().query(query, [answer.name]);

        console.log(`You added department ${answer.name} to the employee database`);
        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

//next add role, this is taking to long haha

async function addRole() {
    try {
        const [departments] = await connection.promise().query("SELECT * FROM department");

        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Enter the title of the new role:",
            },
            {
                type: "input",
                name: "salary",
                message: "Enter the salary of the new role:",
            },
            {
                type: "list",
                name: "department",
                message: "Select the department for the new role:",
                choices: departments.map(department => department.name),
            },
        ]);

        const department = departments.find(dep => dep.name === answers.department);
        const query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
        const roleData = [answers.title, answers.salary, department.id];

        await connection.promise().query(query, roleData);

        console.log(`Added the role ${answers.title} with a salary of ${answers.salary} to the ${answers.department} department in the employee database`);
        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// next we add employees, please god stahp

async function addEmployee() {
    try {
        const [roles] = await connection.promise().query("SELECT id, title FROM role");
        const [managers] = await connection.promise().query(
            'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee'
        );

        const roleChoices = roles.map(({ id, title }) => ({ name: title, value: id }));
        const managerChoices = [{ name: "None", value: null }, ...managers.map(({ id, name }) => ({ name, value: id }))];

        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "Enter the employee's first name:",
            },
            {
                type: "input",
                name: "lastName",
                message: "Enter the employee's last name:",
            },
            {
                type: "list",
                name: "roleId",
                message: "Select the employee role:",
                choices: roleChoices,
            },
            {
                type: "list",
                name: "managerId",
                message: "Select the employee manager:",
                choices: managerChoices,
            },
        ]);

        const sql =
            "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
        const values = [
            answers.firstName,
            answers.lastName,
            answers.roleId,
            answers.managerId,
        ];

        await connection.promise().query(sql, values);
        console.log("Employee added successfully");
        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

//next update employee role...

async function updateEmployeeRole() {
    try {
        const [employees] = await connection.promise().query(
            "SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id"
        );

        const [roles] = await connection.promise().query("SELECT id, title FROM role");

        const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id,
        }));

        const roleChoices = roles.map(({ id, title }) => ({ name: title, value: id }));

        const answers = await inquirer.prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Select the employee to update:",
                choices: employeeChoices,
            },
            {
                type: "list",
                name: "roleId",
                message: "Select the new role:",
                choices: roleChoices,
            },
        ]);

        const sql = "UPDATE employee SET role_id = ? WHERE id = ?";
        const values = [answers.roleId, answers.employeeId];

        await connection.promise().query(sql, values);
        console.log("Employee role updated successfully");
        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

//next update employe managerssss

async function updateEmployeeManager() {
    try {
        const [employees] = await connection.promise().query(
            "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee"
        );

        const employeeChoices = employees.map(({ id, name }) => ({
            name,
            value: id,
        }));

        const answers = await inquirer.prompt([
            {
                type: "list",
                name: "employeeId",
                message: "Select the employee to update:",
                choices: employeeChoices,
            },
            {
                type: "list",
                name: "managerId",
                message: "Select the new manager for the employee:",
                choices: [...employeeChoices, { name: "None", value: null }],
            },
        ]);

        const sql = "UPDATE employee SET manager_id = ? WHERE id = ?";
        const values = [answers.managerId, answers.employeeId];

        await connection.promise().query(sql, values);
        console.log("Employee manager updated successfully");
        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

