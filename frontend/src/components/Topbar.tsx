'use client'

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GradeIcon from '@mui/icons-material/Grade';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link'
import { app_theme } from './theme';
import ProfileDropdown from './ProfileDropdown';
import { LocationSearchBar } from './LocationSearchBar';
import InfoIcon from '@mui/icons-material/Info';
// See https://mui.com/material-ui/react-drawer/

// Header at the top of app and leftbar that appears when you click the top left icon

const drawerWidth = 240;

const side_icons = [<HomeIcon key={1}/>, 
                    <GradeIcon key={2}/>, 
                    <ReplayIcon key={3}/>,
                    <SearchIcon key={4}/>, 
                    <AddIcon key={5}/>, 
                    <GroupAddIcon key={6}/>]
                    
//const upper_icons = [<AccountBoxIcon/>]

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

// copied from https://mui.com/material-ui/react-drawer/
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: open ? drawerWidth : 0,
  width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
  '& .MuiDrawer-paper': {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: open ? 0 : -drawerWidth,
    width: drawerWidth,
    boxSizing: 'border-box',
  },
}));

// copied from https://mui.com/material-ui/react-drawer/
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface TopbarProps {
  hasSearchBar: boolean;  // true if you want loation search bar
}

export default function Topbar({hasSearchBar}: TopbarProps) {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // style={{ background: 'transparent', boxShadow: 'none'}} to make appbar transparent

  return (
    <div>
      <AppBar position="fixed" style={{ background: 'transparent', boxShadow: 'none'}} open={open}>
        <Toolbar variant='dense'>

          {/* Top left icon */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            id = "topBar"
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>

          {/* logo */}
          <Link href={'/'} style={{ color: 'inherit', textDecoration: 'none'}}>
            <Typography variant="h6" noWrap component="div">
              Crux Conditions
            </Typography>
          </Link>

          {hasSearchBar && <LocationSearchBar/>}

          <ProfileDropdown/>
        </Toolbar>
      </AppBar>

      {/* Left bar */}

      <Drawer
        sx={{
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {app_theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Home', 'Favorites', 'Recent', 'Advanced Search', 'Create Location', 'Partner Finder'].map((text, index) => (
            <Link key={text} href={"/" + text.replace(' ', '_').toLocaleLowerCase()} style={{ color: 'black', textDecoration: 'none'}} id ={text}>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {side_icons[index]}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
          <Divider variant='middle'/>
          <Link href={'https://sccapstone.github.io/Briattoshu/'} style={{ color: 'black', textDecoration: 'none'}}>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InfoIcon/>
                </ListItemIcon>
                <ListItemText primary='About' />
              </ListItemButton>
            </ListItem>
          </Link>
        </List>
      </Drawer>
    </div>
  );
}