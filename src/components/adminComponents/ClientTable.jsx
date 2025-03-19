import React, { useState } from 'react';
import { SearchClient } from './SearchClient';
import { Eye } from '@phosphor-icons/react';
import { ClientModal } from './ClientModal';
import Pagination from './Pagination';

export const ClientTable = ({ clients = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filteredClients, setFilteredClients] = useState(clients);
  const [currentPage, setCurrentPage] = useState(1); 

  const totalPages = Math.ceil(filteredClients.length / 10);
  const currentClients = filteredClients.slice((currentPage - 1) * 10, currentPage * 10);

  const handleSearch = (query) => {
    let filtered = clients.filter((client) => client.fullname.toLowerCase().includes(query.toLowerCase()));
    setFilteredClients(filtered);
    setCurrentPage(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="p-4">
      <SearchClient onSearch={handleSearch} />

      <div className="overflow-x-auto">
        <table className="w-full border rounded-md text-sm">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="p-2 text-left pl-4">Full Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentClients.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-100">
                <td className="p-2 pl-4">{client.fullname}</td>
                <td className="p-2">{client.gmail}</td>
                <td className="p-2">{client.contact}</td>
                <td className={`p-2 ${client.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{client.status}</td>
                <td className="p-2 flex justify center">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setIsModalOpen(true);
                    }}
                    className="text-black hover:text-gray-600 cursor-pointer"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <ClientModal selectedClient={selectedClient} closeModal={closeModal} />
        </div>
      )}
    </div>
  );
};
