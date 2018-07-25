import React, { Component } from 'react';

import env from '../../env';
import Map from './mapComponent';

class MapWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSurvey: '',
      indicators: [],
      selectedIndicator: '',
      searchIndicators: ''
    };
  }

  componentWillMount() {
    this.selectDefaultSurvey();
  }
  componentDidMount() {
    this.updateIndicators(this.state.selectedSurvey);
    this.getData(this.state.selectedSurvey);
  }

  selectDefaultSurvey() {
    this.setState({
      selectedSurvey: this.props.surveyData
        ? this.props.surveyData[0].title
        : ''
    });
  }
  updateIndicators(survey) {
    const indicators = this.props.surveyData
      ? this.props.surveyData.filter(item => item.title === survey)[0]
          .survey_ui_schema['ui:group:indicators']
      : [];
    this.setState({
      indicators,
      selectedIndicator: indicators[0]
    });
  }

  selectSurvey(survey) {
    this.setState({ selectedSurvey: survey });
    this.updateIndicators(survey);

    this.getData(survey);
  }
  selectIndicator(indicator) {
    this.setState({ selectedIndicator: indicator });
  }

  searchIndicators(query) {
    this.setState({ searchIndicators: query });
  }
  camelCasetoWords(str) {
    return str
      .replace(/([A-Z])/g, match => ` ${match}`)
      .toLowerCase()
      .replace(/^./, match => match.toUpperCase());
  }

  getData(survey) {
    const id = this.props.surveyData
      ? this.props.surveyData.filter(item => item.title === survey)[0].id
      : null;

    fetch(`${env.API}/snapshots/?survey_id=${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.props.token}`
      }
    }).then(response => response.json().then(res => console.log(res)));
  }
  render() {
    console.log(this.state);
    const { surveyData } = this.props;
    const { indicators, searchIndicators } = this.state;
    return (
      <div className="map-container">
        <div className="map-sidebar col-md-3">
          <label>Survey</label>
          <select
            className="map-survey-select"
            onChange={e => this.selectSurvey(e.target.value)}
          >
            {(surveyData || []).map(item => (
              <option
                key={item.id}
                onClick={() => this.selectSurvey(item.title)}
              >
                {item.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search indicators"
            onChange={e => this.searchIndicators(e.target.value)}
            className="map-search"
          />
          <div className="map-indicators">
            {indicators
              .filter(item =>
                item.toLowerCase().includes(searchIndicators.toLowerCase())
              )
              .map(item => (
                <div
                  onClick={() => this.selectIndicator(item)}
                  key={item}
                  className={`map-indicator ${
                    this.state.selectedIndicator === item ? 'active' : ''
                  }`}
                >
                  {this.camelCasetoWords(item)}
                </div>
              ))}
          </div>
        </div>
        <div className="map col-md-9">
          <Map
            isMarkerShown
            googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${
              env.GOOGLEKEY
            }&v=3.exp&libraries=geometry,drawing,places`}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={
              <div style={{ height: `600px`, width: `100%` }} />
            }
            mapElement={<div style={{ height: `100%` }} />}
          />
        </div>
      </div>
    );
  }
}

export default MapWrapper;
