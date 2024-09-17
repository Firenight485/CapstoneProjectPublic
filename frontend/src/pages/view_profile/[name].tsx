import { axios_instance } from "@/axios";
import { AdvSearchLocation } from "@/components/AdvSearchLocation";
import LoadingScreen from "@/components/LoadingScreen";
import Topbar from "@/components/Topbar";
import { Box, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// page similar to profile.tsx, but only used for viewing profiles.

export default function View_Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dateJoined, setDateJoined] = useState('')
  const [pfp, setPfp] = useState<any>('');
  const [logbook, setLogbook] = useState([]);
  const [noProfile, setNoProfile] = useState(false);  // true if user is not found
  const [loading, setLoading] = useState(true);  // true while loading
  const router = useRouter();

  useEffect(() => {
    // get user data
    const fetchData = async(tmp:string) => {
      try {
        const response = await axios_instance.get('api/user/get-profile?name=' + tmp);
        let data = response.data[0];
        setUsername(data.pk);
        setEmail(data.fields.email);
        const formattedDate = data.fields.created_at.split('T')[0];
        setDateJoined(formattedDate);
      } catch (error) {
        console.error(error);
        setNoProfile(true);
      }
      setLoading(false);
    }

    // get user logbook
    const fetchLogbook = async(tmp:string) => {
      try {
        const response = await axios_instance.get('api/user/get-logbook/?name=' + tmp);
        let data = response.data;
        let log:any = []
        for(const loc of data)
          log.push(loc.pk)
        setLogbook(log);
      } catch (error) {
        console.error(error);
      }
    }

    // get pfp
    const fetchPFP = async(tmp:string) => {
      try {
        let res = await axios_instance({
          method: "get",
          responseType: "blob",
          url: 'api/user/profile_pic/?name=' + tmp
        });
        let reader = new window.FileReader();
        reader.readAsDataURL(res.data);
        reader.onload = function () {
          let imageDataUrl = reader.result;
          setPfp(imageDataUrl);
        };
       } catch (error) {
        console.error("Failed to fetch profile picture URL:", error);
       }
    }

    // get user username
    let tmp:any = router.query.name;
    setUsername(tmp);
    fetchData(tmp);
    fetchLogbook(tmp);
    fetchPFP(tmp);
  }, [])

  return (
    <>
      <Topbar hasSearchBar={false}/>

      {loading &&
      <LoadingScreen/>}
      
      {/* no profile has been found screen */}
      {noProfile && !loading &&
      <div
        style={{
          height: '50vh',
          width: '100vw',
          display: 'flex'
        }}
      >
        <Topbar hasSearchBar={false}/>
        <Typography variant='h5' margin={'auto'}>
          The profile you are looking for does not seem to exist.
        </Typography>
      </div>}

      {/* user info and profile picture box */}
      {!noProfile && !loading && 
      <Box sx={{
        display: 'flex',
        margin: '100px 20px 0 20px',
        flexDirection: {xs : 'column', md: 'row'},
        gap: '20px',
        alignItems: {xs : 'center', md: 'stretch'},
      }}>
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
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <img src={pfp} style={{
              width: '230px',
              height: '230px',
              borderRadius: '50%',
              border: '3px solid #000',
            }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {username}
            </Typography>
            <Typography variant="h5">
              {email}
            </Typography>
            <Typography variant="h6" >
              Date joined: {dateJoined}
            </Typography>
          </Box>
        </Paper>

        {/* logbook */}
        <Paper elevation={3} sx={{
          flexGrow: 1,
          padding: '20px',
          borderRadius: '10px',
          minHeight: '300px',
          width: '100%',
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', margin: 'auto' }}>
              Logbook
            </Typography>
            <div 
                style={{
                  maxWidth: '1000px',
                  width: '100%',
                  padding: '20px'
                }}
              >
                {logbook.map((location:string, index) => 
                  <AdvSearchLocation
                    name={location}
                    key={index}
                  />
                )}
            </div>
          </Box>
        </Paper>
      </Box>}
    </>
  );
}