# React, Google Maps, D3 를 이용한 Hexagonal binning 기법

> 위치기반 데이터를 시각화 할때 기본 분포도 보다 더 좋은 방법은 없을까?

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17847211/c66f66fe-6887-11e6-88a8-3f80d4abad9b.png"/>
</p>

## 목차
1. [결과물] (#end-product)
2. [포스트의 목적] (#objective)
3. [Front-End Core Library] (#core-library)
4. [Walkthrough] (#walkthrough)
6. Wrap-up
7. Citation

## <a name="end-product"></a>결과물

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17847619/e4e94670-6889-11e6-9d73-b396d7d8cba7.png"/>
</p>

Hexagonal binning 기법이 적용된 강남구 지역 위치 데이터 분포도입니다. 육각형 통( = hexagonal bin 혹은 hexbin) 안에 숫자는 그 육각형 통이 차지하고있는 지역 안에 존재하는 데이터 포인트의 수 입니다. 밀집도를 한눈에 볼수 있도록 각 hexbin 의 색의 짙고 연함을 현재 zoom level 의 상대적 밀집도와 맵핑이 될 수 있도록 컬러 코딩하였습니다.


* Live demo 페이지
* [Live demo 소스코드 Github Repo] (https://github.com/hkgittt/hexbin-demo)

## <a name="objective"></a>포스트의 목적

Business Intelligence 란 서비스에 있어서 다음 액션을 취하는데 필요한 객관적인 정보입니다. 메쉬코리아 커머스랩에선 부탁해! 지역별 상점 영업상태를 조금 더 직관적으로 보고싶었습니다. 가장 간단한 방법은 상점의 위치를 지도위에 마커로 표시하는것입니다. 하지만 이러한 단순한 분포도는 zoom level 에 따라서 유용성의 차이가 커서, 조금더 좋은 방법이 없을까 고민하던 찰나에 hexagonal binning 이라는 기법을 접하게 되었습니다.

이 포스팅의 목적은 조금이나마 저희들이 React, Google Maps, 그리고 D3 를 이용해 hexagonal binning 기법을 시행한 경험을 나누고 싶었습니다. 공개된 live demo 페이지의 소스코드를 함께 살펴볼까 합니다. 여러분의 React, D3 와의 숙련도에 따라서 어려울수도 있고 쉬울수도 있겠지만, 소스코드는 최대한 군더더기를 빼고 필요한 부분만 남겨두었습니다. 예를 들면, 요즘 React 와 같이 많이 사용하는 state 관리 library 인 Redux 는 사용하지 않습니다. Redux 의 유용성을 부정하는것이 아니고, 엄밀히 말해서 이 live demo 에서는 필요가 없기 때문입니다. Live demo 소스코드 자체도 [create-react-app] (https://github.com/facebookincubator/create-react-app) 이라는 React 프로젝트 스타터 킷을 사용하였습니다 (Facebook Incubator 에서 나온 프로젝트입니다). React 프로젝트 세팅을 제대로 해 보셨다면 아시겠지만, webpack, babel, eslint 및 구성요소가 많은데, create-react-app 은 [커멘드 한줄] (https://github.com/facebookincubator/create-react-app#creating-an-app) 로 React 프로젝트를 시작할수 있습니다. 또 혹시나 뒤에서 어떤 세팅이 적용되고있는지 궁금하신 분들을 위해 `npm run eject` 커맨드, 즉 세팅 파일들을 unlock 하는 [기능](https://github.com/facebookincubator/create-react-app#converting-to-a-custom-setup)도 내제하고 있습니다.

## <a name="core-library"></a>Front-End Core Library

### React
요즘 [React] (https://facebook.github.io/react/) 가 핫합니다. React 는 Facebook 사가 직접만든 UI 개발용 open-source JavaScript library 입니다.
메쉬코리아에서는 2016년 1월 React 를 높이 평가하여, 내부 web application 에 점진적으로 도입하고 있는데요, React 가 제공하는 컴포넌트 디자인 파라다임에 굉장히 만족하고있습니다. JavaScript 는 ES2015 (ES6) 를 적극 지향하고 있으며, 어떻게 하면 더욱 효과적인 React 코드를 짤수 있을까에 대해서 항상 고민하고 있습니다.

### Google Maps
Google Maps 는 다들 아시죠? 위치 기반 서비스를 개발할수 있도록 해주는 API 를 제공합니다. 대안으로는 Naver Map 또는 Daum Maps 가 있겠죠?
저희는  [Google Maps JavaScript API] (https://developers.google.com/maps/documentation/javascript/) 를 React 컴포넌트화 시킨 [react-google-maps] (https://github.com/tomchentw/react-google-maps) 를 사용했습니다.

### D3
[D3] (https://d3js.org/) 는 컴퓨터 공학자이자, 데이터 시각화 전문가인 Mike Bostock 이 만든 [open-source libary] (https://github.com/d3/d3) 로서, 미가공 데이터를 다루기에 유용한 함수들부터, 가공된 데이터를 편리한 syntax 를 통해 효율적으로 DOM 에 렌더링해줄수 있는 유틸리티 함수들을 하나의 library 에 모아서 제공합니다. 또 React 개발자들에게 좋은 소식은, D3 가 4.0 버전으로 올라오면서 모듈화를 선언했다는 점입니다. 이 포스트에서는 구체적으로 D3 의 d3-hexbin, d3-scale, d3-interpolate 모듈들을 사용하여 완성하였습니다.

## <a name="walkthrough"></a>Walkthrough

Hexagonal binning 기법을 사용하는 방법을 소스코드를 보며 천천히 하나씩 짚어보겠습니다.
먼저 Hexagonal binning 기법에 대한 기본적 개념으로 시작합니다.

* [Hexagonal binning 기법이란?] (#walkthrough-01)
* [Data] (#walkthrough-02)
* [컴포넌트 구조] (#walkthrough-03)
	* [App 컴포넌트] (#walkthrough-0301)
	* [GoogleMapLoader 와 GoogleMap 컴포넌트] (#walkthrough-0302)
	* [Hexbin 컴포넌트] (#walkthrough-0303)
	* [Hexagon 컴포넌트] (#walkthrough-0304)

### <a name="walkthrough-01"></a> Hexagonal binning 기법이란?
Hexagonal binning 기법은 기본 분포도 (distribution map) 와 많이 다르지 않습니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17880029/8718303a-6931-11e6-8d1a-b331d3f78a87.png"/>
  <br/>
  데이터 포인트가 하나의 점으로 표시되는 분포도입니다.
</p>
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17880030/87187c66-6931-11e6-805e-2a6201575515.png"/>
  <br/>
  데이터 포인트들을 특정크기의 hexbin 안에다가 넣는것을 hexagonal binning 이라고 합니다.
</p>
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17885277/80bb9efe-6957-11e6-874f-c51e5b80a3e3.png"/>
  <br/>
  데이터 포인트들을 얼마나 포함하고 있느냐에 따라 그에 맞는 색상을 적용합니다.
</p>

### <a name="walkthrough-02"></a> Data
모든 데이터 시각화의 시작은 데이터 입니다.

```javascript
// 위치 데이터
const singleLocation = { "lat": 37.505434, "lng": 127.026385 };

```
하나의 위치 데이터는 (예: 어떤 상점의 위치) 위도와 경도 key 를 가지고있는 객체입니다.

```javascript
// 위치 데이터를 모아놓은 배열
const multipleLocations = [ 
	{ "lat": 37.505434, "lng": 127.026385 },
	{ "lat": 37.516167, "lng": 127.040858 },
	...,
];
```

소스코드내에서 샘플 위치 데이터는 [JSON 파일] (https://github.com/hkgittt/hexbin-demo/blob/master/src/data/generated-data.json) 로 따로 관리합니다. 편의상 webpack 의 json-loader 를 통해서 [프로젝트로 들여옵니다] (https://github.com/hkgittt/hexbin-demo/blob/master/src/App.js#L8). (실제 프로젝트 환경에선 서버에서 asynchronous 하게 불러오겠죠?)

### <a name="walkthrough-03"></a> 컴포넌트 구조

프로젝트의 실제 entry point 인 [index.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/index.js) 는 (create-react-app 에서 만들어준 그대로 입니다) 최상위 컴포넌트인 `App` 컴포넌트를 페이지에 [마운트 해줍니다] (https://github.com/hkgittt/hexbin-demo/blob/master/src/index.js#L6-L9).


<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917353/9fcda3b0-69f6-11e6-8bbd-23667efb9393.png"/>
  <br/>
</p>

App 컴포넌트 부터 차례대로 들어가보겠습니다.

#### <a name="walkthrough-0301"></a>  App 컴포넌트

`App` 컴포넌트는 react-google-map 에서 제공하는 `GoogleMapLoader` 컴포넌트를 마운트 합니다. 아직 여기까지 특별한 것은 없습니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917322/49a7eda6-69f6-11e6-8046-8135637e0a4a.png"/>
  <br/>
</p>

[App.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/App.js)

```javascript
import React, { Component } from 'react';

// ... 코드 생략

import { GoogleMapLoader, GoogleMap, Marker } from 'react-google-maps';
import fakeStoreLatLngData from './data/generated-data.json';

// ... 코드 생략

class App extends Component {
  constructor() {
  }
  // ... 코드 생략
  render() {
    return (
      { ... 코드 생략 }
      <GoogleMapLoader
        { ... 코드 생략 }
      />
    );
  }
}
```

`fakeStoreLatLngData` 는 위치 데이터를 배열로 가지고 있는 [generated-data.json] (https://github.com/hkgittt/hexbin-demo/blob/master/src/data/generated-data.json) 파일을 JSON.parse() 를 통해 JavaScript 배열로 가공해주었습니다.

#### <a name="walkthrough-0302"></a> GoogleMapLoader 와 GoogleMap 컴포넌트

`App` 컴포넌트에서 마운트된 `GoogleMapLoader` 컴포넌트와 `GoogleMap` 컴포넌트를 조금더 자세히 살펴보겠습니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917323/4b54a040-69f6-11e6-9c9d-13625c13947f.png"/>
  <br/>
</p>

`GoogleMapLoader` 컴포넌트의 역활은 `GoogleMap` 컴포넌트를 마운트시켜주는 것입니다.

[App.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/App.js)

```javascript
import { GoogleMapLoader, GoogleMap, Marker } from 'react-google-maps';

// ... 코드 생략

const MAP_PIXEL_HEIGHT = 600;

class App extends Component {
  constructor() {
  }
  // ... 코드 생략
  render() {
    return (
      { ... 코드 생략 }
      <GoogleMapLoader
        query={{ libraries: 'geometry,places,visualization' }}
        containerElement={
          <div
            style={{ width: '100%', height: MAP_PIXEL_HEIGHT }}
          />
        }
        googleMapElement={
          <GoogleMap
            defaultZoom={12}
            options={{ mapTypeControl: false }}
            defaultCenter={{ lat: 37.518397, lng: 126.978886 }}
          >
          { ... 코드 생략 }
          </GoogleMap>
        }
      />
    );
  }
}
```


`GoogleMapLoader` 의 `prop` 중 `containerElement` `prop` 은 Google Map 이 렌더되어 들어갈 컨테이너를 지정합니다. `div` 를 하나 넣어주고, `height` 를 위에서 정의한 `MAP_PIXEL_HEIGHT` 로 지정합니다. `MAP_PIXEL_HEIGHT` 는 나중에 zoom level 에 따른 hexbin 크기를 재계산할때 사용합니다.

`GoogleMap` 컴포넌트는 `GoogleMapLoader` 의 `googleMapElement` 라는 `prop` 으로 마운트 됩니다. `GoogleMap` 의 `prop` 중에 `options` 라는 `prop` 이 있는데, 여기엔 [Google Maps 설정 객체] (https://developers.google.com/maps/documentation/javascript/reference#MapOptions) 를 넣어줍니다.

> <img width="30" src="https://cloud.githubusercontent.com/assets/16535279/17925023/3034ee66-6a26-11e6-9488-85be6a50901a.png"/><br/>
이 두 컴포넌트가 제 역활을 하기 위해서는 [index.html](https://github.com/hkgittt/hexbin-demo/blob/master/index.html#L7-L9) 에서 다음의 코드를 추가 해 주어야 합니다.

> ```html
<script type="text/javascript"
  src="https://maps.googleapis.com/maps/api/js?key=[API_KEY]&libraries=geometry,drawing,places,visualization">
</script>
```

> [Google Maps API 용으로 만드신 key] (https://developers.google.com/maps/documentation/javascript/get-api-key) 를 `[API_KEY]` 부분에 넣어주시면, synchronous 하게 Google Maps JavaScript API 를 로드하게 됩니다 (`google` 이라는 글로벌 변수가 생기게 됩니다). API 가 로드되지 않은상태에선 지도가 보이지 않습니다.

`GoogleMap` 컴포넌트의 children 으로 이제 react-google-maps 에서 제공하는 `Marker` 컴포넌트나, 커스텀 Overlay, 예를들면 `Hexbin` 컴포넌트를 넣어주면 지도 위에 표현이 됩니다 (`Hexbin` 컴포넌트도 내부적으로 react-google-maps 에서 제공하는 기본 `OverlayView` 를 사용합니다).

```javascript

// ... 코드 생략

import Hexbin from './Hexbin.js';

import fakeStoreLatLngData from './data/generated-data.json';

const MAP_PIXEL_HEIGHT = 600;
const HEX_PIXEL_RADIUS = 50;

class App extends Component {
  constructor() {
  }
  // ... 코드 생략
  render() {
    return (
      { ... 코드 생략 }
      <GoogleMapLoader
        query={{ libraries: 'geometry,places,visualization' }}
        containerElement={
          <div
            style={{ width: '100%', height: MAP_PIXEL_HEIGHT }}
          />
        }
        googleMapElement={
          <GoogleMap
            defaultZoom={12}
            options={{ mapTypeControl: false }}
            defaultCenter={{ lat: 37.518397, lng: 126.978886 }}
          >
            <Hexbin
              hexPixelRadius={HEX_PIXEL_RADIUS}
              mapPixelHeight={MAP_PIXEL_HEIGHT}
              data={fakeStoreLatLngData}
              colorRange={['white', 'rgb(242, 117, 165)']}
            />
          </GoogleMap>
        }
      />
    );
  }
}

// ... 코드 생략
```

`Hexbin` 컴포넌트가 받는 `prop` 들은 총 4가지 입니다. `hexPixelRadius` = 고정하고 싶은 육각형 통의 반지름 픽셀길이, `mapPixelHeight` 지도가 들어있는 `div`의 높이, `data` = 위치 데이터 배열, 그리고 `colorRange` = 상대적 밀집도를 표현할 색상 range 입니다.

그럼 이제 `Hexbin` 컴포넌트를 자세히 들여다볼 차례입니다.

#### <a name="walkthrough-0303"></a> Hexbin 컴포넌트

`Hexbin` 컴포넌트의 역활은 위치 데이터를 배열로 받아 그 데이터를 hexagonal binning 기법을 통해 시각화 해 주는 것입니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917326/4e896714-69f6-11e6-8895-e7fe7ad44269.png"/>
  <br/>
</p>

[Hexbin.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/Hexbin.js)

```javascript
import React, { Component, PropTypes } from 'react';
import { OverlayView } from 'react-google-maps';
import { hexbin } from 'd3-hexbin';
import { scaleLinear } from 'd3-scale';
import { interpolateLab } from 'd3-interpolate';
import { max } from 'd3-array';
import Hexagon from './Hexagon.js';

// ... 코드 생략
```
`Hexbin` 컴포넌트가 `import` 하는 모듈들입니다. D3 의 다양한 모듈중에 필요한 모듈들만 `import` 하고 있습니다. `OverlayView` 는 react-google-maps 에서 제공하는 컴포넌트인데, 지도위에 커스텀 element 를 올릴때 유용한 컴포넌트입니다.

먼저 `Hexbin` 컴포넌트의 `constructor` 부분을 보겠습니다.

```javascript
// ... 코드 생략

export default class Hexbin extends Component {
  constructor(props) {
    super(props);

    // method binding
    this.calculateHexPointRadius = this.calculateHexPointRadius.bind(this);
    this.addProjectedPoint = this.addProjectedPoint.bind(this);
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
    setTimeout(() => this.setState({ currentBounds: this.mapRef.getBounds(), currentProjection: this.mapRef.getProjection() }), 500);

    // set initial state
    this.state = {
      currentZoom: this.mapRef.getZoom(),
    };
  }
  // ... 코드 생략
}

// ... 코드 생략
```

`Hexbin` 컴포넌트 함수를 모두 바인딩 해 준 후에, `this.mapRef` 라는 변수에 `prop` 으로  받은 `mapHolderRef` 라는 객체의 `getMap()` 이라는 함수를 실행함으로서  `GoogleMap` 컴포넌트의 지도 객체를 저장해 줍니다 (`GoogleMap` 컴포넌트의 의 children 컴포넌트는 모두 `mapHolderRef` 라는 `prop` 을 자동으로 내려받습니다 react-google-maps 4.11.0 현제).

`this.mapRef` 는 이제 지도 객체에 event listener 를 추가하거나, 지도의 zoom level, bounds, 및 projection 을 access 하는 용도로 유용하게 쓰일 예정입니다.

`this.mapRef` 로 `GoogleMap` 지도 객체를 확보한 뒤 바로 이 지도 객체에다가 두가지 event listener 를 추가 해 줍니다. `dragend` 와 `zoom_changed` event 인데요, `dragend` 는 사용자가 마우스로 지도 영역을 새로 정의하였을때 그려야 하는 hexbin 들의 위치를 재정의 해주는 용도이고 (지도에 보이지 않는 hexbin 은 그리지 않습니다), `zoom_changed` event 는 사용자가 zoom level 을 바꾸었을때, 거기에 따라서 hexbin 크기를 새로 정의하고, 새로운 hexbin 들 안에다가 위치 데이터를 다시 계산하여 넣어야하기 때문에 필요한 listener 입니다.

그리고 그 다음엔 `Hexbin` 컴포넌트의 `state` 를 정의합니다. `state` 로 들어가는 변수는 딱 3가지 입니다: `currentZoom`, `currentBounds`, 그리고 `currentProjection` 입니다. 이 `state` 변수들이 바뀔때마다 `Hexbin` 컴포넌트는 다시 렌더링을 하게 됩니다.

여기서 조금 흥미로운 부분은, `this.mapRef.getBounds()` 나 `this.mapRef.getProjection()` 이 `constructor` 에서 synchronous 하게  실행되지 않는다는 점입니다 (실행하면 `undefined` 를 반환합니다). 그래서 이 두 함수는 500ms `setTimeout` 의 callback 함수에서 `setState` 함수를 통해 초기화 해줍니다.

반면에 `this.mapRef.getZoom()` 은 this.state 를 통해서 synchronous 하게 state 의 `currentZoom` 변수를 초기화 해줍니다.

`Hexbin` 컴포넌트의 정확한 메커니즘은 컴포넌트의 `render()` 함수 를 따라가보면 알수 있습니다.

```javascript
// ... 코드 생략

export default class Hexbin extends Component {

  // ... 코드 생략

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

// ... 코드 생략
```

`render()` 함수가 제일 먼저 만드는 변수는 `hexagons` 과 `colorScale` 입니다.

 먼저 `GoogleMap` 지도 객체가 준비된 상태에서 (`this.state.currentProjection` 이 존재하는 상태에서) `hexagons` 는 `makeNewHexagons()` 라는 컴포넌트 함수를 통해 만들어지는데요. d3-hexbin 이 이 시점에서 등장하게 됩니다.
 
 그럼 `makeNewHexagons()` 함수를 따라 가보도록 하겠습니다.
 
 ```javascript
 // ... 코드 생략
 
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

    // caculate the hexagons
    hexagons = hexbinGenerator(this.props.data.map(this.addProjectedPoint));

    return hexagons.map((hexagon, idx) => { hexagon.id = idx; return hexagon }); // in order to give unique keys
  }

  // ... 코드 생략
 ``` 
먼저 `prop` 으로 받아야 하는 위치 데이터가 존재하지 않으면 빈 배열을 반환합니다. Hexbin 을 만들수가 없겠죠?

만약 데이터가 존재한다면, `hexbinGenerator` 라는 변수를 선언하는데요, 이 변수는 hexbin 배열을 만들어내는 generator 입니다.

d3-hexbin 모듈을 사용할때 절차입니다:

1. d3-hexbin 의 `hexbin()` 은 기본적으로 `hexbin` generator 를 반환합니다 (`const hexbinGenerator = hexbin()`).
2. Generator 는 `radius()` 함수를 통해 먼저 hexbin 의 반지름을 정해준뒤 (`hexbinGenerator.radius(RADIUS)`),
2. 위에서 반환한 `hexbin` generator 에 위치 데이터 배열을 넘겨주면 (`hexbinGenerator(DATA)`), hexbin 배열을 계산해서 반환합니다.
	* 여기서 hexbin 배열이라함은  
```
[
	[],
]
```

* 이 배열을 바탕으로 `Hexagon` 컴포넌트가 hexbin 들을 지도위에 그려줍니다.

d3-hexbin 모듈에 대한 정확한 사용법은 공식 [Github Repo] (https://github.com/d3/d3-hexbin) 에서 확인 바랍니다.

> <img width="30" src="https://cloud.githubusercontent.com/assets/16535279/17925023/3034ee66-6a26-11e6-9488-85be6a50901a.png"/><br/>
d3-hexbin 을 사용하기 위해선 위치 데이터를 먼저 2D Projection 을 해 주어야 합니다. 왜냐하면 위도 경도는 2D 좌표가 아니기 때문입니다.

> <p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17960424/ef0ef204-6ae0-11e6-8827-c9a556883a44.png"/>
  <br/>
</p>
> Google Map API 에서 제공하는 `Projection` 이라는 객체가 있는데, 이 객체는 위도 경도를 2D 좌표 (포인트 좌표)로 변환해주는 `fromLatLngToPoint()` 라는 함수와, 2D 좌표를 다시 위도 경도로 변환해주는 `fromPointToLatLng()` 이라는 함수를 가지고 있습니다. `Hexbin` 컴포넌트에는 `currentProjection` 이라는 `state` 변수가 있는데, 바로 이 변수가 `Projection` 객체입니다.
> 
> 위에 `makeNewHexagons()` 함수에서 `hexbinGenerator` 에다가 위치데이터를 넘겨줄때 위도경도 데이터를 포인트 좌표로 `map` 해주는것을 볼수 있습니다. `hexagons = hexbinGenerator(this.props.data.map(this.addProjectedPoint));`


#### <a name="walkthrough-0304"></a> Hexagon 컴포넌트

Hexagon 컴포넌트는 presentational 컴포넌트입니다. Hexbin 컴포넌트에서 육각형통을 그릴때 사용하는 컴포넌트입니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917330/51f43104-69f6-11e6-9720-e81dc9a63cd3.png"/>
  <br/>
</p>

[Hexagon.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/Hexagon.js)

d3-hexbin 이 제공하는 함수중에 반지름을 넣어주면 그 크기의 육각형 path 를 반환하는 함수가 있습니다. 이 path 를 svg 의 path element 로 넘겨줍니다. 여기서 d3-scale 과 d3-interpolate 를 사용하여 hexbin 의 상대적 밀집도를 계산하고, 색상을 정해줍니다.

> <img width="30" src="https://cloud.githubusercontent.com/assets/16535279/17925023/3034ee66-6a26-11e6-9488-85be6a50901a.png"/><br/>
React 와 D3 를 같이 논의할때 빠져서는 안되는 포인트가 하나 있는데요, 그건 바로 누가 DOM 에 대한 접근을 담당하느냐에 대한 것입니다. 만약 D3 가 담당하게 되면 간단히 생각해서 React 프로젝트 내에 조그만한 D3 영역이 생기는 것입니다. D3 를 내제하고 있는 React 컴포넌트의 `shouldComponentUpdate` lifecycle hook 에서 항상 `false` 값을 반환하고, [`findDOMNode()`](https://facebook.github.io/react/docs/top-level-api.html#reactdom.finddomnode) 를 통해 컴포넌트의 DOM 을 가져온뒤 D3의 `enter()`, `update()`, `exit()` 함수에 의존합니다. 그와 반대로 React 의 선천적으로 강한 DOM 제어능력을 살려서 D3 는 어디까지나 데이터 가공에만 사용하는 방법이 두번째 방법입니다. 후자가 바로 메쉬코리아에서 택한 React 와 D3 를 같이 사용하는 방법입니다. D3 와 주로 같이 사용하는 `svg` 태그를  포함한 대부분의 태그들을 [React (Virtual) DOM](https://facebook.github.io/react/docs/tags-and-attributes.html) 이 지원합니다.

## Wrap-up
ES2015 syntax 로 짜여진 React 코드가 낮설지 않으시다면, live demo 소스코드를 이해하시는데 큰 무리는 없으실겁니다. Walkthrough 섹션 참고하시면서 소스코드를 읽어 보시는 것을 권장 드립니다. 혹시 이상한 부분이나 

## Citation
<img width="25" style="float: left; margin-right: 10px" src="https://cloud.githubusercontent.com/assets/16535279/17925023/3034ee66-6a26-11e6-9488-85be6a50901a.png"/>
<div>Icon made by <a href="http://www.flaticon.com/authors/roundicons" title="Roundicons">Roundicons</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

generated-data.json created with [JSON GENERATOR] (http://www.json-generator.com)