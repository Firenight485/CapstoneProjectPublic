import { axios_instance } from "@/axios";
import CreateEditLocationPage from "@/components/CreateEditLocationPage";
import Topbar from "@/components/Topbar";
import { getFullDiffLevel, getFullRockType, getStateFullName } from "@/components/Utils";
import { UsernameContext } from "@/contexts/UsernameContext";
import { Link, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

// page for editing a location

export default function EditLocation() {
  const {username, setUsername} = useContext(UsernameContext);
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  // get data for given location
  useEffect(() => {
    const fetchLocationData = async(locName:string) => {
      try {
        const response = await axios_instance.get('api/get-location/?name=' + locName);
        let loc = response.data.fields;
        loc.name = response.data.pk;
        loc.state = await getStateFullName(loc.state);
        loc.rock_type = await getFullRockType(loc.rock_type);
        loc.difficulty_level = await getFullDiffLevel(loc.difficulty_level);
        setData(loc);
      } catch (error) {
        console.error(error)
      }
    };

    if (!document.URL.includes('?name='))
      router.push('/home');
    else {
      let tmp = document.URL.split('?name=')[1];
      fetchLocationData(tmp);
    }
  }, [])

  return(
    <>
      {/* pass data to edit component */}
      {username !== '' && data && data.author === username &&
      <CreateEditLocationPage 
        defName={data.name}
        defDesc={data.description}
        defLat={Number(data.latitude)}
        defLng={Number(data.longitude)}
        defState={data.state}
        defClimbingType={data.climbing_type}
        defDiff={data.difficulty_level}
        defRockType={data.rock_type}
        defId={data.location_id}
        isEditPage={true}
      />}
      {username === '' &&
      <div
        style={{
          height: '100vh',
          width: '100vw',
          display: 'flex'
        }}
      >
        <Topbar hasSearchBar={false}/>
        <Typography variant='h5' margin={'auto'}>
          Please <Link href="/login">login</Link> to edit a location
        </Typography>
      </div>}
    </>
  );
}