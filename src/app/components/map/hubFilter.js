import React from 'react';

const HubFilter = props => (
  <div>
    <div>
      <label>Hub</label>
    </div>
    <select
      className="map-select"
      onChange={e => props.selectItem({ selectedHub: e.target.value })}
    >
      <option default value="">
        All
      </option>
      {props.data.map(hub => (
        <option key={hub} value={hub}>
          {hub}
        </option>
      ))}
    </select>
  </div>
);

export default HubFilter;
