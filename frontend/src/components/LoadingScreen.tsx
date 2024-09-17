import { CircularProgress, Typography } from "@mui/material";

// component to show in screen while loading

export default function LoadingScreen() {
  return (
    <div
      style={{
        height: '50vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px'
      }}
    >
      <Typography variant="h5">
        Loading...
      </Typography>
      <CircularProgress />
    </div>
  )
}