import React from 'react'

const AdminNavbar = () => {
   const [open, setOpen] = useState(false);

    const toggleSidebar = () => {
        setOpen(!open);
    };

    const closeSideBar = () => {
        setOpen(false);
    };

    const menuItems = [
        { name: "Home" , icon: <House size={20} />, href: '#'},
        { name: "Projects" , icon: <ListChecks size={20} />, href: '#'},
        { name: "Finance" , icon: <Bank size={20} />, href: '#'},
        { name: "Human Resource" , icon: <UsersThree size={20} />, href: '#'},
        { name: "Scheduler" , icon: <Calendar size={32} />, href: '#'},
    ];
  return (
    <div className='flex '>
        {/* Sidebar toggle Button */}
        <button className='p-4' onClick={toggleSidebar}>
            {open ? <X size ={20}/> : <List size={20}/>} 
        </button>

        {/* Sidebar menu */}
        <motion.div
            initial={{ x: -300 }}
            animate={{ x: open ? 0 : -350}}
            transition={{ duration: 0.1}}
            className='bg-gray-900 h-screen w-64 text-white fixed top-0 left-0 shadow-lg p-5 flex flex-col justify-between'
        >
            <div>
                <div className="flex justify-between items-center mb-6">
                    <p className="font-bold text-lg">DUV ENGINEERS</p>
                    <button onClick={closeSideBar}><X size={24}/></button>
                </div>
                <div className="flex items-center space-x-2 mb-6 border-b pb-4">
                    <UserCheck size={42} className=' border-2 rounded-full p-1 text-[#4c735c]'/>
                    <p className='font-bold text-lg text-white'>Admin</p>
                </div>
                <div>
                    <input 
                        type="text" 
                        placeholder='Search...'
                        className='w-full bg-gray-800 text-white p-2 rounded-2xl mb-4'
                    />
                </div>
                <ul className='space-y-4'>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <a href={item.href} className='flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg'>
                                {item.icon}
                                {item.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <a href="#" className='flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg w-full'>
                    <SignOut size={32} />
                    Logout
                </a>
            </div>
        </motion.div>
    </div>
  )
}

export default AdminNavbar
