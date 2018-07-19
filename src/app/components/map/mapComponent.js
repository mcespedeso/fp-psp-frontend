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

const Map = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      defaultZoom={7}
      defaultCenter={{ lat: -23.442503, lng: -58.443832 }}
      options={{
        maxZoom: 10
      }}
    >
      {props.isMarkerShown && (
        <div>
          <Marker
            icon={green}
            position={{ lat: -23.442503, lng: -58.443832 }}
          />
          <Marker icon={red} position={{ lat: -22.442503, lng: -59.443832 }} />
          <Marker
            icon={yellow}
            position={{ lat: -21.442503, lng: -58.443832 }}
          />
        </div>
      )}
    </GoogleMap>
  ))
);

export default Map;
