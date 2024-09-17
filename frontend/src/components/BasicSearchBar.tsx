import { IconButton, InputAdornment, TextField, styled } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import React, { useEffect, useRef, useState } from "react";
import LocationEntry from "./LocationEntry";
import { useRouter } from 'next/router';


interface searchBarProps {
  locations: any;  // locations to render
  value: string;  // search in the serach bar
  handleEnter?: (event: any) => void;  // callback when a key is pressed, usually to detect enter
  handleChange: (event: any) => void;  // callback on change of search
  handleSubmit?: () => {};  // callback when the search button is clicked
  showAllButton?: boolean;  // true if the view all button that links to advanced search should appear
  resultLimit?: number;  // max number of searches shown
  placeholder?: string;  // placeholder when search is empty
  margin?: string;
  borderRadius?: string;
}

const border = '1px solid rgba(0, 0, 0, 0.23)';

// disable unwanted hovering
const StyledTextfield = styled(TextField)({
  "& .MuiInputBase-root": {
    "& fieldset": {
      border: border
    },
    "&:hover fieldset": {
      border: border
    },
    "&.Mui-focused fieldset": {
      border: border
    }
  },
})

export default function BasicSearchBar({locations, 
                                        value,
                                        handleChange, 
                                        handleEnter, 
                                        handleSubmit, 
                                        showAllButton = false, 
                                        resultLimit = Number.POSITIVE_INFINITY, 
                                        placeholder, 
                                        margin, 
                                        borderRadius}:searchBarProps) {
                                          
  const [searchBarHeight, setHeight] = useState(0);  // used to store height of search bar
  const [clickedOff, setClickedOff] = useState(true);  // has user clicked off
  const router = useRouter();

  // used to get the height of the search bar for offset
  let bar = useRef<any>(null);
  // used to tell when clicked off search bar
  let dropdownRef = useRef<any>(null);

  // remove the search results when the user clicks away from the search bar
  useEffect(() => {
    let click_handler = (e:any) => {
      if (!dropdownRef.current.contains(e.target))
        setClickedOff(true);
    }

    document.addEventListener('mousedown', click_handler);
    setHeight(bar.current.offsetHeight);

    return () => {
      document.removeEventListener('mousedown', click_handler);
    };
  }, [dropdownRef]);

  // styles of search bar when there are search results
  const recomStyles = {
    borderRadius: `${borderRadius} ${borderRadius} 0px 0px`,
    margin: margin,
  };

  // style where there are no search results
  const normalStyles = {
    borderRadius: borderRadius, 
    margin: margin,
    backgroundColor: 'white'
  }

  return (
    <div style={{maxWidth: '350px'}} 
      onFocus={()=>setClickedOff(false)}
    >
      <StyledTextfield
        style={{zIndex : 1000}}
        ref={bar} 
        fullWidth
        autoComplete="off"
        placeholder={placeholder}
        color="secondary"
        size="small"
        InputLabelProps={{shrink: false}}
        InputProps={{ 
          sx:{ ...clickedOff || value === '' ? normalStyles : recomStyles },
          endAdornment: (
          <>

            {/* Magnifying glass button */}
            <InputAdornment position="end">
              <IconButton 
              style={{ backgroundColor: 'transparent' }}
              edge="end" 
              onClick={handleSubmit}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>

            {/* Auto complete menu */}
            <div 
              style={{
                position: 'absolute', 
                top: '0', 
                left: '0', 
                width: '100%',
                minHeight: '1px',
                backgroundColor: 'white', 
                borderRadius: borderRadius, 
                zIndex: '-1',
                border: border 
              }}
              ref={dropdownRef}
            >
              <ul style={{margin: '-1px', padding: '0px', listStyleType: 'none'}}>

                {/* Creates offset */}
                <li style={{height: searchBarHeight}}></li>

                {!clickedOff && locations.slice(0, resultLimit)}

                {/* Need to get rid of this */}
                {showAllButton && !clickedOff && locations.length > resultLimit &&
                <LocationEntry 
                  name={''} 
                  state={''}
                  bottom={true}
                  otherText="View All Results"
                  onClick={async() => await router.push('/advanced_search/?dist=&name=' + value + '&state=')}
                />}

                {!clickedOff && value !== '' && locations.length === 0 &&
                <h4 style={{margin: '10px'}}>
                  No Results
                </h4>}

              </ul>
            </div>
          </>
        )
        }} 
        onChange={handleChange}
        onKeyDown={handleEnter}
      />
    </div>
  );
}