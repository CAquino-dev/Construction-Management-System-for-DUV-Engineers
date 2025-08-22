const bcrypt = require("bcrypt");
const db = require("../config/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//working
const registerUser = async (req, res) => {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !phone || !address || !password) {
        return res.status(500).json({ error: "All fields are required" })
    }

    try {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        console.log("hashed password:", hashPassword);

        const query = "INSERT INTO users (full_name, email, phone, address, password ) values (?, ?, ?, ?, ? )";
        db.query(query, [name, email, phone, address, hashPassword ], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message })
            } else {
                res.status(200).json({ meesage: "user registered successfully" })
            }
        })

    } catch (error) {
        return res.status(500).json({ error: "error hashing password" })
    }
}
//working
// const Login = (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   const query = "SELECT * FROM users WHERE email = ?";
//   db.query(query, [email], async (err, results) => {
//     if (err) return res.status(500).json({ error: "Database error!" });

//     if (results.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     const user = results[0];
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     if (user.role_id) {
//       const permissionQuery = "SELECT permission_key, value FROM user_permissions WHERE user_id = ?";

//       db.query(permissionQuery, [user.id], (permErr, permResults) => {
//         if (permErr) {
//           console.error("Error fetching permissions:", permErr);
//           return res.status(500).json({ error: "Error fetching permissions" });
//         }

//         let permissions = null;

//         if (permResults && permResults.length > 0) {
//           permissions = {};
//           permResults.forEach(p => {
//             permissions[p.permission_key] = p.value;
//           });
//           sendLoginResponse();
//         } else {
//           // No custom permissions, fallback to role defaults
//           const roleQuery = "SELECT * FROM roles WHERE role_id = ?";
//           db.query(roleQuery, [user.role_id], (roleErr, roleResults) => {
//             if (roleErr || roleResults.length === 0) {
//               console.error("Error fetching role defaults:", roleErr);
//               return res.status(500).json({ error: "Error fetching role defaults" });
//             }

//             // Build permissions object from role columns (excluding id and name)
//             const role = roleResults[0];
//             permissions = {};
//             Object.keys(role).forEach(key => {
//               if (!["role_id", "role_name"].includes(key)) {
//                 permissions[key] = role[key];
//               }
//             });

//             sendLoginResponse();
//           });
//         }

//         function sendLoginResponse() {
//           const payload = {
//             userId: user.id,
//             userType: "Employee",
//             permissions
//           };
//           const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

//           res.json({
//             message: "Login successful",
//             userId: user.id,
//             userType: "Employee",
//             permissions,
//             token
//           });
//         }
//       });
//     } else {
//       // Client user (no role)
//       const payload = {
//         userId: user.id,
//         userType: "Client",
//         permissions: null
//       };
//       const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

//       res.json({
//         message: "Login successful",
//         userId: user.id,
//         userType: "Client",
//         permissions: null,
//         token
//       });
//     }
//   });
// };

const Login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error!" });

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Fetch permissions if the user has a role_id
        let permissions = null;
        if (user.role_id) {
            const permissionQuery = "SELECT * FROM permissions WHERE id = ?";
            permissions = await new Promise((resolve, reject) => {
                db.query(permissionQuery, [user.role_id], (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]); // Assuming one set of permissions per role_id
                });
            });
        }

        // Create the JWT token, including userType and permissions
        const payload = {
            userId: user.id,
            userType: user.role_id ? "Employee" : "Client",  // Keep userType in the payload
            permissions: permissions ? permissions : null,  // Include permissions in the payload
        };

        // Ensure JWT_SECRET is set in your .env file
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

        // Send response with token, userType, permissions, and userId
        res.json({
            message: "Login successful",
            userId: user.id,        // Include userId
            userType: user.role_id ? "Employee" : "Client",  // Include userType
            permissions: permissions ? permissions : null,  // Include permissions
        });
    });
};





module.exports = { registerUser, Login };