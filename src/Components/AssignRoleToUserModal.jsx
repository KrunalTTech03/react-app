import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import toast from "react-hot-toast";
import Select from 'react-select';

const AssignRoleToUserModal = ({ onClose, onSuccess, users = null, roles = null, isOpen = true }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localUsers, setLocalUsers] = useState([]);
  const [localRoles, setLocalRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (users) {
      const formattedUsers = users.map(user => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
        user: user
      }));
      setLocalUsers(formattedUsers);
    } else {
      getUsers();
    }
    
    if (roles) {
      const formattedRoles = roles.map(role => ({
        value: role.role_Id,
        label: role.role_name,
        role: role
      }));
      setLocalRoles(formattedRoles);
    } else {
      getRoles();
    }
  }, [users, roles]);

  const getUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get("/User/all/");
      if (response.data.success) {
        const formattedUsers = response.data.data.map(user => ({
          value: user.id,
          label: `${user.firstName} ${user.lastName}`,
          user: user
        }));
        setLocalUsers(formattedUsers);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error loading users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const getRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await axiosInstance.get("/Role/");
      if (response.data.success) {
        const formattedRoles = response.data.data.map(role => ({
          value: role.role_Id,
          label: role.role_name,
          role: role
        }));
        setLocalRoles(formattedRoles);
      } else {
        toast.error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error loading roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedRole) {
      toast.error("Please select both a user and a role");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.post("/Role/assign/", {
        userId: selectedUser.value,
        roleId: selectedRole.value
      });

      if (response.data.success) {
        toast.success("Role assigned successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to assign role");
      }
    } catch (error) {
      console.error("Error assigning role:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "An error occurred while assigning the role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      borderColor: '#e2e8f0',
      minHeight: '42px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#a855f7'
      },
      '&:focus-within': {
        borderColor: '#a855f7',
        boxShadow: '0 0 0 1px #a855f7'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? '#a855f7' 
        : state.isFocused 
          ? '#f3e8ff' 
          : base.backgroundColor,
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#a855f7' : '#f9fafb'
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      textAlign: 'left'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    singleValue: (base) => ({
      ...base,
      textAlign: 'left'
    }),
    input: (base) => ({
      ...base,
      textAlign: 'left'
    })
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-left">
          Assign Role to User
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Select User
            </label>
            <Select
              value={selectedUser}
              onChange={setSelectedUser}
              options={localUsers}
              styles={selectStyles}
              placeholder="Select a user"
              isSearchable
              isClearable
              className="text-base text-left"
              isLoading={loadingUsers}
              loadingMessage={() => "Loading users..."}
              noOptionsMessage={() => "No users found"}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Select Role
            </label>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              options={localRoles}
              styles={selectStyles}
              placeholder="Select a role"
              isSearchable
              isClearable
              className="text-base text-left"
              isLoading={loadingRoles}
              loadingMessage={() => "Loading roles..."}
              noOptionsMessage={() => "No roles found"}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg cursor-pointer bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUser || !selectedRole}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                isSubmitting || !selectedUser || !selectedRole
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                "Assign Role"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRoleToUserModal;
