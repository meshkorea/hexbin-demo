/*
  This component renders hexbin configurations for a range of zoom levels
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

import React, { Component, PropTypes } from 'react';
import { OverlayView } from 'react-google-maps';
import { hexbin } from 'd3-hexbin';
import { scaleLinear } from 'd3-scale';
import { interpolateLab } from 'd3-interpolate';
import { max } from 'd3-array';
import Hexagon from './Hexagon.js';
const google = window.google;

// expects latLng = { lat: 0, lng: 0 }
// outputs { x: 0, y: 0 }
function latLngToPoint(projection, latLng) {
  // check if it is already a google.maps.LatLng object
  return (typeof latLng.lat === 'function') ? projection.fromLatLngToPoint(latLng) : projection.fromLatLngToPoint(new google.maps.LatLng(latLng));
}

// expects point = { x: 0, y: 0 }
// outputs google latLng object
function pointToLatLng(projection, point) {
  return projection.fromPointToLatLng(new google.maps.Point(point.x, point.y));
}

export default class Hexbin extends Component {
  constructor(props) {
    super(props);

    // method binding
    this.calculateHexPointRadius = this.calculateHexPointRadius.bind(this);
    this.convertLatLngToPoint = this.convertLatLngToPoint.bind(this);
    this.handleZoomChange = this.handleZoomChange.bind(this);
    this.handleBoundsChange = this.handleBoundsChange.bind(this);
    this.makeNewColorScale = this.makeNewColorScale.bind(this);
    this.makeNewHexagons = this.makeNewHexagons.bind(this);
    this.makeNewHexbinGenerator = this.makeNewHexbinGenerator.bind(this);

    // keep a reference to the map instance
    this.mapRef = this.props.mapHolderRef.getMap();

    // add event listeners to map
    this.mapDragendListener = this.mapRef.addListener('dragend', this.handleBoundsChange);
    this.mapZoomListener = this.mapRef.addListener('zoom_changed', this.handleZoomChange);

    // for some reason getBounds() and getProjection() functions need a little loadtime
    setTimeout(() => this.setState({ currentBounds: this.mapRef.getBounds(), currentProjection: this.mapRef.getProjection() }), 500);

    // set initial state
    this.state = {
      currentZoom: this.mapRef.getZoom(),
    };
  }
  componentWillUnmount() {
    // need to remove zoom_changed event listener before unmounting
    google.maps.event.removeListener(this.mapZoomListener);
    google.maps.event.removeListener(this.mapDragendListener);
  }
  calculateHexPointRadius() {
    // delta point / delta pixel
    return (latLngToPoint(this.state.currentProjection, this.state.currentBounds.getSouthWest()).y - latLngToPoint(this.state.currentProjection, this.state.currentBounds.getNorthEast()).y) * this.props.hexPixelRadius / this.props.mapPixelHeight;
  }
  convertLatLngToPoint(latlng) {
    return latLngToPoint(this.state.currentProjection, latlng);
  }
  handleBoundsChange() {
    // set currentBounds
    this.setState({
      currentBounds: this.mapRef.getBounds(),
    });
  }
  handleZoomChange() {
    // set currentZoom
    this.setState({
      currentZoom: this.mapRef.getZoom(),
      currentBounds: this.mapRef.getBounds(),
    });
  }
  makeNewColorScale(hexagons) {
    return scaleLinear().domain([0, max(hexagons.map(hexagon => hexagon.length))]).range(this.props.colorRange).interpolate(interpolateLab);
  }
  makeNewHexbinGenerator(hexPointRadius) {
    return hexbin().radius(hexPointRadius);
  }
  makeNewHexagons() {
    let hexagons;
    // if data is unavailable, return an empty array
    if (!this.props.data) {
      return [];
    }

    // declare a new hexbin generator
    let hexbinGenerator;

    // make new hexbin according to new hexPointRadius
    const hexPointRadiusNew = this.calculateHexPointRadius();
    hexbinGenerator = this.makeNewHexbinGenerator(hexPointRadiusNew);

    // set x and y accessors
    hexbinGenerator.x(d => d.x);
    hexbinGenerator.y(d => d.y);

    // calculate the hexagons
    hexagons = hexbinGenerator(this.props.data.map(this.convertLatLngToPoint));
    return hexagons.map((hexagon, idx) => { hexagon.id = idx; return hexagon }); // in order to give unique keys
  }
  render() {
    let hexagons = [];
    let colorScale;

    if (this.state.currentProjection) {
      hexagons = this.makeNewHexagons();
      colorScale = this.makeNewColorScale(hexagons);
    }

    return (
      <div>
        {
          hexagons
            .filter(hexagon => this.state.currentBounds.contains(pointToLatLng(this.state.currentProjection, hexagon)))
            .map(hexagon => {
              return (
                <OverlayView
                  mapHolderRef={this.props.mapHolderRef}
                  position={pointToLatLng(this.state.currentProjection, hexagon)}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  key={hexagon.id}
                >
                  <Hexagon
                    hexPixelRadius={this.props.hexPixelRadius}
                    fillColor={colorScale(hexagon.length)}
                    content={hexagon.length}
                  />
                </OverlayView>
              );
            })
        }
      </div>
    );
  }
}

Hexbin.propTypes = {
  colorRange: PropTypes.array,
  mapHolderRef: PropTypes.object,
  data: PropTypes.array,
  hexPixelRadius: PropTypes.number,
  mapPixelHeight: PropTypes.number,
};
