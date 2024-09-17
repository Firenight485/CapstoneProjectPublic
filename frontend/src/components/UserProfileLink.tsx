import { axios_instance } from "@/axios";
import { Avatar, Box, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";

// component that displayer a user's avatar and their username

interface userLinkProps {
  username: string;
  email?: string;
  date?: string;  // some date you want to show, used in partner finder
  showUsername?: boolean;  // false if you just want the pfp
  onClick?: (event:any) => void;
}

export default function UserProfileLink({username, email, date, showUsername = true, onClick}:userLinkProps) {
  const [profilePictureUrl, setProfilePictureUrl] = useState<any>('');

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
      let res = await axios_instance({
        method: "get",
        responseType: "blob",
        url: 'api/pic/get_specfic_pic/?name=' + username
      });
      let reader = new window.FileReader();
      reader.readAsDataURL(res.data);
      reader.onload = function () {
        let imageDataUrl = reader.result;
        setProfilePictureUrl(imageDataUrl);
      };
      } catch (error) {
        console.error("Failed to fetch profile picture URL:", error);
      }
    };

    if (username)
      fetchProfilePicture();
  }, [username])

  return(
    <Typography variant="subtitle2">
      <Box 
        sx={{ 
          fontWeight: 501,
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}
        onClick={onClick}
        id = "Profile"
      >
        <Avatar alt={username} src={profilePictureUrl} />

        {/* Go to account when clicking on username */}
        {showUsername &&
        <Link 
          href={`/view_profile/${username}`}
          style={{
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          {username}
        </Link>} 
        {email && <div>{email}</div>} {date && <div>{date}</div>}
      </Box>
    </Typography>
  );
}