import React, { useState, useEffect, useContext } from 'react';
import Topbar from "@/components/Topbar";
import { axios_instance } from '@/axios';
import { useRouter } from 'next/router';
import { AdvSearchLocation } from '@/components/AdvSearchLocation';
import { Link, Typography } from '@mui/material';
import { UsernameContext } from '@/contexts/UsernameContext';

// page to show a user their recently visited locations

export default function Recents() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const {username, setUsername} = useContext(UsernameContext);
  const router = useRouter();

  useEffect(() => {
    const getRecents = async() => {
      try {
        const response = await axios_instance.get('api/recent/get/');
        let data = response.data;
        setLocations(data.split(','));
      } catch (error) {
        console.error(error)
      }
      setLoading(false);
    }

    getRecents();
  }, [router.asPath])

  return (
    <>
      <Topbar hasSearchBar={false} />
      <div
        style={{
          margin: '100px 0 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h4">
          Recent Locations
        </Typography>

        {/* must be logged in to view recents */}
        {username === '' && !loading &&
        <Typography variant='h5' marginTop={'30px'}>
          Please <Link href="/login">login</Link> to view recent locations
        </Typography>}

        {locations.length === 0 && !loading && username !== '' &&
        <Typography variant='h5' marginTop={'30px'}>
          No Recent Locations
        </Typography>}
        
        <div 
          style={{
            maxWidth: '1000px',
            width: '100%',
            padding: '20px'
          }}
        >
          {locations.reverse().map((location:string, index) => 
            <AdvSearchLocation 
              name={location.replaceAll('+', ' ')}
              key={index}
            />
          )}
        </div>
      </div>
    </>
  );
}