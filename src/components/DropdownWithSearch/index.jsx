import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

function DropdownWithSearch({ options, onSelect }) {
  const [selectedValue, setSelectedValue] = useState(null);
  const [inputValue, setInputValue] = useState("");

  // Automatically select the first option when component mounts
  useEffect(() => {
    if (options && options.length > 0 && !selectedValue) {
      const firstOption = options[0];
      setSelectedValue(firstOption);
      setInputValue(firstOption);
      onSelect(firstOption);
    }
  }, [options, onSelect, selectedValue]);

  const handleInputChange = (event, value) => {
    setSelectedValue(value);
    onSelect(value);
  };

  return (
    <Autocomplete
      sx={{ width: "250px" }}
      options={options}
      value={selectedValue}
      onChange={handleInputChange}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      disableClearable // This removes the clear button
      renderInput={(params) => (
        <TextField
          {...params}
          label="Years"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
          }}
        />
      )}
    />
  );
}

export default DropdownWithSearch;
