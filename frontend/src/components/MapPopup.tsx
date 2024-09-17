import { Dialog } from "@mui/material";
import Map from "@/components/Map"

// component used within advanced search to select current location

interface props {
  open: boolean;
  onClose: () => void;
  handleDragPos?: (dragpos:any) => any;  // share coords with parent component
  defaultLat: string;
  defaultLng: string;
}

export default function MapPopup({open, onClose, handleDragPos, defaultLat, defaultLng}:props) {

  return (
    <Dialog
      open={open}
      keepMounted
      onClose={onClose}
      PaperProps={{
        sx: {
          height: '400px',
          width: '400px'
        }
      }}
    >
      <Map 
        locations={[]} 
        height="100%" 
        width="100%"
        draglat={Number(defaultLat)}
        draglng={Number(defaultLng)}
        handleDragPos={handleDragPos}
      />
    </Dialog>
  );
}