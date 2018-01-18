import React from 'react';

class NumberFormat extends React.Component {
    constructor(props) {
      super(props);
      this.setInitialValues(props);
      this._handleOnChange = this._handleOnChange.bind(this);
    }

    _handleOnChange(event){

        if(event.target.value.length===0){
            this.setState({valueView: 0});
            
            setImmediate(() =>
                this.props.onChange(0)
            );
            return;
        }
          
        let number = this.parseNumber(event.target.value);
        this.setState({valueView: this.prettyNumber(event.target.value, number)});
            
        setImmediate(() =>
            this.props.onChange(number)
        );
    }

    parseNumber(value, locale = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage)) {

        const example = Intl.NumberFormat(locale).format('1.1');      
        const cleanPattern = new RegExp(`[^-+0-9${ example.charAt( 1 ) }]`, 'g');
        const cleaned = value.replace(cleanPattern, '');
        const normalized = cleaned.replace(example.charAt(1), '.');
      
        return parseFloat(normalized);
    }

    prettyNumber(original, number, locale = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage)) {

        const example = Intl.NumberFormat(locale).format('1.1');
        const decimalSepartor = example.charAt(1);
    
        let toRet = new Intl.NumberFormat(locale).format(parseInt(number, 10));
        let count = this.decimalSeparatorCounter(original, decimalSepartor);
        if (count ===1) {
            if(original.substring(original.indexOf(decimalSepartor)+1, original.length).length>2){
                toRet += original.substring(original.indexOf(decimalSepartor), original.length-1);
            }else {
                toRet += original.substring(original.indexOf(decimalSepartor));
            }
        } else if (count>1){
            toRet += original.substring(original.indexOf(decimalSepartor), original.length-1);
        }
    
        return toRet; 
    }

    decimalSeparatorCounter(value, decimalSeparator){
        let count = 0;
        let position = value.indexOf(decimalSeparator);
        while ( position !== -1 ) {
            count++;
            position = value.indexOf(decimalSeparator, position+1);
        }

        return count;
    }

    setInitialValues(props){
        let value = 0;
        if (props.schema && props.schema.default) {
          value = props.schema.default;
        }else if(props.formData===undefined || props.formData.length===0){
          value = 0;
          setImmediate(() =>
            props.onChange(0)
          );
        } else {
          value = props.formData;
        }
        this.state = {
          title: props.schema.title,
          required: props.required ? '*' : '',
          valueView: this.prettyNumber(value.toString(), this.parseNumber(value.toString()))
        };
    }

    componentWillReceiveProps(nextProps) {

        if (this.props.name !== nextProps.name) {
            let value = 0;
            if (nextProps.schema && nextProps.schema.default) {
                value = nextProps.schema.default;
            }else if(nextProps.formData===undefined || nextProps.formData.length===0){
                value = 0;
                setImmediate(() =>
                    nextProps.onChange(0)
                );
            } else {
                value = nextProps.formData;
            }
            this.setState ({
                title: nextProps.schema.title,
                required: nextProps.required ? '*' : '',
                valueView: this.prettyNumber(value.toString(), this.parseNumber(value.toString()))
            });
        }
    }

    render() {

        return (
          <div className="form-group field field-number">
            <label className="control-label">
              {this.state.title} {this.state.required}
            </label>
            <br />
            <input className="form-control" type="text" value={this.state.valueView} onChange={this._handleOnChange} />
          </div>
        );
    }
}

export default NumberFormat;