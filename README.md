# React, Google Maps, D3 를 이용한 Hexagonal Binning 기법

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


## <a name="end-product"></a>결과물

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/16535279/17847619/e4e94670-6889-11e6-9d73-b396d7d8cba7.png"/>
</p>

Hexagonal Binning 기법이 적용된 강남구 지역 위치 데이터 분포도입니다. 육각형 통( = hexagonal bin 이하 hexbin) 안에 숫자는 그 육각형 통이 차지하고있는 지역 안에 존재하는 데이터 포인트의 수 입니다. 밀집도를 한눈에 볼수 있도록 각 hexbin 의 색의 짙고 연함을 현재 zoom level 의 상대적 밀집도와 맵핑이 될 수 있도록 컬러 코딩하였습니다.


* Live demo 페이지
* [Live demo 소스코드 Github 페이지] (https://github.com/hkgittt/hexbin-demo)

## <a name="objective"></a>포스트의 목적

Business Intelligence 란 서비스에 있어서 다음 액션을 취하는데 필요한 객관적인 정보입니다. 메쉬코리아 커머스랩에선 부탁해! 지역별 상점 영업상태를 조금 더 직관적으로 보고싶었습니다. 가장 간단한 방법은 상점의 위치를 지도위에 마커로 표시하는것입니다. 하지만 이러한 단순한 분포도는 zoom level 에 따라서 유용성의 차이가 커서, 조금더 좋은 방법이 없을까 고민하던 찰나에 hexagonal binning 이라는 기법을 접하게 되었습니다.

이 포스팅의 목적은 조금이나마 저희들이 React, Google Maps, 그리고 D3 를 이용해 hexagonal binning 기법을 시행한 경험을 나누고 싶었습니다. 공개된 live demo 페이지의 소스코드를 함께 살펴볼까 합니다. 여러분의 React, D3 와의 숙련도에 따라서 어려울수도 있고 쉬울수도 있겠지만, 소스코드는 최대한 군더더기를 빼고 필요한 부분만 남겨두었습니다. 예를 들면, 요즘 React 와 같이 많이 사용하는 state 관리 library 인 Redux 는 사용하지 않습니다. Redux 의 유용성을 부정하는것이 아니고, 엄밀히 말해서 이 live demo 에서는 필요가 없기 때문입니다. Live demo 소스코드 자체도 [create-react-app] (https://github.com/facebookincubator/create-react-app) 이라는 프로젝트 스타터 킷을 사용하였습니다 (Facebook Incubator 에서 나온 프로젝트입니다). React 프로젝트 세팅을 제대로 해 보셨다면 아시겠지만, webpack, babel, eslint 및 구성요소가 많은데, create-react-app 은 [커멘드 한줄] (https://github.com/facebookincubator/create-react-app#creating-an-app) 로 React 프로젝트를 시작할수 있습니다. 또 혹시나 뒤에서 어떤 세팅이 적용되고있는지 궁금하신 분들을 위해 `npm run eject` 커맨드, 즉 세팅 파일들을 unlock 하는 기능도 내제하고 있습니다.

## <a name="core-library"></a>Front-End Core Library

### React
요즘 [React] (https://facebook.github.io/react/) 가 핫합니다. React 는 Facebook 사가 직접만든 UI 개발용 open-source JavaScript library 입니다.
메쉬코리아에서는 2016년 1월 React 를 높이 평가하여, 내부 web application 에 점진적으로 도입하고 있는데요, React 가 제공하는 컴포넌트 디자인 파라다임에 굉장히 만족하고있습니다. 그리고 어떻게 하면 더욱 효과적으로 사용할수 있을까에 대해서 항상 고민하고 있습니다.

### Google Maps
Google Maps 는 다들 아시죠? 위치 기반 서비스를 개발할수 있도록 해주는 API 를 제공합니다. 대안으로는 Naver Map 또는 Daum Maps 가 있겠죠?
저희는  [Google Maps JavaScript API] (https://developers.google.com/maps/documentation/javascript/) 를 React 컴포넌트화 시킨 [react-google-maps] (https://github.com/tomchentw/react-google-maps) 를 사용했습니다.

### D3
[D3] (https://d3js.org/) 는 컴퓨터 공학자이자, 데이터 시각화 전문가인 Mike Bostock 이 만든 [open-source libary] (https://github.com/d3/d3) 로서, raw data 를 다루기에 유용한 함수들부터, 가공된 data 를 효율적으로 DOM 에 렌더링해줄수 있는 유틸리티 함수들을 하나의 library 에 모아서 제공합니다. 또 React 개발자들에게 좋은 소식은, D3 가 4.0 버전으로 올라오면서 모듈화를 선언했다는 점입니다. 이 포스트에서는 구체적으로 D3 의 d3-hexbin, d3-scale, d3-interpolate 모듈들을 사용하여 완성하였습니다.

## <a name="walkthrough"></a>Walkthrough

Hexagonal binning 기법을 사용하는 방법을 소스코드를 보며 천천히 하나씩 짚어보겠습니다.
먼저 Hexagonal binning 기법에 대한 기본적 개념으로 시작합니다.

1. [Hexagonal binning 기법이란?] (#walkthrough-01)
* [Data] (#walkthrough-02)
* [최상위 App 컴포넌트] (#walkthrough-03)
* [react-google-maps 와 2D Projection] (#walkthrough-04)
* [Hexbin 컴포넌트] (#walkthrough-05)
* [Hexagon 컴포넌트] (#walkthrough-06)

### <a name="walkthrough-01"></a>1. Hexagonal binning 기법이란?
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
  데이터 포인트들을 얼마나 포함하고 있느냐에 따라 다른 색상을 적용합니다. (
</p>

### <a name="walkthrough-02"></a>2. Data
모든 데이터 시각화의 시작은 데이터 입니다.

```
// 위치 데이터
const singleLocation = { "lat": 37.505434, "lng": 127.026385 };

```
하나의 위치 데이터는 (예: 어떤 상점의 위치) 위도와 경도 key 를 가지고있는 객체입니다.

```
// 위치 데이터를 모아놓은 배열
const multipleLocations = [ 
	{ "lat": 37.505434, "lng": 127.026385 },
	{ "lat": 37.516167, "lng": 127.040858 },
	...,
];
```

소스코드내에서 샘플 위치 데이터는 [JSON 파일] (https://github.com/hkgittt/hexbin-demo/blob/master/src/data/generated-data.json) 로 따로 관리합니다. 편의상 webpack 의 json-loader 를 통해서 [프로젝트로 들여옵니다] (https://github.com/hkgittt/hexbin-demo/blob/master/src/App.js#L8). (실제 프로젝트 환경에선 서버에서 asynchronous 하게 불러오겠죠?)

### <a name="walkthrough-03"></a>3. 최상위 App 컴포넌트
프로젝트의 실제 entry point 인 [index.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/index.js) 는 (create-react-app 에서 만들어준 그대로 입니다) 최상위 컴포넌트인 App 컴포넌트를 페이지에 [마운트 해줍니다] (https://github.com/hkgittt/hexbin-demo/blob/master/src/index.js#L6-L9).

#### [App.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/App.js)
App 컴포넌트는 react-google-map 에서 제공하는 GoogleMapLoader 컴포넌트를 마운트 합니다. GoogleMapLoader 컴포넌트의 googleMapElement 라는 prop 으로 GoogleMap 컴포넌트가 들어가게됩니다. 

```
<GoogleMapLoader
  query={{ libraries: 'geometry,places,visualization' }}
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
     { ... 생략 }
    </GoogleMap>
  }
/>
```

### <a name="walkthrough-04"></a>4. react-google-maps 와 2D Projection

App 컴포넌트에서 마운트된 GooleMapLoader 컴포넌트를 조금더 자세히 살펴보겠습니다.



###### !!! Warning !!!
Hexbin 을 사용하기 위해선 상점위치 데이터를 먼저 2D Projection 을 해줘야 합니다. 왜냐하면 위도 경도는 2D 좌표가 아니기때문입니다.

Google Maps API 는 Projection 이라는 객채가 있는데, 이 객채는 위치데이터를 위도 경도 에서  x { 0, 256 }, y { 0, 256 } coordinate system 으로 project 해줍니다. 

위
d3-hexagon expects a boundary in a 2D linear plane.



d3-hexbin 이 제공하는 함수중에 반지름을 넣어주면 그 크기의 육각형 path 를 반환하는 함수가 있습니다. 이 path 를 svg 의 path element 로 넘겨줍니다. 여기서 d3-scale 과 d3-interpolate 를 사용하여 hexbin 의 상대적 밀집도를 계산하고, 색상을 정해줍니다.



### <a name="walkthrough-05"></a>5. Hexbin 컴포넌트

#### [Hexbin.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/Hexbin.js)

```
import React, { Component, PropTypes } from 'react';
import { OverlayView } from 'react-google-maps';
import d3Hexbin from 'd3-hexbin';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';
import { interpolateLab } from 'd3-interpolate';
```

### <a name="walkthrough-06"></a>6. Hexagon 컴포넌트

#### [Hexagon.js] (https://github.com/hkgittt/hexbin-demo/blob/master/src/Hexagon.js)

## Wrap-up


이 포스팅의 초점은 3가지 의 Gotcha 인데요. 개발하면서 straight-forward 하지 않았던 3가지 포인트입니다. 1. Lat / Lng 은 linear scale 이 아니였다. 2. Svg 가 안보여요! 3. D3-hexbin 사용방법!
