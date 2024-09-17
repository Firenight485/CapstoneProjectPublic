import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { axios_instance } from '@/axios';
import { useRouter } from 'next/router';
import { UsernameContext } from '@/contexts/UsernameContext';
import UserProfileLink from './UserProfileLink';

// component to show options when you click on icon in the top right of screen

export default function ProfileDropdown() {
  const {username, setUsername} = React.useContext(UsernameContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);  // element the popup is attached to
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event:any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async() => {
    try {
      await axios_instance.post('/api/logout/');
      setUsername('');
      router.reload();
    } catch(error) {
      console.error(error);
    }
  }

  return (
    <div style={{marginLeft: 'auto'}}>
      <UserProfileLink username={username} onClick={handleClick} showUsername={false}/>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        id="basic-menu"
      >
        {username &&
        [
        <MenuItem key={0} id='Profile_Link' onClick={() => router.push('/profile')}>Profile</MenuItem>,
        <MenuItem key={1} id='Logout' onClick={handleLogout}>Logout</MenuItem>
        ]}

        {!username &&
        [
        <MenuItem key={0} id='Sign Up' onClick={() => router.push('/signup')}>Sign Up</MenuItem>,
        <MenuItem key={1} id='Login' onClick={() => {router.push('/login');}}>Login</MenuItem>
        ]}
      </Menu>
    </div>
  );
}