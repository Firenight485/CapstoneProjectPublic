import Topbar from "@/components/Topbar";
import { useContext, useEffect, useState } from 'react';
import { Paper, TextField, Stack, Button, Link, Divider, Typography } from "@mui/material";
import React from "react";
import { useRouter } from 'next/router';
import { axios_instance } from '@/axios';
import climber from '../../public/climber.jpg'
import { UsernameContext } from "@/contexts/UsernameContext";

// login page

export default function Login() {
  const {username, setUsername} = useContext(UsernameContext);  // logged in user name
  const [uname, setUname] = useState('');  // username entered in username box
  const [password, setPassword] = useState(''); // password entered
  const [emptyUsername, setEmptyUsername] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [validLogin, setValidLogin] = useState(true);
  const [loaded, setLoaded] = useState(false); // is page loaded

  let emptyList = [emptyUsername, emptyPassword];
  const router = useRouter();

  // determine if user is already logged in
  useEffect(() => {
    const alreadyLoggedIn = async() => {
      let loggedIn = await axios_instance.get('api/is-logged-in/');
      if (loggedIn.status === 200)
        await router.push('/profile');
      else
        setLoaded(true);
    }

    alreadyLoggedIn();
  }, [])

  const handleChange = (event:any, index: number) => {
    const setters = [setUname, setPassword];
    setters[index](event.target.value);
  }

  // submit login attempt
  const handleSubmit = async() => {
    let empty = false;
    const setters = [setEmptyUsername, setEmptyPassword];
    [uname, password].map((value, index) => {
      if (value === '') {
        setters[index](true);
        empty = true;
      } else {
        setters[index](false);
      }
    });

    // if the user didnt enter a username and password,
    // dont bother checking if it is a valid login
    if (empty) 
      return;
    
    try {
      let response = await axios_instance.post('api/login/', {
        username: uname,
        password: password
      })

      // 200 == HTTP OK
      if (response.status === 200) {
        setValidLogin(true);
        setUsername(uname);
        router.push('/home');
      }
    } catch (error) {
      setValidLogin(false);
      console.error(error)
    }
  }

  // submit when enter is pressed
  const handleEnter = (event:any) => {
    // 13 is key code for enter
    if (event.keyCode === 13)
      handleSubmit();
  }

  const buttonStyles = {
    borderRadius: '20px', 
    minWidth: '60%',
    height: '40px'
  };

  return (
    <>
      {loaded &&
      <div style={{backgroundImage: `url(${climber.src})`, height: '100dvh'}}>
        <Topbar hasSearchBar={false}/>
        <Paper 
        elevation={1}
        sx={{
          position: 'fixed',
          top: '15vh',
          left: '50%', 
          transform: 'translatex(-50%)',
          minWidth: { xs: '300px', md: '400px' },
          height: 'fit-content'
        }}>
          <Stack 
          spacing={2} 
          margin='20px'
          >
            <Typography variant="h3" style={{ marginRight: 'auto', marginLeft: '5px' }}>
              Sign In
            </Typography>

            {/* username and password buttons */}
            {['Username', 'Password'].map((text, index) => (
              <TextField
              type={index === 1 ? "password" : ''}
              error={emptyList[index]} 
              helperText={emptyList[index] ? "Required" : ''}
              key={index}
              size="small"
              label={text}
              InputProps={{ 
                sx:{ borderRadius: '20px', 
                      width: '100%', 
                      minWidth: { xs: '250px', md: '350px' }},
              }}
              onKeyDown={handleEnter}
              onChange={(event:any)=>{handleChange(event, index)}}/>
            ))}

            {!validLogin &&
            <Typography variant="caption" color="#d32f2f">
                Invalid Username or Password
            </Typography>}

            <Typography variant="body1">
              <Link underline="none" href='/forgot_password/forgot'>
                Forgot Password?
              </Link>
            </Typography>

            <Button 
            variant="contained" 
            sx={buttonStyles}
            onClick={handleSubmit}>
              Sign In
            </Button>

            <Divider flexItem>
              <Typography variant="body1">or</Typography>
            </Divider>
            
            <Button 
            variant="contained" 
            sx={buttonStyles}
            onClick={() => router.push('/signup')} id = "Sign up2">
              Sign Up
            </Button>

          </Stack>
        </Paper>
      </div>}
    </>
  );
}
