import React from 'react';

const HouseholdFilter = props => (
  <div>
    <div>
      <label>Household</label>
    </div>
    <select
      className="map-select"
      onChange={e => props.selectItem({ selectedHousehold: e.target.value })}
    >
      <option selected="selected" value="">
        All
      </option>
      {props.data.map(household => (
        <option key={household} value={household}>
          {household}
        </option>
      ))}
    </select>
  </div>
);

export default HouseholdFilter;
