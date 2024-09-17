import BasicSearchBar from "./BasicSearchBar";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { axios_instance } from "@/axios";
import LocationEntry from "./LocationEntry";

// wraper of basicSearchBar specifically for searching locaitons

export function LocationSearchBar() {
  const [value, setValue] = useState('');
  const [locations, setLocations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // the search is specified in the url, so parse the url for the search
    const getLocations = async() => {
      let data:any = [];
      try {
        const response = await axios_instance.get('api/search/?keyword=' + value);
        for (const elem of response.data) {
          let loc = elem.fields;
          loc.name = elem.pk;
          data.push(loc);
        }

        let mappedData:any = data.map((location:any, index:number)=>
          <LocationEntry 
            name={location.name} 
            state={location.state}
            bottom={index === data.length - 1} 
            key={index}
            moreInfo={true}
            onClick={async() => await router.push("/home?keyword="+location.name)}  // update url to make search
          />
        );
        setLocations(mappedData);
      } catch (error) {
        console.error(error)
      }
    }  

    if (value !== '')
      getLocations();
    else 
      setLocations([]);
  }, [router.asPath, router, value]);

  const handleSubmit = async() => {
    if (value !== '')
      await router.push("/home?keyword=" + value); // update url to make search
  }

  const handleEnter = (event:any) => {
    // 13 is key code for enter
    if (event.keyCode === 13)
      handleSubmit();
  }

  return (
    <BasicSearchBar 
      value={value} 
      locations={locations} 
      handleChange={(event:any) => setValue(event.target.value)} 
      handleSubmit={handleSubmit} 
      handleEnter={handleEnter}
      showAllButton={true}
      resultLimit={10}
      placeholder="Search Climbing Destinations"
      borderRadius="20px"
      margin="0 0 0 30px"
    />
  );
}