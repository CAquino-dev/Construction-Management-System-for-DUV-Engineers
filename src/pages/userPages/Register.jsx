import React, { useState } from 'react'

const Register = () => {
    const [formData, setFormData] = useState({
      username: "",
      password: "",
      confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value }); 
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); //prevent the page from reloading

        if(formData.password !== formData.confirmPassword){
          setError("Passwords don't match, please try again.");
          setTimeout(() => setError(""), 3000);
          return;  
        }

        try {
          const response = await fetch(`http://localhost:5000/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: formData.username,
              password: formData.password
            }),
          });
          const data = await response.json();
          if (response.ok) {
            setSuccess("Registration successful! Please log in.");
            setTimeout(() => setSuccess(""), 3000);
            setFormData({ username: "", password: "", confirmPassword: "" });
          } else {
            setError(data.error || "Registration failed.");
            setTimeout(() => setError(""), 3000);
          }
        } catch (error) {
          setError("Server error. Please try again.");
          setTimeout(() => setError(""), 3000);
        }
        
    }

  return (
    <div className='mt-20'>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text"
        name='username' 
        value={formData.username}
        placeholder='Username'
        onChange={handleChange}
        required
        />
        <input type="password" 
        name='password'
        value={formData.password}
        placeholder='Password'
        onChange={handleChange}
        required
        />
        <input type="password" 
        name='confirmPassword'
        value={formData.confirmPassword}
        placeholder='Confirm Password'
        onChange={handleChange}
        required
        />
        <button type='submit'>Register</button>
      </form>

    </div>
  )
}

export default Register
