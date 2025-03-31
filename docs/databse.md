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
