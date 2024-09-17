import { axios_instance } from "@/axios";
import { Autocomplete, Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";

// componenet to select difficuly level, rock type, or state for a location

interface diffListProps {
  defValue: any;  // default value
  error: boolean;  // should error text appear
  helperText: string;  // text shown on error
  handleChange: (event: any, newDiff:any) => void;  // callback for value change
  label: string;  // label for input, such as "Enter a rock type"
  type: 'diff' | 'state' | 'rock';
  style?: {};
  helperTextProps?: {};  // used to add styles to helperText
  arrayValues?: boolean  // sometimes this component stores values such as [value, display_value]
                         // where display_value is actully shown on the screen, yet value is sent
                         // to the backend. This is because of a lapase in planning with the backend,
                         // but anyway this boolean is true if the values are i such form, false if the 
                         // value is both the value and display value.
  id?:string
}

export default function LocationAttributeSelector({defValue, error, helperText, handleChange, label, type, 
                                                  style, helperTextProps, arrayValues = true, id}:diffListProps) {
  const [options, setOptions] = useState([]);  // possible values to select

  useEffect(() => {
    const fetchStates = async() => {
      try {
        const response = await axios_instance.get('api/locations/getstates');
        let tmp = JSON.parse(response.data);
        if (!arrayValues) {
          tmp = tmp.map((val:any) => val[1]);
          tmp.push('');
        } else {
          tmp.push(['', '']);
        }
        setOptions(tmp);
      } catch (error) {
        console.error(error)
      }
    }

    const fetchDifficultyLvls = async() => {
      try {
        const response = await axios_instance.get('api/locations/difficulty-levels');
        let tmp = JSON.parse(response.data);
        if (!arrayValues) {
          tmp = tmp.map((val:any) => val[1]);
          tmp.push('');
        } else {
          tmp.push(['', '']);
        }
        setOptions(tmp);
      } catch (error) {
        console.error(error)
      }
    }

    const fetchRockTypes = async() => {
      try {
        const response = await axios_instance.get('api/locations/rock-types');
        let tmp = JSON.parse(response.data);
        if (!arrayValues) {
          tmp = tmp.map((val:any) => val[1]);
          tmp.push('');
        } else {
          tmp.push(['', '']);
        }
        setOptions(tmp);
      } catch (error) {
        console.error(error)
      }
    }

    if (type === 'state')
      fetchStates();
    else if (type === 'diff')
      fetchDifficultyLvls();
    else if (type === 'rock')
      fetchRockTypes();
  }, []);

  return (
    <Autocomplete
      id={id}
      style={style}
      size="small"
      options={options}
      defaultValue={defValue}
      getOptionLabel={arrayValues ? (option) => option[1] : (option) => option}
      renderInput={(params) => 
        <TextField 
          {...params} 
          label={label} 
          error={error}
          helperText={helperText}
          FormHelperTextProps={helperTextProps}
      />}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {arrayValues ? option[1] : option}
        </Box>
      )}
      onChange={handleChange}
    />
  )
}