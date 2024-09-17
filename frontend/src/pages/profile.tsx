import { axios_instance } from "@/axios";
import Topbar from "@/components/Topbar";
import { useContext, useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, Typography, Paper, Divider, Link, Avatar, Tooltip, IconButton } from "@mui/material";
import BasicSearchBar from "@/components/BasicSearchBar";
import LocationEntry from "@/components/LocationEntry";
import { LogLocation } from "@/components/LogLocation";
import AddFriendsSearchBar from "@/components/AddFriendsSearchBar";
import { FriendEntry } from "@/components/FriendEntry";
import { CreatedLocationEntry } from "@/components/CreatedLocationEntry";
import { UsernameContext } from "@/contexts/UsernameContext";
import ConfirmDeletePopup from "@/components/ConfirmDeletePopup";
import DeleteIcon from '@mui/icons-material/Delete';
import AlternateLocationSearchBar from "@/components/AlternateLocationSearchBar";
import LoadingScreen from "@/components/LoadingScreen";

// page for editing ones profile

interface tabProps {
  setTab: () => void;  // logbook, friends, created locations
  text: string;  // logbook, friends, created locations
  highlight?: boolean;  // true if tab should be highlighted
}

// component for logbook, friends, created locations tabs
function TabHeader({setTab, text, highlight}:tabProps) {
  const [hover, setHover] = useState(false);

  const hoverStyles = {
    backgroundColor: hover || highlight ? '#D3D3D3' : '',
    padding: '10px'
  }

  return (
    <Box 
      onClick={setTab}
      onMouseLeave={()=>setHover(false)}
      onMouseEnter={()=>setHover(true)}
      style={hoverStyles}
    >
      <Typography variant="h3">
        {text}
      </Typography>
    </Box>
  )
}

const maxElems = 4;

export default function Profile() {
  const {username, setUsername} = useContext(UsernameContext);
  const [uanme, setUanme] = useState('');  // username displayed
  const [email, setEmail] = useState('');  // email dispalyed
  const [dateJoined, setDateJoined] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<any>('');  // path of pfp
  const [imageFile, setImageFile] = useState<any>(null);  // actual pfp stored
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);  // open delete popup for pfp
  const [openDeleteProfile, setOpenDeleteProfile] = useState(false);  // open delete popup for account
  const [editPhoto, setEditPhoto] = useState(false);  // true if photo is being changed
  const [logLocation, setLogLocation] = useState('');  // locations for logbook search bar
  const [render, setRender] = useState(false);  // re render page

  const [logBook, setLogbook] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [createdLocations, setCreatedLocations] = useState([]);

  const [showMore, setShowMore] = useState(false);  // shore move values in each respective tab
  const [tab, setTab] = useState('logbook');  // logbook is default tab
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);
  const maxSearchResults = 3;

  const renderStuff = () => {
    setRender(!render);
  }
  
  // get user data
  useEffect(() => {
    const getData = async() => {
      try {
        const response = await axios_instance.get('api/user/get-info');
        let data = response.data[0];
        setUanme(data.pk);
        setEmail(data.fields.email);
        const formattedDate = data.fields.created_at.split('T')[0];
        setDateJoined(formattedDate);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    if (username)
      getData();
    else
      setLoading(false);
  }, [username])

  // get data for each tab
  useEffect(() => {
    const fetchLogbook = async() => {
      try {
        const response = await axios_instance.get('api/log/get');
        let data = response.data;
        let log = []
        for(const loc of data)
          log.push(loc.pk)
        setLogbook(log);
      } catch (error) {
        console.error(error)
      }
    };

    const fetchFriends = async() => {
      try {
        const response = await axios_instance.get('api/friend/get/');
        let tmp = response.data;
        let data:any = [];
        for (let elem of tmp)
          data.push(elem.pk);
        data = data.filter((name: string) => name !== username);
        setFriends(data);
      } catch (error) {
        console.error(error)
      }
    };

    const fetchCreatedLocations = async() => {
      try {
        const response = await axios_instance.get('api/user/get-locations/');
        let data:any = []
        for (const elem of response.data) {
          let loc = elem.fields;
          loc.name = elem.pk;
          data.push(elem.fields.name);
        }
        setCreatedLocations(data);
      } catch (error) {
        console.error(error)
      }
    };
    if (username) {
    fetchLogbook();
    fetchFriends();
    fetchCreatedLocations();
    }
  }, [render, username])
  
  // get pfp
  useEffect(() => {
    const fetchProfilePicture = async () => {
       try {
        let res = await axios_instance({
          method: "get",
          responseType: "blob",
          url: 'api/pic/get'
        });
        let reader = new window.FileReader();
        reader.readAsDataURL(res.data);
        reader.onload = function () {
          let imageDataUrl = reader.result;
          setProfilePictureUrl(imageDataUrl);
        };
       } catch (error) {
        console.error("Failed to fetch profile picture URL:", error);
       }
    };
    if (username)
      fetchProfilePicture();
  }, [editPhoto, username]);

  const addToLogbook = async(locName: string) => {
    try {
      console.log(locName);
      await axios_instance.post('api/log/add/', {loc: locName});
      setRender(!render);
    } catch (error) {
      console.error(error);
    }
  }

  // upload new pfp
  const submitProfilePicture = async() => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('imageName', imageFile.name);
      const config = {
        headers: {
          'content-type': 'multipart/form-data',
        },
      };
      await axios_instance.post('api/pic/update/', formData, config);
      setEditPhoto(false);
      setKey(key + 1);
    } catch (error) {
      console.error(error);
    }
  }

  const canclProfilePictureUpload = () => {
    setImageFile('');
    setEditPhoto(false)
  }

  // reset pfp to defualt
  const removeProfilePicture = async() => {
    try {
      await axios_instance.post('api/pic/reset/'); 
      setEditPhoto(false);
      setKey(key + 1);
    } catch (error) {
      console.error(error);
    }
  }

  // delete profile
  const deleteProfile = async() => {
    try {
      await axios_instance.delete('api/user/delete/'); 
      setUsername('');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Topbar hasSearchBar={false} key={key}/>
      <Box sx={{
        display: 'flex',
        margin: '100px 20px 0 20px',
        flexDirection: {xs : 'column', md: 'row'},
        gap: '20px',
        alignItems: {xs : 'center', md: 'stretch'},
      }}>
        {loading &&
        <LoadingScreen/>}

        {!loading && 
        <>

        {username === '' &&
        <Typography variant='h5' margin={'auto'}>
          Please <Link href="/login">login</Link> to view your profile
        </Typography>}


        {/* pfp and user data box */}
        {username !== '' &&
        <>
        <Paper elevation={3} sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          width: '100%',
          maxWidth: '500px',
          padding: '20px',
          borderRadius: '10px',
        }}>
          <ConfirmDeletePopup 
            open={openDeleteProfile} 
            onConfirm={deleteProfile} 
            onClose={()=>setOpenDeleteProfile(false)}
            text="Are you sure you would like to delete your profile? This action cannot be undone."
          />

          <IconButton 
            style={{marginLeft: 'auto', marginBottom: -20}}
            onClick={() => setOpenDeleteProfile(true)}
            id = "Delete_Profile"
          >
            <DeleteIcon/>
          </IconButton>

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>

            <Tooltip title="Update Photo" onClick={()=>setEditPhoto(true)}>
              <Avatar src={profilePictureUrl} style={{
                width: '230px',
                height: '230px',
                borderRadius: '50%',
                border: '2px solid #000',
              }} />
            </Tooltip>

            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {uanme}
            </Typography>
            <Typography variant="h5">
              {email}
            </Typography>
            <Typography variant="h6" >
              Date joined: {dateJoined}
            </Typography>

            {editPhoto &&
            <div>
              <Button
                component="label"
              >
                Upload File
                <input
                  type="file" 
                  accept=".jpg,.png"
                  onChange={(e:any) => {
                    setProfilePictureUrl(URL.createObjectURL(e.target.files[0])); 
                    setImageFile(e.target.files[0]);
                  }}
                  hidden
                />
              </Button>
              <Button onClick={()=>setOpenDelete(true)}>Remove Picture</Button>
              <Button onClick={canclProfilePictureUpload}>Cancel</Button>
              <Button onClick={submitProfilePicture}>Submit</Button>
            </div>}

            <ConfirmDeletePopup 
              open={openDelete} 
              onConfirm={removeProfilePicture} 
              onClose={()=>setOpenDelete(false)}
              text="Are you sure you would like to reset your profile picture? This action cannot be undone."
            />

          </Box>
        </Paper>
        
        {/* tabbed ui box */}
        <Paper elevation={3} sx={{
          flexGrow: 1,
          padding: '20px',
          borderRadius: '10px',
          minHeight: '300px',
          width: '100%',
          position: 'relative'
        }}>

          <Typography variant="h4" sx={{ fontWeight: 'bold' }} 
            style={{
              display: 'flex',
              flexDirection: 'row', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <TabHeader 
              setTab={()=>{setTab('logbook'); setShowMore(false);}} 
              text="Logbook"
              highlight={tab === 'logbook'}
            />

            <Divider orientation="vertical" variant="middle" flexItem />

            <TabHeader 
              setTab={()=>{setTab('locations'); setShowMore(false);}} 
              text="Created Locations"
              highlight={tab === 'locations'}
            />

            <Divider orientation="vertical" variant="middle" flexItem />

            <TabHeader 
              setTab={()=>{setTab('friends'); setShowMore(false);}} 
              text="Friends"
              highlight={tab === 'friends'}
            />
          </Typography>


          {/* logbook tab */}
          {tab === 'logbook' && 
          <Box sx={{
            display: 'flex',
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div 
              style={{
                maxWidth: '1000px',
                width: '100%',
                padding: '20px',
              }}
            >
              {(!showMore ? logBook.slice(0,maxElems + 1) : logBook).map((location:string, index) => 
                <LogLocation
                  name={location}
                  key={index}
                  reRenderFunction={renderStuff}
                />
              )}
            </div>
          </Box>}

          {tab === 'logbook' &&
          <Button
            size="small"
            variant="outlined"
            sx={{ 
              position: 'absolute',
              right: '10px',
              bottom: '10px'
            }}
            onClick={() => setOpen(true)}
          >
            Add Location
          </Button>}

          {/* friends tab */}
          {tab === 'friends' && 
          <Box sx={{
            display: 'flex',
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div 
                style={{
                  maxWidth: '1000px',
                  width: '100%',
                  padding: '20px'
                }}
              >
                {(!friends ? logBook.slice(0,maxElems + 1) : friends).map((name:string, index) => 
                  <FriendEntry 
                    name={name}
                    key={index}
                    reRenderFunction={renderStuff} 
                    currentUser={""}
                  />
                )}
            </div>
          </Box>}

          {tab === 'friends' &&
          <Button
            size="small"
            variant="outlined"
            sx={{ 
              position: 'absolute',
              right: '10px',
              bottom: '10px'
            }}
            onClick={() => setOpen(true)}
          >
            Add Friend
          </Button>}

          {/* created locations tab */}
          {tab === 'locations' && 
          <Box sx={{
            display: 'flex',
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div 
                style={{
                  maxWidth: '1000px',
                  width: '100%',
                  padding: '20px'
                }}
              >
                {(!showMore ? createdLocations.slice(0,maxElems + 1) : createdLocations).map((name:string, index) => 
                  <CreatedLocationEntry
                    name={name}  
                    key={index}
                    onDelete={() => setRender(!render)}
                  />
                )}
            </div>
          </Box>}

          {(tab === 'logbook' && logBook.length > maxElems ||
           tab === 'friends' && friends.length > maxElems ||
           tab === 'locations' && createdLocations.length > maxElems) &&
          <Button
            size="small"
            variant="outlined"
            sx={{ 
              position: 'absolute',
              bottom: '10px',
              left: '50%',
            }}
            onClick={() => setShowMore(!showMore)}
          >
            {!showMore ? 'Show More' : 'Show Less'}
          </Button>}

        </Paper></>}
        </>}
      </Box>

      {/* add to logbook popup */}
      {tab === 'logbook' &&
      <Dialog
        open={open}
        keepMounted
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            height: '150px',
            width: '400px'
          }
        }}
      >
        <DialogContent>
          <div
            style={{
              display: 'flex',
              gap: '10px'
            }}
          >
            <AlternateLocationSearchBar error={false} helperText="" 
              onChange={(event:any, newVal:any) => {
                if (newVal && newVal.name)
                  setLogLocation(newVal.name);
              }}
            />
            <Button onClick={() => addToLogbook(logLocation)}>Add Location</Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>}
      
      {/* add to friends popup */}
      {tab === 'friends' &&
      <Dialog
        open={open}
        keepMounted
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            height: '150px',
            width: '400px'
          }
        }}
      >
        <DialogContent>
          <AddFriendsSearchBar renderFunction={renderStuff}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>}
    </>
  );
}
