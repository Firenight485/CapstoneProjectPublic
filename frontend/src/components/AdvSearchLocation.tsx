import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useState } from "react";

// while this component was made to be used for the advanced search page,
// the recents page also uses it and the necessary functionality overlaps

interface locationProps {
  name: string;  // name of location
  location?: string;  // state of location
}

export function AdvSearchLocation({name, location}:locationProps) {
  const [hover, setHover] = useState(false);  // is component being hovered
  const router = useRouter();
  
  return (
    <>
      <Divider sx={{ height: '1px'}} orientation="horizontal" />
      <div
        style={{
          margin: '0px',
          padding: '10px',
          backgroundColor: hover ? '#D3D3D3' : '',
          cursor: 'pointer'
        }}
        onMouseLeave={()=>setHover(false)}
        onMouseEnter={()=>setHover(true)}
        onClick={async() => await router.push("/locations/"+name.replaceAll(' ', '+'))}
      >
        <Typography variant="h6">
          {name}{location && ','} {location}
        </Typography>
      </div>
    </>
  );
}