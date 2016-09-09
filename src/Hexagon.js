/*
  This component renders a single hexagon
  by HK Yoon (Meshkorea)
  August 2016

  The MIT License

  Copyright © 2016. (주)메쉬코리아 all rights reserved.

  Permission is hereby granted, free of charge, 
  to any person obtaining a copy of this software and 
  associated documentation files (the "Software"), to 
  deal in the Software without restriction, including 
  without limitation the rights to use, copy, modify, 
  merge, publish, distribute, sublicense, and/or sell 
  copies of the Software, and to permit persons to whom 
  the Software is furnished to do so, 
  subject to the following conditions:

  The above copyright notice and this permission notice 
  shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR 
  ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import React, { PropTypes, Component } from 'react';
import { hexbin } from 'd3-hexbin';

class Hexagon extends Component {
  render() {
    const { hexPixelRadius, fillColor, content } = this.props;
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

Hexagon.propTypes = {
  hexPixelRadius: PropTypes.number,
  fillColor: PropTypes.string,
  content: PropTypes.any,
}

export default Hexagon;
