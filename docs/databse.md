DATABASE NAME: duv
TABLES:

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

{
"username": "FinanceEmployee",
"email": "finance@email.com",
"fullname": "Finance Name",
"password": "12345",
"role_id": "4",
"department_id": "1"
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

tables:
-- Create the database
CREATE DATABASE duvtesting;
USE duvtesting;

-- Permissions Table
CREATE TABLE permissions (
id INT AUTO_INCREMENT PRIMARY KEY,
role_name VARCHAR(50),
can_access_user ENUM('Y', 'N'),
can_edit_user ENUM('Y', 'N'),
can_delete_user ENUM('Y', 'N'),
can_view_reports ENUM('Y', 'N'),
can_manage_roles ENUM('Y', 'N'),
can_access_finance ENUM('Y', 'N'),
can_access_hr ENUM('Y', 'N'),
can_access_projects ENUM('Y', 'N'),
can_create_project ENUM('Y', 'N'),
can_update_project_status ENUM('Y', 'N'),
can_view_clients ENUM('Y', 'N'),
can_edit_clients ENUM('Y', 'N'),
can_view_payments ENUM('Y', 'N'),
can_manage_payments ENUM('Y', 'N'),
can_manage_schedule ENUM('Y', 'N'),
can_view_attendance ENUM('Y', 'N'),
can_manage_attendance ENUM('Y', 'N')
);

-- Departments Table
CREATE TABLE departments (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
description TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50),
email VARCHAR(100),
full_name VARCHAR(255),
password VARCHAR(255),
phone VARCHAR(20),
address TEXT,
company_name VARCHAR(100),
profile_picture VARCHAR(255),
role ENUM('Client', 'Employee', 'Admin'),
role_id INT,
department_id INT,
status ENUM('Active', 'Inactive'),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (role_id) REFERENCES permissions(id),
FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Clients Table
CREATE TABLE clients (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100),
password_hash VARCHAR(100),
phone VARCHAR(20),
address TEXT,
status ENUM('Active', 'Inactive'),
company_name VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Salary Table (linked to users now)
CREATE TABLE employee_salary (
id INT AUTO_INCREMENT PRIMARY KEY,
employee_id INT,
fixed_salary DECIMAL(10,2),
bonus DECIMAL(10,2),
deductions DECIMAL(10,2),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Attendance Table (linked to users now)
CREATE TABLE attendance (
id INT AUTO_INCREMENT PRIMARY KEY,
employee_id INT,
check_in DATETIME,
check_out DATETIME,
status ENUM('Present', 'Absent', 'Late'),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
work_date DATE,
FOREIGN KEY (employee_id) REFERENCES users(id)
);

-- Payroll Table (linked to users now)
CREATE TABLE payroll (
id INT AUTO_INCREMENT PRIMARY KEY,
employee_id INT,
period_start DATE,
period_end DATE,
total_hours_worked DECIMAL(10,2),
calculated_salary DECIMAL(10,2),
status ENUM('Pending', 'Approved by HR', 'Rejected by HR', 'Paid', 'Rejected by Finance'),
generated_by INT,
generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
approved_by INT,
approved_by_hr_at DATETIME,
paid_by INT,
paid_by_finance_at DATETIME,
rejected_by INT,
rejected_by_finance_at DATETIME,
remarks TEXT,
FOREIGN KEY (employee_id) REFERENCES users(id),
FOREIGN KEY (generated_by) REFERENCES users(id),
FOREIGN KEY (approved_by) REFERENCES users(id),
FOREIGN KEY (paid_by) REFERENCES users(id),
FOREIGN KEY (rejected_by) REFERENCES users(id)
);

CREATE TABLE payslips (
id INT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
created_by INT NOT NULL, -- HR user ID
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE payroll ADD COLUMN payslip_id INT DEFAULT NULL;
