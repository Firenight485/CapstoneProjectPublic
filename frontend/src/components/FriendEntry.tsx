import Divider from "@mui/material/Divider";
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { axios_instance } from "@/axios";
import { useState } from "react";
import ConfirmDeletePopup from "./ConfirmDeletePopup";

// same as FavoiteLocation.tsx but for friends

interface LocationProps {
  name: string;
  reRenderFunction: () => void;  // callback to rerender friends list
  currentUser: string; // Add currentUser prop
}

export function FriendEntry({ name, reRenderFunction, currentUser }: LocationProps) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const removeFriend = async () => {
    try {
      await axios_instance.delete('api/friend/remove/', { data: { friend: name } });
    } catch (error) {
      console.error("Failed to remove friend");
    }
    reRenderFunction();
  }

  if (name === currentUser) {
    return null; // Don't render the entry if it's the current user
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
        onClick={async() => await router.push('/view_profile/' + name)}
      >
        <Typography variant="h6">
          {name}
        </Typography>

        {/* Remove friend */}
        <IconButton
          style={{marginLeft: 'auto', zIndex: 100}}
          sx={{fontWeight: 'bold' }}
          onClick={(e) => {e.stopPropagation(); setOpen(true);}}
        >
          <DeleteIcon/>
        </IconButton>
      </div>

      <ConfirmDeletePopup 
        onClose={() => setOpen(false)} 
        onConfirm={removeFriend} 
        open={open}
        text="Are you sure you would like to remove this friend? This action cannot be undone."
      />
    </>
  );
}