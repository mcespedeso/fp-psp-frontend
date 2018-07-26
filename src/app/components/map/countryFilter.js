import React from 'react';

const CountryFilter = props => (
  <div>
    <div>
      <label>Country</label>
    </div>
    <select
      className="map-select"
      onChange={e => props.selectItem({ selectedCountry: e.target.value })}
    >
      <option selected="selected" value="">
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

export default CountryFilter;
