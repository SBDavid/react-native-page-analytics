# react-native-page-analytics

empty

## 安装

  + npm install react-native-page-analytics

<br/>

## 提供了class组件和hooks两种使用方式

<br />

## class组件：
<br />

### 使用方式
  1. 页面继承PageAnalytics.Screen

  2. 页面中设置三个基础埋点数据： 页面展示id，页面隐藏id，页面名称 三个属性（实现父类抽象属性的方式）

  3. 通过 setPageViewProps 方法设置'页面展示'埋点上报数据，在此方法被调用之前都不会执行'页面展示'埋点数据上报，可以多次调用次方法，去更新'页面展示'埋点上报数据

  4. 通过 setPageExitProps 方法设置'页面隐藏'埋点数据上报，可以多次调用此方法，去更新'页面隐藏'埋点上报数据

  5. 在componentWillUnmount中添加 super.componentWillUnmount(); 移除页面事件监听

  6. (可选）通过实现customPageView的方式，自定义'页面展示'埋点上传方法，去覆盖默认的'页面展示'埋点上传方法，如果实现了此方法，'页面展示'埋点上报时将直接执行此方法

  7. (可选）通过实现customPageExit的方式，自定义'页面隐藏'埋点上传方法，去覆盖默认的'页面隐藏'埋点上传方法，如果实现了此方法，'页面隐藏'埋点上报时将直接执行此方法

<br/>

### 使用示例：
```js
import { View } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';

interface CurrentProps {}

class HomePage extends PageAnalytics.Screen<CurrentProps & AnalyticProps> {
  // 设置页面展示Id
  pageViewId: number = 0;
  // 设置页面隐藏Id
  pageExitId: number = 0;
  // 设置页面名称
  currPage: string = 'homePage';

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  componentDidMount() {
    // 添加pageView数据
    this.syncSetPageViewProps();
    // 添加pageExit数据，如果每次页面离开时发送的prop数据不同，可以多次调用这个方法更新prop
    this.setPageExitProps({ trackId: 100 });
  }

  componentWillUnmount() {
    // 移除监听
    super.componentWillUnmount();
  }

  // 同步设置pageViewProps
  syncSetPageViewProps = () => {
    this.setPageViewProps({
      customData: 'customData',
    });
  };

  // 异步设置pageViewProps
  asyncSetPageViewProps = async () => {
    await Utils.delay(500);
    this.setPageViewProps({
      customData: 'customData',
    });
  };

  // （可选）用户自定义的页面展示埋点上传方法
  customPageView = () => {
    console.log(
      `发送页面pageView埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
    );
  };

  // （可选）用户自定义的页面离开埋点上传方法
  customPageExit = () => {
    console.log(
      `发送页面pageExit埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
    );
  };

  render() {
    return <View />
  }
}
```
### API

| 属性             | 类型        | 可选     | 含义               |
| :---            | :---        | :---    | :---              |
| pageViewId      | number      |   否    | 页面展示id          |
| pageExitId      | number      |   否    | 页面隐藏id          |
| currPage        | string      |   否    | 页面名称            |
| customPageView  | () => void  |   是    | 自定义页面展示埋点方法 |
| customPageExit  | () => void  |   是    | 自定义页面隐藏埋点方法 |

<br />

| 方法               | 参数          | 返回值      | 含义               |
| :---              | :---          | :---      | :---           |
| setPageViewProps  | { [index: string]: string }  | void    | 设置/更新页面展示埋点数据 |
| setPageExitProps  | { [index: string]: string }  | void    | 设置/更新页面隐藏埋点数据 |


### 注意点
  1. pageViewId，pageExitId，currPage 三个基础埋点属性必须要设置，未设置时会有提示


  2. <big>**在首次调用了this.setPageViewProps方法后才会发送页面展示埋点，在此之前，都处于阻塞等待状态，页面展示埋点上报都不会去实际执行；因此，setPageViewProps方法必须要执行至少一次**</big>，推荐在didMount中调用此方法，这样做的原因是，进入页面后 页面展示 事件会立即被触发，但用户想要上传的埋点数据可能还未准备好，等用户手动设置了数据后再去发送埋点数据，建议在componentDidMount方法中调用此方法，可以直接调用，也可以延迟调用

  3. 须在componentWillUnmount中调用super.componentWillUnmount方法去移除页面事件监听

  4. 默认使用xmlog-rn中的方法去上传埋点数据，customPageView和customPageExit属性是可选的，设置了后，页面展示/隐藏 被触发时即执行这两个方法，如果用户想自定义上传的方法，可设置这两个属性

<br />


## hooks：
<br />

### 使用方式：
1. 组件中使用useScreen()，参数中传入 页面展示id，页面隐藏id，页面名称 三个必传属性

2. (可选属性）传入customPageView，自定义'页面展示'埋点上传方法，去覆盖默认的'页面展示'埋点上传方法，如果实现了此方法，'页面展示'埋点上报时将直接执行此方法

3. (可选属性）传入customPageExit，自定义'页面隐藏'埋点上传方法，去覆盖默认的'页面隐藏'埋点上传方法，如果实现了此方法，'页面隐藏'埋点上报时将直接执行此方法

4. hooks返回 setPageViewProps，setPageExitProps 两个方法

5. 通过 setPageViewProps 方法设置'页面展示'埋点上报数据，<big>**在此方法被调用之前都不会执行'页面展示'埋点数据上报，因此此方法必须要执行至少一次**</big>，可以多次调用次方法，去更新'页面展示'埋点上报数据

6. 通过 setPageExitProps 方法设置'页面隐藏'埋点数据上报，可以多次调用此方法，去更新'页面隐藏'埋点上报数据

<br />

### 使用实例：
```js
import { View } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';

interface HomePageProps {}

export default function HomePage(props: HomePageProps & AnalyticProps) {
  // 页面展示Id
  const pageViewId: number = 0;
  // 页面隐藏Id
  const pageExitId: number = 0;
  // 页面名称
  const currPage: string = 'homePage';

  // （可选）用户自定义的页面展示埋点上传方法
  function customPageView() {
    console.log(
      `发送页面pageView埋点 自定义 页面名: ${currPage} pageExitId: ${pageViewId}`
    );
  }

  // （可选）用户自定义的页面离开埋点上传方法，
  function customPageExit() {
    console.log(
      `发送页面pageExit埋点 自定义 页面名: ${currPage} pageExitId: ${pageViewId}`
    );
  }

  const {
    // 添加pageView数据
    setPageViewProps,
    // 添加pageExit数据，如果每次页面离开时发送的prop数据不同，可以多次调用这个方法更新prop
    setPageExitProps
  } = PageAnalytics.useScreen({
    pageViewId,
    pageExitId,
    currPage,
    // 可选
    customPageView,
    // 可选
    customPageExit,
    ...props,
  });

  useEffect(() => {
    setPageViewProps({
        customData: 'customData',
      });
    setPageExitProps({ trackId: 100 });
  }, []);

  return <View />
}
```

<br />

### API

useScreen

| 方法      | 参数   | 返回值  | 含义    |
| :--        | :--    | :-- | :-- |
| useScreen  | {<br /> // 页面展示id <br />pageViewId: number;<br /><br />// 页面隐藏id <br />pageExitId: number;<br /><br />// 页面名称 <br />currPage: string;<br /><br />// 自定义页面展示埋点方法 <br />customPageView?: () => void;<br /><br />// 自定义页面隐藏埋点方法 <br />customPageExit?: () => void;<br /><br />[index: string]: any;<br />} | {<br/> // 设置/更新页面展示埋点数据 <br /> setPageViewProps: (param: {[index: string]:string}) => void<br /><br /> // 设置/更新页面隐藏埋点数据 <br /> setPageExitProps: (param: {[index: string]:string}) => void <br />} | hooks

## 实现，特性
  1. 此工具对页面的navigation跳转、APPstate状态变化、RN页面与Native页面互跳 三种场景都做了处理，同时对ios，安卓两端事件监听的差异做了兼容处理，保证了页面展示/隐藏数据埋点的全面准确


  2. 兼容没有使用react-navigation的项目，对于没有使用路由的单RN页面项目，会对APPstate状态变化、RN页面与Native页面互跳 这两种场景做了处理

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
