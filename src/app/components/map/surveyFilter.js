import React from 'react';

const camelCasetoWords = str =>
  str
    .replace(/([A-Z])/g, match => ` ${match}`)
    .toLowerCase()
    .replace(/^./, match => match.toUpperCase());

const SurveyFilter = props => (
  <div>
    <label>Survey</label>
    <select
      className="map-select"
      onChange={e => props.selectSurvey(e.target.value)}
    >
      {props.surveys.map(item => <option key={item}>{item}</option>)}
    </select>
    <input
      type="text"
      placeholder="Search indicators"
      onChange={e => props.searchIndicators(e.target.value)}
      className="map-search"
    />
    <div className="map-indicators">
      {props.indicators
        .filter(item =>
          item.toLowerCase().includes(props.searchIndicatorsQuery.toLowerCase())
        )
        .map(item => (
          <div
            onClick={() => props.selectIndicator(item)}
            key={item}
            className={`map-indicator ${
              props.selectedIndicator === item ? 'active' : ''
            }`}
          >
            {camelCasetoWords(item)}
          </div>
        ))}
    </div>
  </div>
);

export default SurveyFilter;
