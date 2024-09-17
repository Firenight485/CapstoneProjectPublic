import { axios_instance } from "@/axios";
import { FavortieLocation } from "@/components/FavoriteLocaiton";
import Topbar from "@/components/Topbar";
import { UsernameContext } from "@/contexts/UsernameContext";
import { Link, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

// page to display the user's favorites

export default function Favorites() {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const {username, setUsername} = useContext(UsernameContext);
  const router = useRouter();

  useEffect(() => {
    const getFavorites = async() => {
      try {
        const response = await axios_instance.get('api/fav/get/');
        let data = response.data;
        let locs = []
        for (const area of data)
          locs.push(area.pk);
        setLocations(locs);
      } catch (error) {
        console.error(error)
      }
      setLoading(false);
    }

    getFavorites();
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
          Favorite Locations
        </Typography>

        {/* Must be logged in to have favorites */}
        {username === '' && !loading &&
        <Typography variant='h5' marginTop={'30px'}>
          Please <Link href="/login">login</Link> to view favorite locations
        </Typography>}

        {locations.length === 0 && !loading && username !== '' &&
        <Typography variant='h5' marginTop={'30px'}>
          No Favorite Locations
        </Typography>}
        
        <div 
          style={{
            maxWidth: '1000px',
            width: '100%',
            padding: '20px'
          }}
        >
          {locations.map((location:string, index) => 
            <FavortieLocation
              name={location.replaceAll('+', ' ')}
              key={index}
            />
          )}
        </div>
      </div>
    </>
  );
}

