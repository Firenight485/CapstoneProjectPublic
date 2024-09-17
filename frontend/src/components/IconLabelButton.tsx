import { IconButton, Paper, Typography } from "@mui/material";

// general component for MUI iconButtons with a label that complete a given action upon click

interface props {
  onClick: () => void;
  icon: any;  // mui icon
  label: string;  // label to the left of button
  borderRadius?: string;
  backgroundColor?: string;
  margin?: string; 
}

export default function IconLabelButton({onClick, icon, label, backgroundColor, borderRadius = '20px', margin}:props) {

  return (
    <Paper
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        borderRadius: borderRadius,
        backgroundColor: backgroundColor,
        margin: margin
      }}
    >
      <Typography variant="body1" style={{marginLeft: '10px'}}>
        {label}
      </Typography>
      <IconButton onClick={onClick}>
        {icon}
      </IconButton>
    </Paper>
  )
}