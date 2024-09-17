'use client'

import { useState, useEffect, useRef } from 'react'
import GoogleMapReact from 'google-map-react';
import marker from "/public/person_marker.svg"
import Image from 'next/image';
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useRouter } from 'next/router';

// api key scrubbed for public repository
const api_key = ""

interface mapProps {
  locations: any[];  // locations to render
  restaurants?: any[];  // resturants to render
  lodges?: any[];  // lodging to render
  height: string; 
  width: string; 
  margin?: string;
  maxWidth?: string;
  maxHeight?: string;
  border?: string;
  showUser?: boolean;  // show current location if location is enabled
  draglat?: number;  // lat of draggable pin
  draglng?: number;  // lng of draggable pin
  handleDragPos?: (dragpos:any) => any;  // callback to share lat and lng of draggable pin
  
  // default center point of map
  defCenterLat?: number;
  defCenterLng?: number;
}

// user icon component
// have to make seperate component because the map library is weird with TSX
function UserLocation(props:{lat:number, lng:number}) {
  return (
    <Image
      height={25} 
      width={25} 
      style={{transform: 'translate(-50%, -100%)'}}
      priority
      src={marker}
      alt="User Marker"
    />
  );
}

export default function Map({locations, restaurants = [], lodges = [], height, width, margin, maxWidth, maxHeight, 
                             border, showUser, draglat = 0, draglng = 0, handleDragPos, 
                             defCenterLat = 33.989759689975344, defCenterLng = -81.02921928769354}: mapProps) {
  const [lat, setLat] = useState(0);  // user lat
  const [long, setLong] = useState(0);  // user lng
  // google maps api is for pure js, so we need to keep refernces to the maps and map object
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [maps, setMaps] = useState<any>(null);

  const markerRef = useRef<any>(null);  // dragable marker
  const markers = useRef<any[]>([]);  // all currently rendered markers, keep refernces for deleting
  const router = useRouter();

  // get geolocaiton of user
  useEffect(() => {
    if (showUser && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }
    
    function success(position:any) {
      setLat(position.coords.latitude);
      setLong(position.coords.longitude);
    }
    
    function error() {
      console.log("Unable to retrieve your location");
    }
  }, [showUser])

  // set location of draggable marker
  useEffect(() => {
    if (markerRef.current)
      markerRef.current.setPosition(new google.maps.LatLng( draglat, draglng ));
  }, [draglat, draglng])

  // useEffect dealing with all map rendering
  useEffect(() => {
    const setDragMarker = () => {
      if (markerRef.current)
        markerRef.current.setMap(null);

      if (map === null || maps === null)
        return;

      if (handleDragPos === undefined)
        return

      const marker = new maps.Marker({
        position: {lat: draglat, lng: draglng},
        map,
        draggable:true,
        icon: "/marker_img.png",
      });
      marker.addListener('dragend', (e:any) => {
        const position = marker.position as google.maps.LatLng;
        handleDragPos({lat: position.lat(), lng: position.lng()});
      });
      markerRef.current = marker;
    }

    // created clusters of lodging and resutants if there are too many
    const createClusters = async(locations:any[], isFood:boolean) => {
      const icon = {
        url: isFood ? "/food-marker.png" : "/lodge-marker.png",
        scaledSize: new google.maps.Size(75, 75), // scaled size
      };
    
      let markers = locations && locations.map((location) => {
        let position = {lat: location.lat, lng: location.lng}
        let contentString =
          '<div id="content">' +
          "</div>" +
          `<h3 id="firstHeading" class="firstHeading">${location.name}</h1>` +
          `<h3 id="firstHeading" class="firstHeading">${location.vicinity}</h1>`
          "</div>";

        let infowindow = new google.maps.InfoWindow({
          content: contentString,
        });
        let marker = new maps.Marker({
          position: position,
          map,
          icon: icon,
        });

        marker.addListener('mouseover', () => {
          infowindow.open({
            anchor: marker,
            map,
          });
        });
        marker.addListener('mouseout', () => {
          infowindow.close();
        });
        // go to google maps page to resturant/lodge
        marker.addListener('click', async() => window.open(`https://maps.google.com/maps?q=${location.name.replace('&', '')}&sll=${location.lat},${location.lng}`));

        return marker;
      })
      new MarkerClusterer({map, markers})
    }

    // render climbing locations
    const renderLocations = () => {
      // remove all existing markers
      for (let i = 0; i < markers.current.length; i++)
        markers.current[i].setMap(null);
      markers.current = []

      for (const location of locations) {
        let position = {lat: Number(location.latitude), lng: Number(location.longitude)};
        let contentString =
          '<div id="content">' +
          "</div>" +
          `<h3 id="firstHeading" class="firstHeading">${location.name}</h1>`
          "</div>";

        let infowindow = new google.maps.InfoWindow({
          content: contentString,
        });
        let marker = new maps.Marker({
          position: position,
          map,
          icon: "/marker_img.png",
        });

        marker.addListener('mouseover', () => {
          infowindow.open({
            anchor: marker,
            map,
          });
        });
        marker.addListener('mouseout', () => {
          infowindow.close();
        });
        marker.addListener('click', async() => await router.push("/locations/" + location.name.replaceAll(' ', '+')));
        markers.current.push(marker);
      }
    }

    if (handleDragPos)
      setDragMarker();
    if (maps && map) {
      if (locations.length > 0)
        renderLocations();
      if (restaurants.length > 0)
        createClusters(restaurants, true);
      if (lodges.length > 0)
        createClusters(lodges, false);
    }  
  }, [map, maps, restaurants, lodges, locations])

  // callback to actually get refernces of map and maps obj from google maps API
  const handleApiLoaded = (map:any, maps:any) => {
    setMap(map);
    setMaps(maps);
  };

  const defaultProps = {
    center: {
      lat: defCenterLat,
      lng: defCenterLng
    },
    zoom: 4
  };

  const defaultMapOptions = {
    fullscreenControl: false,
    gestureHandling: "greedy",
    zoomControl : false,
    restriction: {
      latLngBounds: {
        north: 85,
        south: -85, 
        east: 180,
        west: -180,
      },
      strictBounds: false,
    },
  };

  return (
    <div 
      style={{ 
        height: height, 
        width: width, 
        margin: margin, 
        maxHeight: maxHeight, 
        maxWidth: maxWidth,
        border: border
      }}
    >
      <GoogleMapReact
        bootstrapURLKeys={{ key: api_key }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        options={defaultMapOptions}
        onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
        yesIWantToUseGoogleMapApiInternals={handleDragPos !== undefined}
      >
        {showUser && lat != 0 && long != 0 &&
        <UserLocation
          lat={lat}
          lng={long}
        />}
      </GoogleMapReact>
    </div>
  );
}