'use client';
import Map, {Marker} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useState, useEffect} from 'react'
import MarkerDialog from './markerDialog';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type info = {
  title: string,
  lat: number, 
  long: number,
  img: string
}

const MapBox = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [userloc, setUserLoc] = useState<[Number, number]>([73.8203, 40.7367]);
  //const [currInfo, setCurrInfo] = useState<info | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
      enableHighAccuracy: true
    });

    function successLocation(position: GeolocationPosition) {
      const newLoc: [number, number] = [
        position.coords.longitude,
        position.coords.latitude
      ];
      console.log("User location found:", newLoc);
      setUserLoc(newLoc);
    }

    function errorLocation() {
      console.log("Error getting location, using default.");
      setUserLoc([73.8203, 40.7367]);
    }
  }, []); 

  const mock: info = {
    title: 'This is a test image',
    lat: -73.924608,
    long: 40.638874,
    img: 'https://plus.unsplash.com/premium_photo-1732721750556-f5aef2460dfd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  };
  

  return (
    <>
      <Map
        mapboxAccessToken={token}
        initialViewState={{
          longitude: -73.924608,
          latitude: 40.638874,
          zoom: 13
        }}
        style={{ width: "400px", height: "400px" }} 
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <Marker 
          longitude={-73.924608} 
          latitude={40.638874} 
          anchor="bottom"
          onClick={() => setOpenDialog(true)}
        >
          <img 
            src="https://plus.unsplash.com/premium_photo-1732721750556-f5aef2460dfd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            alt="marker" 
            width={75} 
            height={75}
            className='border-5 rounded-xl' 
          />
        </Marker>
      </Map>
      <MarkerDialog
        issue={mock}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
      />
    </>
  );
};

export default MapBox;