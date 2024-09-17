import Divider from "@mui/material/Divider";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { axios_instance } from "@/axios";
import { useState } from "react";
import ConfirmDeletePopup from "./ConfirmDeletePopup";

// component to display the user's created locations within the profile

interface locationProps {
  name: string;  // name of location
  onDelete:()=>void;  // callback when deleted
}

export function CreatedLocationEntry({name, onDelete}:locationProps) {
  const [hover, setHover] = useState(false);  // is mouse hovering
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async() => {
    try {
      await axios_instance.post('api/location/delete/', {name: name});
      onDelete();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      {/* Divider to seperate instances of this component */}
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
        {/* location name */}
        <Typography variant="h6">
          {name}
        </Typography>
        
        {/* Edit and delte location buttons */}
        <div
          style={{marginLeft: 'auto'}}
        >
          {/* Need to stop propogation so that the onClick if the parent div is not called */}
          <IconButton
              sx={{fontWeight: 'bold' }}
              onClick={(e) => {e.stopPropagation(); router.push('/edit_location?name=' + name.replaceAll(' ', '+'))}}
            >
              <EditIcon/>
          </IconButton>

          <IconButton
            sx={{fontWeight: 'bold' }}
            onClick={(e) => {e.stopPropagation(); setOpen(true);}}
            >
            <DeleteIcon/>
          </IconButton>
        </div>
        
      </div>
      <ConfirmDeletePopup 
        onClose={() => setOpen(false)} 
        onConfirm={handleDelete} 
        open={open}
        text="Are you sure you would like to delete this location? This action cannot be undone."
      />
    </>
  );
}