'use client';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect, Suspense } from 'react';
import MarkerDialog from './markerDialog';
import { Post } from '@/types/Post';

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface Props {
  data: Post[];
}

function severityColor(severity: string) {
  switch (severity) {
    case 'high':
      return 'border-red-500';  
    case 'medium': 
      return 'border-yellow-500';
    case 'low':
      return 'border-green-500';
    default:
      return 'border-gray-500';  
  }
}

const MapBox = ({data}: Props) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [userloc, setUserLoc] = useState<[number, number]>([ -73.8203, 40.7367 ]);
  const [currInfo, setCurrInfo] = useState<Post | null>(null);
  const [viewState, setViewState] = useState({
    longitude: userloc[0],
    latitude: userloc[1],
    zoom: 13
  });
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
      enableHighAccuracy: true
    });

    function successLocation(position: GeolocationPosition) {
      const newLoc: [number, number] = [position.coords.longitude, position.coords.latitude];
      console.log('User location found:', newLoc);
      setUserLoc(newLoc);
    }

    function errorLocation() {
      console.log('Location error');
      setUserLoc([-73.8203, 40.7367]);    }

  }, []);

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      longitude: userloc[0],
      latitude: userloc[1]
    }));
  }, [userloc]);

  return (
    <>
      <div className="w-full h-full overflow-hidden rounded-lg">
        <Map
          {...viewState}
          mapboxAccessToken={token}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          onMove={(evt) => {setViewState(evt.viewState)}}
        >
          {data
            .filter((oost) => oost.latitude !== null && oost.longitude !== null)
            .map((oost) => (
              <Marker
                key={oost.id} 
                longitude={oost.longitude!}
                latitude={oost.latitude!}
                anchor="bottom"
                onClick={() => {
                  setOpenDialog(true);
                  setCurrInfo(oost);
                }}
              >
                  <img
                    src={oost.image_url && oost.image_url.trim() !== '' ? oost.image_url : "/placeholder.svg?height=75&width=75"}
                    alt="marker"
                    width={75}
                    height={75}
                    className={
                      `transform translate-x-0 marker-image w-8 h-8 cursor-pointer border-2 ${oost.severity ? severityColor(oost.severity) : 'border-gray-500'} rounded-full object-cover active:scale-105 hover:border-white active:border-white`
                    }
                  />
              </Marker>
            ))}

            {/* User Location Marker */}
            <Marker longitude={userloc[0]} latitude={userloc[1]} anchor="center">
                <div className="relative">
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                  <div className="absolute w-12 h-12 bg-blue-500/30 rounded-full -top-3 -left-3 animate-ping" />
                </div>
            </Marker>
          
        </Map>
      </div>

      {/* Dialog for displaying marker info */}
      {currInfo && (
        <MarkerDialog 
          issue={currInfo} 
          openDialog={openDialog} 
          setOpenDialog={setOpenDialog} 
        />
      )}
    </>
  );
};

export default MapBox;
