import Topbar from "@/components/Topbar";
import { useState } from 'react';
import { Paper, TextField, Stack, Button, Typography } from "@mui/material";
import React from "react";
import { useRouter } from 'next/router';
import { axios_instance } from '@/axios';
import climber from '../../../public/climber.jpg'
import Swal from "sweetalert2";

// page used to enter a new password for reset password

export default function ForgotPassword() {
  const [password, setPassword] = useState('');
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [validPassword, setValidPassword] = useState(true);
  const router = useRouter();

  const handleSubmit = async() => {
    let empty = false;
    if (password === '') {
      setEmptyPassword(true);
      empty = true;
    } else {
      setEmptyPassword(false);
    }

    if (empty) 
      return;
    
    try {
      let response = await axios_instance.post(`api/forgot_password/${router.query.id}`, {
        password: password
      })

      // 200 == HTTP OK
      if (response.status === 200) {
        setValidPassword(true);
        router.push('/home');
        Swal.fire({  // success popup
          title: "Password Change Successful",
          text: "Password has been successfully changed.",
          icon: "success",
          confirmButtonColor: '#64b5f6',
        });
      }
    } catch (error) {
      setValidPassword(false);
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
            Forgot Password
          </Typography>

          <TextField
            type={'password'}
            error={emptyPassword} 
            helperText={emptyPassword ? "Required" : ''}
            size="small"
            label={'Password'}
            InputProps={{ 
              sx:{ borderRadius: '20px', 
                    width: '100%', 
                    minWidth: { xs: '250px', md: '350px' }},
            }}
            onKeyDown={handleEnter}
            onChange={(event:any)=>{setPassword(event.target.value)}}
          />

          {!validPassword &&
          <Typography variant="caption" color="#d32f2f">
              Password must have at least 1 capital letter, at least 1 special character, and be at least 8 characters long!
          </Typography>}

          <Button 
          variant="contained" 
          sx={buttonStyles}
          onClick={handleSubmit}>
            Update Password
          </Button>

        </Stack>
      </Paper>
    </div>
  );
}
