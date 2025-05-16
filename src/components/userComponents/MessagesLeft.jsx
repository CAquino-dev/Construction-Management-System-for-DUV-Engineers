import React from 'react';

export const MessagesLeft = ({ onSelectUser }) => {
  const users = [
    { id: 1, name: 'User1', messages: ['Hello pogi', 'How are you?'] },
    { id: 2, name: 'User2', messages: ['Hey there!', 'What\'s up?'] },
    { id: 3, name: 'User3', messages: ['Nyanya', 'Good morning'] },
  ];

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onSelectUser(user)} // When a user is clicked, it calls onSelectUser
          className="p-4 bg-white rounded-lg shadow-md hover:bg-gray-100 cursor-pointer transition duration-300 ease-in-out"
        >
          <p className="font-semibold text-lg">{user.name}</p>
          <p className="text-sm text-gray-600">{user.messages[0]}</p> {/* Show the first message */}
        </div>
      ))}
    </div>
  );
};
