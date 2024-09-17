import { axios_instance } from "@/axios";
import { Autocomplete, Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";

interface props {
  error: boolean;
  helperText: string;
  onChange: (event: any, newVal:any) => void;
}

export default function AlternateLocationSearchBar({error, helperText, onChange}:props) {
  const [search, setSearch] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const getLocations = async() => {
      let data:any = [];
      try {
        const response = await axios_instance.get('api/search/?keyword=' + search);
        for (const elem of response.data) {
            let loc = elem.fields;
            loc.name = elem.pk;
            data.push(loc);
        }
        setLocations(data);
      } catch (error) {
        console.error(error)
      }
    }

    if (!document.URL.includes('?location=')) 
        getLocations();
  }, [search]);

  return (
    <Autocomplete
      options={locations}
      id="searchbar"
      fullWidth
      getOptionLabel={(option:any) => option.name}
      renderInput={(params) => 
          <TextField 
          {...params} 
          label="Location" 
          error={error}
          helperText={helperText}
      />}
      renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.name}
          </Box>
      )}
      onChange={onChange}
      onInputChange={(event: any, newVal:any) => {
          setSearch(newVal);
      }}
  />
  )
}