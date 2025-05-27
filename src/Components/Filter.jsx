import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosInstance from "../../axiosInstance";

const stringConditions = [
  { value: "Contains", label: "Contains" },
  { value: "NotContains", label: "Not Contains" },
];

const numberConditions = [
  { value: "Equalsto", label: "Equals to" },
  { value: "NotEqualsto", label: "Not Equals to" },
];

const getConditionsForColumn = (col) => {
  const lower = col.toLowerCase();
  if (lower === "phone" || lower === "order") {
    return numberConditions;
  }
  return stringConditions;
};

const Filter = ({ column, onApply, onClose, position, onFilterRequest }) => {
  const [condition, setCondition] = useState(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conditionOptions, setConditionOptions] = useState(getConditionsForColumn(column));

  useEffect(() => {
    setConditionOptions(getConditionsForColumn(column));
    setCondition(null); 
  }, [column]);

  const handleLegacyApply = async () => {
    if (!condition) {
      setError("Please select a condition.");
      return;
    }
    if (!value.trim()) {
      setError("Please enter a value.");
      return;
    }

    setError("");
    setLoading(true);

    const filters = [
      {
        column: column.toLowerCase(),
        condition: condition.value
          .toLowerCase()
          .replace("equalsto", "equals")
          .replace("notequalsto", "notequals"),
        value: value,
      },
    ];

    try {
      let response;
      if (column === "Name" || column === "assignedroles") {
        response = await axiosInstance.post("/Permission/filter", filters);
      } else if (column === "role_name" || column === "permission") {
        response = await axiosInstance.post("/Role/filter", filters);
      } else {
        response = await axiosInstance.post("/User/filter", filters);
      }

      const data = response.data;

      if (!data.success) {
        toast.error(data.message || "Filter failed.");
        onApply(null);
      } else {
        const result = Array.isArray(data.data) ? data.data : [];
        onApply(result);
      }
      onClose();
    } catch (error) {
      console.error("Error applying filter:", error);
      toast.error("Error applying filter.");
      onApply(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFilterApply = async () => {
    if (!condition) {
      setError("Please select a condition.");
      return;
    }
    if (!value.trim()) {
      setError("Please enter a value.");
      return;
    }

    setError("");
    setLoading(true);

    const filters = [
      {
        column: column.toLowerCase(),
        condition: condition.value
          .toLowerCase()
          .replace("equalsto", "equals")
          .replace("notequalsto", "notequals")
          .replace("notcontains", "notcontains"),
        value: value,
      },
    ];

    try {
      const data = await onFilterRequest(filters);
      if (!data) {
        onApply(null);
      } else {
        onApply(data);
      }
      onClose();
    } catch (error) {
      console.error("Error applying filter:", error);
      toast.error("Error applying filter.");
      onApply(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCondition(null);
    setValue("");
    onApply(null);
  };

  return (
    <div
      className="filter-popup fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-64 p-4"
      style={{
        top: position?.top ?? 150,
        left: position?.left ?? 150,
      }}
    >
      <div className="mb-3">
        <label className="text-sm font-bold text-gray-700 mb-1 block">
          Column
        </label>
        <input
          type="text"
          value={column}
          disabled
          className="w-full bg-gray-100 text-sm p-2 rounded-md text-gray-600"
        />
      </div>

      <div className="mb-3">
        <label className="text-sm font-bold text-gray-700 mb-1 block">
          Condition
        </label>
        <Select
          value={condition}
          onChange={setCondition}
          options={conditionOptions}
          isSearchable={false}
          placeholder="Select condition"
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "36px",
              fontSize: "0.875rem",
              cursor: "pointer",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: "0.875rem",
            }),
          }}
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-bold text-gray-700 mb-1 block">
          Value
        </label>
        <div className="flex items-center bg-gray-100 rounded px-2 py-1">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError("");
            }}
            placeholder="Enter value..."
            className="bg-transparent w-full outline-none text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium mb-2">{error}</p>
      )}

      <div className="flex justify-between">
        <button
          onClick={handleClear}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
        <button
          onClick={onFilterRequest ? handleCustomFilterApply : handleLegacyApply}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition duration-200 ${
            loading
              ? "bg-gray-400 cursor-wait"
              : "bg-gray-700 hover:bg-gray-800 text-white cursor-pointer"
          }`}
          disabled={loading}
        >
          {loading ? (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 000 16v-4l-3.5 3.5L12 24v-4a8 8 0 01-8-8z"
              ></path>
            </svg>
          ) : (
            <>
              <FiSearch className="text-white" />
              <span>Apply</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Filter;