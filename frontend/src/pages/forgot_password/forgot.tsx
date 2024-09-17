import Topbar from "@/components/Topbar";
import { useState } from 'react';
import { Paper, TextField, Stack, Button, Typography } from "@mui/material";
import React from "react";
import { useRouter } from 'next/router';
import { axios_instance } from '@/axios';
import climber from '../../../public/climber.jpg'

// forgot password page for entering your email in order to get a reset password email.

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emptyEmail, setEmptyEmail] = useState(false);
  const [validEmail, setValidEmail] = useState(true);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async() => {
    let empty = false;
    if (email === '') {
      setEmptyEmail(true);
      empty = true;
    } else {
      setEmptyEmail(false);
    }

    if (empty) 
      return;
    
    try {
      let response = await axios_instance.post(`api/forgot_password/`, {
        email: email
      })

      // 200 == HTTP OK
      if (response.status === 200) {
        setValidEmail(true);
        setSent(true);
      }
    } catch (error) {
      setValidEmail(false);
      console.error(error)
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

  const textStyles = { marginRight: 'auto', marginLeft: '5px' };

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
          <Typography variant="h3" style={textStyles}>
            Forgot Password
          </Typography>

          {sent &&
          <Typography variant="body1" style={textStyles}>
            An email has been sent with instructions to reset your password.
          </Typography>}

          {!sent &&
          <>
            <Typography variant="body1" style={textStyles}>
              Please enter the email associated with your account to reset your password.
            </Typography>

            <Typography variant="body1" style={textStyles}>
              Notice: emails sent to .sc.edu addresses have been know to get quarantined, while gmail has no issues.
            </Typography>

            <TextField
              error={emptyEmail} 
              helperText={emptyEmail ? "Required" : ''}
              size="small"
              label={'Email'}
              InputProps={{ 
                sx:{ borderRadius: '20px', 
                      width: '100%', 
                      minWidth: { xs: '250px', md: '350px' }},
              }}
              onKeyDown={handleEnter}
              onChange={(event:any)=>{setEmail(event.target.value)}}/>

            {!validEmail &&
            <Typography variant="caption" color="#d32f2f">
                Please enter a valid email
            </Typography>}

            <Button 
            variant="contained" 
            sx={buttonStyles}
            onClick={handleSubmit}>
              Submit
            </Button>
          </>}

        </Stack>
      </Paper>
    </div>
  );
}
