import React, { useState } from 'react';
import img1 from '../../assets/img1.png';
import { useNavigate } from 'react-router';
import { usePermissions } from '../../context/PermissionsContext';
import DUVLogoWhite from '../../assets/DUVLogoWhite.png';

const Login = () => {
  const navigate = useNavigate(); 
  const { setPermissions } = usePermissions();

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState(""); 
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.username,
          password: loginForm.password
        }),
      });
      const data = await response.json();
      console.log(data);

      if(response.ok){
        setSuccess("Login Successful");
        setTimeout(() => setSuccess(""), 3000);
        setLoginForm({ username: "", password: "" });

        // Store the token in localStorage
        localStorage.setItem("authToken", data.token);  // Store JWT token

        if(data.userType === "Employee"){
          setPermissions(data.permissions);
          localStorage.setItem("permissions", JSON.stringify(data.permissions));
          localStorage.setItem("userId", JSON.stringify(data.userId));
          localStorage.setItem("role", data.permissions.role_name);
          navigate('/admin-dashboard/AttendanceMonitoring');
        } else if (data.userType === "Client") {
          localStorage.setItem("userId", JSON.stringify(data.userId));
          navigate('/clientDashboard');
        }
      } else {
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
    <div className='bg-gray-200 gap-8 flex items-center justify-center min-h-screen bg-cover bg-center relative'>
      <div className='relative w-full max-w-md min-h-[500px] h-auto bg-white backdrop-blur-lg rounded-lg shadow-xl p-10 flex flex-col justify-center'>
        <div className='flex flex-col items-center justify-center mb-4 gap-2'>
          <img src={DUVLogoWhite} alt="" className='w-32 bg-[#4c735c] p-2 rounded mb-6'/>
          <h2 className='text-2xl font-bold'>Welcome to DUV engineers</h2>
          <p className='text-md'>We Build for your comfort</p>
        </div>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            name='username' 
            type="email" 
            value={loginForm.username}
            placeholder='Email'
            onChange={handleChange}
            className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
          />
          <input 
            name='password'
            type="password" 
            value={loginForm.password}
            placeholder='Password'
            onChange={handleChange}
            className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4c735c]'
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          <button type='submit' className='bg-[#4c735c] text-white py-3 rounded-lg hover:bg-[#4c735c]/90 cursor-pointer'>
            Login
          </button>
        </form>
        <p className='text-center mt-4'>Don't have an account? <a href="/register" className='text-[#4c735c]'>Sign Up</a></p>
      </div>
    </div>
  );
}

export default Login;
