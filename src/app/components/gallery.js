import React from 'react';

class Gallery extends React.Component {
  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);

    let current = '';

    if (props.schema && props.schema.default) {
      if (Array.isArray(props.schema.default)) {
        current = props.schema.default[0].url;
      } else {
        current = props.formData;
      }
    }

    this.state = {
      selected: current,
      isGoing: '',
      images: props.schema.items.enum,
      title: props.schema.title,
      required: props.required ? '*' : '', 
      loading: true
    };
  }

  renderImage(imageUrl, imageDescription, imageValue, index, className) {
    return (
      <div className="col-md-4" key={index}>
        <div
          onClick={this._handleClickOnImage(
            index,
            imageUrl,
            imageDescription,
            imageValue
          )}
          className={className}
        >
          <figure className={imageValue}>
            <img alt="" src={imageUrl} className="img-responsive" />
            <figcaption>{imageDescription}</figcaption>
          </figure>
        </div>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {

    if (this.props.name !== nextProps.name) {
      let ban = false;
      if(nextProps.formData[0].value === "NONE"){
        ban = true;
      }
      this.setState ( {
        selected: nextProps.formData[0].url,
        images: nextProps.schema.items.enum,
        title: nextProps.schema.title,
        required: nextProps.required ? '*' : '',
        isGoing: ban,
        loading: true
      });
    }
  }

  imagesWillRender(){
    let images = [];
    for (let i = 0; i < this.state.images.length; i++) {
      let url = this.state.images[i].url;
      let description = this.state.images[i].description;
      let value = this.state.images[i].value;
      let clazz = url === this.state.selected ? 'gallery-selected' : '';
      clazz += ' gallery-image gallery-image-div ';
      images.push(this.renderImage(url, description, value, i, clazz));
    }
    return images;
  }

  render() {
    const { loading } = this.state;
    
    let images = [];
    if(loading) { 
      setTimeout(() => this.setState({ loading: false }), 200);
      for (let i = 0; i < this.state.images.length-1; i++) {
        images.push(this.renderImage('../../static/images/image_default.png', 'Loading...', 'NONE', i, 'gallery-image gallery-image-div' ));
      }
    } else {
      images = this.imagesWillRender();
    }

    return (
      <div className="form-group field field-gallery">
        <label className="control-label">
          {this.state.title} {this.state.required}
        </label>

        <div className="gallery-no-answer text-center">
          <input
            type="checkbox"
            checked={this.state.isGoing}
            onChange={this.handleInputChange}
          />
             &#32;&#32;I&#39;d prefer not to answer
        </div>
        <br />
        <br />
        <div className="row">
          <div className="images col-sm-8 col-md-offset-2">
            <div className="row">{images}</div>
          </div>
        </div>
      </div>
    );
  }

  handleInputChange(event) {
    let component = this;
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({isGoing: value});

    if(value){
      component.setState({
        selected: '',
        isGoing: true
      });
      if (component.props.onChange) {
          component.props.onChange([
            { url: "NONE", description: "", value: "NONE" }
          ]);
      }

    }
  }

  _handleClickOnImage(index, imageUrl, imageDescription, imageValue) {
    var component = this;

    return function() {

      if (component.props.onChange) {
        component.props.onChange(index, imageUrl, imageDescription, imageValue);
      }
      component.setState({
        selected: imageUrl,
        isGoing: false
      });


      setImmediate(() =>
        component.props.onChange([
          { url: imageUrl, description: imageDescription, value: imageValue }
        ])
      );
    };
  }
}

export default Gallery;
