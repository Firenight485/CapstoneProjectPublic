import { axios_instance } from "@/axios";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import Map from "@/components/Map"
import { Box, Button, TextField, Typography } from "@mui/material";
import LocationAttributeSelector from "./LocationAttributeSelector";
import ClimbingTypeSelector from "./ClimbingTypeSelector";
import Swal from "sweetalert2";

// This component is for all intents and purposes a page, but as the create location
// and edit location pages are so similar, they were primarly created using this 1 component

interface props {
  isEditPage: boolean;  // true if this is edit page, false if create locaiton page

  // all below values are the current values of the location
  // used to populate fields when editing.
  defName?: string;
  defDesc?: string;
  defLat?: number;
  defLng?: number;
  defClimbingType?: any[];
  defState?: any[];
  defRockType?: any[];
  defDiff?: any[];
  defId?: string;
}


export default function CreateEditLocationPage({isEditPage, defName = '', defDesc = '', defLat = 38.9, defLng = -77, defClimbingType = [], 
                                                defState = ['', ''], defRockType = ['', ''], defDiff = ['', ''], defId = ''}: props) {
  const [name, setName] = useState(defName);
  const [desc, setDesc] = useState(defDesc);
  const [state, setState] = useState(defState);
  const [rockType, setRockType] = useState(defRockType);
  const [difficulty, setDifficulty] = useState(defDiff);
  const [climbingType, setClimbingType] = useState<any>(defClimbingType);
  const [validName, setValidName] = useState(true);  // false if location name is alredy in use
  const [lat, setLat] = useState(defLat);
  const [lng, setLng] = useState(defLng);
  const [submitted, setSubmitted] = useState(false);  // true if user tried to submit location
  const router = useRouter();

  // callback for map to handle when the maker's position changed
  const handleDragPos = (pos:any) => {
    setLat(pos.lat);
    setLng(pos.lng);
  }

  // update to submit location
  const handleSubmit = async(publish:boolean) => {
    setSubmitted(true);

    const newLoc = {
      name: name,
      latitude: lat,
      longitude: lng,
      description: desc,
      state: state[0],
      difficulty_level: difficulty[0],
      rock_type: rockType[0],
      climbing_type: climbingType,
      location_id: defId
    }

    // reasons to not submit location
    if (!name                      ||
        !desc                      ||
        !state[0]                  ||
        !difficulty[0]             ||
        !rockType[0]               ||
        Number.isNaN(lng)          ||
        Number.isNaN(lat)          ||
        lat > 90 || lat < -90      ||
        lng > 180 || lng < -180    ||
        climbingType.length === 0)
      return;


    try {
      if (isEditPage)
        await axios_instance.put('api/location/update-location/', newLoc);
      else {
        await axios_instance.post('api/create-location/', newLoc);
        // generate location created alert
        Swal.fire({
          title: "Post Successful",
          text: "Your location has been created",
          icon: "success",
          confirmButtonColor: '#64b5f6',
        });
      }
      router.push('/home')
    } catch (error) {
      setValidName(false);
      console.error(error)
    }
  }

  const handleStateChange = (event: any, newState:any) => {
    if (!newState)
      newState = '';
    setState(newState);
  }

  const handleRockTypeChange = (event: any, newType:any) => {
    if (!newType)
      newType = '';
    setRockType(newType);
  }

  const handleDiffChange = (event: any, newDiff:any) => {
    if (!newDiff)
      newDiff = '';
    setDifficulty(newDiff);
  }

  const handleClimbingTypeChange = (type:string) => {
    let newarr = [...climbingType]
    if (newarr.includes(type))
      newarr.splice(newarr.indexOf(type), 1);
    else
      newarr.push(type)
    setClimbingType(newarr);
  }

  return(
    <>
      <Topbar hasSearchBar={false}/>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '20px',
          margin: '50px 20px 0 20px'
        }}
      >
        {/* Location name */}
        <TextField
          error={!name && submitted || !validName}
          helperText={submitted && !name ? 'Please enter a location name.' : 
            !validName ? 'A location with this name has already been created. Please try a different name.' : ''}
          size="small"
          placeholder="Location Name"
          fullWidth
          value={name}
          sx={{
            maxWidth: '700px'
          }}
          id = "name_field"
          onChange={(event:any) => setName(event.target.value)}
        />

        {/* Map displaying location */}
        {useMemo(()=><Map
          height="45vh" 
          width="90%"
          maxWidth="800px" 
          locations={[]}
          border="2px solid"
          draglat={lat}
          draglng={lng}
          handleDragPos={handleDragPos}
          defCenterLat={defLat}
          defCenterLng={defLng}
        />, [lat, lng])}

        {/* Latitude and longitide */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Typography variant="h6">
            Location Position
          </Typography>

          <Typography variant="body1">
            Enter a latitude and longitude below, or use the map to drag and drop the pin to your desired location.
          </Typography>

          <div
            style={{
              display: 'flex',
              gap: 'inherit'
            }}
          >
            <TextField
              size="small"
              label="Latitude"
              type="number"
              value={lat}
              error={(Number.isNaN(lat) || lat > 90 || lat < -90) && submitted}
              helperText={(Number.isNaN(lat) || lat > 90 || lat < -90) 
                && submitted ? 'Please enter a valid latitude between 90 and -90.' : ''}
              onChange={(event:any) => setLat(parseFloat(event.target.value))}
              id = "latitude_field"
            />
            <TextField
              size="small"
              label="Longitude"
              type="number"
              value={lng}
              error={(Number.isNaN(lng) || lng > 90 || lng < -90) && submitted}
              helperText={(Number.isNaN(lng) || lng > 90 || lng < -90) 
                && submitted ? 'Please enter a valid longitude between 180 and -180.' : ''}
              onChange={(event:any) => setLng(parseFloat(event.target.value))}
              id = "longitude_field"
            />
          </div>
        </div>

        {/* Description */}
        <Box
          sx={{
            width: {xs: '90vw', lg: '60vw'},
          }}
        >
          <Typography variant="h6">
            Description
          </Typography>
          <br/>
          <TextField
            error={!desc && submitted}
            helperText={submitted && !desc ? 'Please enter a description.' : ''}
            size="small"
            placeholder="Enter a brief description detailing the climbing destination"
            fullWidth
            value={desc}
            multiline
            onChange={(event:any) => setDesc(event.target.value)}
            rows={4}
            id = "description_field"
          />
        </Box>

        {/* Selectors for all other fields of the location */}
        <div
          style={{
            display: 'flex',
            gap: '35px',
            maxWidth: '600px',
            width: '100%'
          }}
        >
          <ClimbingTypeSelector 
            error={submitted && !climbingType.length} 
            climbingTypes={climbingType} 
            onChange={handleClimbingTypeChange}
            label="Choose Climbing Type(s)"
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'inherit',
              maxWidth: '300px',
              width: '100%'
            }}
          >
            {/* state */}
            <LocationAttributeSelector 
              defValue={defState}
              error={!state[0] && submitted}
              helperText={submitted && !state[0] ? 'Please select a State.' : ''}
              handleChange={handleStateChange}
              type="state"
              label="State"
              id = "state"
            /> 

            {/* rock type */} 
            <LocationAttributeSelector 
              defValue={defRockType}
              label="Rock Type" 
              error={!rockType[0] && submitted}
              helperText={submitted && !rockType[0] ? 'Please select a rock type.' : ''}
              handleChange={handleRockTypeChange}
              type="rock"
              id = "rock"
            /> 

            {/* Difficulty level */}
            <LocationAttributeSelector 
              defValue={defDiff}
              label="Difficulty" 
              error={!difficulty[0] && submitted}
              helperText={submitted && !difficulty[0] ? 'Please select a difficulty.' : ''}
              handleChange={handleDiffChange}
              type="diff"
              id = "diff"
            /> 
          </div>
        </div>

        {/* confirm button */}
        <div
          style={{
            display: 'flex',
            gap: 'inherit',
            margin: '0 0 40px 0'
          }}
        >
          {!isEditPage &&
          <Button
            variant="outlined"
            onClick={()=>handleSubmit(true)}
            id = "publishButton"
          >
            Publish Location
          </Button>}

          {isEditPage &&
          <Button
            variant="outlined"
            onClick={()=>handleSubmit(false)}
          >
            Save Changes
          </Button>
          }
        </div>
      </div>
    </>
  );
}