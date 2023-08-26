const inquirer = require("inquirer");
const mysql = require("mysql2");

// the first thing we have to do is create the conection for mysql

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
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
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Update employee managers",
            "View employees by manager",
            "View employees by department",
            "Delete departments, roles, and employees",
            "View the total utilized budget of a department",
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
            "Update an employee role",*
            "Update employee managers",*
            "View employees by manager",*
            "View employees by department",*
            "Delete departments, roles, and employees",*
            "View the total utilized budget of a department;in other words, the combined salaries of all employees in that department.",*
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
            SELECT role.title, role.id, department.dep_name, role.salary
            FROM role
            JOIN department ON role.department_id = department.id
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
    SELECT e.id, e.first_name, e.last_name, r.title, d.dep_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
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

        const query = "INSERT INTO department (dep_name) VALUES (?)";
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

        // Construct the choices array for departments
        const departmentChoices = departments.map(department => ({
            name: department.dep_name,
            value: department.id,
        }));

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
                name: "departmentId", // Use a more appropriate name for the selected value
                message: "Select the department for the new role:",
                choices: departmentChoices,
            },
        ]);

        // Find the chosen department using departmentId
        const chosenDepartment = departments.find(dep => dep.id === answers.departmentId);

        const query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
        const roleData = [answers.title, answers.salary, chosenDepartment.id];

        await connection.promise().query(query, roleData);

        console.log(`Added the role ${answers.title} with a salary of ${answers.salary} to the ${chosenDepartment.dep_name} department in the employee database`);
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
            "SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee LEFT JOIN role ON employee.role_id = role.id"
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

async function updateEmployeeManagers() {
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

// function to view employees by manager

async function viewEmployeesByManager() {
    try {
        const query = `
            SELECT 
                e.id, 
                e.first_name, 
                e.last_name, 
                r.title, 
                d.dep_name, 
                CONCAT(m.first_name, ' ', m.last_name) AS manager_name
            FROM 
                employee e
                INNER JOIN role r ON e.role_id = r.id
                INNER JOIN department d ON r.department_id = d.id
                LEFT JOIN employee m ON e.manager_id = m.id
            ORDER BY 
                manager_name, 
                e.last_name, 
                e.first_name
        `;

        const [rows] = await connection.promise().query(query);

        const employeesByManager = rows.reduce((acc, cur) => {
            const { manager_name, ...employeeData } = cur;
            if (!acc[manager_name]) {
                acc[manager_name] = [];
            }
            acc[manager_name].push(employeeData);
            return acc;
        }, {});

        console.log("Employees by manager:");
        for (const managerName in employeesByManager) {
            console.log(`\n${managerName}:`);
            const employees = employeesByManager[managerName];
            employees.forEach((employee) => {
                const { first_name, last_name, title, dep_name } = employee;
                console.log(`  ${first_name} ${last_name} | ${title} | ${dep_name}`);
            });
        }

        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}


//now view employees by departmente, holy christ

async function viewEmployeesByDepartment() {
    try {
        const query = `
            SELECT 
                department.dep_name, 
                employee.first_name, 
                employee.last_name 
            FROM 
                employee 
                INNER JOIN roles ON employee.role_id = role.id 
                INNER JOIN department ON role.department_id = department.id 
            ORDER BY 
                department.dep_name ASC
        `;

        const [rows] = await connection.promise().query(query);

        console.log("\nEmployees by department:");
        console.table(rows);

        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// next delete emp, role or dep, but we need a switch first

async function deleteDepartmentsRolesEmployees() {
    try {
        const answer = await inquirer.prompt({
            type: "list",
            name: "data",
            message: "What would you like to delete?",
            choices: ["Employee", "Role", "Department", "Go Back"],
        });

        switch (answer.data) {
            case "Employee":
                await deleteEmployee();
                break;
            case "Role":
                await deleteRole();
                break;
            case "Department":
                await deleteDepartment();
                break;
            case "Go Back":
                start();
                break;
            default:
                console.log(`Invalid choice: ${answer.data}`);
                start();
                break;
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

//now we have to go one by one, oh god

//delete employee

async function deleteEmployee() {
    try {
        const employees = await connection.query("SELECT id, first_name, last_name FROM employee");
        const employeeChoices = employees.map(employee => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
        }));
        employeeChoices.push({ name: "Go Back", value: "back" });

        const answer = await inquirer.prompt({
            type: "list",
            name: "employeeId",
            message: "Select the employee you want to delete:",
            choices: employeeChoices,
        });

        if (answer.employeeId === "back") {
            deleteDepartmentsRolesEmployees();
            return;
        }

        await connection.query("DELETE FROM employee WHERE id = ?", [answer.employeeId]);
        console.log(`Employee with ID ${answer.employeeId} has been deleted.`);
        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// then delete roleee

async function deleteRole() {
    try {
        const roles = await connection.query("SELECT id, title FROM role");
        const roleChoices = roles.map(role => ({
            name: role.title,
            value: role.id,
        }));
        roleChoices.push({ name: "Go Back", value: "back" });

        const answer = await inquirer.prompt({
            type: "list",
            name: "roleId",
            message: "Select the role you want to delete:",
            choices: roleChoices,
        });

        if (answer.roleId === "back") {
            deleteDepartmentsRolesEmployees();
            return;
        }

        await connection.query("DELETE FROM role WHERE id = ?", [answer.roleId]);
        console.log(`Role with ID ${answer.roleId} has been deleted.`);
        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// next delete department 

async function deleteDepartment() {
    try {
        const departments = await connection.query("SELECT id, name FROM department");
        const departmentChoices = departments.map(department => ({
            name: department.name,
            value: department.id,
        }));
        departmentChoices.push({ name: "Go Back", value: "back" });

        const answer = await inquirer.prompt({
            type: "list",
            name: "departmentId",
            message: "Select the department you want to delete:",
            choices: departmentChoices,
        });

        if (answer.departmentId === "back") {
            deleteDepartmentsRolesEmployees();
            return;
        }

        await connection.query("DELETE FROM department WHERE id = ?", [answer.departmentId]);
        console.log(`Department with ID ${answer.departmentId} has been deleted.`);
        start();
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

// finally, all salaries in a dpt

// finally, all salaries in a dpt
async function viewTotalUtilizedBudgetOfDepartment() {
    try {
        const [departments] = await connection.promise().query("SELECT * FROM department");

        const answer = await inquirer.prompt({
            type: "list",
            name: "departmentId",
            message: "Select the department to view the budget:",
            choices: departments.map(department => department.dep_name),
        });

        const selectedDepartment = departments.find(dep => dep.dep_name === answer.departmentId);

        // make sure the department was found
        if (!selectedDepartment) {
            console.log("Selected department not found.");
            start();
            return;
        }

        // get the total budget using a query
        const query = `
            SELECT SUM(role.salary) AS total_budget
            FROM employee
            JOIN role ON employee.role_id = role.id
            WHERE role.department_id = ?
        `;
        
        const [result] = await connection.promise().query(query, [selectedDepartment.id]);

        const totalBudget = result[0].total_budget;
        
        // display the total budget
        console.log(`Total budget for the ${selectedDepartment.dep_name} department: $${totalBudget}`);
        
        start();
    } catch (error) {
        console.error("An error occurred:", error);
        start();
    }
}


//close connection

process.on("exit", ()=>{
    connection.end();
});

