import React from 'react';
import { Gmaps, Marker } from 'react-gmaps';
import env from '../env';

const params = { v: '3.exp', key: env.GOOGLEKEY };

class Gmap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: {
        lat: 51.5258541,
        lng: -0.08040660000006028
      },
      point: {
        lat: 51.5258541,
        lng: -0.08040660000006028
      },
      title: props.schema.title,
      required: props.required ? '*' : '',
      zoom: 12
    };

    if (props.formData && props.formData !== undefined) {
      this.state.point = {
        lat: props.formData.split(',')[0],
        lng: props.formData.split(',')[1]
      };
      this.state.center = {
        lat: props.formData.split(',')[0],
        lng: props.formData.split(',')[1]
      };
    } else {
      this.state.point = this.state.center;
      setImmediate(() =>
        this.props.onChange(`${this.state.point.lat},${this.state.point.lng}`)
      );
    }
  }

  onMapCreated(map) {
    map.setOptions({
      disableDefaultUI: false
    });
  }

  onClick() {
    var component = this;
    return function returnFunc(e) {
      component.setState({
        point: {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        },
        zoom: this.zoom,
        center: {
          lat: this.center.lat(),
          lng: this.center.lng()
        }
      });

      setImmediate(() =>
        component.props.onChange(
          `${component.state.point.lat},${component.state.point.lng}`
        )
      );
    };
  }

  render() {
    return (
      <div className="row">
        <div className="gmap col-sm-8 col-md-offset-2">
          <label className="control-label gmap-label">
            {this.state.title} {this.state.required}
          </label>
          <Gmaps
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            lat={this.state.center.lat}
            lng={this.state.center.lng}
            zoom={this.state.zoom}
            loadingMessage="Loading..."
            params={params}
            onMapCreated={this.onMapCreated}
            onClick={this.onClick()}
          >
            <Marker
              lat={this.state.point.lat}
              lng={this.state.point.lng}
              draggable
            />
          </Gmaps>
        </div>
      </div>
    );
  }
}

export default Gmap;
