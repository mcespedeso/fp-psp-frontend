import React, { Component } from 'react';

import env from '../../env';
import Map from './mapComponent';
import ColorPicker from './colorPicker';
import SurveyFilter from './surveyFilter';
import Filter from './filterComponent';

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
      selectedCountry: '',
      selectedUser: ''
    };
    this.toggleSelectedColors = this.toggleSelectedColors.bind(this);
    this.selectSurvey = this.selectSurvey.bind(this);
    this.searchIndicators = this.searchIndicators.bind(this);
    this.selectIndicator = this.selectIndicator.bind(this);
    this.selectItem = this.selectItem.bind(this);
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

  selectItem(item) {
    this.setState(item);
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
      selectedCountry: '',
      selectedUser: ''
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

  getDropdownItems(data, dropdownItem) {
    switch (dropdownItem) {
      case 'country':
        return data
          .map(country => (country.family.organization.country || {}).country)
          .filter((country, i, self) => country && self.indexOf(country) === i);

      case 'hub':
        return data
          .filter(
            item =>
              this.state.selectedCountry.length
                ? (item.family.organization.country || {}).country ===
                  this.state.selectedCountry
                : item
          )
          .map(hub => hub.family.organization.application.name)
          .filter((hub, i, self) => self.indexOf(hub) === i);

      case 'organization':
        return data
          .filter(
            item =>
              (this.state.selectedHub.length
                ? item.family.organization.application.name ===
                  this.state.selectedHub
                : item) &&
              (this.state.selectedCountry.length
                ? (item.family.organization.country || {}).country ===
                  this.state.selectedCountry
                : item)
          )
          .map(organization => organization.family.organization.name)
          .filter((organization, i, self) => self.indexOf(organization) === i);

      case 'user':
        return data
          .filter(
            item =>
              (this.state.selectedOrganization.length
                ? item.family.organization.name ===
                  this.state.selectedOrganization
                : item) &&
              (this.state.selectedHub.length
                ? item.family.organization.application.name ===
                  this.state.selectedHub
                : item) &&
              (this.state.selectedCountry.length
                ? (item.family.organization.country || {}).country ===
                  this.state.selectedCountry
                : item)
          )
          .map(user => user.user.username)
          .filter((user, i, self) => user && self.indexOf(user) === i);

      case 'household':
        return data
          .filter(
            item =>
              (this.state.selectedUser.length
                ? item.user.username === this.state.selectedUser
                : item) &&
              (this.state.selectedOrganization.length
                ? item.family.organization.name ===
                  this.state.selectedOrganization
                : item) &&
              (this.state.selectedHub.length
                ? item.family.organization.application.name ===
                  this.state.selectedHub
                : item) &&
              (this.state.selectedCountry.length
                ? (item.family.organization.country || {}).country ===
                  this.state.selectedCountry
                : item)
          )
          .map(item => item.family.name);

      default:
    }
  }

  getMarkers(data, indicator) {
    return data.map(item => ({
      coordinates: item.economic_survey_data.familyUbication,
      color: item.indicator_survey_data[indicator],
      household: item.family.name,
      householdID: item.family.familyId,
      date: item.created_at,
      organization: item.family.organization.name,
      hub: item.family.organization.application.name,
      country: (item.family.organization.country || {}).country,
      user: item.user.username
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
    const filters = [
      {
        label: 'Country',
        data: this.getDropdownItems(this.state.snapshotData, 'country'),
        itemToSelect: 'selectedCountry',
        access: ['ROLE_ROOT', 'ROLE_HUB_ADMIN', 'ROLE_APP_ADMIN']
      },
      {
        label: 'Hub',
        data: this.getDropdownItems(this.state.snapshotData, 'hub'),
        itemToSelect: 'selectedHub',
        access: ['ROLE_ROOT']
      },
      {
        label: 'Organization',
        data: this.getDropdownItems(this.state.snapshotData, 'organization'),
        itemToSelect: 'selectedOrganization',
        access: ['ROLE_ROOT', 'ROLE_HUB_ADMIN']
      },
      {
        label: 'User',
        data: this.getDropdownItems(this.state.snapshotData, 'user'),
        itemToSelect: 'selectedUser',
        access: ['ROLE_ROOT', 'ROLE_HUB_ADMIN', 'ROLE_APP_ADMIN']
      },
      {
        label: 'Household',
        data: this.getDropdownItems(this.state.snapshotData, 'household'),
        itemToSelect: 'selectedHousehold',
        access: [
          'ROLE_ROOT',
          'ROLE_HUB_ADMIN',
          'ROLE_APP_ADMIN',
          'ROLE_SURVEY_USER'
        ]
      }
    ];
    const {
      indicators,
      selectedIndicator,
      searchIndicatorsQuery,
      selectedColors,
      markers,
      selectedHousehold,
      selectedOrganization,
      selectedHub,
      selectedCountry,
      selectedUser
    } = this.state;
    return (
      <div className="map-container">
        <div className="row">
          {filters
            .filter(item => item.access.includes(this.props.user))
            .map(item => (
              <div key={item.label} className="col-sm-2">
                <Filter
                  label={item.label}
                  data={item.data}
                  selectItem={this.selectItem}
                  itemToSelect={item.itemToSelect}
                />
              </div>
            ))}
          <div className="col-sm-2">
            <ColorPicker
              toggleSelectedColors={this.toggleSelectedColors}
              selectedColors={selectedColors}
            />
          </div>
        </div>

        <div className="row">
          <div className="map-sidebar col-md-2">
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
          <div className="map col-md-10">
            <Map
              selectedColors={selectedColors}
              markers={markers}
              selectedHousehold={selectedHousehold}
              selectedOrganization={selectedOrganization}
              selectedHub={selectedHub}
              selectedCountry={selectedCountry}
              selectedUser={selectedUser}
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
