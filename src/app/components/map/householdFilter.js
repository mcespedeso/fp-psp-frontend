import React from 'react';

const HouseholdFilter = props => (
  <div>
    <div>
      <label>Household</label>
    </div>
    <select
      className="map-select"
      onChange={e => props.selectHousehold(e.target.value)}
    >
      <option value="">All</option>
      {props.households.map(household => (
        <option key={household} value={household}>
          {household}
        </option>
      ))}
    </select>
  </div>
);

export default HouseholdFilter;
