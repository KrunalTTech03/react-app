import React, { useState } from "react";
import { MdDelete, MdWarning, MdClose } from "react-icons/md";
import { motion } from "framer-motion";
import axiosInstance from "../../axiosInstance";
import { toast } from "react-hot-toast";

function DeleteMenu({ menuId, menuTitle, onClose, onDeleteSuccess, hasSubMenus }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (hasSubMenus) {
      toast.error("Cannot delete a menu that has sub-menus");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/Menu/delete/${menuId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.data.success) {
        toast.success("Menu deleted successfully");
        onDeleteSuccess();
        onClose();
      } else {
        toast.error(response.data.message || "Failed to delete menu");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error deleting menu";
      toast.error(errorMessage);
      console.error("Error deleting menu:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-0 relative overflow-hidden"
      >
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <MdDelete className="mr-2" size={22} />
              Delete Menu
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
          {hasSubMenus ? (
            <div className="bg-yellow-50 p-4 mb-4 rounded-lg border border-yellow-200 flex items-start">
              <MdWarning className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-yellow-700">Cannot Delete</h3>
                <p className="text-yellow-600 text-sm mt-1">
                  This menu has sub-menus. Please delete all sub-menus first before deleting this menu.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <MdWarning className="text-red-600" size={32} />
                </div>
              </div>
              <p className="text-gray-700 text-center">
                Are you sure you want to delete the menu <span className="font-medium">"{menuTitle}"</span>? This action cannot be undone.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || hasSubMenus}
              className={`px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors font-medium shadow-sm flex items-center justify-center min-w-[100px] ${
                (isDeleting || hasSubMenus) ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Menu</span>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DeleteMenu;