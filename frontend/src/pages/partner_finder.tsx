import React, { useState, useEffect, useContext } from 'react';
import Topbar from "@/components/Topbar";
import { axios_instance } from '@/axios';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    Typography,
    Autocomplete,
    Box,
    FormControl,
    InputLabel,
    FormHelperText,
    Fab, } from '@mui/material';
import { UsernameContext } from '@/contexts/UsernameContext';
import { useRouter } from 'next/router';
import PartnerFinderPost from '@/components/PartnerFinderPost';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import AlternateLocationSearchBar from '@/components/AlternateLocationSearchBar';
import LoadingScreen from '@/components/LoadingScreen';

// partner finder page

export default function Partner_Finder() {
    // hook to open the create post screen
    const [open, setOpen] = useState(false);
    const [posts, setPosts] = useState([]); //fetched posts
    // hooks for new post
    const [newPostContent, setNewPostContent] = useState('');
    const [location, setLocation] = useState('');
    const [titleLocation, setTitleLocaiton] = useState('');
    const [maxAge, setMaxAge] = useState<number | ''>(100);
    const [minAge, setMinAge] = useState<number | ''>(16);
    const [rating, setRating] = useState('');
    // possible difficulty levels
    const [diffList, setDiffList] = useState([]);
    // true if user tried to submit
    const [submitted, setSubmitted] = useState(false);
    // state to force useEffect to run and thus get posts again (rerender)
    const [renderCondition, render] = useState(false);
    // context for keeping track of username and by extension if user is logged in
    const {username, setUsername} = useContext(UsernameContext);
    // used for routing pages
    const router = useRouter();
    // used to reset search in search bar
    const [key, setKey] = useState(0);
    const [loading, setLoading] = useState(true);

    // submission of a new post
    const submitPost = async () => {
        if (username === '') {
            await router.push('/login');
            return;
        }

        setSubmitted(true);
        if (newPostContent == '' ||
            location       == '' ||
            rating         == '' ||
            minAge         == '' ||
            maxAge         == '')
            return;

        try {
            await axios_instance.post('/api/pf/create/', {
                content: newPostContent,
                loc_name: location,
                max_age: maxAge,
                min_age: minAge,
                skill_level: rating,
            });
            setOpen(false);
            setSubmitted(false);
            setNewPostContent('');
            setLocation('');
            setMaxAge(100);
            setMinAge(16);
            setRating('');
            setKey(key + 1);
            render(!renderCondition); 

            Swal.fire({
                title: "Post Successful",
                text: "Your post has been made",
                icon: "success",
                confirmButtonColor: '#64b5f6',
            });
        } catch (error) {
            console.error("Failed to submit post:", error);
        }
    };

    // get posts and possible difficulty levels
    useEffect(() => {
        const fetchDifficultyLvls = async() => {
            try {
                const response = await axios_instance.get('api/locations/difficulty-levels');
                setDiffList(JSON.parse(response.data));
            } catch (error) {
              console.error(error)
            }
        }

        const fetchPosts = async () => {
            try {
                let response;
                let url = document.URL;
                if (url.includes('?location=')) {
                    let loc = document.URL.split('=')[1];
                    loc = loc.replaceAll('+', ' ');
                    setLocation(loc);
                    setTitleLocaiton(loc);
                    response = await axios_instance.get('/api/pf/get/?location=' + loc);
                    response.data = [response?.data];
                } else {
                    response = await axios_instance.get('/api/get-pf-posts/');
                }

                let data = JSON.parse(response.data);
                for (let elem of data) {
                    elem['parent'] = JSON.parse(elem['parent'])
                    elem['replies'] = JSON.parse(elem['replies'])
                }
                setPosts(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            }
        };

        fetchPosts();
        fetchDifficultyLvls();
    }, [renderCondition, router.asPath]);

    return (
        <>
            <Topbar hasSearchBar={false}/>
            <div
                style={{
                    margin: '40px 20px 20px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    alignItems: 'center'
                }}
                id="mainContainer"
            >
                {loading && <LoadingScreen/>}
                {!loading && <>
                <div
                    style={{
                        display: 'flex',
                        gap: '20px'
                    }}
                >
                    <Typography variant="h4" margin='10px'>
                        {titleLocation === '' ? 'Partner Finder' : `Partner Finder - ${titleLocation}`}
                    </Typography>
                </div>
                
                {/* message when there are no posts */}
                {posts.length === 0 &&
                <Typography variant='h5' marginTop={'30px'}>
                    No posts yet... Be the first!
                </Typography>}

                {/* create post */}
                {open &&
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        width: '100%',
                        maxWidth: '1200px'
                    }}
                    id="newPostForm"
                >
                    <TextField
                        label="New Post Content"
                        multiline
                        rows={4}
                        value={newPostContent}
                        onChange={(e: { target: { value: any; }; }) => setNewPostContent(e.target.value)}
                        variant="outlined"
                        fullWidth
                        error={newPostContent === '' && submitted}
                        helperText={submitted && newPostContent === '' ? 'Please enter post content' : ''}
                        id="postContentField"
                    />
                    {/* Additional fields for post details */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 'inherit'
                        }}
                    >
                        {/* if this is the main partner finder page, serach bar to select location is shown */}
                        {!document.URL.includes('?location=') &&
                        <AlternateLocationSearchBar 
                            key={key}
                            error={location === '' && submitted}
                            helperText={submitted && location === '' ? 'Please select a location.' : ''}
                            onChange={(event: any, newVal:any) => {
                                if (newVal)
                                    setLocation(newVal.name);
                                else
                                    setLocation('')
                            }}
                        />}

                        {/* dropdown for skill level */}
                        <FormControl fullWidth>
                            <InputLabel error={submitted && rating === ''}>Difficulty Rating</InputLabel>
                            <Select
                                label='Difficulty Rating'
                                value={rating}
                                onChange={(e: { target: { value: any; }; }) => {setRating(e.target.value)}}
                                error={rating === '' && submitted}
                                id='diffLevel'
                            >
                                {diffList.map((diff:string[], key:number) => 
                                    <MenuItem value={diff} key={key} id={diff[1]}>{diff[1]}</MenuItem>
                                )}
                            </Select>
                            <FormHelperText error>{submitted && rating === '' ? 'Please select a difficulty rating.' : ''}</FormHelperText>
                        </FormControl>

                        {/* min and max age */}
                        <TextField
                            fullWidth
                            label="Min-Age"
                            value={minAge}
                            type="number"
                            onChange={(event:any) => setMinAge(event.target.value)}
                            error={minAge === '' && submitted}
                            helperText={submitted && minAge === '' ? 'Please enter a min age' : ''}
                        />
                        <TextField
                            fullWidth
                            label="Max-Age"
                            value={maxAge}
                            type="number"
                            onChange={(event:any) => setMaxAge(event.target.value)}
                            error={maxAge === '' && submitted}
                            helperText={submitted && maxAge === '' ? 'Please enter a min age' : ''}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: 'inherit'
                        }}
                    >
                        <Button onClick={()=>setOpen(false)} variant="contained" fullWidth>Cancel</Button>
                        <Button onClick={submitPost} variant="contained" fullWidth id='postButton'>Post</Button>
                    </div>
                </div>}

                {/* List of posts */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        width: '100%',
                        maxWidth: '1300px'
                    }}
                >
                    {posts.map((post:any, key:number) =>
                        <PartnerFinderPost
                            key={key}
                            author={post.parent[0].fields.author}
                            content={post.parent[0].fields.content}
                            datePosted={post.parent[0].fields.created_at}
                            locationName={post.parent[0].fields.location}
                            postid={post.parent[0].pk}
                            maxAge={post.parent[0].fields.max_age}
                            minAge={post.parent[0].fields.min_age}
                            skillLevel={post.parent[0].fields.skill_level.replace('[', '').replace(']','').replaceAll('\'', '').replace(' ', '').split(',')}
                            replies={post.replies}
                            fetchPosts={() => render(!renderCondition)}
                        />
                    )}
                </div>
                </>}
            </div>

            {/* add post button */}
            {username !== '' &&
            <Fab 
                color="primary"
                onClick={() => setOpen(true)}
                id='fab'
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    top: 'auto',
                    left: 'auto'
                }}
            >
                <AddIcon />
            </Fab>}
        </>
    );
};
