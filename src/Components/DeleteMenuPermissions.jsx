import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../axiosInstance';

function DeleteMenuPermissions({ onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [menus, setMenus] = useState([]);
  const [, setPermissions] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [menuPermissions, setMenuPermissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMenus();
    fetchPermissions();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await axiosInstance.get("/Menu/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data.success) {
        const menuOptions = response.data.data.map(menu => ({
          value: menu.id,
          label: menu.title
        }));
        setMenus(menuOptions);
      } else {
        toast.error("Failed to fetch menus: " + response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching menus");
      console.error("Error fetching menus:", error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axiosInstance.get("/Permission/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data.success) {
        const permissionOptions = response.data.data.map(permission => ({
          value: permission.id,
          label: permission.name
        }));
        setPermissions(permissionOptions);
      } else {
        toast.error("Failed to fetch permissions: " + response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching permissions");
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchMenuPermissions = async (menuId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/Menu/${menuId}/permissions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (response.data.success) {
        const permissionOptions = response.data.data.map(permission => ({
          value: permission.id,
          label: permission.name
        }));
        setMenuPermissions(permissionOptions);
      } else {
        toast.error("Failed to fetch menu permissions: " + response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching menu permissions");
      console.error("Error fetching menu permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuChange = (selectedOption) => {
    setSelectedMenu(selectedOption);
    setSelectedPermissions([]);
    if (selectedOption) {
      fetchMenuPermissions(selectedOption.value);
    } else {
      setMenuPermissions([]);
    }
  };

  const handlePermissionChange = (selectedOptions) => {
    setSelectedPermissions(selectedOptions || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMenu) {
      toast.error("Please select a menu");
      return;
    }
    
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission to remove");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.delete("/Menu/delete-menu-permission", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        data: {
          menuId: selectedMenu.value,
          permissionIds: selectedPermissions.map(p => p.value)
        }
      });
      
      if (response.data.success) {
        toast.success("Menu permissions deleted successfully!");
        setSelectedMenu(null);
        setSelectedPermissions([]);
        setMenuPermissions([]);
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to delete menu permissions");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting menu permissions");
      console.error("Error deleting menu permissions:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      boxShadow: 'none',
      borderColor: '#e2e8f0',
      '&:hover': {
        borderColor: '#cbd5e0',
      },
      padding: '2px',
      borderRadius: '0.5rem',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
      color: state.isSelected ? 'white' : '#4b5563',
      cursor: 'pointer',
      ':active': {
        backgroundColor: '#3b82f6',
        color: 'white',
      }
    }),
    menu: (provided) => ({
      ...provided,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      borderRadius: '0.5rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#dbeafe',
      borderRadius: '0.25rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#1e40af',
      fontWeight: 500,
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#3b82f6',
      ':hover': {
        backgroundColor: '#bfdbfe',
        color: '#1e40af',
      },
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 relative overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              Remove Menu Permissions
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
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Select Menu <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedMenu}
                  onChange={handleMenuChange}
                  options={menus}
                  placeholder="Select a menu"
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No menus available"}
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : menuPermissions.length > 0 ? (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Select Permissions to Remove <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedPermissions}
                    onChange={handlePermissionChange}
                    options={menuPermissions}
                    placeholder="Select permissions to remove"
                    styles={selectStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isMulti
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "No permissions available"}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Select the permissions that you want to remove from the selected menu
                  </p>
                </div>
              ) : selectedMenu ? (
                <div className="bg-gray-100 p-4 rounded-lg text-gray-600 text-center">
                  No permissions found for this menu
                </div>
              ) : null}
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
                disabled={isSubmitting || !selectedMenu || selectedPermissions.length === 0}
                className={`px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[100px] ${
                  isSubmitting || !selectedMenu || selectedPermissions.length === 0 ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Remove Permissions</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default DeleteMenuPermissions;