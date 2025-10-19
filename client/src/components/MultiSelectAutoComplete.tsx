import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface MultiSelectAutocompleteProps {
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    noneOption?: string;
}

export default function MultiSelectAutocomplete({
    options,
    selectedValues,
    onChange,
    placeholder = "Type to search or select...",
    noneOption = "None of the above",
}: MultiSelectAutocompleteProps) {
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter options based on input
    useEffect(() => {
        if (inputValue.trim() === "") {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter((option) =>
                option.toLowerCase().includes(inputValue.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [inputValue, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        const isNone = value === noneOption;

        if (isNone) {
            // If selecting "None", clear all other selections
            onChange([value]);
            setInputValue("");
            setIsOpen(false);
        } else {
            // Remove "None" if it was selected
            const withoutNone = selectedValues.filter((v) => v !== noneOption);

            if (selectedValues.includes(value)) {
                // Deselect
                onChange(withoutNone.filter((v) => v !== value));
            } else {
                // Select
                onChange([...withoutNone, value]);
            }
            setInputValue("");
            inputRef.current?.focus();
        }
    };

    const handleRemove = (value: string) => {
        onChange(selectedValues.filter((v) => v !== value));
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Backspace to remove last tag
        if (
            e.key === "Backspace" &&
            inputValue === "" &&
            selectedValues.length > 0
        ) {
            onChange(selectedValues.slice(0, -1));
        }
        // Enter to select first filtered option
        else if (
            e.key === "Enter" &&
            filteredOptions.length > 0 &&
            inputValue !== ""
        ) {
            e.preventDefault();
            handleSelect(filteredOptions[0]);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Main Input Container */}
            <div
                onClick={() => {
                    setIsOpen(true);
                    inputRef.current?.focus();
                }}
                className={`min-h-[56px] p-3 rounded-lg border-2 cursor-text transition-all duration-200 ${
                    isOpen
                        ? "border-[#D2A0F0] bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
            >
                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                    <AnimatePresence>
                        {selectedValues.map((value) => (
                            <motion.div
                                key={value}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all bg-white border-2 text-gray-700 shadow-sm"
                                style={{
                                    borderColor: "#D2A0F0",
                                }}
                            >
                                <span>{value}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(value);
                                    }}
                                    className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedValues.length === 0 ? placeholder : ""}
                    className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Dropdown Options */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                No matches found
                            </div>
                        ) : (
                            <div className="py-2">
                                {/* None option at the top */}
                                <button
                                    onClick={() => handleSelect(noneOption)}
                                    className={`w-full text-left px-4 py-2.5 transition-all ${
                                        selectedValues.includes(noneOption)
                                            ? "bg-purple-50 text-[#D2A0F0] font-semibold"
                                            : "hover:bg-gray-50 text-gray-900"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{noneOption}</span>
                                        {selectedValues.includes(
                                            noneOption
                                        ) && (
                                            <span
                                                className="text-sm"
                                                style={{ color: "#D2A0F0" }}
                                            >
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                </button>

                                {/* Separator */}
                                <div className="my-2 border-t border-gray-200"></div>

                                {/* Regular options */}
                                {filteredOptions
                                    .filter((opt) => opt !== noneOption)
                                    .map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleSelect(option)}
                                            className={`w-full text-left px-4 py-2.5 transition-all ${
                                                selectedValues.includes(option)
                                                    ? "bg-purple-50 text-[#D2A0F0] font-semibold"
                                                    : "hover:bg-gray-50 text-gray-900"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                {selectedValues.includes(
                                                    option
                                                ) && (
                                                    <span
                                                        className="text-sm"
                                                        style={{
                                                            color: "#D2A0F0",
                                                        }}
                                                    >
                                                        ✓
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
