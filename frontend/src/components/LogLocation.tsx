import Divider from "@mui/material/Divider";
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { axios_instance } from "@/axios";
import { useState } from "react";
import ConfirmDeletePopup from "./ConfirmDeletePopup";

// like FavoriteLocaiton.tsx but for logged locations in user profile page.

interface locationProps {
  name: string;  // name of location to be displayed
  location?: string;
  reRenderFunction: () => void;  // used to reRender logged locations on a change
}

export function LogLocation({name, reRenderFunction}:locationProps) {
  const [hover, setHover] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const removeFromLogbook = async() => {
    try {
      await axios_instance.delete('api/log/remove/', {data: {loc: name}});
    } catch (error) {
      console.error("Failed to delete from logbook");
    }
    reRenderFunction()
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
          display: 'flex'
        }}
        onMouseLeave={()=>setHover(false)}
        onMouseEnter={()=>setHover(true)}
        onClick={async() => await router.push('/locations/' + name.replaceAll(' ', '+'))}
      >
        <Typography variant="h6">
          {name.replaceAll('+', ' ')}
        </Typography>
        <IconButton
            style={{marginLeft: 'auto'}}
            sx={{fontWeight: 'bold' }}
            onClick={(e) => {e.stopPropagation(); setOpen(true);}}
          >
            <DeleteIcon/>
        </IconButton>
        
      </div>

      <ConfirmDeletePopup 
        onClose={() => setOpen(false)} 
        onConfirm={removeFromLogbook} 
        open={open}
        text="Are you sure you would like to remove this location from your logbook? This action cannot be undone."
      />
    </>
  );
}