import React, { useState } from 'react'

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(`username: ${username} password:${password}`)
        setUsername("");
        setPassword("");
    }

  return (
    <div>
        <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
        type="text" 
        value={username}
        placeholder='Username'
        onChange={(e) => {setUsername(e.target.value)}}
        />
        <input 
        type="password" 
        value={password}
        placeholder='Password'
        onChange={(e) => {setPassword(e.target.value)}}
        />
        <button type='submit' >Login</button>
      </form>
    </div>
  )
}

export default Login
