import { getSurroundingData } from '@/app/private/actions';
import MapBox from './mapbox'; 

export default async function MapBoxWrapper() {
  const data = await getSurroundingData(); 

  return <MapBox data={data} />;
}
