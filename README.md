# React, Google Maps, D3 를 이용한 Hexagonal Binning 기법

> 위치기반 데이터를 시각화 할때 기본 분포도 보다 더 좋은 방법은 없을까?

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17847211/c66f66fe-6887-11e6-88a8-3f80d4abad9b.png"/>
</p>

## 목차
1.  [결과물](#end-product)
2.  [포스트의 목적](#objective)
3.  [요리 재료 소개](#core-library)
4.  [조리하기](#walkthrough)
5.  [마치며](#closing)
6.  [License](#license)

<a name="end-product"></a>
## 1. 결과물

  <img src="https://cloud.githubusercontent.com/assets/16535279/18374131/2d32e36a-7685-11e6-9722-71217bc1b69d.gif"/>

육각통(Hexagonal Binning 또는 hexbin) 기법을 적용한 강남구 지역의 위치 데이터 분포도입니다. 육각통 안에 표시된 숫자는 그 통안에 존재하는 데이터 포인트의 수 입니다. 육각통의 짙고옅음으로 밀집도를 한 눈에 파악할 수 있습니다.

-   [라이브 데모 페이지](https://meshkorea.github.io/hexbin-demo/)
-   [라이브 데모의 소스 코드](https://github.com/meshkorea/hexbin-demo)

<a name="objective"></a>
## 2. 포스트의 목적

비즈니스 인텔리전스(Business Intelligence 또는 BI)란 원시 데이터를 수집하여 의미 있는 정보로 가공하여 사업적인 의사결정에 도움을 주는 시스템입니다.

(주)메쉬코리아에서는 자사의 서비스인 '부탁해!'의 지역별 상점 영업 상태를 조금 더 직관적으로 보고 싶었습니다. 가장 간단한 방법은 영업 중인 상점의 위치를 지도 위에 마커로 표시하는것입니다. 하지만 이러한 단순한 분포도는 지도를 확대 축소할 때 정보를 인지하기가 어려운 문제가 있습니다. 그래서 육각통 기법을 이용해서 비즈니스 인텔리전스를 구현해 보기로 했습니다.

이 포스트를 통해 우리 랩이 React, Google Maps, 그리고 D3를 이용해 비즈니스 인텔리전스를 구현한 경험을 나누고자 합니다. 이 포스트를 읽는 독자 여러분들의 경험치는 천차만별이라 생각합니다. React와 D3에 대한 숙련도의 차이를 무시하고, 최대한 간결하면서도 누락됨이 없이 데모코드 및 포스트를 작성했습니다. 읽고 이해하는데 다소 어려움이 있다면, 언제든 댓글로 질문을 남겨 주세요. 예를 들어 요즘 React 와 같이 많이 사용하는 상태 관리 라이브러리인 Redux는 사용하지 않습니다. 이 포스트 및 라이브 데모에는 필요없기 때문입니다.

그리고 프로젝트 스캐폴딩(Scaffolding)을 위해 [`create-react-app`](https://github.com/facebookincubator/create-react-app)이라는 React 프로젝트 스타터 킷을 이용했습니다. React 프로젝트 해 보신 분은 아시겠지만, webpack, babel, eslint 등등 진입장벽이 꽤 높습니다. 이 프로젝트에 적용한 스타터 킷을 이용하면 명령 한 줄(`$ create-react-app my-app && cd my-app`)로 프로젝트 뼈대 구조를 빠르게 생성할 수 있습니다. 파워유저라면 `$ npm run eject` 명령을 이용하여 자신만의 보일러플레이트(Boilerplate)를 만들 수도 있습니다.

<a name="core-library"></a>
## 3. 요리 재료 소개

### 3.1. React

[React](https://facebook.github.io/react/)는 페이스북에서 UI 개발을 위해 만들고 공개한 오픈소스 자바스크립트 라이브러리입니다. (주)메쉬코리아에서도 2016년 1월부터 프로젝트에 적용을 시작해 점진적으로 적용 범위를 확장해 나가고 있습니다. 8 개월 동안의 사용 경험을 요약하자면 '만족'입니다. 특히 컴포넌트를 이용한 설계 패러다임이 굉장히 만족스럽습니다. 또 우리 회사는 ES2015(ES6)도 적극 적용하고 있습니다.

### 3.2. Google Maps

Google Maps 는 다들 아시죠? 위치 기반 서비스를 개발할 수 있는 API를 제공합니다. 우리는 [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)를 React 컴포넌트화해 놓은 [react-google-maps](https://github.com/tomchentw/react-google-maps) (v4.11.0) 를 사용합니다.

### 3.3. D3


[D3](https://d3js.org/)는 컴퓨터 공학자이자 데이터 시각화 전문가인 마이크 보스톡(Mike Bostock)이 만든 오픈소스 라이브러리입니다. 미가공 데이터를 다루기에 유용한 함수과 쉬운 문법으로 가공된 데이터를 DOM 에 렌더링할수 있는 유틸리티 함수들을 제공합니다. 또, D3 4.0에서 컴포넌트별 모듈화를 채용해서 React 개발자들에게는 반가운 소식입니다. 이 포스트의 라이브 데모 프로젝트는 d3-hexbin, d3-scale, d3-interpolate 모듈들을 사용했습니다.

> <img width="30" src="https://cloud.githubusercontent.com/assets/16535279/17925023/3034ee66-6a26-11e6-9488-85be6a50901a.png"/>
>
> React와 D3를 같이 사용할 때 DOM에 대한 접근을 주체를 결정해야 합니다. 만약 D3가 담당하게 되면 React 프로젝트에 조그만한 D3 영역이 생긴다고 볼 수 있습니다. D3를 내재하는 React 컴포넌트의 `shouldComponentUpdate` 생명 주기 훅(Lifecycle Hook)에서 항상 `false` 값을 반환하여 React의 DOM 접근을 무효화합니다. 그리고 [`findDOMNode()`](https://facebook.github.io/react/docs/top-level-api.html#reactdom.finddomnode)를 통해 컴포넌트의 DOM을 가져온 뒤 D3의 `enter()`, `update()`, `exit()` 함수를 이용하여 DOM을 조작합니다.
>
> 반대로 React가 DOM에 접근하는 방법입니다. React의 강력한 DOM 제어 능력을 살리고 D3는 데이터 가공에만 사용하는 방법입니다. 이 프로젝트 및 (주)메쉬코리아가 사용하는 방법입니다. `<svg>` 태그를 포함한 대부분의 태그들을 [React (Virtual) DOM](https://facebook.github.io/react/docs/tags-and-attributes.html)으로 조작할 수 있습니다.

<a name="walkthrough"></a>
## 4. 조리하기

육각통 기법을 사용하는 방법을 소스코드를 보며 천천히 하나씩 짚어보겠습니다.

-   [4.1. 육각통 기법이란?](#walkthrough-01)
-   [4.2. 데이터](#walkthrough-02)
-   [4.3. 컴포넌트 구조](#walkthrough-03)
    -  [4.3.1. App 컴포넌트](#walkthrough-0301)
    -  [4.3.2. GoogleMapLoader와 GoogleMap 컴포넌트](#walkthrough-0302)
    -  [4.3.3. Hexbin 컴포넌트](#walkthrough-0303)
    -  [4.3.4. Hexagon 컴포넌트](#walkthrough-0304)

<a name="walkthrough-01"></a>
### 4.1. 육각통 기법이란?

육각통 기법은 기본 분포도(distribution map)와 많이 다르지 않습니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17880029/8718303a-6931-11e6-8d1a-b331d3f78a87.png"/>
  <br/>
  데이터 포인트가 하나의 점으로 표시됩니다.
</p>

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17880030/87187c66-6931-11e6-805e-2a6201575515.png"/>
  <br/>
  데이터 포인트들을 특정 크기의 육각형 안에 넣는 것을 '육각통 기법'이라고 합니다.
</p>

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17885277/80bb9efe-6957-11e6-874f-c51e5b80a3e3.png"/>
  <br/>
  데이터 포인트의 개수에 따라 그에 맞는 색상을 적용합니다.
</p>

<a name="walkthrough-02"></a>
### 4.2. 데이터

모든 시각화의 시작은 데이터입니다.

```javascript
// 위치 데이터
const singleLocation = { "lat": 37.505434, "lng": 127.026385 };
```

하나의 위치 데이터는(예: 어떤 상점의 위치) 위도와 경도를 가지고 있는 자바스크립트 객체입니다.

```javascript
// 위치 데이터를 모아놓은 배열
const multipleLocations = [
  { "lat": 37.505434, "lng": 127.026385 },
  { "lat": 37.516167, "lng": 127.040858 },
  {...},
];
```

라이브 데모 프로젝트에서는 위치 데이터를 [JSON 파일](https://github.com/meshkorea/hexbin-demo/blob/master/src/data/generated-data.json)로 사용합니다. `webpack`의 `json-loader`를 이용해서 데이터 파일을 프로젝트로 가져옵니다([코드](https://github.com/meshkorea/hexbin-demo/blob/master/src/App.js#L8)). 실무 프로젝트에선 서버에서 비동기 방식으로 불러오겠죠?

<a name="walkthrough-03"></a>
### 4.3. 컴포넌트 구조

이 프로젝트의 진입점인 [index.js](https://github.com/meshkorea/hexbin-demo/blob/master/src/index.js)는 최상위 컴포넌트인 `App` 컴포넌트를 불러옵니다([코드](https://github.com/meshkorea/hexbin-demo/blob/master/src/index.js#L6-L9)).

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917353/9fcda3b0-69f6-11e6-8bbd-23667efb9393.png"/>
  <br/>
</p>

<a name="walkthrough-0301"></a>
#### 4.3.1. App 컴포넌트

`App` 컴포넌트부터 차례대로 살펴 보겠습니다. `App` 컴포넌트는 `react-google-map`에서 제공하는 `GoogleMapLoader` 컴포넌트를 임포트 합니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917322/49a7eda6-69f6-11e6-8046-8135637e0a4a.png"/>
  <br/>
</p>

```javascript
// src/App.js

import React, { Component } from 'react';
// 코드 생략
import { GoogleMapLoader, GoogleMap, Marker } from 'react-google-maps';
import fakeStoreLatLngData from './data/generated-data.json';
// 코드 생략

class App extends Component {
  constructor() {
  }

  // 코드 생략

  render() {
    return (
      { /* ... */ }
      <GoogleMapLoader
        { /* ... */ }
      />
    );
  }
}
```

`fakeStoreLatLngData`는 위치 데이터를 배열로 가지고 있는 [`generated-data.json`](https://github.com/meshkorea/hexbin-demo/blob/master/src/data/generated-data.json) 파일을 `JSON.parse()` 를 통해 자바스크립트 배열로 가공해줍니다 (이 부분을 `webpack` 의 `json-loader` 가 합니다).

<a name="walkthrough-0302"></a>
#### 4.3.2. GoogleMapLoader와 GoogleMap 컴포넌트

`App` 컴포넌트에서 임포트된 `GoogleMapLoader` 컴포넌트와 `GoogleMap` 컴포넌트를 조금 더 자세히 살펴보겠습니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917323/4b54a040-69f6-11e6-9c9d-13625c13947f.png"/>
  <br/>
</p>

`GoogleMapLoader` 컴포넌트가 `GoogleMap` 컴포넌트를 사용할 수 있게 해 줍니다.


```javascript
// src/App.js

import { GoogleMapLoader, GoogleMap, Marker } from 'react-google-maps';

// 코드 생략

const MAP_PIXEL_HEIGHT = 600;

class App extends Component {
  constructor() {
  }
  // 코드 생략
  render() {
    return (
      { /* 코드 생략 */ }
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
          { /* 코드 생략 */ }
          </GoogleMap>
        }
      />
    );
  }
}
```

`GoogleMapLoader`의 속성 값 중 `containerElement`는 Google Map을 렌더링할 컨테이너를 지정합니다. `div`를 하나 넣어주고 `height`를 위에서 정의한 `MAP_PIXEL_HEIGHT` 상수의 값으로로 지정합니다. `MAP_PIXEL_HEIGHT`는 나중에 zoom level에 따라 육각형의 크기를 재계산할 때 사용합니다.

`GoogleMap` 컴포넌트는 `GoogleMapLoader`의 `googleMapElement`라는 속성으로 마운트됩니다. `GoogleMap`의 속성 중에 `options`라는 속성이 있는데, 여기엔 [Google Maps 설정 객체](https://developers.google.com/maps/documentation/javascript/reference#MapOptions)를 넣어줍니다.

> <img width="30" src="https://cloud.githubusercontent.com/assets/16535279/17925023/3034ee66-6a26-11e6-9488-85be6a50901a.png"/>
>
> 이 두 컴포넌트가 제대로 작동하기 위해서는 `index.html`에 다음 코드를 추가 해야 합니다.

> ```html
> <script type="text/javascript"
>   src="https://maps.googleapis.com/maps/api/js?key=[API_KEY]&libraries=geometry,drawing,places,visualization">
> </script>
> ```
>
> [Google Maps API 키](https://developers.google.com/maps/documentation/javascript/get-api-key)를 `[API_KEY]` 자리 표시자에 넣어줍니다. 이 때 `google` 이라는 글로벌 변수가 선언됩니다. 이 라이브러리가 로드되어야 지도가 보입니다.

`GoogleMap` 컴포넌트의 자식 노드로 `react-google-maps`에서 제공하는 `Marker` 컴포넌트나 커스텀 오버레이를 쓸 수 있습니다. 예를들어 `Hexbin` 컴포넌트를 넣어주면 지도 위에 육각형을 표현할 수 있습니다. 참고로 `Hexbin` 컴포넌트도 `react-google-maps` 에서 제공하는 기본 `OverlayView`를 사용합니다.

```javascript
// src/App.js

// 코드 생략
import Hexbin from './Hexbin.js';
import fakeStoreLatLngData from './data/generated-data.json';

const MAP_PIXEL_HEIGHT = 600;
const HEX_PIXEL_RADIUS = 50;

class App extends Component {
  constructor() {
  }
  // 코드 생략
  render() {
    return (
      { /* 코드 생략 */ }
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
```

`Hexbin` 컴포넌트가 받는 속성 값은 총 네 가지입니다.

-   `hexPixelRadius`: 육각통의 반지름 픽셀 길이
-   `mapPixelHeight`: 지도가 들어있는 `div` 컨테이너의 높이
-   `data`: 위치 데이터 배열
-   `colorRange`: 상대적 밀집도를 표현할 색상 범위

<a name="walkthrough-0303"></a>
#### 4.3.3. Hexbin 컴포넌트

이제 `Hexbin` 컴포넌트를 자세히 들여다 볼까요? `Hexbin` 컴포넌트는 위치 데이터 배열을 받아 육각통 기법으로 시각화합니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917326/4e896714-69f6-11e6-8895-e7fe7ad44269.png"/>
  <br/>
</p>

```javascript
// src/Hexbin.js

import React, { Component, PropTypes } from 'react';
import { OverlayView } from 'react-google-maps';
import { hexbin } from 'd3-hexbin';
import { scaleLinear } from 'd3-scale';
import { interpolateLab } from 'd3-interpolate';
import { max } from 'd3-array';
import Hexagon from './Hexagon.js';

// 코드 생략
```

`Hexbin` 컴포넌트가 임포트하는 모듈들입니다. D3의 다양한 모듈 중에 필요한 모듈들만 임포트하고 있습니다. `OverlayView`는 `react-google-maps`에서 제공하는 컴포넌트인데, 지도 위에 커스텀 엘리먼트를 표현할 때 유용한 컴포넌트입니다.

먼저 `Hexbin` 컴포넌트의 생성자(`constructor`)부분을 보겠습니다.

```javascript
// src/Hexbin.js

// 코드 생략

export default class Hexbin extends Component {
  constructor(props) {
    super(props);

    // 함수에 컨텍스트 바인딩
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
  // 코드 생략
}
```

`Hexbin` 컴포넌트 함수를 모두 바인딩했습니다. 함수를 여기서 바인딩 해주는 이유는 이 [포스트](https://medium.com/@housecor/react-binding-patterns-5-approaches-for-handling-this-92c651b5af56)를 참고하세요. `this.mapRef`라는 변수에 속성 값으로 받은 `mapHolderRef`라는 객체의 `getMap()`이라는 함수를 실행하여  `GoogleMap` 컴포넌트의 지도 객체를 할당했습니다. `GoogleMap` 컴포넌트의 자식 컴포넌트는 모두 `mapHolderRef` 라는 속성을 자동으로 상속받습니다.

`this.mapRef`는 지도 객체에 이벤트 리스너를 추가하거나 지도의 zoom level, bounds, projection 등의 값에 접근하는 용도로 쓸 수 있습니다.

`this.mapRef`로 `GoogleMap` 지도 객체를 얻고, 바로 이 지도 객체에 다음 두 가지 이벤트 리스너를 추가합니다. `dragend`와 `zoom_changed` 이벤트인데요.

-   `dragend`: 사용자가 마우스로 지도 영역을 새로 정의하였을때 육각통들의 위치를 재정의하는 함수 `handleBoundsChange()`
-   `zoom_changed`: 사용자가 zoom level을 바꾸었을때 거기에 따라서 육각통의 넓이를 새로 정의하고, 새로운 육각통들 안에다가 위치 데이터를 다시 계산하여 넣는 함수(지도에 보이지 않는 육각통은 그리지 않습니다) `handleZoomChange()`

다음으로 `Hexbin` 컴포넌트의 `state`를 정의합니다. `state`로 들어가는 변수는 세 가지 입니다. 이 `state` 변수들이 바뀔 때마다 `Hexbin` 컴포넌트는 다시 렌더링합니다.

-   `currentZoom`
-   `currentBounds`
-   `currentProjection`

여기서 조금 흥미로운 부분은 `this.mapRef.getBounds()`나 `this.mapRef.getProjection()`이 생성자에서 동기적으로 실행되지 않는다는 점입니다(실행하면 `undefined`를 반환합니다). 그래서 이 두 함수는 500 밀리 초(ms) 지연시켜(`setTimeout`) `setState` 함수를 호출해 초기화 해야 합니다.

반면에 `this.mapRef.getZoom()`은 `this.state` 를 통해서 동기적으로 `state`의 `currentZoom` 변수를 초기화 해줍니다.

`Hexbin` 컴포넌트의 정확한 메커니즘은 컴포넌트의 `render()` 함수를 따라가보면 알 수 있습니다. 같이 따라가 볼까요?

```javascript
// src/Hexbin.js

// 코드 생략

export default class Hexbin extends Component {

  // 코드 생략

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
```

`render()` 함수가 제일 먼저 만드는 변수는 `hexagons`와 `colorScale` 입니다.

 먼저 `GoogleMap` 지도 객체가 준비된 상태에서(`this.state.currentProjection`이 셋팅된 상태) `hexagons` 변수는 `makeNewHexagons()`라는 컴포넌트 함수를 통해 만들어지는데요, `d3-hexbin`이 등장하기 시작합니다.

`makeNewHexagons()` 함수를 따라 가보도록 하겠습니다.

```javascript
// src/Hexbin.js

// 코드 생략

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
```

먼저 속성 값을 통해 받아야 하는 위치 데이터가 존재하지 않으면 빈 배열을 반환합니다. 육각통을 만들수가 없겠죠?

만약 데이터가 존재한다면 `hexbinGenerator` 라는 변수를 선언하는데요, 이 변수는 `hexbin` 배열을 만들어내는 제너레이터입니다.

다음은 `d3-hexbin` 모듈을 사용하는 절차입니다.

1.  `d3-hexbin` 의 `hexbin()`은 기본적으로 육각통 제너레이터를 반환합니다 (`const hexbinGenerator = hexbin()`).
2.  제너레이터는 `radius()` 함수를 통해 반환할 육각통의 반지름을 정합니다 (`hexbinGenerator.radius(RADIUS)`).
3.  제너레이터의 `x()`, `y()` 함수를 통해 넘겨줄 위치데이터의 `x` 와 `y` 값을 추출하는 함수를 넣어줍니다 (`hexbinGenerator.x(d => d.x)`).
3.  1 에서 생성한 `hexbinGenerator`에 위치 데이터 배열을 넘겨주면 (`hexbinGenerator(DATA)`), 육각통들의 배열을 계산해서 반환합니다.

	* 육각통 배열이라함은

	```javascript
	// 1. 모든 육각통들을 나타내는 배열
	[
	  // 2. 하나의 육각통을 나타내는 배열
	  [
	    // 3a. 하나의 육각통에 들어있는 하나의 위치 객체
	    {
	      x: 218.22502328888885,
	      y: 99.17794119756525,
	    },
	    // 3b. 같은 육각통에 들어있는 또다른 위치 객체
	    {
	      x: 218.22201528888885,
	      y: 99.17285021805677,
	    },
	  ],
	  [...],
	  ...,
	]
	```
이고, 위에서 표현되진 않았지만 2. 배열은 `x` 와 `y` 속성을 가지는데 (자바스크립트 배열도 객체입니다), 바로 이 속성이 각 육각통 정중앙의 `x`, `y` 위치 입니다. 이 모든 정보들를 가지고 우리는 육각통들을 지도 위에 그릴 수 있습니다.

`d3-hexbin` 모듈에 대한 정확한 사용법은 [공식 저장소](https://github.com/d3/d3-hexbin)에서 확인 바랍니다.

> <img width="30" src="https://cloud.githubusercontent.com/assets/16535279/17925023/3034ee66-6a26-11e6-9488-85be6a50901a.png"/>
>
>  잠시만요, 갑자기 위치 데이터가 위도, 경도에서 x, y 로 바뀌지 않았나요?!
> 
> `d3-hexbin` 을 사용하기 위해서는 위치 데이터를 먼저 2차원 투영(2D Projection)해  주어야 합니다. 왜냐하면 위경도는 2D 좌표가 아니기 때문입니다.
>
> <p align="center"><img src="https://cloud.githubusercontent.com/assets/16535279/18377256/f362c332-76a0-11e6-86e9-6723ea125569.png"/><br/></p>
>
> Google Map API에서 제공하는 `Projection` 이라는 객체가 있는데, 이 객체는 구면좌표인 위경도를 2D 좌표(포인트 좌표)로 변환해주는 `fromLatLngToPoint()` 라는 함수와, 2D 좌표를 다시 위경도로 변환해주는 `fromPointToLatLng()`이라는 함수를 가지고 있습니다. `Hexbin` 컴포넌트에는 `currentProjection` 이라는 `state` 변수가 있는데, 바로 이 변수가 `Projection` 객체입니다.
>
> 위에 `makeNewHexagons()` 함수에서 `hexbinGenerator`에다가 위치 데이터를 넘겨줄 때 위경도 데이터를 포인트 좌표로 `map` 해주는 것을 볼 수 있습니다(`hexagons = hexbinGenerator(this.props.data.map(this.convertLatLngToPoint));`).

마지막으로 짚고 넘어가야할 부분이 `calculateHexPointRadius()` 인데요, 이 함수는 우리가 최상위 컴포넌트에서 정의한 `HEX_PIXEL_RADIUS`, 즉 육각통의 반지름 픽셀길이가 실제 2D 좌표에서 어떤 값이 되야하는지 계산하는 함수입니다. 어떤 zoom level 에서든지 보여지는 육각통의 픽셀넓이가 같으려면, zoom level 에 따라 그 육각통의 실제 차지하는 죄표상 위치적 넓이는 변화해야겠죠? 계산방법은 실제로 간단합니다. 보여지는 지도의 픽셀 높이와 `mapPixelHeight` 육각통의 픽셀 반지름 `hexPixelRadius` 의 비례가 포인트 좌표상의 높이와 포인트 좌표상의 육각통 반지름의 비례가 같아야하는 공식이 성립하면 됩니다.

`render()` 함수가 다음으로 만드는 변수는 `colorScale`이고, 육각통을 그릴때 필요한 색상을 계산하는 함수입니다. `makeNewColorScale()`함수는 `d3-hexbin` 으로 만든 육각통 배열을 넘겨주면 `d3-scale` 과 `d3-interpolate` 를 사용하여 각 육각통의 상대적 밀집도를 색상으로 표현할수 있는 스케일 함수를 반환합니다. 이제 육각통들을 그릴 준비가 끝났습니다. `react-google-maps` 가 제공하는 `OverlayView` 컴포넌트에 다음 소개할 `Hexagon`컴포넌트를 넣어줍니다. 여기서 `OverlayView` 컴포넌트의 `position` 속성은 위경도를 요구하기때문에 각 육각형통의 중앙포인트를 다시 위경도로 바꿔줍니다.

<a name="walkthrough-0304"></a>
#### 4.3.4. Hexagon 컴포넌트

`Hexagon` 컴포넌트는 프리젠테이션 컴포넌트입니다. `Hexbin` 컴포넌트에서 육각통을 그릴 때 사용하는 컴포넌트입니다.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17917330/51f43104-69f6-11e6-9720-e81dc9a63cd3.png"/>
  <br/>
</p>

`d3-hexbin`이 제공하는 함수 중에 반지름을 넣어주면 그 크기의 육각형 데이터(Path)을 반환하는 함수가 있습니다. 이 데이터를 Svg의 `<path>` 엘리먼트로 넘겨줍니다.

```javascript
// src/Hexagon.js

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

```

`Hexagon` 컴포넌트의 소스 코드는 간단합니다. 그릴 육각통의 픽셀 반지름 길이와, 색상, 그리고 안에 들어갈 숫자는 모두 속성으로 `Hexbin` 컴포넌트에게로 부터 내려 받습니다. 여기서 `top`, `left` 또는,`transform` 을 이용하여 그래픽을 오프셋 하는 이유는 다음 그림이 더 쉽게 설명할수있을것 같습니다.
<p align="center"><img src="https://cloud.githubusercontent.com/assets/16535279/18336394/cf7fcce2-75c1-11e6-8113-c0fbdd58ee49.png"/><br/></p>

<a name="closing"></a>
## 5. 마치며

ES2015 문법과 React 코드가 낯설지 않다면, 라이브 데모 소스 코드를 이해하시는데 큰 무리는 없을 겁니다. [4. 조리하기](#walkthrough) 섹션을 참고하면서 스스로 소스 코드를 읽어 보실 것을 권장합니다.

<a name="license"></a>
## 6. License
* MIT License
* Sample JSON data created with [JSON GENERATOR](http://www.json-generator.com)

<img width="25" style="float: left; margin-right: 10px" src="https://cloud.githubusercontent.com/assets/16535279/17925023/3034ee66-6a26-11e6-9488-85be6a50901a.png"/>Icon made by [Roundicons](http://www.flaticon.com/authors/roundicons) from [www.flaticon.com](http://www.flaticon.com) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)
