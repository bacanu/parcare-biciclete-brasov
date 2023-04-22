/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Status, Wrapper } from "@googlemaps/react-wrapper";
import React, { useEffect, useRef, ReactElement, useState } from "react";
import ReactDOM from "react-dom";
import './Map.css'
import { MarkerWithLabel } from "@googlemaps/markerwithlabel";



const render = (status: Status): ReactElement => {
  if (status === Status.LOADING) return <h3>{status} ..</h3>;
  if (status === Status.FAILURE) return <h3>{status} ...</h3>;
  return <></>;
};

function MyMapComponent({
  center,
  zoom,
  spots,
  userPosition,
}) {
  const ref = useRef<any>();
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any>([]);
  const [userPos, setUserPos] = useState<any>(null);

  useEffect(() => {
    if (!ref.current) {
      return
    }

    let m = new window.google.maps.Map(ref.current, {
      center,
      zoom,
      zoomControl: false,
      mapTypeControl: false,
      // scaleControl: boolean,
      streetViewControl: false,
      // rotateControl: boolean,
      fullscreenControl: false
    });

    setMap(m)
  }, [ref.current]);

  useEffect(() => {
    if (!map) {
      return
    }

    markers.forEach((m) => {
      m.setMap(null)
    })

    let newMarkers = spots.map((spot) => {
      let [lat, lng] = spot.latLng
      let m = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: spot.desc,
        label: spot.label,
      });

      const infowindow = new google.maps.InfoWindow({
        content: spot.desc,
        ariaLabel: spot.name,
      });

      m.addListener("click", () => {
        infowindow.open({
          anchor: m,
          map,
        });
      });

      return m;
    })

    setMarkers(newMarkers)

  }, [spots, map])

  useEffect(() => {
    if (!userPosition) {
      return
    }

    if (!map) {
      return
    }

    if (userPos) {
      userPos.map = null
    }


    let [lat, lng] = userPosition;

    const svgMarker = {
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      fillColor: "red",
      fillOpacity: 1,
      // strokeColor: "black",
      strokeWeight: 0,
      rotation: 0,
      scale: 7,
    };


    // let m = new google.maps.Marker({
    //   position: {lat, lng},
    //   map,
    // });


    let user = new MarkerWithLabel({
      position: { lat, lng },
      clickable: true,
      draggable: false,
      icon: svgMarker,
      title: "Aici ești tu",
      map: map,
      labelContent: "Aici ești tu", // can also be HTMLElement
      labelAnchor: new google.maps.Point(-28, -43),
      labelClass: "user-position", // the CSS class for the label
    })

    var bounds = new google.maps.LatLngBounds();

    bounds.extend({ lat, lng });

    spots.forEach((spot) => {
      let [lat, lng] = spot.latLng;
      bounds.extend({ lat, lng });
    })

    map.fitBounds(bounds);

    return () => {
      user.setMap(null)
    }

  }, [userPosition, map])

  return <div ref={ref} id="map" />;
}

function Map({
  center,
  zoom,
  spots,
  userPosition
}) {


  return (
    <Wrapper apiKey="AIzaSyARQYxbNAMymxj7HkZqv1E8YolYGtTd5KU" render={render}>
      <MyMapComponent center={center} zoom={zoom} spots={spots} userPosition={userPosition} />
    </Wrapper>
  );
}

export default Map