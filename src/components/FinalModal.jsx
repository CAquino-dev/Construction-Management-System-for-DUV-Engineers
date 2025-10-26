import React from "react";
import { createPortal } from "react-dom";

export const FinalModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return createPortal(
    <div
      className="fixed inset-0 bg-black/50  flex items-center justify-center z-50"
      onClick={onClose} // if you click outside, close the modal
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // clicking inside doesn't close
      >
        {/* X button to close modal */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl text-gray-500 hover:text-red-500"
        >
          &times;
        </button>

        {/* Show whatever is inside the modal */}
        {children}
      </div>
    </div>,
    document.getElementById("modal-root") // where to put the modal in the HTML
  );
};
