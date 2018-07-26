import React from 'react';

const OrganizationFilter = props => (
  <div>
    <div>
      <label>Organization</label>
    </div>
    <select onChange={e => props.selectOrganization(e.target.value)}>
      <option value="">All</option>
      {props.organizations.map(organization => (
        <option key={organization} value={organization}>
          {organization}
        </option>
      ))}
    </select>
  </div>
);

export default OrganizationFilter;
