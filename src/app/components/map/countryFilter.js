import React from 'react';

const CountryFilter = props => (
  <div>
    <div>
      <label>Country</label>
    </div>
    <select onChange={e => props.selectCountry(e.target.value)}>
      <option value="">All</option>
      {props.countries.map(country => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  </div>
);

export default CountryFilter;
