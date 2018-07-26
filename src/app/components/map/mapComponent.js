import React from 'react';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from 'react-google-maps';

import red from '../../../static/images/red-dot.svg';
import green from '../../../static/images/green-dot.svg';
import yellow from '../../../static/images/yellow-dot.svg';

const selectColor = color => {
  switch (color) {
    case 'GREEN':
      return green;
    case 'YELLOW':
      return yellow;
    case 'RED':
      return red;
    default:
      return '';
  }
};

const Map = withScriptjs(
  withGoogleMap(props => (
    <div>
      <GoogleMap defaultZoom={3} defaultCenter={{ lat: 20, lng: -15 }}>
        {props.isMarkerShown && (
          <div>
            {props.markers
              .filter(
                marker =>
                  marker.coordinates &&
                  props.selectedColors.includes(marker.color)
              )
              .filter(
                marker =>
                  props.selectedHousehold.length
                    ? marker.household === props.selectedHousehold
                    : marker
              )
              .map(marker => (
                <Marker
                  key={Math.random(1000)}
                  icon={selectColor(marker.color)}
                  position={{
                    lat: Number(marker.coordinates.split(',')[0]),
                    lng: Number(marker.coordinates.split(',')[1])
                  }}
                />
              ))}
          </div>
        )}
      </GoogleMap>
    </div>
  ))
);

export default Map;
