# react-native-page-analytics

empty

## Installation

```sh
npm install react-native-page-analytics
```

## 使用
<br/>

### 使用方式概要：
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

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
