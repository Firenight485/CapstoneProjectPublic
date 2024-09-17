import { UsernameContext } from "@/contexts/UsernameContext";
import { Button, Rating, TextField } from "@mui/material";
import { useContext, useState } from "react";
import UserProfileLink from "./UserProfileLink";

// component used to edit a partner finder post/reply or create a partner finder reply

interface props {
  contentPlaceholder: string;  // placeholder when not content is in textfield
  handleSubmit: (content: string) => void;
  handleCancel: () => void;
  submitText: string;  // text content of submit button

  // defualt values when using this component for editing
  defaultContent?: string;
  defaultRating?: number;
  defaultMinAge?: number;
  defaultMaxAge?:number;

  isReply?: boolean;  // true if this component is in a reply

  margin?: string;
  showPFP?: boolean;  // true if pfp should be shown
}

export default function PartnerFinderPostBox({contentPlaceholder, handleSubmit, handleCancel, submitText, defaultContent = '', 
                                              isReply, defaultMaxAge, defaultMinAge, margin = '', showPFP}:props) {
  const [content, setContent] = useState(defaultContent);
  const [submitted, setSubmitted] = useState(false);
  const {username, setUsername} = useContext(UsernameContext);

  // styles for buttons
  const btnStyles = {
    borderRadius: '20px',
  };

  const handleEnter = (event:any) => {
    // 13 is key code for enter
    if (event.keyCode === 13) {
      submitWrapper();
    }
  }

  const submitWrapper = () => {
    setSubmitted(true);
    if (content !== '') {
      setSubmitted(false);
      handleSubmit(content); 
      onClose();
    }
  }

  const onClose = () => {
    setContent('');
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: margin
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '15px'
        }}
      >
        {/* pfp and username */}
        {showPFP && <UserProfileLink username={username} showUsername={false}/>}

        {/* Content of post/reply */}
        <TextField
          onChange={(event:any) => setContent(event.target.value)}
          value={content}
          variant="standard"
          fullWidth
          placeholder={contentPlaceholder}
          style={{margin: '0 0 0 5px'}}
          onKeyDown={handleEnter}
          error={content === '' && submitted}
          helperText={content === '' && submitted ? 'Required' : ''}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          margin: '10px 0 0 0'
        }}
      >
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
      </div>
    </div>
  );
}