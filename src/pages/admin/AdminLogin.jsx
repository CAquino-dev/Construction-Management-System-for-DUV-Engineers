import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import { usePermissions } from '../../context/PermissionsContext';

const AdminLogin = () => {
    const navigate = useNavigate(); 
    const { setPermissions } = usePermissions();

    const [loginForm, setLoginForm] = useState({
      username: "",
      password: "",
    });

    const [error, setError] = useState(""); 
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
      setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        const response = await fetch(`http://localhost:5000/api/auth/employeeLogin`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: loginForm.username,
            password: loginForm.password
          }),
        });
        const data = await response.json();
        console.log(data)
        if(response.ok){
          setSuccess("Login Successful")
          setTimeout(() => setSuccess(""), 3000);
          setLoginForm({ username: "", password: "" });
          setPermissions(data.results);
          localStorage.setItem("permissions", JSON.stringify(data.results));
          localStorage.setItem("userId", JSON.stringify(data.userId));
          console.log('userID:', data.userId)
          navigate('/admin-dashboard');
        }else{
          setError(data.error || "Login failed");
          setTimeout(() => setError(""), 3000);
        }
      } catch (error) {
        console.log(error);
        setError("Server error. Please try again.");
        setTimeout(() => setError(""), 3000);
      }

    }


  return (
    <>
      {/* Header Section */}
      <div className='flex justify-between items-center bg-[#4c735c] h-[60px] px-4 text-white font-bold text-xl'>
        <h1>DUV ENGINEERS</h1>
        <h1>ADMIN LOGIN</h1>
      </div>

      {/* Login Form Section */}
      <div className='flex justify-center items-center h-screen bg-[#f4f4f4]'>
        <div className='bg-white shadow-lg rounded-lg p-8 w-[400px]'>
          <h2 className='text-2xl font-bold text-center mb-6 text-[#4c735c]'>Admin Login</h2>

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Username
              </label>
              <input
                type='text'
                placeholder='Enter Username'
                onChange={handleChange}
                value={loginForm.username}
                name='username'
                className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
              />
            </div>

            <div className='mb-6'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Password
              </label>
              <input
                type='password'
                placeholder='Enter Password'
                onChange={handleChange}
                value={loginForm.password}
                name='password'
                className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
              />
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
            <button
              type='submit'
              className='w-full bg-[#4c735c] text-white p-3 rounded-lg font-semibold hover:bg-[#3a5b4a] transition duration-300'
            >
              Login
            </button>
          </form>

          <p className='text-center text-sm text-gray-500 mt-4'>
            © 2025 DUV ENGINEERS | All Rights Reserved
          </p>
        </div>
      </div>
    </>
  )
}

export default AdminLogin;