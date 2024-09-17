import { ThemeProvider } from "@mui/material"
import { app_theme } from "@/components/theme"
import {UsernameContext} from '@/contexts/UsernameContext'
import { useEffect, useState } from "react";
import '../css/globals.css'
import { axios_instance } from "@/axios";

// entry point of project

// change theme of h3 for whole project so it is response to screen size.
app_theme.typography.h3 = {
  fontSize: '1.2rem',
  '@media (min-width:600px)': {
    fontSize: '1.5rem',
  },
  [app_theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
};


export default function App({ Component, pageProps }:any) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const getData = async() => {
      try {
        const response = await axios_instance.get('api/getaccountinfo');
        let data = response.data;
        setUsername(data.username);
      } catch (error) {
        console.error(error);
      }
    };

    getData();
  }, [])

  return (
    <UsernameContext.Provider value={{username, setUsername}}>
      <ThemeProvider theme={app_theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </UsernameContext.Provider>
  )
}    