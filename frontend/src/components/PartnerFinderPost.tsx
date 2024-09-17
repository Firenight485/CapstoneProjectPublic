import { axios_instance } from "@/axios";
import { UsernameContext } from "@/contexts/UsernameContext";
import { Button, Divider, IconButton, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import PartnerFinderPostBox from "./PartnerFinderPostBox";
import { ISOtoNormalDate } from "@/pages/locations/[name]";
import UserProfileLink from "./UserProfileLink";
import LocationAttributeSelector from "./LocationAttributeSelector";
import ConfirmDeletePopup from "./ConfirmDeletePopup";

// like comment.tsx but for partner finder instead of location page. 
// Component that renders a partner finder post.

interface props {
  author: string;
  datePosted: string;
  content: string;
  locationName:string;  // location the post is for
  replies?: any[];

  // content for post
  maxAge?: number | '';
  minAge?: number | '';
  isReply?: boolean;
  postid?: string;
  skillLevel?:any;

  fetchPosts: () => void;  // callback to reRender posts
}

export default function PartnerFinderPost({author, content, datePosted, locationName, maxAge = '', minAge = '',
                                          replies = [], isReply = false, postid, fetchPosts, skillLevel = ['', '']}:props) {
  const [showReplies, setShowReplies] = useState(false);  // true if a post, false if a reply
  const [makeReply, setMakeReply] = useState(false);  // true if writing a reply
  const [edit, setEdit] = useState(false);  // true if editing a post/reply
  const {username, setUsername} = useContext(UsernameContext);
  // tmp values stored while editing
  const [editMaxAge, setEditMaxAge] = useState<Number | ''>(maxAge);
  const [editMinAge, setEditMinAge] = useState<Number | ''>(minAge);
  const [editRating, setEditRating] = useState<any>(skillLevel);

  const [submitted, setSubmitted] = useState(false);  // true if user tried to submit and edit
  const [open, setOpen] = useState(false);  // true if delete popup should open

  const replyLeftOffset = '15px';  // replies are shifted right
  const margin = isReply ? `0 0 0 ${replyLeftOffset}` : '0';

  // margin of replies changes if you are writing a reply or not
  const replyMargin = makeReply ? '-40px 2px 0 0' : '2px 2px 0 0';

  const handleDiffChange = (event: any, newDiff:any) => {
    let newval = [...editRating];
    if (newDiff === null)
      newDiff = '';
    newval = newDiff;
    setEditRating(newDiff);
  }

  if (datePosted)
    datePosted = ISOtoNormalDate(datePosted);

  const handleDelete = async() => {
    try {
      if (!isReply)
        await axios_instance.delete('api/pf/delete/', {data:{id: postid}});
      else
        await axios_instance.delete('api/pf/delete-reply/', {data:{id: postid}});
      fetchPosts();
    } catch (error) {
      console.error(error)
    }
  }

  const submitReply = async(content:string) => {
    let newReply = {
      loc_name: locationName,
      content: content,
      parent_id: postid
    }

    try {
      await axios_instance.post('api/pf/reply/', newReply);
      setMakeReply(false);
      fetchPosts();
    } catch (error) {
      console.error(error)
    }
  }

  const updateReplyorPost = async(content:string) => {
    let updated;

    if (isReply) {
      updated = {
        content: content,
        id: postid
      }
    } else {
      setSubmitted(true);  // user tried to submit
      updated = {
        content: content,
        id: postid,
        min_age: editMinAge,
        max_age: editMaxAge,
        skill_level: editRating
      }

      // dont submit in these cases
      if (editMinAge    === '' ||
          editMaxAge    === '' ||
          editRating[0] === '')
      return;
    }

    try {
      if (isReply)
        await axios_instance.put('api/pf/update-reply/', updated);
      else
        await axios_instance.put('api/pf/update/', updated);
      setSubmitted(false);
      setMakeReply(false);
      fetchPosts();
      setEdit(false);
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      style={{
        margin: margin,
        width: '100%'
      }}
    >
      {/* Divider between posts, not replies */}
      {!isReply && <Divider style={{margin: '0 0 10px 0'}}/>}

      <div
        style={{
          display: 'flex',
          gap: '10px'
        }}
      >
        {/* Show location and other info for posts */}
        {!isReply && !edit &&
        <Typography variant="h5">
          Location: {locationName}, Age Range: {minAge} - {maxAge}, 
          Skill Level: {skillLevel ? skillLevel[1] : skillLevel}
        </Typography>}

        {/* Edit post (not reply) */}
        {!isReply && edit &&
        <Typography variant="h5"
          style={{
            display: 'flex',
            gap: '10px',
            width: '100%',
            flexWrap: 'wrap'
          }}
        >
          Location: {locationName},  
          Age Range:
          <TextField
            size="small"
            label="Min-Age"
            value={editMinAge}
            type="number"
            onChange={(event:any) => setEditMinAge(event.target.value)}
            error={editMinAge === '' && submitted}
            helperText={submitted && editMinAge === '' ? 'Please enter a min age' : ''}
          />
          -
          <TextField
            size="small"
            label="Max-Age"
            value={editMaxAge}
            type="number"
            onChange={(event:any) => setEditMaxAge(event.target.value)}
            error={editMaxAge === '' && submitted}
            helperText={submitted && editMaxAge === '' ? 'Please enter a min age' : ''}
          /> Skill Level:

          <LocationAttributeSelector 
            style={{width: '175px'}}
            defValue={skillLevel}
            label="Skill Level" 
            error={editRating[0] === '' && submitted}
            helperText={submitted && editRating[0] === '' ? 'Please select a difficulty.' : ''}
            handleChange={handleDiffChange}
            type="diff"
          />
        </Typography>}

        {/* username and pfp */}
        {isReply &&
        <UserProfileLink username={author} date={datePosted}/>}

        {/* edit or delete post buttons */}
        {username && username === author &&
        <div
          style={{
            margin: '0 0 0 auto',
            display: 'flex',
            gap: '20px'
          }}
        >
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

          <ConfirmDeletePopup 
            onClose={() => setOpen(false)} 
            onConfirm={handleDelete} 
            open={open}
            text="Are you sure you would like to delete this item? This action cannot be undone."
          />
        </div>}
      </div>

      {/* Location of pfp if the component is a reply is differnt than for a post */}
      {!isReply &&
      <UserProfileLink username={author} date={datePosted}/>}

      {/* text content of post */}
      {!edit && 
      <>
        <Typography variant="body1" margin={isReply? '0 0 0 0' : '10px 0 0 0'}>
          {content}
        </Typography>

        {!isReply && username &&
        <div
          style={{
            display: 'flex',
            gap: '10px'
          }}
        >
          <Button 
            onClick={() => setMakeReply(true)}
          >
            Reply
          </Button>
        </div>}
      </>}

      {/* make reply box */}
      {makeReply &&
      <PartnerFinderPostBox
        contentPlaceholder="Leave a reply..."
        handleSubmit={submitReply}
        handleCancel={() => {setMakeReply(false)}}
        isReply
        submitText="Reply"
        margin={replies.length > 0 ? `0 0 15px ${replyLeftOffset}` :  `0 0 50px ${replyLeftOffset}`}
        showPFP
      />}

      {/* Edit post/reply box */}
      {edit &&
      <PartnerFinderPostBox
        contentPlaceholder={isReply ? "Leave a reply..." : 'Post content'}
        handleSubmit={updateReplyorPost}
        handleCancel={() => {setEdit(false)}}
        submitText={isReply ? 'Save Reply' : 'Save Post'}
        isReply={isReply}
        defaultContent={content}
      />}

      {/* show replies button and replies */}
      <div
        style={{
          margin: replyMargin
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
        replies.map((reply:any, key:number) => 
          <PartnerFinderPost 
            author={reply.fields.author} 
            datePosted={reply.fields.created_at} 
            content={reply.fields.content} 
            locationName={locationName} 
            postid={reply.pk}
            isReply
            fetchPosts={fetchPosts}
            key={key}
          />
        )}
      </div>
    </div>
  );
}