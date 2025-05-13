import React, { useState, useEffect } from "react";
import { MdEdit, MdClose } from "react-icons/md";
import { motion } from "framer-motion";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axiosInstance from "../../axiosInstance";

function EditMenu({ isOpen, onClose, menuData, parentMenuOptions, onMenuUpdated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [localParentMenuOptions, setLocalParentMenuOptions] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      icon: "",
      path: "",
      order: 0,
      parentMenuId: null,
    },
  });

  useEffect(() => {
    if (menuData && isOpen) {
      reset({
        title: menuData.title || "",
        icon: menuData.icon || "",
        path: menuData.path || "",
        order: menuData.order || 0,
        parentMenuId: menuData.parentMenuId || null,
      });

      if (!parentMenuOptions || parentMenuOptions.length === 0) {
        fetchParentMenus();
      } else {
        setLocalParentMenuOptions(parentMenuOptions);
      }
    }
  }, [menuData, isOpen, reset]);

  useEffect(() => {
    if (parentMenuOptions && parentMenuOptions.length > 0) {
      setLocalParentMenuOptions(parentMenuOptions);
    }
  }, [parentMenuOptions]);

  const fetchParentMenus = async () => {
    try {
      const response = await axiosInstance.get("/Menu/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const filteredMenus = response.data.data.filter(
          (menu) => menu.id !== menuData?.id
        );
        
        const options = filteredMenus.map((menu) => ({
          value: menu.id,
          label: menu.title,
        }));
        
        setLocalParentMenuOptions(options);
      }
    } catch (error) {
      console.error("Error fetching parent menus:", error);
    }
  };

  const handleParentMenuChange = (selectedOption) => {
    setValue("parentMenuId", selectedOption ? selectedOption.value : null);
  };

  const handleUpdateMenu = async (formData) => {
    if (!menuData?.id) {
      toast.error("Menu ID is missing");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.put(
        `/Menu/update/${menuData.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Menu updated successfully!");
        
        // Create an updated menu object with the new data
        const updatedMenu = {
          ...menuData,
          ...formData
        };
        
        // Call the callback function to update parent component state
        if (onMenuUpdated) {
          onMenuUpdated(updatedMenu);
        }
        
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        toast.error(response.data.message || "Failed to update menu");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating menu");
      console.error("Error updating menu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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

  // Find the current parent menu option
  const selectedParentMenu = localParentMenuOptions.find(
    (option) => option.value === watch("parentMenuId")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 relative overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <MdEdit className="mr-2" size={22} />
              Edit Menu
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

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(handleUpdateMenu)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 2,
                      message: "Title must be at least 2 characters",
                    },
                  })}
                  type="text"
                  placeholder="Enter menu title"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.title ? "border-red-500" : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Icon
                </label>
                <input
                  {...register("icon")}
                  type="text"
                  placeholder="Enter icon name or emoji"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Path
                </label>
                <input
                  {...register("path", {
                    pattern: {
                      value: /^\/.*$/,
                      message: "Path should start with /",
                    },
                  })}
                  type="text"
                  placeholder="Enter menu path (e.g. /admin/dashboard)"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.path ? "border-red-500" : ""
                  }`}
                />
                {errors.path && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.path.message}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Display Order
                </label>
                <input
                  {...register("order", {
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Order must be a positive number",
                    },
                  })}
                  type="number"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.order ? "border-red-500" : ""
                  }`}
                />
                {errors.order && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.order.message}
                  </p>
                )}
              </div>

              <div className="mb-4 col-span-1 sm:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Parent Menu (optional)
                </label>
                <Select
                  isClearable
                  onChange={handleParentMenuChange}
                  options={localParentMenuOptions}
                  value={selectedParentMenu}
                  placeholder="Select parent menu (optional)"
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  noOptionsMessage={() => "No parent menus available"}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to set as a top-level menu
                </p>
              </div>
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
                className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[100px] ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Menu</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default EditMenu;