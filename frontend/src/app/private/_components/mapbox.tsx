'use client';
import Map, { Marker, Layer, Source, LayerProps } from 'react-map-gl/mapbox';
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

// 3D Building Layer Style
const buildingLayer: LayerProps = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 15,
  paint: {
    'fill-extrusion-color': '#aaa',
    'fill-extrusion-height': [
      'interpolate', ['linear'], ['zoom'],
      15, 0,
      15.05, ['get', 'height']
    ],
    'fill-extrusion-base': [
      'interpolate', ['linear'], ['zoom'],
      15, 0,
      15.05, ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.6
  }
};

const MapBox = ({data}: Props) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [userloc, setUserLoc] = useState<[number, number]>([ -73.8203, 40.7367 ]);
  const [currInfo, setCurrInfo] = useState<Post | null>(null);
  const [viewState, setViewState] = useState({
    longitude: userloc[0],
    latitude: userloc[1],
    zoom: 13,
    pitch: 45,
    bearing: 0
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
      setUserLoc([-73.8203, 40.7367]);
    }

  }, []);

  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      longitude: userloc[0],
      latitude: userloc[1]
    }));
  }, [userloc]);

  // Helper to toggle 3D view
  const toggle3DView = () => {
    setViewState(prev => ({
      ...prev,
      pitch: prev.pitch > 0 ? 0 : 45
    }));
  };

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
          {/* 3D building layer */}
          <Layer {...buildingLayer} />
          
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

      {/* Toggle 3D view button */}
      <button 
        onClick={toggle3DView}
        className="absolute bottom-2 right-2 bg-white/80 dark:bg-black/60 backdrop-blur-sm text-xs p-2 rounded-full hover:bg-white/100 dark:hover:bg-black/80 transition-colors"
      >
        {viewState.pitch > 0 ? '2D' : '3D'}
      </button>

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
