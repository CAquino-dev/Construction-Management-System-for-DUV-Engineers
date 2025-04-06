DATABASE NAME: duv
TABLES:

CREATE TABLE permissions (
id INT AUTO_INCREMENT PRIMARY KEY,
permission_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE role_permissions (
role_id INT,
permission_id INT,
PRIMARY KEY (role_id, permission_id),
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

{
"name": "testClient",
"email": "client@email",
"phone": "0851612358",
"address": "dasma",
"password": "client12345"
}

{
"username": "HRJohnDoe",
"email": "HR@email.com",
"fullname": "HR Employee",
"password": "12345",
"role_id": "2",
"department_id": "2"
}

{
"username": "ADMIN1",
"password": "12345"
}
{
"username": "EmployeeTest",
"password": "12345"
}

-- 🔹 Employees Table
CREATE TABLE employees (
id INT PRIMARY KEY AUTO_INCREMENT,
first_name VARCHAR(50) NOT NULL,
last_name VARCHAR(50) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL, -- Hashed Password
role_name VARCHAR(50) NOT NULL,
department_id INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 🔹 Departments Table
CREATE TABLE departments (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL UNIQUE
);

-- 🔹 Permissions Table
CREATE TABLE permissions (
role_name VARCHAR(50) PRIMARY KEY,
can_access_user ENUM('Y', 'N') DEFAULT 'N',
can_edit_user ENUM('Y', 'N') DEFAULT 'N',
can_delete_user ENUM('Y', 'N') DEFAULT 'N',
can_view_reports ENUM('Y', 'N') DEFAULT 'N',
can_manage_roles ENUM('Y', 'N') DEFAULT 'N',
can_access_finance ENUM('Y', 'N') DEFAULT 'N'
);

-- 🔹 Projects Table
CREATE TABLE projects (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description TEXT,
start_date DATE,
end_date DATE,
budget DECIMAL(15,2),
status ENUM('Planned', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Planned',
assigned_department INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (assigned_department) REFERENCES departments(id)
);

-- 🔹 Clients Table
CREATE TABLE clients (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
phone VARCHAR(20),
address TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔹 Tasks Table
CREATE TABLE tasks (
id INT PRIMARY KEY AUTO_INCREMENT,
project_id INT NOT NULL,
assigned_to INT NOT NULL,
task_name VARCHAR(255) NOT NULL,
task_description TEXT,
due_date DATE,
status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (project_id) REFERENCES projects(id),
FOREIGN KEY (assigned_to) REFERENCES employees(id)
);

-- 🔹 Payments Table
CREATE TABLE payments (
id INT PRIMARY KEY AUTO_INCREMENT,
client_id INT NOT NULL,
amount DECIMAL(15,2) NOT NULL,
payment_date DATE NOT NULL,
status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (client_id) REFERENCES clients(id)
);
