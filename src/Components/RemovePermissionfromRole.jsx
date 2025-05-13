import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosInstance";
import toast from "react-hot-toast";
import Select from 'react-select';

function RemovePermissionfromRole({ isOpen, onClose, roles }) {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Transform roles data for react-select
  const roleOptions = roles.map(role => ({
    value: role.role_Id,
    label: role.role_name
  }));

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole.value);
    } else {
      setPermissions([]);
      setSelectedPermission(null);
    }
  }, [selectedRole]);

  const fetchRolePermissions = async (roleId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Permission/role-permissions");
      const rolePermissions = response.data.data.filter(
        (permission) => permission.roleId === roleId
      );
      setPermissions(rolePermissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error.message);
      toast.error("Failed to fetch role permissions");
    } finally {
      setLoading(false);
    }
  };

  // Transform permissions data for react-select
  const permissionOptions = permissions.map(permission => ({
    value: permission.permissionId,
    label: permission.permissionName
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    
    if (!selectedPermission) {
      toast.error("Please select a permission");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        roleId: selectedRole.value,
        permissionIds: [selectedPermission.value]
      };
      
      const response = await axiosInstance.delete("/Permission/remove", { 
        data: payload 
      });

      if (response.data.success) {
        toast.success("Permission removed successfully");
        // Refresh permissions list
        fetchRolePermissions(selectedRole.value);
        setSelectedPermission(null);
      } else {
        toast.error(response.data.message || "Failed to remove permission");
      }
    } catch (error) {
      console.error("Error removing permission:", error.response?.data || error.message);
      toast.error("An error occurred while removing the permission");
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for react-select
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
      color: '#9ca3af'
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    })
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Remove Permission from Role
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Role
            </label>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              options={roleOptions}
              styles={selectStyles}
              placeholder="Select a role"
              isSearchable
              isClearable
              className="text-base"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Permission to Remove
            </label>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : permissionOptions.length > 0 ? (
              <Select
                value={selectedPermission}
                onChange={setSelectedPermission}
                options={permissionOptions}
                styles={selectStyles}
                placeholder="Select a permission"
                isSearchable
                isClearable
                isDisabled={!selectedRole}
                className="text-base"
              />
            ) : (
              <div className="text-gray-500 italic py-2 px-4 border border-gray-200 rounded-lg bg-gray-50">
                {selectedRole ? "No permissions assigned to this role" : "Select a role first"}
              </div>
            )}
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
              disabled={loading || !selectedRole || !selectedPermission}
              className={`px-4 py-2 rounded-lg cursor-pointer ${
                loading || !selectedRole || !selectedPermission
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              } text-white flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Removing...
                </>
              ) : (
                "Remove Permission"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RemovePermissionfromRole;