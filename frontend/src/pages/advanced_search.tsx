import Topbar from "@/components/Topbar";
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { AdvSearchLocation } from "@/components/AdvSearchLocation";
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import Typography from "@mui/material/Typography";
import { axios_instance } from "@/axios";
import { Box, Checkbox, FormControlLabel, FormGroup, InputAdornment, TextField } from "@mui/material";
import { useRouter } from "next/router";
import MapPopup from "@/components/MapPopup";
import LocationAttributeSelector from "@/components/LocationAttributeSelector";
import ClimbingTypeSelector from "@/components/ClimbingTypeSelector";

// page for doing a more in depth search than that possible on the home page

function urlHasParams(url:string) {
  return url.includes('state=') &&
         url.includes('dist=')  &&
         url.includes('name=')
}

export default function AdvancedSearch() {
  const [name, setName] = useState<any>('');  // search value
  const [state, setState] = useState<any>('');  // selected state
  const [distance, setDistance] = useState<any>('');  // max distance selected
  const [difficulty, setDifficulty] = useState<any>('');  // diff selected
  const [rockType, setRockType] = useState<any>('');  // rock type selected
  const [climbingTypes, setClimbingTypes] = useState<any>([]);  // climbing types selected
  const [locations, setLocations] = useState([]); // locations returned by search
  const [lat, setLat] = useState<any>('');  // lat of search origin
  const [long, setLong] = useState<any>('');  // lng of search origin
  const [defaultLat, setDefaultLat] = useState('39');  // default to washington DC
  const [defaultLong, setDefaultLong] = useState('-77');
  const [showFields, setShowFields] = useState(false);  // true if other options dropdown has been opened
  const [openMap, setOpenMap] = useState(false);  // true if map should be shown
  // true if the various optional search parameters have been selected
  const [showDistance, setShowDistance] = useState(false);
  const [showState, setShowState] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showRockType, setShowRockType] = useState(false);
  const [showClimbingType, setShowClimbingType] = useState(false);

  const [error, setError] = useState(false);  // true if search error is present, such as not giving a 
                                              // state when state has been selected
  const router = useRouter();

  const handleClimbingTypeChange = (type:string) => {
    let newarr = [...climbingTypes]
    if (newarr.includes(type))
      newarr.splice(newarr.indexOf(type), 1);
    else
      newarr.push(type)
    setClimbingTypes(newarr);
  }

  // get values of a search from the url
  const getUrlParam = (param: string):any => {
    let temp = '';
    let url = router.asPath;
    if (!urlHasParams(url))
      return '';

    switch (param) {
      case 'state':
        return url.split('state=')[1].split('&')[0].replace('%20', ' ');
      case 'lat':
        temp = url.split('&name=')[0].split('+')[0].split('=')[1];
        if (temp === undefined)
          temp = '';
        return temp;
      case 'lng':
        temp = url.split('&name=')[0].split('+')[1];
        if (temp === undefined)
          temp = '';
        return temp;
      case 'dist':
        temp = url.split('&name=')[0].split('+')[2];
        if (temp === undefined)
          temp = '';
        return temp;
      case 'name':
        return url.split('name=')[1].split('&state')[0].replace('%20', ' ');
      case 'rock':
        return url.split('rock=')[1].split('&')[0];
      case 'diff':
        return url.split('diff=')[1].split('&')[0];
      case 'climbingTypes':
        let types = url.split('type=')[1].split('+');
        if (types.includes(''))
          return [];
        return types;
      default:
        if (param === 'climbingTypes')
          return [];
        return '';
    }
  }

  // make searches
  useEffect(() => {
    const fetchData = async() => {
      let data:any = [];
      let search = window.location.search;
      if (search !== '') {
        try {
          const response = await axios_instance.get('api/advanced-search/' + search);
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
    }

    // try to get users position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }
    
    function success(position:any) {
      setDefaultLat(position.coords.latitude);
      setDefaultLong(position.coords.longitude);
      console.log('success');
    }
    
    function error() {
      console.log("Unable to retrieve your location");
    }

    setState(getUrlParam('state'));
    setDistance(getUrlParam('dist'));
    setName(getUrlParam('name'));
    setLat(getUrlParam('lat'));
    setLong(getUrlParam('lng'));
    setRockType(getUrlParam('rock'));
    setClimbingTypes(getUrlParam('climbingTypes'));
    setDifficulty(getUrlParam('diff'));
    fetchData();
  }, [router.asPath])

  // make a search
  const handleSubmit = async() => {
    let distanceString = '';
    let stateString = '';
    let diffString = '';
    let rockString = '';
    let typeString = '';
    let error = false;

    if (showDistance && lat && long && distance)
      distanceString = '' + lat + '+' + long + '+' + parseInt(distance);
    else if (showDistance && defaultLat && defaultLong && distance)
      distanceString = '' + defaultLat + '+' + defaultLong + '+' + parseInt(distance);
    else if (showDistance)
      error = true;

    if (state && showState)
      stateString = state
    else if (showState)
      error = true;

    if (rockType && showRockType)
      rockString = rockType
    else if (showRockType)
      error = true;

    if (difficulty && showDiff)
      diffString = difficulty
    else if (showDiff)
      error = true;

    if (climbingTypes.length && showClimbingType)
      typeString = climbingTypes.toString().replaceAll(',', '+');
    else if (showClimbingType)
      error = true;

    if (!error) {
      await router.push(`/advanced_search/?dist=${distanceString}&name=${name}&state=${stateString}&rock=${rockString}&diff=${diffString}&type=${typeString}`);
      setError(false);
    } else {
      setError(true);
    }
  }

  const handleEnter = (event:any) => {
    // 13 is key code for enter
    if (event.keyCode === 13) {
      event.preventDefault();
      handleSubmit();
    }
  }

  const handleStateChange = (event: any, newState:any) => {
    if (!newState)
      newState = '';
    setState(newState);
  }

  const handleRockChange = (event: any, newRock:any) => {
    if (!newRock)
      newRock = '';
    setRockType(newRock);
  }

  const handleDiffChange = (event: any, newDiff:any) => {
    if (!newDiff)
      newDiff = '';
    setDifficulty(newDiff);
  }

  const handleDragPos = (pos:any) => {
    setLat(pos.lat);
    setLong(pos.lng);
  }

  // different error messages depending what is missing in distance
  const getDistanceHelperText = () => {
    if (!showDistance || !error)
      return '';
    if (lat === '' || long === '' && distance === '')
      return 'Please enter a distance and specify your location';
    if (distance === '')
      return 'Please specify a distance';
    if (lat === '' || long === '')
      return 'Please specify your location';
    return '';
  }

  // only let numbers be entered to distance
  const handleDistanceChange = (event:any) => {
    let val = event.target.value;

    const regExp = /[a-zA-Z]/g
    let num_val = parseFloat(val);
    console.log(parseFloat(val));
    if ((val === '' || num_val) && !regExp.test(val))
      setDistance(val);
  }

  const searchFieldStyles = {
    backgroundColor: 'white',
    marginBottom: 'auto',
    width: '100%'
  };

  const bgColor = 'rgb(245, 245, 245)';

  const checkboxStyles = {
    margin:'auto'
  };

  // background shouldnt be white behind error message, should be same background
  // as the rest of the gray box
  const helperTextStyles = {
    backgroundColor: bgColor, margin: 0, padding: '4px 14px 4px 14px'
  }

  return (
    <>
      <Topbar hasSearchBar={false}/>
      <div 
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" marginTop='100px'>
          Advanced Search
        </Typography>
        <div 
          style={{
            maxWidth: 900, 
            width: '100%',
            padding: '0px 20px 0px 20px',
            margin: '20px'
          }}
        >
          <div>
            {/* Search Bar */}
            <Paper
              component="form"
              sx={{ 
                p: '2px 4px', 
                display: 'flex', 
                height: 50,
                alignItems: 'center', 
                width: '100%',
                margin: '50px 0px 10px 0px' 
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                value={name}
                placeholder="Search Crux Conditions"
                inputProps={{ 'aria-label': 'Search Crux Conditions' }}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={handleEnter}
              />
              <IconButton 
                sx={{ p: '10px' }} 
                aria-label="directions"
                onClick={() => setShowFields(!showFields)}
              >
                {showFields ? <ArrowDropUpIcon/> : <ArrowDropDownIcon/>}
              </IconButton>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton 
                sx={{ p: '10px' }} 
                aria-label="directions"
                onClick={handleSubmit}
              >
                <SearchIcon />
              </IconButton>
            </Paper>

            {/* Adv search features */}
            { showFields &&
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '10px',
                margin: '0px 0px 30px 0px',
                backgroundColor: bgColor,
                gap: '10px'
              }}
            >
              {/* search type selector */}
              <FormGroup
                style={{
                  display: 'flex',
                  gap: '10px',
                  width: '100%',
                  alignItems: 'center'
                }}
                row
              >
                <Typography>
                  Filter by:
                </Typography>

                <FormControlLabel 
                  style={checkboxStyles} 
                  control={<Checkbox value={showDistance} />} 
                  label="Distance" 
                  checked={showDistance}
                  onChange={(event:any) => setShowDistance(event.target.checked)}
                />

                <FormControlLabel 
                  style={checkboxStyles} 
                  control={<Checkbox />} 
                  label="State" 
                  checked={showState}
                  onChange={(event:any) => setShowState(event.target.checked)}
                />
                
                <FormControlLabel 
                  style={checkboxStyles} 
                  control={<Checkbox />} 
                  label="Rock Type" 
                  checked={showRockType}
                  onChange={(event:any) => setShowRockType(event.target.checked)}
                />
                
                <FormControlLabel 
                  style={checkboxStyles} 
                  control={<Checkbox />} 
                  label="Difficulty Level" 
                  checked={showDiff}
                  onChange={(event:any) => setShowDiff(event.target.checked)}
                />

                <FormControlLabel 
                  style={checkboxStyles} 
                  control={<Checkbox />} 
                  label="Climbing Type" 
                  checked={showClimbingType}
                  onChange={(event:any) => setShowClimbingType(event.target.checked)}
                />
              </FormGroup>

              {/* enter values for each search type */}
              <Box
                sx={{
                  display: 'flex',
                  gap: '10px',
                  width: '100%',
                  flexDirection: {'xs': 'column', 'md': 'row'}
                }}
              >
                {showDistance &&
                <TextField 
                  value={distance}
                  variant="outlined"
                  label={'Max Distance'}
                  size="small"
                  onChange={handleDistanceChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={() => setOpenMap(true)}
                        >
                          <AddLocationAltIcon/>
                        </IconButton>
                      </InputAdornment>
                    )}}
                  style={searchFieldStyles}
                  error={getDistanceHelperText() !== ''}
                  helperText={getDistanceHelperText()}
                  FormHelperTextProps={{ style: helperTextStyles}}
                />}
                
                {showState &&
                <LocationAttributeSelector 
                  defValue={getUrlParam('state')}
                  error={error && !state}
                  helperText={error && !state ? 'Please select a State' : ''}
                  handleChange={handleStateChange}
                  type="state"
                  label="State"
                  style={searchFieldStyles}
                  helperTextProps={{ style: helperTextStyles}}
                  arrayValues={false}
                />}

                {showRockType &&
                <LocationAttributeSelector 
                  defValue={getUrlParam('rock')}
                  error={error && !rockType}
                  helperText={error && !rockType ? 'Please select a Rock Type' : ''}
                  handleChange={handleRockChange}
                  type="rock"
                  label="Rock Type"
                  style={searchFieldStyles}
                  helperTextProps={{ style: helperTextStyles}}
                  arrayValues={false}
                />}

                {showDiff &&
                <LocationAttributeSelector 
                  defValue={getUrlParam('diff')}
                  error={error && !difficulty}
                  helperText={error && !difficulty ? 'Please select a Difficulty Level' : ''}
                  handleChange={handleDiffChange}
                  type="diff"
                  label="Difficulty Level"
                  style={searchFieldStyles}
                  helperTextProps={{ style: helperTextStyles}}
                  arrayValues={false}
                />}

              </Box>

              {showClimbingType &&
              <ClimbingTypeSelector 
                error={error && !climbingTypes.length} 
                climbingTypes={climbingTypes} 
                onChange={handleClimbingTypeChange}
                row
                label="Choose Required Climbing Type(s)"
              />}

            </div>}
          </div>

          {/* Search Results */}
          {locations.length > 0 &&
          <div 
            style={{
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: bgColor,
              marginBottom: '30px'
            }}
          >
            
            <Typography variant="h4" marginLeft={'10px'} marginBottom={'10px'}>
                Results
            </Typography>

            {locations.map((location:any, index) => 
              <AdvSearchLocation 
                name={location.name} 
                location={location.state}
                key={index}
              />
            )}
          </div>}
        </div>
      </div>
      
      <MapPopup 
        open={openMap} 
        onClose={() => setOpenMap(false)}
        handleDragPos={handleDragPos}
        defaultLat={lat == '' ? defaultLat : lat}
        defaultLng={long == '' ? defaultLong : long}
      />
    </>
  );
}
