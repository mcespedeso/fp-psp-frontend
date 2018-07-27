import React from 'react';

const OrganizationFilter = props => (
  <div>
    <div>
      <label>Organization</label>
    </div>
    <select
      className="map-select"
      onChange={e => props.selectItem({ selectedOrganization: e.target.value })}
    >
      <option default value="">
        All
      </option>
      {props.data.map(organization => (
        <option key={organization} value={organization}>
          {organization}
        </option>
      ))}
    </select>
  </div>
);

export default OrganizationFilter;
