import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../axiosInstance';
import { toast } from 'react-hot-toast';

function CreateMenuPermission({ onClose, onPermissionCreated }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: ""
    }
  });

  const handleCreatePermission = async (formData) => {
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post("/Menu/create-permission", {
        id: "00000000-0000-0000-0000-000000000000",
        name: formData.name
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });
      
      if (response.data.success) {
        toast.success("Permission created successfully!");
        reset();
        if (onPermissionCreated) {
          onPermissionCreated(response.data.data);
        }
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to create permission");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating permission");
      console.error("Error creating permission:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur bg-opacity-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-0 relative overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Create New Permission</h2>
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
          <form onSubmit={handleSubmit(handleCreatePermission)}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Permission Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", { 
                  required: "Permission name is required",
                  minLength: {
                    value: 2,
                    message: "Permission name must be at least 2 characters"
                  }
                })}
                type="text"
                placeholder="Enter permission name (e.g., View, Edit, Delete)"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  errors.name ? "border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[100px] ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Permission</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateMenuPermission;