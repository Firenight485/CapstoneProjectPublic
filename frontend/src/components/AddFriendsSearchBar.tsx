import { axios_instance } from "@/axios";
import { UsernameContext } from "@/contexts/UsernameContext";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";

interface props {
  renderFunction?: () => void;
}

export default function AddFriendsSearchBar({renderFunction}: props) {
  // list of all users
  const [users, setUsers] = useState([]);
  // currently selected user in the search bar
  const [selected, setSelected] = useState([]);
  const {username, setUsername} = useContext(UsernameContext);

  const handleAddFriend = async() => {
    try {
      await axios_instance.post('api/friend/add/', {friend: selected});
      if (renderFunction)
        renderFunction();
    } catch (error) {
      console.error("Failed to add friend");
    }
  }

  useEffect(() => {
    const getUsers = async() => {
      try {
        const response = await axios_instance.get('api/get-usernames/');
        let data = JSON.parse(response.data);
        // dont allow users to add themselves as a friend
        data = data.filter((name: string) => name !== username);
        setUsers(data);
      } catch (error) {
        console.error(error)
      }
    }

    getUsers();
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px'
      }}
    >
      <Autocomplete
        options={users}
        fullWidth
        renderInput={(params) => 
            <TextField 
            {...params} 
            label="Add friend"
        />}
        onChange={(event: any, newVal:any) => {
          setSelected(newVal);
        }}
      />
      <Button onClick={handleAddFriend}>
        Add Friend
      </Button>
    </div>
  );
}