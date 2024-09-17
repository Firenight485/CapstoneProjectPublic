import { UsernameContext } from "@/contexts/UsernameContext";
import { Button, Rating, TextField } from "@mui/material";
import { useContext, useState } from "react";
import UserProfileLink from "./UserProfileLink";

// component used to edit replies/comments

interface commentBoxProps {
  contentPlaceholder: string;  // when content is deleted, placeholder value
  handleSubmit: (content: string, rating?:number) => void;
  handleCancel: () => void;  // cancel edit callback
  submitText: string;  // text in submit button
  showRating?: boolean;  // give option to edit rating
  defaultContent?: string;  // default content in the textfield, usually the comments content
  defaultRating?: number;  // default content in the textfield, usually the comments rating
  defaultWriting?: boolean;  // if true, cancel and submit buttons will appear by default. 
                             // If not, you will have to click in the textfield to make them appear.
  showPFP?: boolean; // true if you want to show the users pfp
}

export default function CommentBox({contentPlaceholder, handleSubmit, handleCancel, submitText, showRating, 
                                    defaultContent = '', defaultRating = 0, defaultWriting = false, showPFP}:commentBoxProps) {
  const [content, setContent] = useState(defaultContent);  // textfield content
  const [rating, setRating] = useState(defaultRating);
  const [writing, setWriting] = useState(defaultWriting);  // true if you have clicked on textfield.
                                                           // Used to determine if buttons should show
  const [submitted, setSubmitted] = useState(false);  // did you click on the submit button. Used for error detection
  const {username, setUsername} = useContext(UsernameContext);

  const btnStyles = {
    borderRadius: '20px',
  };

  const handleEnter = (event:any) => {
    // 13 is key code for enter
    if (event.keyCode === 13) {
      submitWrapper();
    }
  }

  // used to check for empty values before actully submitting
  const submitWrapper = () => {
    setSubmitted(true);
    if (content !== '') {
      setSubmitted(false);
      handleSubmit(content, rating); 
      onClose();
    }
  }

  const onClose = () => {
    setContent(''); 
    setWriting(false);
    setRating(0);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: !showRating ? '0 0 20px 15px' : ''
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '15px'
        }}
      >
        {/* username and pfp */}
        {showPFP && <UserProfileLink username={username} showUsername={false}/>}

        {/* comment content */}
        <TextField
          onChange={(event:any) => setContent(event.target.value)}
          onClick={() => {if (showRating) setWriting(true)}}
          value={content}
          variant="standard"
          fullWidth
          placeholder={contentPlaceholder}
          style={{margin: '0 0 0 5px'}}
          onKeyDown={handleEnter}
          error={content === '' && submitted}
          helperText={content === '' && submitted ? 'Required' : ''}
          id= 'CommentBox'
        />
      </div>

      {(!showRating || writing) &&
      <div
        style={{
          display: 'flex',
          gap: '20px',
          margin: '10px 0 0 0'
        }}
      >
        {/* Rating editing component */}
        {showRating &&
        <Rating 
          value={rating} 
          size="small" 
          onChange={(event, newValue:any) => {setRating(newValue)}}
        />}

        {/* Confirm and cancel buttons */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            margin: '0 0 0 auto'
          }}
        >
          <Button
            style={btnStyles}
            variant="outlined"
            onClick={() => {handleCancel(); onClose();}}
          >
            Cancel
          </Button>
          <Button
            style={btnStyles}
            variant="outlined"
            onClick={submitWrapper}
          >
            {submitText}
          </Button>
        </div>
      </div>}
    </div>
  );
}