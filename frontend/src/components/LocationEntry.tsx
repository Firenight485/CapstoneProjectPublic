import { useRouter } from 'next/router';
import { useState } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton } from '@mui/material';

// Component to show results in the search bar

interface locationProps {
  name: string;  // name of location
  state: string;  // location state
  bottom?: boolean;  // true if bottom search result
  otherText?: string;  // used if compnent wants to be used for other uses
  onClick: () => void;
  moreInfo?: boolean;  // if true a button linking to location's page will appear
}

export default function LocationEntry({name, state, bottom = false, otherText, onClick, moreInfo = false} : locationProps) {
  const [hover, setHover] = useState(false);
  const router = useRouter();

  const handleClick = async(e:any) => {
    e.stopPropagation();
    await router.push("/locations/" + name.replaceAll(' ', '+'))
  }

  return(
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        margin: '0px',
        backgroundColor: hover ? '#D3D3D3' : '',
        cursor: 'pointer',
        borderRadius: bottom ? '0px 0px 20px 20px' : '',
      }}
      onClick={onClick} 
      onMouseEnter={()=>setHover(true)} 
      onMouseLeave={()=>setHover(false)}
    >
      <h4 
        style={{
          margin: '0px',
          padding: '10px'
        }} 
      >
        {otherText === undefined ? name + ', ' + state : otherText}
      </h4>
      {moreInfo &&
      <IconButton
        style={{
          marginLeft: 'auto'
        }}
        size='small'
        onClick={handleClick}
      >
        <InfoIcon/>
      </IconButton>} 
    </div>
  );
}