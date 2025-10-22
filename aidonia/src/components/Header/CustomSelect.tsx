import React, { useState, useEffect } from "react";

interface CustomSelectProps {
  options: Array<{ label: string; value: string }>;
  selectedValue?: string;
  onChange?: (value: string) => void;
}

const CustomSelect = ({
  options,
  selectedValue,
  onChange,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the selected option or default to first option
  const selectedOption = selectedValue
    ? options.find((opt) => opt.value === selectedValue) || options[0]
    : options[0];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: { label: string; value: string }) => {
    if (onChange) {
      onChange(option.value);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element).closest(".dropdown-content")) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className="dropdown-content custom-select relative"
      style={{ width: "200px" }}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option, index) => {
          // Skip first option if it's "All Categories" for display, but still allow it to be selected
          if (index === 0) return null;

          return (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className={`select-item ${
                selectedOption.value === option.value ? "same-as-selected" : ""
              }`}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomSelect;
