import React from 'react';

const HubFilter = props => (
  <div>
    <div>
      <label>Hub</label>
    </div>
    <select onChange={e => props.selectHub(e.target.value)}>
      <option value="">All</option>
      {props.hubs.map(hub => (
        <option key={hub} value={hub}>
          {hub}
        </option>
      ))}
    </select>
  </div>
);

export default HubFilter;
