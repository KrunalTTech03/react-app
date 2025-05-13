import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Select from "react-select";

const AssignRoleToUserModal = ({ onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch users and roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersResponse = await axiosInstance.get("/User/all/");
        if (usersResponse.data.success) {
          const formattedUsers = usersResponse.data.data.map(user => ({
            value: user.id,
            label: `${user.firstName} ${user.lastName}`
          }));
          setUsers(formattedUsers);
        }
        
        // Fetch roles
        const rolesResponse = await axiosInstance.get("/Role/");
        if (rolesResponse.data.success) {
          const formattedRoles = rolesResponse.data.data.map(role => ({
            value: role.role_Id,
            label: role.role_name
          }));
          setRoles(formattedRoles);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load users and roles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedRole) {
      toast.error("Please select both user and role");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/Role/assign/", {
        userId: selectedUser.value,
        roleId: selectedRole.value
      });
      
      if (response.data.success) {
        toast.success(`Role "${selectedRole.label}" assigned to ${selectedUser.label} successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to assign role");
      }
    } catch (error) {
      console.error("Error assigning role:", error);
      const errorMessage = error.response?.data?.message || "An error occurred while assigning the role";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#e2e8f0',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#cbd5e0',
      },
      textAlign: 'left'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f3f4f6' : null,
      color: state.isSelected ? 'white' : '#374151',
      textAlign: 'left'
    }),
    singleValue: (provided) => ({
      ...provided,
      textAlign: 'left'
    }),
    placeholder: (provided) => ({
      ...provided,
      textAlign: 'left'
    }),
    input: (provided) => ({
      ...provided,
      textAlign: 'left'
    })
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-100 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Assign Role to User</h2>
          <p className="text-blue-100 text-sm mt-1">Select a user and assign a role</p>
        </div>
        
        {loading ? (
          <div className="p-6 flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select User
              </label>
              <Select
                options={users}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Choose a user..."
                isSearchable
                className="text-sm text-left"
                styles={customSelectStyles}
                noOptionsMessage={() => "No users found"}
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Role
              </label>
              <Select
                options={roles}
                value={selectedRole}
                onChange={setSelectedRole}
                placeholder="Choose a role..."
                isSearchable
                className="text-sm text-left"
                styles={customSelectStyles}
                noOptionsMessage={() => "No roles found"}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                disabled={isSubmitting || !selectedUser || !selectedRole}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Assigning...
                  </span>
                ) : (
                  "Assign Role"
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AssignRoleToUserModal;