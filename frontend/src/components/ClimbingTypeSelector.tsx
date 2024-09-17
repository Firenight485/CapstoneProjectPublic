import { axios_instance } from "@/axios";
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel } from "@mui/material";
import { useEffect, useState } from "react";

interface climbingTypeProps {
  error: boolean;  // true if error color should appear
  climbingTypes: any[];  // currenlty selected climbing types
  onChange: (choice:any) => void;  // callback when a type is selected/deselected
  row?:boolean;  // true if types should be in row format, false if column
  label: string;  // label for the component, i.e. "Select a climbing type"
}

export default function ClimbingTypeSelector({error, climbingTypes, onChange, row, label}:climbingTypeProps) {
  const [choices, setChoices] = useState([]);  // possible climbing types

  useEffect(() => {
    const fetchClimbingTypes = async() => {
      try {
        const response = await axios_instance.get('api/locations/climbing-types');
        let tmp = JSON.parse(response.data);
        setChoices(tmp);
      } catch (error) {
        console.error(error)
      }
    }

    fetchClimbingTypes();
  }, []);

  return (
    <FormControl 
      component="fieldset" 
      variant="standard" 
      error={error}
    >
      {error &&
      <FormHelperText>Please select at least 1 climbing type</FormHelperText>}

      <FormLabel focused={false} component="legend">{label}</FormLabel>
      <FormGroup
        sx={row ? {
          display: 'flex',
          flexDirection: {xs: 'column', md: row ? 'row' : 'column'},
          justifyContent: 'center',
          alignItems: 'center'
        } : {}}
      >
        {choices.map((choice:string, key:number) => 
          <FormControlLabel
            key={key}
            control={
              <Checkbox checked={climbingTypes.includes(choice)} onChange={()=>onChange(choice)}/>
            }
            label={choice}
          />
        )}
      </FormGroup>
    </FormControl>
  )
}