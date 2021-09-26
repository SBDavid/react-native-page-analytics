# react-native-page-analytics

empty

## 安装

  + npm install @xmly/react-native-page-analytics

<br/>

## 提供了class组件和hooks两种使用方式

<br />

## class组件：
<br />

### 使用方式
  1. 页面继承PageAnalytics.Screen或者PageAnalytics.PureScreen，分别对应普通组件和纯组件

  2. 定义 **customPageView** 和 **customPageExit** 属性，分别在 **页面展示** 和 **页面隐藏** 时执行

  3. 在componentWillUnmount中添加 super.componentWillUnmount(); 移除页面事件监听


<br/>

### 使用示例：
```js
import { View } from 'react-native';
import PageAnalytics, { AnalyticProps } from '@xmly/react-native-page-analytics';

interface CurrentProps {}
interface CurrentState {}

class HomePage extends PageAnalytics.Screen<CurrentProps & AnalyticProps, CurrentState> {

  constructor(props: CurrentProps & AnalyticProps) {
    super(props);
  }

  componentDidMount() {

  }

  componentWillUnmount() {
    // 移除监听
    super.componentWillUnmount();
  }

  // 页面展示埋点上传
  customPageView = () => {
    console.log(`发送页面pageView埋点 页面名: homePage  metaId: 0`);
  };

  // 页面隐藏埋点上传
  customPageExit = () => {
    console.log(`发送页面pageExit埋点 页面名: homePage metaId: 0`);
  };

  render() {
    return <View />
  }
}
```
### API

| 属性             | 类型        | 可选     | 含义               |
| :---            | :---        | :---    | :---              |
| customPageView  | () => void  |   否    | 页面展示埋点方法 |
| customPageExit  | () => void  |   否    | 自定义页面隐藏埋点方法 |


<br />


### 注意点

  1. **须在componentWillUnmount中调用super.componentWillUnmount方法去移除页面事件监听**

<br />


## hooks：
<br />

### 使用方式：
1. 组件中使用useScreen()，参数中传入 **customPageView**，**customPageExit**，两个必传属性，分别在 **页面展示** 和 **页面隐藏** 时执行，**对于使用了路由的页面，需要将路由对象navigation传入**

<br />

### 使用实例：
```js
import { useCallback } from 'react';
import { View } from 'react-native';
import PageAnalytics, { AnalyticProps } from '@xmly/react-native-page-analytics';

interface HomePageProps {}

export default function HomePage(props: HomePageProps & AnalyticProps) {

  // 页面展示埋点上传
  const customPageView = useCallback(() => {
    console.log(`发送页面pageView埋点 页面名: homePage  metaId: 0`);
  }, []);


  // 页面隐藏埋点上传
  const customPageExit = useCallback(() => {
    console.log(`发送页面pageExit埋点 页面名: homePage metaId: 0`);
  }, []);

  PageAnalytics.useScreen({
    customPageView,
    customPageExit,
    ...props, // 对于有使用路由的页面，需要将路由对象navigation传入
  });

  return <View />
}
```

<br />

### API

useScreen

| 方法      | 参数   | 返回值  | 含义    |
| :--        | :--    | :-- | :-- |
| useScreen  | {<br /> // 页面展示埋点上传 <br />customPageView?: () => void;<br /><br />// 页面隐藏埋点上传 <br />customPageExit?: () => void;<br /><br />// 若使用了路由，传入navigation <br /> [index: string]: any;<br />} | -- | hooks

## 实现，特性
  1. 此工具对页面的navigation跳转、APPstate状态变化、RN页面与Native页面互跳 三种场景都做了处理，同时对ios，安卓两端事件监听的差异做了兼容处理，保证了页面展示/隐藏数据埋点的全面准确


  2. 兼容没有使用react-navigation的项目，对于没有使用路由的单RN页面项目，会对APPstate状态变化、RN页面与Native页面互跳 这两种场景做了处理

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
