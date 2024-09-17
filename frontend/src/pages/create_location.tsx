import CreateEditLocationPage from "@/components/CreateEditLocationPage";
import Topbar from "@/components/Topbar";
import { UsernameContext } from "@/contexts/UsernameContext";
import { Link, Typography } from "@mui/material";
import { useContext } from "react";

// page for creating a location

export default function CreateLocation() {
  const {username, setUsername} = useContext(UsernameContext);

  return(
    <>
      {username !== '' && <CreateEditLocationPage isEditPage={false}/>}

      {username === '' &&
      <div
        style={{
          height: '50vh',
          width: '100vw',
          display: 'flex'
        }}
      >
        <Topbar hasSearchBar={false}/>
        <Typography variant='h5' margin={'auto'}>
          Please <Link href="/login">login</Link> to create a location
        </Typography>
      </div>}
    </>
  );
}