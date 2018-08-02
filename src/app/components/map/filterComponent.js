import React from 'react';

const Filter = props => (
  <div>
    <div>
      <label>{props.label}</label>
    </div>
    <select
      className="map-select"
      onChange={e => props.selectItem({ [props.itemToSelect]: e.target.value })}
    >
      <option default value="">
        All
      </option>
      {props.data.map(country => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  </div>
);

export default Filter;
