import { useEffect, useState } from 'react'
import './App.css'
import Map from './Map'
import React from 'react'

let requestGeolocation = (callbackFn) => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      callbackFn([position.coords.latitude, position.coords.longitude])
    })

    const watchId = navigator.geolocation.watchPosition((position) => {
      callbackFn([position.coords.latitude, position.coords.longitude])
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    }
  } else {
    return () => {
      console.log("Can't unwatch because geolocation was not granted")
    }
  }
}

function App() {

  const [count, setCount] = useState(0)

  const [wantsGeolocation, setWantsGeolocation] = useState(false);
  const [userPosition, setUserPosition] = useState<any>(null)

  useEffect(() => {
    let cancelWatchFn = () => { }

    if (wantsGeolocation) {
      cancelWatchFn = requestGeolocation((position) => {
        setUserPosition(position);
      })
    } else {
      cancelWatchFn()
      setUserPosition(null)
    }

    return () => {
      cancelWatchFn()
      setUserPosition(null)
    }

  }, [wantsGeolocation])

  const center = { lat: 45.652506, lng: 25.610841 };
  const zoom = 13;
  let spots = [
    { name: "Mall Coresi", desc: "", latLng: [45.67206293963791, 25.617934814676513] },
  ]

  let getDistanceToUser = (spotLatLng) => {
    if (!userPosition) {
      return null
    }


    let userLatLng = { lat: userPosition[0], lng: userPosition[1] }

    var lat = [userLatLng.lat, spotLatLng.lat]
    var lng = [userLatLng.lng, spotLatLng.lng]
    var R = 6378137;
    var dLat = (lat[1] - lat[0]) * Math.PI / 180;
    var dLng = (lng[1] - lng[0]) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat[0] * Math.PI / 180) * Math.cos(lat[1] * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return Math.round(d);
  }

  let spotsWithDistance = spots.map(spot => {
    return {
      spot: spot,
      distance: getDistanceToUser({ lat: spot.latLng[0], lng: spot.latLng[1] })
    }
  }).sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))

  return (
    <>
      <Map center={center} zoom={zoom} spots={spots} userPosition={userPosition} />
      <div className='gps'>
        <button onClick={() => { setWantsGeolocation(true) }} >Unde sunt eu?</button>
      </div>
      <div className='spot-list'>
        {spotsWithDistance.map((s) => <div key={s.spot.latLng[0] + "-" + s.spot.latLng[0] }>
          <div className="title">{s.spot.name} {s.distance ? `(${s.distance}m)`: ""}</div>
          <div className="desc">{s.spot.desc}</div>
           
        </div>)}
      </div>
    </>
  )
}

export default App
