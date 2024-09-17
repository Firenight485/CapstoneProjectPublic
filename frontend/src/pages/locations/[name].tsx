import { axios_instance } from "@/axios";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo, useState } from "react";
import Map from "@/components/Map"
import { Box, Button, Dialog, DialogActions, DialogContent, Rating, Typography } from "@mui/material";
import WeatherGraph from "@/components/WeatherGraph";
import LocationEntry from "@/components/LocationEntry";
import BasicSearchBar from "@/components/BasicSearchBar";
import RemoveIcon from '@mui/icons-material/Remove';
import IconLabelButton from "@/components/IconLabelButton";
import Comment from "@/components/Comment";
import CommentBox from "@/components/CommentBox";
import { UsernameContext } from "@/contexts/UsernameContext";
import HandshakeIcon from '@mui/icons-material/Handshake';
import { getFullDiffLevel, getFullRockType } from "@/components/Utils";

// page for displaying locations

interface location {
  name: string;  // name of location
  latitude: string;
  longitude: string;
  description: string;
  state: string;
  difficulty_level: string;
  rock_type: string;
  climbing_type: string[];
}

// converts date from 2024-03-28T15:07:38.401Z like string to yyyy-mm-dd
export const ISOtoNormalDate = (date:string) => {
  let tmpDate = new Date(date);
  const offset = tmpDate.getTimezoneOffset()
  let offestDate = new Date(tmpDate.getTime() - (offset*60*1000))
  return offestDate.toISOString().split('T')[0];
}

export default function Locations() {
  const [name, setName] = useState('');  // name of location
  const [favorite, setFavorite] = useState(false);  // true if location is favorited
  const [compareNames, setCompareNames] = useState<string[]>([]);  // locations to compare weather with
  const [locations, setLocations] = useState([]);  // locations retuned by the search bar for comparing weather
  const [value, setValue] = useState('');  // value of search in weather search bar
  const [data, setData] = useState<location | null>(null);  // data for the location
  const [open, setOpen] = useState(false);  // open when weather search popup should open
  const [comments, setComments] = useState<any>([]);  // comments on location
  const [reRender, setReRender] = useState(false);  // used to rerender this component
  const {username, setUsername} = useContext(UsernameContext);
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);  // resutants near location
  const [lodges, setLodges] = useState<any[]>([]);  // lodging near location
  const [searchRadius, setSearchRadius] = useState(10);  // search radius for lodging and resturants
  const maxSearchResults = 3;  // max search results in compare weather search bar

  // only get location/resturant/lodge data on first render
  useEffect(() => {
    const getRestaurants = async(location:string) => {
      try {
        let search = 'name=' + location + '&radius=' + searchRadius;
        const response = await axios_instance.get('api/location/get_nearby_restaurants?' + search);
        let data:any = [];
        for (const elem of response.data.restaurants)
          data.push(elem);
        setRestaurants(restaurants => [...restaurants, ...data]);
      } catch (error) {
        console.error(error)
      }
    }

    const getLodges = async(location:string) => {
      try {
        let search = 'name=' + location + '&radius=' + searchRadius;
        const response = await axios_instance.get('api/location/get_nearby_lodging?' + search);
        let data:any = [];
        for (const elem of response.data.lodging)
          data.push(elem);
        setLodges(lodges => [...lodges, ...data]);
      } catch (error) {
        console.error(error)
      }
    }

    const fetchLocationData = async(locName:string) => {
      try {
        const response = await axios_instance.get('api/get-location/?name=' + locName);
        let loc = response.data.fields;
        loc.name = response.data.pk;
        loc.difficulty_level = (await getFullDiffLevel(loc.difficulty_level))[1];
        loc.rock_type = (await getFullRockType(loc.rock_type))[1];
        loc.climbing_type = loc.climbing_type.toString().replace('[', '').replace(']', '').replaceAll('\"', '').replaceAll(' ', '').replaceAll(',', ', ');
        getLodges(loc.name);
        getRestaurants(loc.name);
        setData(loc);
      } catch (error) {
        console.error(error)
      }
    };

    let locName:any = router.query.name;
    setName(locName);
    fetchLocationData(locName);
  }, [router.asPath]);

  // try to add location to recents
  useEffect(() => {
    const addToRecents = async() => {
      const data = {loc: name};

      try {
        await axios_instance.post('api/recent/add/', data);
      } catch {}
    }

    if (username !== '' && name !== '')
      addToRecents();
  }, [name]);

  // add a searched location to the compare weather list
  const appendCompareNames = (locName:string) => {
    for (const n of compareNames)
      if (n === locName || n === name)
        return;
    setCompareNames(compareNames.concat(locName));
  }

  // if you just pass compareNames.concat(name) as a prop, WeatherGraph rerenders
  // every time locations does which is not good. This is needed to prevent that
  const appendNameToCompareNames = useMemo(() => {
    return compareNames.concat(name);
  }, [compareNames, name]);

  // get locations from a compare weather search
  useEffect(() => {
    const getLocations = async() => {
      let data:any = [];
      try {
        const response = await axios_instance.get('api/search/?keyword=' + value);
        for (const elem of response.data) {
          let loc = elem.fields;
          loc.name = elem.pk;
          if (loc.name.replaceAll('+', ' ') !== name.replaceAll('+', ' '))
            data.push(loc);
        }

        let mappedData:any = data.map((location:any, index:number)=>
          <LocationEntry 
            name={location.name} 
            state={location.state}
            bottom={index === maxSearchResults - 1 || index === data.length - 1} 
            key={index}
            onClick={() => appendCompareNames(location.name)}
          />
        );
        setLocations(mappedData);
      } catch (error) {
        console.error(error)
      }
    }

    if (value !== '')
      getLocations();
    else 
      setLocations([]);
  }, [value, compareNames]);

  // determine if location is a favorite
  useEffect(() => {
    const getFavoriteStatus = async() => {
      try {
        await axios_instance.get('api/fav/isfav/?name=' + name);
        setFavorite(true);
      } catch (error) {
        setFavorite(false);
      }
    }

    if (name !== '')
      getFavoriteStatus();
  }, [favorite, name])

  const reRenderComments = () => {
    setReRender(!reRender);
  }

  // deal with a location being removed or added as a favorite
  const handleFavoriteChange = async() => {
    let favStatus = !favorite;
    setFavorite(favStatus);

    let loc = {
      loc: name
    };

    if (favStatus) {
      try {
        await axios_instance.post('api/fav/add/', loc);
      } catch (error) {
        console.error(error)
      }
    } else {
      try {
        await axios_instance.delete('api/fav/remove/', {data: loc});
      } catch (error) {
        console.error(error)
      }
    }
  }

  // get comments on page load and whenever a comment is changed
  useEffect(() => {
    const fetchComments = async() => {
      try {
        const response = await axios_instance.get('api/location/comments/?location=' + name);
        let comms = response.data;
        let renderedComms = [];
        for (let i = 0; i < comms.length; i++) {
          if (comms[i].fields.parent != null)
            continue;

          let replies = [];
          for (let j = 0; j < comms.length; j++) {
            if (comms[i].pk == comms[j].fields.parent)
              replies.push({
                author:comms[j].fields.author + '', 
                content:comms[j].fields.content,
                datePosted:ISOtoNormalDate(comms[j].fields.created_at),
                commentid:comms[j].pk
            });
          }
          
          renderedComms.push(
            <Comment 
              author={comms[i].fields.author} 
              content={comms[i].fields.content} 
              datePosted={ISOtoNormalDate(comms[i].fields.created_at)}
              replies={replies}
              rating={comms[i].fields.rating}
              locationName={name}
              key={i}
              commentid={comms[i].pk}
              fetchComments={reRenderComments}
            />
          );
        }
        setComments(renderedComms); 
      } catch (error) {
        console.error(error)
      }
    }

    if (name != '')
      fetchComments();
  }, [name, reRender])

  // remove location from compare list
  const removeComparison = (name:string) => {
    let index = compareNames.indexOf(name);
    setCompareNames(compareNames.filter((n, i) => i != index));
  }

  // add a comment
  const submitComment = async(content:string, rating?:number) => {
    if (username === '') {
      await router.push('/login');
      return;
    }

    let newReply = {
      loc_name: name,
      content: content,
      rating: rating
    }

    try {
      await axios_instance.post('api/comment/create/', newReply);
      reRenderComments();
    } catch (error) {
      console.error(error)
    }
  }

  const typographyStyles = {marginBottom: '5px'};

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
          margin: '5vh 0 30px 0'
        }}
      >
        {/* location name and favorite status */}
        <div
          style={{
            display: 'flex',
            gap: '20px'
          }}
        >
          <Typography variant="h4">
            {data ? data.name : ''}
          </Typography>

          {username !== '' && <Rating
            value={+favorite}
            onChange={handleFavoriteChange}
            max={1}
            style={{margin: '12px 0 0 0'}}
          />}
        </div>

        {/* map */}
        {data !== null && <Map 
          margin="0 5% 0 5%"
          height="45vh" 
          width="90%"
          maxWidth="800px" 
          locations={data ? [data] : []}
          border="2px solid"
          restaurants={restaurants}
          lodges={lodges}
          defCenterLat={data !== null ? parseFloat(data.latitude) : undefined}
          defCenterLng={data !== null ? parseFloat(data.longitude) : undefined}
        />}

        {/* Desc and other information */}
        <Box
          sx={{
            width: {xs: '90vw', lg: '60vw'}
          }}
        >
          <Typography variant="h6" style={typographyStyles}>
            Description
          </Typography>
          <Typography>
            {data ? data.description : ''}
          </Typography>
          <br/>

          <Typography variant="h6" style={typographyStyles}>
            Climbing Types
          </Typography>
          <Typography>
            {data ? data.climbing_type : ''}
          </Typography>
          <br/>

          <Typography variant="h6" style={typographyStyles}>
            Difficulty Level
          </Typography>
          <Typography>
            {data ? data.difficulty_level : ''}
          </Typography>
          <br/>
          
          <Typography variant="h6" style={typographyStyles}>
            Rock Type
          </Typography>
          <Typography>
            {data ? data.rock_type : ''}
          </Typography>
          <br/>

          <div
            style={{
              display: 'flex'
            }}
          >
            <Typography variant="h6">
              Weather
            </Typography>
            <Button
              style={{marginLeft: 'auto'}}
              variant="outlined"
              onClick={() => setOpen(true)}
            >
              Compare
            </Button>
          </div>

          {/* weather graph */}
          {name !== '' &&
            <WeatherGraph
              compareNames={appendNameToCompareNames}
              height="60vh"
              width="100%"
              margin="10px 0 20px 0" 
            />
          }

          {/* comments */}
          <div
            style={{
              display: 'flex'
            }}
          >
            <Typography variant="h6">
              Comments
            </Typography>
            <Button 
              endIcon={<HandshakeIcon/>} 
              size="small" 
              onClick={async() => await router.push('/partner_finder?location=' + name)}
              style={{
                margin: '0 0 0 auto'
              }}
            >
              Partner Finder
            </Button>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              margin: '20px'
            }}
          >
            <CommentBox
              contentPlaceholder="Add a comment..."
              handleSubmit={submitComment}
              handleCancel={() => {}}
              submitText="Comment"
              showRating
              showPFP
            />
            {comments}
          </div>

        </Box>
      </div>

      {/* Popup for compare weather */}
      <Dialog
        open={open}
        keepMounted
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            height: '400px',
            width: '400px'
          }
        }}
      >
        <DialogContent>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <Typography variant="h5">Currently Comparing:</Typography>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px'
              }}
            >
              {compareNames.map((name, index) => 
                <IconLabelButton 
                  label={name} 
                  onClick={() => removeComparison(name)}
                  icon={<RemoveIcon/>}
                  backgroundColor="#A89F9F" 
                  key={index}
                />
              )}
            </div>
            <BasicSearchBar 
              value={value} 
              locations={locations} 
              handleChange={(event:any) => setValue(event.target.value)}
              resultLimit={maxSearchResults}
              placeholder="Search Locations to Compare"
              borderRadius="20px"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}