import React, { useState, useEffect } from "react";
import Select from "react-select";
import axiosInstance from "../../axiosInstance";
import toast from "react-hot-toast";

function AssignPermission({ onClose }) {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchRoles();
    fetchMenus();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Role/");
      const roleOptions = response.data.data.map((role) => ({
        value: role.role_Id,
        label: role.role_name,
      }));
      setRoles(roleOptions);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const formatMenusForSelect = (menus, level = 0) => {
  const indent = "  ".repeat(level); 
  return menus.flatMap(menu => {
    const formattedMenu = {
      value: menu.id,
      label: `${indent}${level > 0 ? "└─ " : ""}${menu.title}`,
    };

    const subMenus = menu.subMenus?.length
      ? formatMenusForSelect(menu.subMenus, level + 1)
      : [];

    return [formattedMenu, ...subMenus];
  });
};


const fetchMenus = async () => {
  setLoading(true);
  try {
    const response = await axiosInstance.get("/Menu/all");
    const menuData = response.data.data || [];

    const menuOptions = formatMenusForSelect(menuData);
    setMenus(menuOptions);
  } catch (error) {
    console.error("Error fetching menus:", error);
    toast.error("Failed to load menus");
  } finally {
    setLoading(false);
  }
};

// const fetchMenus = async () => {
//     setLoading(true);
//     try {
//       const response = await axiosInstance.get("/Menu/all");
//       const menuData = response.data.data || [];

//       const groupedMenuOptions = menuData.map((menu) => ({
//         label: menu.title,
//         options: [
//           { value: menu.id, label: menu.title },
//           ...(menu.subMenus || []).map((sub) => ({
//             value: sub.id,
//             label: sub.title,
//           })),
//         ],
//       }));

//       setMenus(groupedMenuOptions);
//     } catch (error) {
//       console.error("Error fetching menus:", error);
//       toast.error("Failed to load menus");
//     } finally {
//       setLoading(false);
//     }
//   };

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/Permission/permissions");
      const data = response.data.data || [];

      const validPermissions = data.filter(
        (p) => p.id !== undefined && p.id !== null
      );
      setPermissions(validPermissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (selectedOption) => {
    setSelectedRole(selectedOption);
    setSelectedPermissions([]);
    if (selectedOption && selectedMenu) {
      fetchRolePermissions(selectedOption.value, selectedMenu.value);
    }
  };

  const handleMenuChange = (selectedOption) => {
    setSelectedMenu(selectedOption);
    setSelectedPermissions([]);
    if (selectedOption && selectedRole) {
      fetchRolePermissions(selectedRole.value, selectedOption.value);
    }
  };

  const fetchRolePermissions = async (roleId, menuId) => {
    if (!roleId || !menuId) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/Permission/role/${roleId}/menu/${menuId}/permissions`
      );
      const rolePermissions = response.data.data || [];

      const permissionIds = permissions
        .filter((permission) => rolePermissions.includes(permission.name))
        .map((permission) => permission.id);

      setSelectedPermissions(permissionIds);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      toast.error("Failed to load role permissions");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prevSelected) => {
      if (prevSelected.includes(permissionId)) {
        return prevSelected.filter((id) => id !== permissionId);
      } else {
        return [...prevSelected, permissionId];
      }
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPermissions(filteredPermissions.map((p) => p.id));
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch = permission.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "selected")
      return matchesSearch && selectedPermissions.includes(permission.id);
    if (activeTab === "unselected")
      return matchesSearch && !selectedPermissions.includes(permission.id);
    return matchesSearch;
  });

  const isAllSelected =
    filteredPermissions.length > 0 &&
    filteredPermissions.every((p) => selectedPermissions.includes(p.id));

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (!selectedMenu) {
      toast.error("Please select a menu");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        roleId: selectedRole.value,
        menuId: selectedMenu.value,
        permissionIds: selectedPermissions,
      };

      const response = await axiosInstance.post("/Permission/assign", payload);

      if (response.data.success) {
        toast.success("Role permissions updated successfully");
        onClose();
      } else {
        toast.error(
          response.data.message || "Failed to update role permissions"
        );
      }
    } catch (error) {
      console.error("Error updating role permissions:", error);
      toast.error("An error occurred while updating role permissions");
    } finally {
      setSaving(false);
    }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "42px",
      borderColor: "#e2e8f0",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#cbd5e0",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#f0f9ff" : "white",
      color: "#1e293b",
      "&:hover": {
        backgroundColor: "#e0f2fe",
      },
      textAlign: "left",
    }),
    singleValue: (base) => ({
      ...base,
      textAlign: "left",
    }),
    placeholder: (base) => ({
      ...base,
      textAlign: "left",
    }),
    menuList: (base) => ({
      ...base,
      textAlign: "left",
    }),
  };

  if (loading && !roles.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
          <div className="text-center py-8">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 overflow-y-auto py-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 flex flex-col md:flex-row">
        <div className="p-5 border-b md:border-b-0 md:border-r md:w-1/3 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Role Permission Management
          </h2>

          <div className="mb-4">
            <label className="block text-sm text-left font-medium text-gray-700 mb-1">
              Select Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedRole}
              onChange={handleRoleChange}
              options={roles}
              styles={customSelectStyles}
              placeholder="Select a role"
              isDisabled={loading || saving}
              isClearable
              className="text-left"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm text-left font-medium text-gray-700 mb-1">
              Select Menu <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedMenu}
              onChange={handleMenuChange}
              options={menus}
              styles={customSelectStyles}
              placeholder="Select a menu"
              isDisabled={loading || saving}
              isClearable
              className="text-left"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mt-2 mb-5">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Permission Summary
            </h3>
            <div className="flex justify-between items-center">
              <span>Selected</span>
              <span className="font-semibold">
                {selectedPermissions.length} of {permissions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${
                    permissions.length
                      ? (selectedPermissions.length / permissions.length) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="mt-auto">
            <h3 className="text-sm font-medium text-left text-gray-700 mb-2">
              Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() =>
                  setSelectedPermissions(permissions.map((p) => p.id))
                }
                className="w-full text-left px-3 py-2 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Select All Visible Permissions
              </button>
              <button
                onClick={() => setSelectedPermissions([])}
                className="w-full text-left px-3 py-2 rounded cursor-pointer bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Deselect All Visible Permissions
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 cursor-pointer rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={!selectedRole || !selectedMenu || saving}
            >
              {saving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>

        <div className="p-5 md:w-2/3 flex flex-col h-full max-h-[80vh] md:max-h-[600px]">
          <div className="mb-4">
            <div className="flex items-center bg-white border rounded-lg overflow-hidden">
              <div className="pl-3 pr-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                className="py-2 w-full focus:ring-0 border-0 outline-none"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="flex mb-4 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium cursor-pointer ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium cursor-pointer ${
                activeTab === "selected"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("selected")}
            >
              Selected
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium cursor-pointer ${
                activeTab === "unselected"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("unselected")}
            >
              Unselected
            </button>
          </div>

          {selectedRole && selectedMenu ? (
            <>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                  disabled={saving}
                />
                <label
                  htmlFor="select-all"
                  className="flex justify-between w-full text-sm font-medium text-gray-700"
                >
                  <span>
                    Select all {filteredPermissions.length} permissions
                  </span>
                  <span className="text-gray-500">
                    {isAllSelected ? "All selected" : "Some selected"}
                  </span>
                </label>
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 pr-1 space-y-2">
                  {filteredPermissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No permissions found matching your criteria
                    </div>
                  ) : (
                    filteredPermissions.map((permission) => {
                      const permissionId = permission.id;
                      if (!permissionId) return null;

                      const isSelected =
                        selectedPermissions.includes(permissionId);

                      return (
                        <div
                          key={permissionId}
                          className={`flex items-center p-3 rounded-lg border ${
                            isSelected
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-gray-200"
                          } hover:bg-gray-50`}
                        >
                          <input
                            type="checkbox"
                            id={`perm-${permissionId}`}
                            checked={isSelected}
                            onChange={() =>
                              handlePermissionChange(permissionId)
                            }
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-200"
                            disabled={saving}
                          />
                          <label
                            htmlFor={`perm-${permissionId}`}
                            className="flex justify-between w-full ml-2 text-sm text-gray-700"
                          >
                            <span>{permission.name}</span>
                            <span
                              className={`text-sm ${
                                isSelected ? "text-blue-600" : "text-gray-400"
                              }`}
                            >
                              {isSelected ? "Selected" : "Not Selected"}
                            </span>
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Please select both a role and menu to manage permissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignPermission;
