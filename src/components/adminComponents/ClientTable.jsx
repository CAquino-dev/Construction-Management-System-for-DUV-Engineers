import React, { useState } from "react";
import { SearchClient } from "./SearchClient";
import { Eye } from "@phosphor-icons/react";
import { ClientModal } from "./ClientModal";
import Pagination from "./Pagination";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table"; // Ensure correct path

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
        <Table>
          <TableHeader>
            <TableRow className="bg-[#4c735c] text-white hover:bg-[#4c735c]">
              <TableHead className="text-center text-white">Full Name</TableHead>
              <TableHead className="text-center text-white">Email</TableHead>
              <TableHead className="text-center text-white">Phone</TableHead>
              <TableHead className="text-center text-white">Status</TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentClients.length > 0 ? (
              currentClients.map((client, index) => (
                <TableRow key={client.id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <TableCell className="text-center">{client.fullname}</TableCell>
                  <TableCell className="text-center">{client.gmail}</TableCell>
                  <TableCell className="text-center">{client.contact}</TableCell>
                  <TableCell className={`${client.status === "Active" ? "text-green-600 text-center" : "text-red-600 text-center"}`}>
                    {client.status}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => {
                        setSelectedClient(client);
                        setIsModalOpen(true);
                      }}
                      className="text-black hover:text-gray-600 cursor-pointer"
                    >
                      <Eye size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="p-4 text-center text-gray-500">
                  No clients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />

      {isModalOpen && selectedClient && (
        <div className="">
          <ClientModal selectedClient={selectedClient} closeModal={closeModal} />
        </div>
      )}
    </div>
  );
};
