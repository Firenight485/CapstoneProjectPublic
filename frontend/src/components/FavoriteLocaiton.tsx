import { axios_instance } from "@/axios";
import { Rating } from "@mui/material";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useState } from "react";

// similar to AdvSearchLocation, used to show locations on favorites tab

interface locationProps {
  name: string;
  location?: string;
}

export function FavortieLocation({name, location}:locationProps) {
  const [hover, setHover] = useState(false);
  const [favorite, setFavorite] = useState(true);
  const router = useRouter();
  
  // handle star button is pressed
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

  return (
    <>
      <Divider sx={{ height: '1px'}} orientation="horizontal" />
      <div
        style={{
          margin: '0px',
          padding: '10px',
          backgroundColor: hover ? '#D3D3D3' : '',
          cursor: 'pointer',
          display: 'flex',
          zIndex: 1
        }}
        onMouseLeave={()=>setHover(false)}
        onMouseEnter={()=>setHover(true)}
        onClick={async() => await router.push("/locations/"+name)}
      >
        <Typography variant="h6">
          {name}{location && ','} {location}
        </Typography>

        {/* Used to favorite/unfavorite location */}
        <Rating
          value={+favorite}
          onChange={handleFavoriteChange}
          onClick={(e) => {e.stopPropagation()}}
          max={1}
          style={{margin: '3px 0 0 auto', zIndex: 100}}
        />
      </div>
    </>
  );
}