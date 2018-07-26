import React, { Component } from 'react';

import env from '../../env';
import Map from './mapComponent';
import ColorPicker from './colorPicker';
import HouseholdFilter from './householdFilter';
import SurveyFilter from './surveyFilter';
import OrganizationFilter from './organizationFilter';
import HubFilter from './hubFilter';
import CountryFilter from './countryFilter';

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
      selectedColors: ['RED', 'YELLOW', 'GREEN'],
      selectedHousehold: '',
      selectedOrganization: '',
      selectedHub: '',
      selectedCountry: ''
    };
    this.toggleSelectedColors = this.toggleSelectedColors.bind(this);
    this.selectSurvey = this.selectSurvey.bind(this);
    this.searchIndicators = this.searchIndicators.bind(this);
    this.selectIndicator = this.selectIndicator.bind(this);
    this.selectHousehold = this.selectHousehold.bind(this);
    this.selectOrganization = this.selectOrganization.bind(this);
    this.selectHub = this.selectHub.bind(this);
    this.selectCountry = this.selectCountry.bind(this);
  }

  componentWillMount() {
    this.selectDefaultSurvey();
  }
  componentDidMount() {
    this.getIndicators(this.state.selectedSurvey);
    this.getData(this.state.selectedSurvey);
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

  getSurveys(data) {
    return data.map(survey => survey.title);
  }

  selectDefaultSurvey() {
    this.setState({
      selectedSurvey: this.props.surveyData
        ? this.props.surveyData[0].title
        : ''
    });
  }

  selectSurvey(survey) {
    this.setState({
      selectedSurvey: survey,
      selectedHousehold: '',
      selectedOrganization: '',
      selectedHub: '',
      selectedCountry: ''
    });
    this.getIndicators(survey);
    this.getData(survey);
  }

  getIndicators(survey) {
    const indicators = this.props.surveyData
      ? this.props.surveyData.filter(item => item.title === survey)[0]
          .survey_ui_schema['ui:group:indicators']
      : [];
    this.setState({
      indicators,
      selectedIndicator: indicators[0]
    });
  }

  selectIndicator(indicator) {
    this.setState({
      selectedIndicator: indicator,
      markers: this.getMarkers(this.state.snapshotData, indicator)
    });
  }

  searchIndicators(query) {
    this.setState({ searchIndicatorsQuery: query });
  }

  getHouseholds(data) {
    return data.map(household => household.family.name);
  }

  selectHousehold(household) {
    this.setState({ selectedHousehold: household });
  }

  getOrganizations(data) {
    return data
      .map(organization => organization.family.organization.name)
      .filter((organization, i, self) => self.indexOf(organization) === i);
  }

  selectOrganization(organization) {
    this.setState({ selectedOrganization: organization });
  }

  getHubs(data) {
    return data
      .map(hub => hub.family.organization.application.name)
      .filter((hub, i, self) => self.indexOf(hub) === i);
  }

  selectHub(hub) {
    this.setState({ selectedHub: hub });
  }

  getCountries(data) {
    return data
      .map(country => (country.family.organization.country || {}).country)
      .filter((country, i, self) => country && self.indexOf(country) === i);
  }

  selectCountry(country) {
    this.setState({ selectedCountry: country });
  }

  getMarkers(data, indicator) {
    return data.map(item => ({
      coordinates: item.economic_survey_data.familyUbication,
      color: item.indicator_survey_data[indicator],
      household: item.family.name,
      organization: item.family.organization.name,
      hub: item.family.organization.application.name,
      country: (item.family.organization.country || {}).country
    }));
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
      markers,
      selectedHousehold,
      selectedOrganization,
      selectedHub,
      selectedCountry
    } = this.state;
    return (
      <div className="map-container">
        <div className="row">
          {' '}
          <div className="col-sm-3">
            <CountryFilter
              countries={this.getCountries(this.state.snapshotData)}
              selectCountry={this.selectCountry}
            />
          </div>
          <div className="col-sm-2">
            <HubFilter
              hubs={this.getHubs(this.state.snapshotData)}
              selectHub={this.selectHub}
            />
          </div>
          <div className="col-sm-2">
            <OrganizationFilter
              organizations={this.getOrganizations(this.state.snapshotData)}
              selectOrganization={this.selectOrganization}
            />
          </div>
          <div className="col-sm-2">
            <HouseholdFilter
              households={this.getHouseholds(this.state.snapshotData)}
              selectHousehold={this.selectHousehold}
            />
          </div>
          <div className="col-sm-3">
            <ColorPicker
              toggleSelectedColors={this.toggleSelectedColors}
              selectedColors={selectedColors}
            />
          </div>
        </div>

        <div className="row">
          <div className="map-sidebar col-md-3">
            <SurveyFilter
              surveys={this.getSurveys(surveyData)}
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
              selectedHousehold={selectedHousehold}
              selectedOrganization={selectedOrganization}
              selectedHub={selectedHub}
              selectedCountry={selectedCountry}
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
      </div>
    );
  }
}

export default MapContainer;
