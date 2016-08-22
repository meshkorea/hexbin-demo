import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { GoogleMapLoader, GoogleMap } from 'react-google-maps';
import HexbinComponent from './Hexbin.js';

import fakeStoreLatLngData from './data/sample-data.json';

const MAP_HEIGHT = 600;
const HEX_PIXEL_RADIUS = 50;

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Hexbin Demo</h2>
        </div>
        <GoogleMapLoader
          query={{ libraries: 'geometry,drawing,places,visualization' }}
          containerElement={
            <div
              style={{
                width: '100%',
                height: MAP_HEIGHT,
              }}
            />
          }
          googleMapElement={
            <GoogleMap
              style={{ border: '5px solid black' }}
              defaultZoom={12}
              options={{ mapTypeControl: false }}
              defaultCenter={{ lat: 37.518397, lng: 126.978886 }}
            >
              <HexbinComponent
                hexPixelRadius={HEX_PIXEL_RADIUS}
                mapPixelHeight={MAP_HEIGHT}
                data={fakeStoreLatLngData}
                colorRange={['white', 'red']}
              />
            </GoogleMap>
          }
        />
      </div>
    );
  }
}

export default App;
