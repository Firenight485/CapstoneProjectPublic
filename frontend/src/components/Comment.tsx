import { Button, IconButton, Rating, Typography } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useContext, useState } from "react";
import { axios_instance } from "@/axios";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CommentBox from "./CommentBox";
import { UsernameContext } from "@/contexts/UsernameContext";
import UserProfileLink from "./UserProfileLink";
import ConfirmDeletePopup from "./ConfirmDeletePopup";

// While is component is called comment, it is used to render both comments and replies.

export interface reply {
  author: string;
  datePosted: string;
  content: string;
  commentid:string;  // unique, used for editing and deleting
}

interface commentProps {
  author: string;
  datePosted: string;
  content: string;
  locationName:string;  // location upon which the comment was made
  rating?: number;  // star rating from 0-5 for the location. Not present in replies
  replies?: reply[];  // should be empty if the object is a reply
  isReply?: boolean;  // true if this component is a reply
  commentid?: string;  // unique, used for editing and deleting
  fetchComments: () => void;  // callback used when a comment/reply is updated, 
                              // deleted, or made, which gets any changes from the backend
}


export default function Comment({author, datePosted, content, locationName, rating, replies = [], isReply, commentid, fetchComments}:commentProps) {
  const [showReplies, setShowReplies] = useState(false);  // true if replies button has been clicked
  const [makeReply, setMakeReply] = useState(false);  // true if writing reply
  const [edit, setEdit] = useState(false);  // true if editing
  const {username, setUsername} = useContext(UsernameContext);
  const [open, setOpen] = useState(false);  // open confirm delete popup when true

  // replies are shifted to the right
  const margin = isReply ? '0 0 0 15px' : '0';

  // if a reply is being written, margins have to be shifted to make room for
  // the textbox that appears
  const makeReplyMargin = makeReply ? '-40px 2px 0 0' : '2px 2px 0 0';

  const handleDelete = async() => {
    try {
      await axios_instance.delete('api/comment/delete/', {data:{id: commentid}});
      fetchComments();
    } catch (error) {
      console.error(error)
    }
  }

  // submitComment is in the actual locaton page in pages/locations.
  // submitReply is in this component as every comment can be replied to,
  // while comments are created at a single input box per location.
  const submitReply = async(content:string) => {
    let newReply = {
      loc_name: locationName,
      content: content,
      parent_id: commentid
    }

    try {
      await axios_instance.post('api/comment/reply/', newReply);
      setMakeReply(false);
      fetchComments();
    } catch (error) {
      console.error(error)
    }
  }


  const updateReplyorComment = async(content:string, rating?:number) => {
    let updated = {
      loc_name: locationName,
      content: content,
      id: commentid,
      rating: rating
    }

    // if a rating is provided, we know that a comment was edited.
    // If not, a reply was.
    try {
      if (rating)
        await axios_instance.post('api/comment/editcomment/', updated);
      else
        await axios_instance.post('api/comment/editreply/', updated);
      setMakeReply(false);
      fetchComments();
      setEdit(false);
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      style={{
        padding: '0 5px 3px 0',
        display: 'flex',
        flexDirection: 'column',
        margin: margin
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '10px'
        }}
      >
        {/* Username and pfp */}
        <UserProfileLink username={author} date={datePosted}/>

        {/* If you are logged in and the author, you can edit and delete comments/replies */}
        {username && username === author &&
        <div
          style={{
            margin: '0 0 0 auto',
            display: 'flex',
            gap: '20px'
          }}
        >
          <ConfirmDeletePopup 
            onClose={() => setOpen(false)} 
            onConfirm={handleDelete} 
            open={open}
            text="Are you sure you would like to delete this item? This action cannot be undone."
          />

          <IconButton 
            onClick={() => setOpen(true)}
            size="small"
          >
            <DeleteIcon/>
          </IconButton>
          <IconButton 
            onClick={() => setEdit(true)}
            size="small"
          >
            <EditIcon/>
          </IconButton>
        </div>}
      </div>

      {/* Display normally, when an edit is not being made */}
      {!edit && 
      <>
        <Typography variant="body1">
          {content}
        </Typography>

        {!isReply && username && 
        <div
          style={{
            display: 'flex',
            gap: '10px'
          }}
        >
          <Rating 
            value={rating} 
            size="small" 
            readOnly
            style={{
              margin: '10px 0 0 0'
            }}
          />

          <Button 
            onClick={() => setMakeReply(true)}
          >
            Reply
          </Button>
        </div>}
      </>}

      {/* Box to make a reply one the reply button was clicked */}
      {makeReply &&
      <CommentBox
        contentPlaceholder="Leave a reply..."
        handleSubmit={submitReply}
        handleCancel={() => {setMakeReply(false)}}
        submitText="Reply"
        showPFP
      />}

      {/* Box that takes the place of normal content when editing */}
      {edit &&
      <CommentBox
        contentPlaceholder="Leave a reply..."
        handleSubmit={updateReplyorComment}
        handleCancel={() => {setEdit(false)}}
        submitText={isReply ? 'Save Reply' : 'Save Comment'}
        showRating={!isReply}
        defaultWriting
        defaultContent={content}
        defaultRating={rating}
      />}

      {/* Replies */}
      <div
        style={{
          margin: makeReplyMargin
        }}
      >
        {replies.length > 0 &&
        <Button 
          startIcon={showReplies ? <ArrowDropUpIcon/> : <ArrowDropDownIcon/>}
          size="small" 
          onClick={() => setShowReplies(!showReplies)}
          style={{
            borderRadius: 0
          }}>
          {replies.length} replies
        </Button>}

        {showReplies &&
        replies.map((reply:reply, key:number) => 
          <Comment 
            author={reply.author} 
            datePosted={reply.datePosted} 
            content={reply.content} 
            locationName={locationName} 
            commentid={reply.commentid}
            isReply
            fetchComments={fetchComments}
            key={key}/>
        )}
      </div>
    </div>
  );
}