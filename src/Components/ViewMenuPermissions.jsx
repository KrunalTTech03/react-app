import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdDelete } from 'react-icons/md';
import axiosInstance from '../../axiosInstance';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

function ViewMenuPermissions({ onClose }) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/Menu/permission-all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      // Handle the direct array response
      if (Array.isArray(response.data)) {
        setPermissions(response.data);
      } else if (response.data.success && Array.isArray(response.data.data)) {
        setPermissions(response.data.data);
      } else {
        toast.error("Invalid permissions data format");
        console.error("Invalid permissions data format:", response.data);
      }
    } catch (error) {
      toast.error("Error fetching permissions");
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (permission) => {
    Swal.fire({
      title: 'Confirm Delete',
      text: `Are you sure you want to delete the permission "${permission.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // red-600
      cancelButtonColor: '#6b7280', // gray-500
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(permission);
      }
    });
  };

  const confirmDelete = async (permission) => {
    try {
      // Show loading state with SweetAlert2
      Swal.fire({
        title: 'Deleting...',
        text: 'Please wait while we delete the permission',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const response = await axiosInstance.delete(`/Menu/delete-permission/${permission.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data.success) {
        // Close the loading dialog
        Swal.close();
        
        // Show success message
        Swal.fire({
          title: 'Deleted!',
          text: 'Permission has been successfully deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Remove the deleted permission from state
        setPermissions(permissions.filter(p => p.id !== permission.id));
      } else {
        Swal.fire({
          title: 'Error!',
          text: response.data.message || "Failed to delete permission",
          icon: 'error'
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error deleting permission";
      
      let errorTitle = 'Error!';
      let errorText = errorMessage;
      
      if (error.response?.status === 401) {
        errorTitle = 'Access Denied';
        errorText = 'Only admins can delete permissions.';
      } else if (error.response?.status === 500) {
        errorTitle = 'Server Error';
        errorText = 'A server error occurred while processing your request.';
      }
      
      Swal.fire({
        title: errorTitle,
        text: errorText,
        icon: 'error'
      });
      
      console.error('Error deleting permission:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-0 relative overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              Available Permissions
            </h2>
            <button
              className="text-white hover:text-gray-200 transition-colors"
              onClick={onClose}
              aria-label="Close Modal"
            >
              <MdClose size={22} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-3 text-gray-600">Loading permissions...</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {permissions.length > 0 ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {permissions.map((permission) => (
                      <li 
                        key={permission.id} 
                        className="px-4 py-3 hover:bg-gray-100 transition-colors flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800">{permission.name}</span>
                        <div className="flex items-center">
                          <span className="text-gray-500 text-sm mr-3">{permission.id.substring(0, 8)}...</span>
                          <button
                            onClick={() => handleDeleteClick(permission)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                            title="Delete permission"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No permissions found.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ViewMenuPermissions;