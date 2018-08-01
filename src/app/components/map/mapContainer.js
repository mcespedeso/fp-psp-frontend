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
    this.getSnapshotData(this.state.selectedSurvey);
  }

  getSnapshotData(survey) {
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
          snapshotData: res
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

  filterData(data, filter) {
    return data.filter(
      item =>
        (this.state.selectedCountry.length && filter !== 'country'
          ? (item.family.organization.country || {}).country ===
            this.state.selectedCountry
          : item) &&
        (this.state.selectedHub.length && filter !== 'hub'
          ? item.family.organization.application.name === this.state.selectedHub
          : item) &&
        (this.state.selectedOrganization.length && filter !== 'organization'
          ? item.family.organization.name === this.state.selectedOrganization
          : item) &&
        (this.state.selectedUser.length && filter !== 'user'
          ? item.user.username === this.state.selectedUser
          : item) &&
        (this.state.selectedHousehold.length && filter !== 'household'
          ? item.family.name === this.state.selectedHousehold
          : item)
    );
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
    this.getSnapshotData(survey);
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
      selectedIndicator: indicator
    });
  }

  searchIndicators(query) {
    this.setState({ searchIndicatorsQuery: query });
  }

  getMarkers(data, indicator) {
    return this.filterData(data).map(item => ({
      coordinates: item.economic_survey_data.familyUbication,
      color: item.indicator_survey_data[indicator],
      householdID: item.family.familyId,
      household: item.family.name,
      date: item.created_at
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

  createFilters(data) {
    return [
      {
        label: 'Country',
        data: this.filterData(data, 'country')
          .map(country => (country.family.organization.country || {}).country)
          .filter((country, i, self) => country && self.indexOf(country) === i),
        itemToSelect: 'selectedCountry',
        access: ['ROLE_ROOT', 'ROLE_HUB_ADMIN', 'ROLE_APP_ADMIN']
      },
      {
        label: 'Hub',
        data: this.filterData(data, 'hub')
          .map(hub => hub.family.organization.application.name)
          .filter((hub, i, self) => self.indexOf(hub) === i),
        itemToSelect: 'selectedHub',
        access: ['ROLE_ROOT']
      },
      {
        label: 'Organization',
        data: this.filterData(data, 'organization')
          .map(organization => organization.family.organization.name)
          .filter((organization, i, self) => self.indexOf(organization) === i),
        itemToSelect: 'selectedOrganization',
        access: ['ROLE_ROOT', 'ROLE_HUB_ADMIN']
      },
      {
        label: 'User',
        data: this.filterData(data, 'user')
          .map(user => user.user.username)
          .filter((user, i, self) => user && self.indexOf(user) === i),
        itemToSelect: 'selectedUser',
        access: ['ROLE_ROOT', 'ROLE_HUB_ADMIN', 'ROLE_APP_ADMIN']
      },
      {
        label: 'Household',
        data: this.filterData(data, 'household').map(item => item.family.name),
        itemToSelect: 'selectedHousehold',
        access: [
          'ROLE_ROOT',
          'ROLE_HUB_ADMIN',
          'ROLE_APP_ADMIN',
          'ROLE_SURVEY_USER'
        ]
      }
    ];
  }

  render() {
    const { surveyData } = this.props;
    const {
      indicators,
      selectedIndicator,
      searchIndicatorsQuery,
      selectedColors
    } = this.state;
    return (
      <div className="map-container">
        <div className="row">
          {this.createFilters(this.state.snapshotData)
            .filter(item => item.access.includes(this.props.user))
            .map(item => (
              <div key={item.label} className="col-lg-2">
                <Filter
                  label={item.label}
                  data={item.data}
                  selectItem={this.selectItem}
                  itemToSelect={item.itemToSelect}
                />
              </div>
            ))}
          <div className="col-xl-2">
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
              markers={this.getMarkers(
                this.filterData(this.state.snapshotData),
                this.state.selectedIndicator
              )}
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
