import React, { Component, PropTypes } from 'react';
import { OverlayView } from 'react-google-maps';
import { hexbin } from 'd3-hexbin';
import { scaleLinear } from 'd3-scale';
import { interpolateLab } from 'd3-interpolate';
import { max } from 'd3-array';
import Hexagon from './Hexagon.js';
const google = window.google;

/*
  This component renders hexbin configurations for a range of zoom levels
  by HK Yoon
  August 2016
*/

// expects latLng = { lat: 0, lng: 0 }
// outputs { x: 0, y: 0 }
function latLngToPoint(projection, latLng) {
  // check if it is already a google.maps.LatLng object
  const point = (typeof latLng.lat === 'function') ? projection.fromLatLngToPoint(latLng) : projection.fromLatLngToPoint(new google.maps.LatLng(latLng));
  return point;
}

// expects point = { x: 0, y: 0 }
// outputs google latLng object
function pointToLatLng(projection, point) {
  const latLng = projection.fromPointToLatLng(new google.maps.Point(point.x, point.y));
  return latLng;
}

export default class Hexbin extends Component {
  constructor(props) {
    super(props);

    // method binding
    this.calculateHexPointRadius = this.calculateHexPointRadius.bind(this);
    this.convertLatLngToPoints = this.convertLatLngToPoints.bind(this);
    this.getFillColor = this.getFillColor.bind(this);
    this.handleZoomChange = this.handleZoomChange.bind(this);
    this.handleBoundsChange = this.handleBoundsChange.bind(this);
    this.makeNewColorScale = this.makeNewColorScale.bind(this);
    this.makeNewHexagons = this.makeNewHexagons.bind(this);
    this.makeNewHexbin = this.makeNewHexbin.bind(this);

    // keep a reference to the map instance
    this.mapRef = this.props.mapHolderRef.getMap();

    // add zoom change event listener to map
    this.mapDragendListener = this.mapRef.addListener('dragend', this.handleBoundsChange);
    this.mapZoomListener = this.mapRef.addListener('zoom_changed', this.handleZoomChange);

    // somehow getBounds() function needs a little loadtime
    setTimeout(() => this.setState({ currentBounds: this.mapRef.getBounds() }), 500);

    // set initial state
    this.state = {
      currentBounds: this.mapRef.getBounds(),
      currentZoom: this.mapRef.getZoom(),
    };
  }
  componentWillUnmount() {
    // need to remove zoom_changed event listener before unmounting
    google.maps.event.removeListener(this.mapZoomListener);
    google.maps.event.removeListener(this.mapDragendListener);
  }
  calculateHexPointRadius(mapRef, bounds, mapPixelHeight, hexPixelRadius) {
    // delta point / delta pixel
    const radius = (latLngToPoint(mapRef.getProjection(), bounds.getSouthWest()).y - latLngToPoint(mapRef.getProjection(), bounds.getNorthEast()).y) * hexPixelRadius / mapPixelHeight;
    return radius;
  }
  convertLatLngToPoints(latlng) {
    const point = latLngToPoint(this.mapRef.getProjection(), latlng);

    // adding point fields along with latlng
    const object = Object.assign({ x: point.x, y: point.y }, latlng);

    return object;
  }
  getFillColor(hexagon, colorScale) {
    return colorScale(hexagon.length);
  }
  handleBoundsChange() {
    // set currentBounds
    this.setState({
      currentBounds: this.mapRef.getBounds(),
    });
  }
  handleZoomChange() {
    let currentZoom = this.mapRef.getZoom();

    // set currentZoom
    this.setState({
      currentZoom,
      currentBounds: this.mapRef.getBounds(),
    });
  }
  makeNewColorScale(hexagons) {
    return scaleLinear().domain([0, max(hexagons.map(hexagon => hexagon.length))]).range(this.props.colorRange).interpolate(interpolateLab);
  }
  makeNewHexbin(hexPointRadius) {
    return hexbin().radius(hexPointRadius);
  }
  makeNewHexagons() {
    let hexagons;
    // if data is unavailable, return an empty array
    if (!this.props.data) {
      return [];
    }

    // declare a new hexbin
    let hexbin;

    // make new hexbin according to new hexPointRadius
    const hexPointRadiusNew = this.calculateHexPointRadius(this.mapRef, this.state.currentBounds, this.props.mapPixelHeight, this.props.hexPixelRadius);
    hexbin = this.makeNewHexbin(hexPointRadiusNew);

    // set x and y accessors
    hexbin.x(d => d.x);
    hexbin.y(d => d.y);

    // caculate the hexagons
    hexagons = hexbin(this.props.data.map(this.convertLatLngToPoints));

    return hexagons.map((hexagon, idx) => { hexagon.id = idx; return hexagon }); // in order to give unique keys
  }
  render() {
    const projection = this.mapRef.getProjection();

    let hexagons = [];
    let colorScale;

    if (projection) {
      hexagons = this.makeNewHexagons();
      colorScale = this.makeNewColorScale(hexagons);
    }

    return (
      <div>
        {
          hexagons
            .filter(hexagon => this.state.currentBounds.contains(pointToLatLng(projection, hexagon)))
            .map(hexagon => {
              return (
                <OverlayView
                  mapHolderRef={this.props.mapHolderRef}
                  position={pointToLatLng(projection, hexagon)}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  key={hexagon.id}
                >
                  <Hexagon
                    hexPixelRadius={this.props.hexPixelRadius}
                    fillColor={this.getFillColor(hexagon, colorScale)}
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
