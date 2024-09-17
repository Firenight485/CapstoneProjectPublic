'use client'

// theme of app

import { createTheme } from '@mui/material/styles';

export const app_theme = createTheme({
  palette: {
    primary: {
      main: '#64b5f6',
    },
    secondary: {
      main: '#000000',
    },
  },
  typography: {
    button: {
      textTransform: 'none'
    },
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(',')
  }
});
