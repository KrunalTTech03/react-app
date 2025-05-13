import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { motion } from "framer-motion";
import Select from "react-select";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-hot-toast";

const AssignMenuPermission = ({ onClose, onPermissionsAssigned }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [menuOptions, setMenuOptions] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || null;
    setCurrentUserId(userId);

    fetchAllMenus();
    fetchAllPermissions();
    fetchAllRoles();
  }, []);

  const fetchAllMenus = async () => {
    setLoadingMenus(true);
    try {
      const response = await axiosInstance.get("/Menu/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const menuData = response.data.data;
        const processedMenuOptions = processMenusForSelect(menuData);
        setMenuOptions(processedMenuOptions);

        if (currentUserId) {
          checkUserMenuPermissions(currentUserId);
        }
      } else {
        toast.error("Failed to fetch menus");
      }
    } catch (error) {
      toast.error("Error fetching menus");
      console.error("Error fetching menus:", error);
    } finally {
      setLoadingMenus(false);
    }
  };

  const processMenusForSelect = (menus, level = 0, path = "") => {
    let options = [];

    menus.forEach((menu) => {
      const indent = "—".repeat(level);
      const prefix = level > 0 ? `${indent} ` : "";

      options.push({
        value: menu.id,
        label: `${prefix}${menu.title}`,
        path: menu.path,
        isParent: menu.subMenus && menu.subMenus.length > 0,
      });

      if (menu.subMenus && menu.subMenus.length > 0) {
        const subOptions = processMenusForSelect(
          menu.subMenus,
          level + 1,
          `${path}${menu.path}/`
        );
        options = [...options, ...subOptions];
      }
    });

    return options;
  };

  const checkUserMenuPermissions = async (userId) => {
    try {
      const response = await axiosInstance.get(`/Menu/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const userMenus = response.data.data;

        const accessibleMenuIds = extractMenuIds(userMenus);

        setMenuOptions((prevOptions) =>
          prevOptions.map((option) => ({
            ...option,
            hasAccess: accessibleMenuIds.includes(option.value),
          }))
        );
      }
    } catch (error) {
      console.error("Error checking user menu permissions:", error);
    }
  };

  const extractMenuIds = (menus) => {
    let ids = [];

    menus.forEach((menu) => {
      ids.push(menu.id);

      if (menu.subMenus && menu.subMenus.length > 0) {
        ids = [...ids, ...extractMenuIds(menu.subMenus)];
      }
    });

    return ids;
  };

  const fetchAllRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await axiosInstance.get("/Role", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const roles = response.data.data
          .filter((role) => !role.isDeleted)
          .map((role) => ({
            value: role.role_Id,
            label: role.role_name,
          }));

        setRoleOptions(roles);
      } else {
        toast.error("Failed to fetch roles");
      }
    } catch (error) {
      toast.error("Error fetching roles");
      console.error("Error fetching roles:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchAllPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const response = await axiosInstance.get("/Menu/permission-all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const permissions = response.data.map((perm) => ({
          value: perm.id,
          label: perm.name,
        }));
        setAvailablePermissions(permissions);
      } else if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        const permissions = response.data.data.map((perm) => ({
          value: perm.id,
          label: perm.name,
        }));
        setAvailablePermissions(permissions);
      } else {
        console.error("Unexpected response format:", response.data);
        toast.error("Failed to parse permissions data");
      }
    } catch (error) {
      toast.error("Error fetching permissions");
      console.error("Error fetching permissions:", error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const fetchExistingPermissions = async (menuId, roleId) => {
    if (!menuId || !roleId) return;

    try {
      const response = await axiosInstance.get(
        `/Menu/permissions/${menuId}/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.success) {
        const existingPermissionIds = response.data.data.map(
          (p) => p.permissionId
        );

        const existingPermissions = availablePermissions.filter((p) =>
          existingPermissionIds.includes(p.value)
        );

        setSelectedPermissions(existingPermissions);
      }
    } catch (error) {
      console.error("Error fetching existing permissions:", error);
    }
  };

  const handleMenuChange = (option) => {
    setSelectedMenu(option);

    setSelectedPermissions([]);

    if (option && selectedRole) {
      fetchExistingPermissions(option.value, selectedRole.value);
    }
  };

  const handleRoleChange = (option) => {
    setSelectedRole(option);

    setSelectedPermissions([]);

    if (selectedMenu && option) {
      fetchExistingPermissions(selectedMenu.value, option.value);
    }
  };

  const handlePermissionsChange = (options) => {
    setSelectedPermissions(options || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMenu) {
      toast.error("Please select a menu");
      return;
    }

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    setIsLoading(true);

    try {
      const permissionIds = selectedPermissions.map((p) => p.value);

      const payload = {
        menuId: selectedMenu.value,
        permissionIds: permissionIds,
        roleId: selectedRole.value,
      };

      console.log("Sending payload:", payload);

      const response = await axiosInstance.post(
        "/Menu/assign-permission",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Permissions assigned successfully!");

        window.dispatchEvent(new Event("menuPermissionsUpdated"));

        if (onPermissionsAssigned) {
          onPermissionsAssigned();
        }

        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to assign permissions");
      }
    } catch (error) {
      console.error("Error assigning permissions:", error);
      toast.error(
        error.response?.data?.message || "Error assigning permissions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      boxShadow: "none",
      borderColor: "#e2e8f0",
      "&:hover": {
        borderColor: "#cbd5e0",
      },
      padding: "2px",
      borderRadius: "0.5rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#dbeafe"
        : "white",
      color: state.isSelected ? "white" : "#4b5563",
      cursor: "pointer",
      ":active": {
        backgroundColor: "#3b82f6",
        color: "white",
      },
    }),
    menu: (provided) => ({
      ...provided,
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      borderRadius: "0.5rem",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
  };

  const formattedMenuOptions = menuOptions.map((option) => ({
    ...option,
    label: (
      <div className="flex items-center justify-between w-full">
        <span>{option.label}</span>
        <div className="flex items-center space-x-2">
          {option.isParent && (
            <span className="text-xs bg-gray-200 px-1 rounded">Parent</span>
          )}
          {option.hasAccess && (
            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
              Access
            </span>
          )}
        </div>
      </div>
    ),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-0 relative overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Assign Menu Permissions</h2>
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
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Select Menu <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedMenu}
                onChange={handleMenuChange}
                options={formattedMenuOptions}
                placeholder={
                  loadingMenus ? "Loading menus..." : "Select a menu"
                }
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable
                isClearable
                isLoading={loadingMenus}
                formatOptionLabel={({ label }) => label}
              />
              {!selectedMenu && (
                <p className="text-gray-500 text-xs mt-1">
                  Select a menu to assign permissions
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedRole}
                onChange={handleRoleChange}
                options={roleOptions}
                placeholder={loadingRoles ? "Loading roles..." : "Select role"}
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                isSearchable
                isClearable
                isLoading={loadingRoles}
                noOptionsMessage={() => "No roles available"}
              />
              <p className="text-gray-500 text-xs mt-1">
                Select a role for these permissions
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Permissions <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedPermissions}
                onChange={handlePermissionsChange}
                options={availablePermissions}
                placeholder={
                  loadingPermissions
                    ? "Loading permissions..."
                    : "Select permissions"
                }
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
                isMulti
                isSearchable
                isLoading={loadingPermissions}
                noOptionsMessage={() => "No permissions available"}
              />
              {availablePermissions.length > 0 ? (
                <p className="text-gray-500 text-xs mt-1">
                  You can select multiple permissions
                </p>
              ) : (
                <p className="text-red-500 text-xs mt-1">
                  No permissions available
                </p>
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
                disabled={
                  isLoading ||
                  !selectedMenu ||
                  !selectedRole ||
                  !selectedPermissions.length
                }
                className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[100px] ${
                  isLoading ||
                  !selectedMenu ||
                  !selectedRole ||
                  !selectedPermissions.length
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <span>Assign Permissions</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignMenuPermission;