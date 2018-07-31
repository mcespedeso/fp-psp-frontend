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
      selectedIndicator: indicator
    });
  }

  searchIndicators(query) {
    this.setState({ searchIndicatorsQuery: query });
  }

  getDropdownItems(data, dropdownItem) {
    switch (dropdownItem) {
      case 'country':
        return this.filterData(data, 'country')
          .map(country => (country.family.organization.country || {}).country)
          .filter((country, i, self) => country && self.indexOf(country) === i);

      case 'hub':
        return this.filterData(data, 'hub')
          .map(hub => hub.family.organization.application.name)
          .filter((hub, i, self) => self.indexOf(hub) === i);

      case 'organization':
        return this.filterData(data, 'organization')
          .map(organization => organization.family.organization.name)
          .filter((organization, i, self) => self.indexOf(organization) === i);

      case 'user':
        return this.filterData(data, 'user')
          .map(user => user.user.username)
          .filter((user, i, self) => user && self.indexOf(user) === i);

      case 'household':
        return this.filterData(data, 'household').map(item => item.family.name);

      default:
    }
  }

  getMarkers(data, indicator) {
    return this.filterData(data).map(item => ({
      coordinates: item.economic_survey_data.familyUbication,
      color: item.indicator_survey_data[indicator],
      householdID: item.family.familyId,
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
      selectedColors
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
