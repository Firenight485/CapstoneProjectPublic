import Topbar from "@/components/Topbar";
import { useContext, useState } from 'react';
import { Paper, TextField, Stack, Button, ThemeProvider, Typography } from "@mui/material";
import React from "react";
import { useRouter } from 'next/router';
import { axios_instance } from "@/axios";
import climber from '../../public/climber2.jpg'
import { UsernameContext } from "@/contexts/UsernameContext";

// signup page

export default function Signup() {
  const {username, setUsername} = useContext(UsernameContext);
  const [email, setEmail] = useState('');  // entered email
  const [uname, setUname] = useState('');  // entered username
  const [password, setPassword] = useState('');  // enterd password
  const [emptyEmail, setEmptyEmail] = useState(false);
  const [emptyUsername, setEmptyUsername] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [validAccout, setValidAccount] = useState(true);  // true if signup worked
  const [errorMessage, setErrorMessage] = useState('');  // true if error message should be shown
  let emptyList = [emptyEmail, emptyUsername, emptyPassword];
  const router = useRouter();

  // handle a change of password, email, or username
  const handleChange = (event:any, index: number) => {
    const setters = [setEmail, setUname, setPassword];
    setters[index](event.target.value);
  }

  // login the user after the signup
  const login = async() => {
    try {
      let response = await axios_instance.post('api/login/', {
        username: uname,
        password: password
      })

      // 200 == HTTP OK
      if (response.status === 200) {
        setUsername(uname);
        return true;
      } 
      return false;
    } catch (error) {
      console.error(error)
    }
  }

  // try to create account
  const handleSubmit = async() => {
    // use states will not updates within this function,
    // must use seperate variable
    let empty = false;
    const setters = [setEmptyEmail, setEmptyUsername, setEmptyPassword];
    [email, uname, password].map((value, index) => {
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
    
    let response;
    try {
      response = await axios_instance.post('api/signup/', {
        email: email,
        username: uname,
        password: password
      })

      // 200 == HTTP OK
      // try to login user after signing up
      if (response.status === 201 && await login()) {
        router.push('/home');
      } 
    } catch (error:any) {
      if (error.response.data)
        setErrorMessage(error.response.data);
      else
        setErrorMessage('An unknown error has occured');
      setValidAccount(false);
    }
  }

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
            Sign Up
          </Typography>

          {/* email password and username fields */}
          {['Email', 'Username', 'Password'].map((text, index) => (
            <TextField
            type={index === 2 ? "password" : ''}
            id={text}
            error={emptyList[index]} 
            helperText={emptyList[index] ? "Required" : ''}
            key={index}
            size="small"
            label={text}
            InputProps={{ 
              sx:{borderRadius: '20px', 
                  width: '100%', 
                  minWidth: { xs: '250px', md: '350px' }},
            }}
            onKeyDown={handleEnter}
            onChange={(event:any)=>{handleChange(event, index)}}/>
          ))}

          {/* error message returned by the server */}
          {!validAccout &&
          <Typography variant="caption" color="#d32f2f">
            {errorMessage}
          </Typography>}

          <Button 
            variant="contained" 
            sx={buttonStyles}
            onClick={handleSubmit}
            id='Create Account'
          >
            Create Account
          </Button>

        </Stack>
      </Paper>
    </div>
  );
}
