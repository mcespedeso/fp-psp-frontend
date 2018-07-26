import React, { Component } from 'react';

import env from '../../env';
import Map from './mapComponent';
import ColorPicker from './colorPicker';
import HouseholdFilter from './householdFilter';
import SurveyFilter from './surveyFilter';

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSurvey: '',
      indicators: [],
      selectedIndicator: '',
      searchIndicatorsQuery: '',
      snapshotData: [],
      markers: [],
      selectedColors: ['RED', 'YELLOW', 'GREEN']
    };
    this.toggleSelectedColors = this.toggleSelectedColors.bind(this);
    this.selectSurvey = this.selectSurvey.bind(this);
    this.searchIndicators = this.searchIndicators.bind(this);
    this.selectIndicator = this.selectIndicator.bind(this);
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
    this.setState({
      selectedIndicator: indicator,
      markers: this.getMarkers(this.state.snapshotData, indicator)
    });
  }
  getMarkers(data, indicator) {
    return data.map(item => ({
      coordinates: item.economic_survey_data.familyUbication,
      color: item.indicator_survey_data[indicator]
    }));
  }
  searchIndicators(query) {
    this.setState({ searchIndicatorsQuery: query });
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
    }).then(response =>
      response.json().then(res =>
        this.setState({
          snapshotData: res,
          markers: this.getMarkers(res, this.state.selectedIndicator)
        })
      )
    );
  }
  toggleSelectedColors(color) {
    if (this.state.selectedColors.includes(color)) {
      this.setState({
        selectedColors: this.state.selectedColors.filter(item => item !== color)
      });
    } else {
      this.setState({
        selectedColors: [...this.state.selectedColors, color]
      });
    }
  }
  render() {
    const { surveyData } = this.props;
    const {
      indicators,
      selectedIndicator,
      searchIndicatorsQuery,
      selectedColors,
      markers
    } = this.state;
    return (
      <div className="map-container">
        <ColorPicker
          toggleSelectedColors={this.toggleSelectedColors}
          selectedColors={selectedColors}
        />
        <HouseholdFilter />
        <div className="map-sidebar col-md-3">
          <SurveyFilter
            surveyData={surveyData}
            selectSurvey={this.selectSurvey}
            searchIndicators={this.searchIndicators}
            searchIndicatorsQuery={searchIndicatorsQuery}
            indicators={indicators}
            selectIndicator={this.selectIndicator}
            selectedIndicator={selectedIndicator}
          />
        </div>
        <div className="map col-md-9">
          <Map
            selectedColors={selectedColors}
            markers={markers}
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

export default MapContainer;
