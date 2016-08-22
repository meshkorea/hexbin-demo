import React, { Component } from 'react';
import { hexbin } from 'd3-hexbin';

class Hexagon extends Component {
  render() {
    const { hexPixelRadius, content, fillColor } = this.props;
    const hexWidth = this.props.hexPixelRadius * 2 * Math.sin(Math.PI / 3);
    const hexHeight = this.props.hexPixelRadius * 2;
    return (
      <div
        style={{ width: hexWidth, height: hexHeight, position: 'relative', top: - hexHeight / 2, left: - hexWidth / 2 }}
      >
        <svg
          style={{ position: 'relative', overflow: 'visible', zIndex: 99 }}
          width={hexWidth}
          height={hexHeight}
        >
          <path
            stroke={'white'}
            strokeWidth={1}
            d={hexbin().hexagon(hexPixelRadius)}
            fill={fillColor}
            opacity={0.6}
            transform={ `translate(${hexWidth / 2}, ${hexHeight / 2})`}
          >
          </path>
        </svg>
        <div
          style={{ color: 'red', fontSize: '1.5em', position: 'absolute', top: 0, left: 0, textAlign: 'center', width: hexWidth, height: hexHeight, zIndex: 100 }}
          onClick={() => {}}
        >
          <span style={{ borderRadius: '1em', backgroundColor: 'white', lineHeight: `${hexHeight}px`, padding: '.5em', opacity: 0.7 }}>{ content }</span>
        </div>
      </div>
    )
  }
}

export default Hexagon;
