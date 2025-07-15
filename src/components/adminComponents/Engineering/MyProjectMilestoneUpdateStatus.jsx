import React, { useState } from 'react'
import { X } from '@phosphor-icons/react'

export const MyProjectMilestoneUpdateStatus = ({ milestone, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
  }

  const getStatusDotColor = (progress_status) => {
    switch (progress_status) {
      case "For Payment":
        return "text-yellow-400"
      case "Payment Confirmed":
        return "text-green-500"
      case "In Progress":
        return "bg-blue-500"
      case "Completed":
        return "bg-emerald-700"
      case "Cancelled":
        return "bg-red-500"
      default:
        return "bg-[#4c735c]/70"
    }
  }

  const getStatusButtonText = (status) => {
    switch (status) {
      case "Payment Confirmed":
        return "Mark as In Progress"
      case "In Progress":
        return "Mark as Completed"
      default:
        return "Default"
    }
  }

  // Handler for regular status updates (non-image)
  const handleStatusUpdate = async () => {
    let nextStatus = null
    if (milestone.progress_status === "Payment Confirmed") nextStatus = "In Progress"
    else if (milestone.progress_status === "In Progress") {
      alert("Please upload a completion photo to mark as Completed")
      return
    } else {
      alert("No status update available")
      return
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/project/project/milestones/${milestone.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: nextStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update status")

      alert(data.message)
      onClose()  // Close modal or refresh after success
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  // Handler for completing milestone with image upload
  const handleCompleteMilestone = async () => {
    if (!selectedImage) {
      alert("Please select an image as proof of completion")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('project_photo', selectedImage)

      const res = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/engr/milestones/${milestone.id}/complete`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to complete milestone')

      alert(data.message)
      onClose()  // Close modal or refresh after success
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] max-h-[90vh] overflow-auto flex flex-col">
        {/* Close button */}
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <h2 className="text-xl font-semibold mb-4">Update Status for Milestone "{milestone.status}"</h2>

          <div className="flex flex-row gap-4 items-center mb-4">
            <p className="text-gray-600">
              Status: <span className={`font-medium ${getStatusDotColor(milestone.progress_status)}`}>{milestone.progress_status}</span>
            </p>
            {(milestone.progress_status === "Payment Confirmed" || milestone.progress_status === "In Progress") && (
              <>
                {milestone.progress_status === "In Progress" ? (
                  <button
                    onClick={handleCompleteMilestone}
                    disabled={loading || !selectedImage}
                    className={`bg-green-600 hover:bg-green-700 text-white px-5 py-1 rounded-md transition ${(!selectedImage || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Completing...' : 'Mark as Completed'}
                  </button>
                ) : (
                  <button
                    onClick={handleStatusUpdate}
                    className="bg-[#4c735c] hover:bg-[#3b5d47] text-white px-5 py-1 rounded-md transition"
                  >
                    {getStatusButtonText(milestone.progress_status)}
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-1 rounded-md transition"
            >
              Cancel
            </button>
          </div>

          {/* Image Upload Area */}
          <div>
            {!selectedImage ? (
              <label
                htmlFor="imageUpload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-10 cursor-pointer hover:border-green-500 transition"
              >
                <svg
                  className="w-10 h-10 text-gray-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 12v-4m0 0l-4 4m4-4l4 4"
                  />
                </svg>
                <span className="text-gray-500">Click or drag to upload an image</span>
                <input
                  name="project_photo"
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative inline-block">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  className="max-w-full max-h-64 rounded-md border"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75 transition"
                  aria-label="Remove image"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
