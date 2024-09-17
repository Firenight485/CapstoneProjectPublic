import React, { useState, useEffect } from 'react';
import Topbar from "@/components/Topbar"
import Map from "@/components/Map"
import { useRouter } from 'next/router';
import { axios_instance } from '@/axios';
import { useCookies } from 'react-cookie';
import mtn from '../../public/mtn.png'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

// homepage of app. Shows popular locations by default

export default function Home() {
  const router = useRouter();
  const [cookie, setCookie] = useCookies();  // used to determine if site has been visited before
  const [openPopup, setOpenPopup] = useState(false);  // should welcome popup be open
  const [locations, setLocations] = useState([]);  // locations to display

  // determine if user has visited the page before
  useEffect(() => {
    // if user has visited before, dont show the welcome popup
    if (!cookie['visitedCruxConditions']) {
      setOpenPopup(true);

      // expire 1 year later
      let d = new Date();
      d.setDate(d.getDate() + 365);
      setCookie('visitedCruxConditions', 'true', { path: '/', expires: d });
    }
  }, [])

  // get data from a search result
  useEffect(() => {
    const getLocationData = async() => {
      let search = window.location.search;
      let data:any = [];

      // dont query API when no search has been made
      if (search != '') {
        try {
          const response = await axios_instance.get('api/search' + search);
          if (Object.prototype.toString.call(response.data) !== '[object Array]')
            response.data = [response.data];

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
    
    getLocationData();
  }, [router.asPath]);


  const [popularLocations, setPopularLocations] = useState([]);
  // get defaultly displayed popular locations
  useEffect(() => {
    const fetchPopularLocations = async () => {
      let data:any = [];

        try {
          const response = await axios_instance.get('api/popular-locations');
          if (Object.prototype.toString.call(response.data) !== '[object Array]')
            response.data = [response.data];

          for (const elem of response.data) {
            let loc = elem.fields;
            loc.name = elem.pk;
            data.push(loc);
          }
          setPopularLocations(data);
        } catch (error) {
          console.error(error)
        }
    };
    
    fetchPopularLocations();
  }, []);

  return (
    <>
      <Topbar hasSearchBar={true}/>
      
      <Map 
        height='100vh' 
        width='100vw' 
        locations={locations.length === 0 ? popularLocations : locations}
        showUser
      />

      {/* Welcome popup */}
      {openPopup &&
      <Dialog
        open={openPopup}
        id="popupDialog"
        keepMounted
        onClose={() => setOpenPopup(false)}
        PaperProps={{
          sx: {
            height: '300px',
            width: '600px',
            backgroundImage: `url(${mtn.src})`,
            color: 'white'
          }
        }}
      >
        <DialogTitle >Welcome to Crux Conditions!</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <Typography variant="body1">
              Welcome to Crux Conditions! Crux Conditions is an application meant to make planning climbing trips easier.
              You are currently on our home page, which by default displays our most viewed climbing destinations. Feel free
              to search for other locations, or utilize other features of our app. Thanks!
            </Typography>
            
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenPopup(false)}
            style={{color: 'white'}}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>}
    </>
  );
}

