-- insert departments
INSERT INTO department (dep_name) VALUES
    ('Sales'),
    ('Engineering'),
    ('Marketing'),
    ('Finance'),
    ('HR');

-- insert roles
INSERT INTO role (title, salary, department_id) VALUES
    ('Sales Manager', 80000.00, 1),
    ('Sales Representative', 50000.00, 1),
    ('Software Engineer', 90000.00, 2),
    ('QA Engineer', 75000.00, 2),
    ('Marketing Coordinator', 60000.00, 3),
    ('Financial Analyst', 70000.00, 4),
    ('HR Specialist', 60000.00, 5);

-- insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('Naruto', 'Uzumaki', 1, NULL),
    ('Monkey', 'D. Luffy', 2, 1),
    ('Ichigo', 'Kurosaki', 3, NULL),
    ('Edward', 'Enric', 4, 3),
    ('Light', 'Yagami', 5, NULL),
    ('Goku', 'Son', 6, 4),
    ('Eren', 'Yaeger', 7, NULL);
