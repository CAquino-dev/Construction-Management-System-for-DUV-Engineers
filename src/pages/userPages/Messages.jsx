import React, { useState } from 'react';
import { MessagesLeft } from '../../components/userComponents/MessagesLeft'; // Adjust the import path accordingly
import { MessageBox } from '../../components/userComponents/MessageBox'; // Adjust the import path accordingly

export const Messages = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user); // Set the selected user when clicked
  };

  return (
    <div className="flex flex mt-13 gap-2 h-screen">
      {/* Left panel: MessagesLeft component */}
      <div className="lg:w-1/3 w-full bg-white p-4 rounded-lg shadow-md h-full overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Select a User</h2>
        <MessagesLeft onSelectUser={handleSelectUser} />
      </div>

      {/* Right panel: MessageBox component */}
      <div className="lg:w-2/3 w-full bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
        {selectedUser ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Conversation with {selectedUser.name}</h2>
            <MessageBox selectedUser={selectedUser} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Please select a user to start the conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};
