import React from 'react';

const colors = ['RED', 'YELLOW', 'GREEN'];
const ColorPicker = props => (
  <div className="color-picker">
    {colors.map(color => (
      <div
        className={`color-picker-item color-picker-item--${color.toLowerCase()} ${
          props.selectedColors.includes(color)
            ? 'color-picker-item--active'
            : ''
        }`}
        onClick={() => props.toggleSelectedColors(color)}
      >
        {color}
      </div>
    ))}
  </div>
);

export default ColorPicker;
