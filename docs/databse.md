DATABASE NAME: duv
TABLES:

CREATE TABLE roles (
id INT PRIMARY KEY AUTO_INCREMENT,
role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
username VARCHAR(50) UNIQUE NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL, -- Added email for login/notifications
password_hash VARCHAR(255) NOT NULL,
role_id INT, -- References roles table
department_id INT, -- Optional: References department table if needed
status ENUM('Active', 'Inactive') DEFAULT 'Active', -- Track user status
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Record creation date
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Auto-update timestamp

    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL

);

ALTER TABLE users
ADD COLUMN full_name VARCHAR(100) NOT NULL,
ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL;

CREATE TABLE departments (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) UNIQUE NOT NULL,
description TEXT DEFAULT NULL, -- Optional: Description of the department
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
