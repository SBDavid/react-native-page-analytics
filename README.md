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
| customPageExit  | () => void  |   否    | 页面隐藏埋点方法 |


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

<br/>
<br/>

## 控件滑动曝光埋点
<br />

### 安装
   + npm install @xmly/react-native-page-analytics

<br />

### 使用
  1. 在滚动组件外层使用 DisableWrapper 和 ScrollAnalyticWapper 组件包装
  2. 滚动列表元素项使用 ScrollAnalyticComp 组件包装
  3. 发生滚动、组件内容刷新、组件隐藏/展示时使用 ScrollEventSender.send 方法去通知

### 使用示例：
<br/>

  - 下面的例子是一个 Tab页面，左边Tab是一个FlatList，右边Tab是一个ScrollView，在列表滚动时，发送滚动事件去通知滑动曝光组件，给出正确的元素曝光类型，左边的FlatList可以下拉刷新，刷新内容后，发送事件去让列表元素再次曝光，在切换Tab位置的过程中，需要通过发送通知去更新 两个列表是否监听曝光事件，并显示/隐藏Tab内的列表元素。基本上包含了常见的滑动曝光组件使用方法。

```js
import React from 'react';
import {
  ScrollEventSender,
  ScrollAnalyticComp,
  ScrollAnalyticWapper,
  DisableWrapper,
} from '@xmly/react-native-page-analytics';
import {
  ScrollView,
  TouchableHighlight,
  NativeModules,
  FlatList,
  View,
  Text,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScrollableTabView, {
  ChangeTabProperties,
} from 'react-native-scrollable-tab-view';
import styled from 'styled-components';

const PageWrapper = styled(View)<{
  screenWidth: number;
  [index: string]: any;
}>`
  padding: 0 10px 0 10px;
  width: ${(props) => props.screenWidth}px;
  display: flex;
  justify-content: center;
`;

const TotalWrapper = styled(View)`
  height: 500px;
  border: 1px solid red;
`;

const ScrollViewContentWrapper = styled(View)<{
  width: number;
  height: number;
  backgroundColor: string;
}>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  display: flex;
  background-color: ${(props) => props.backgroundColor};
  justify-content: center;
  align-items: center;
  margin: 10px 0;
  border-radius: 5px;
`;

const ScrollViewContentText = styled(Text)`
  font-size: 20px;
  color: white;
`;

const InnerListItemText = styled(Text)`
  font-size: 18px;
  color: white;
`;

const VerticalListItemWrapper = styled(View)<{ width: number }>`
  width: ${(props) => props.width}px;
  height: 120px;
  border-radius: 5px;
  background-color: rgba(255, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface CurrentProps {}

interface CurrentState {
  tabList: number[];
  selectedTab: number;
  flatList: {
    listId: string;
    data: string[];
    disabled: boolean;
    refreshing: boolean;
  };
  scrollView: {
    listId: string;
    data: string[];
    disabled: boolean;
    refreshing: boolean;
  };
}

class Page extends React.Component<CurrentProps, CurrentState> {
  constructor(props: CurrentProps) {
    super(props);
    this.screenWidth = Dimensions.get('screen').width;
  }

  state: CurrentState = {
    tabList: [0, 1],
    selectedTab: 0,
    flatList: {
      listId: 'flatListKey',
      data: Array(5).fill('list1'),
      disabled: false,
      refreshing: false,
    },
    scrollView: {
      listId: 'scrollViewKey',
      data: Array(5).fill('list2'),
      disabled: true,
      refreshing: false,
    },
  };

  screenWidth: number;

  // 曝光事件
  onShowHandler = (name: string, exposeType: number) => {
    console.log(`onShow  type: ${exposeType}  name: ${name}`);
  };

  createFlatListItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <ScrollAnalyticComp
        itemKey={item + '  ' + index}
        key={index}
        onShow={(exposeType: number) => {
          this.onShowHandler(`${item}--${index}`, exposeType);
        }}
        onHide={() => {
          console.log(`onHide  ${item}  index:${index + 1}`);
        }}
        onRefreshed={() => {
          console.log(`onRefreshed  ${item}  index:${index + 1}`);
        }}
        {...this.props}
      >
        <TouchableHighlight onPress={this.pressHandler}>
          <VerticalListItemWrapper width={this.screenWidth}>
            <InnerListItemText>{`${item}--${index}`}</InnerListItemText>
          </VerticalListItemWrapper>
        </TouchableHighlight>
      </ScrollAnalyticComp>
    );
  };

  createSeperator = () => <View style={{ width: '100%', height: 10 }} />;

  // 列表滚动事件
  handleScroll = (listId: string) => {
    // 滚动时发送事件通知，会触发新出现的组件的曝光事件
    ScrollEventSender.send(listId, 'scroll');
  };

  // 列表刷新
  onRefresh = async () => {
    this.setState({ flatList: { ...this.state.flatList, refreshing: true } });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.setState({
      flatList: {
        ...this.state.flatList,
        data: this.state.flatList.data.map((item) => item + '*'),
        refreshing: false,
      },
    });
    // 刷新内容时发送事件通知，会触发组件的曝光事件
    ScrollEventSender.send(this.state.flatList.listId, 'refreshed');
  };

  // tab切换事件，在切换的过程中，左右两个tab的列表会切换 显示/隐藏的状态
  onTabChange = async (value: ChangeTabProperties) => {
    if (value.i === value.from) {
      return;
    }
    // 注意，Tab组件切换会自带一个动画，需要等动画执行结束后，再去触发曝光事件，否则判断元素是否曝光会出错
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { listId: flatListId } = this.state.flatList;
    const { listId: scrollViewId } = this.state.scrollView;

    // 切换Tab后，会隐藏一个Tab页的内容，显示另一个Tab页的内容
    // 被隐藏的Tab页内容关闭曝光事件监听，显示的Tab页内容打开曝光事件监听，并触发一次曝光事件
    if (value.i === 0) {
      console.log('切换到FlatListTab');
      // 打开FlatList 曝光事件监听，关闭ScrollView 曝光事件监听
      ScrollEventSender.send(flatListId, 'enable');
      ScrollEventSender.send(scrollViewId, 'disable');

      // 触发一次FlatList列表元素的曝光，隐藏ScrollView列表元素
      ScrollEventSender.send(flatListId, 'show');
      ScrollEventSender.send(scrollViewId, 'hide');
    } else {
      console.log('切换到ScrollViewTab');
      ScrollEventSender.send(flatListId, 'disable');
      ScrollEventSender.send(scrollViewId, 'enable');

      console.log('切换到list2 show');
      ScrollEventSender.send(flatListId, 'hide');
      ScrollEventSender.send(scrollViewId, 'show');
    }
  };

  // 创建FlatList
  createFlatListTab = (): JSX.Element => {
    const { listId, data, refreshing } = this.state.flatList;
    return (
      <PageWrapper screenWidth={this.screenWidth} tabLabel="FlatList">
        {/*  使用 DisableWrapper 和 ScrollAnalyticWapper 组件包装 滚动组件 */}
        <DisableWrapper id={listId} defalutValue={false} debugKey={'1'}>
          <ScrollAnalyticWapper id={listId} useNavigation={useNavigation}>
            <FlatList
              onScroll={() => {
                this.handleScroll(listId);
              }}
              data={data}
              renderItem={this.createFlatListItem}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this.createSeperator}
              refreshControl={
                <RefreshControl
                  tintColor="#eee"
                  colors={['#eee']}
                  refreshing={refreshing}
                  onRefresh={this.onRefresh}
                />
              }
            />
          </ScrollAnalyticWapper>
        </DisableWrapper>
      </PageWrapper>
    );
  };

  // 创建ScrollView
  createScrollViewTab = (): JSX.Element => {
    const { listId, data } = this.state.scrollView;
    return (
      <PageWrapper screenWidth={this.screenWidth} tabLabel="ScrollView">
        {/*  使用 DisableWrapper 和 ScrollAnalyticWapper 组件包装 滚动组件 */}
        <DisableWrapper defalutValue={true} id={listId} debugKey={listId}>
          <ScrollAnalyticWapper
            key={listId}
            id={listId}
            useNavigation={useNavigation}
          >
            <ScrollView
              onScroll={() => {
                this.handleScroll(listId);
              }}
            >
              {data.map((item, index) => {
                return (
                  <ScrollAnalyticComp
                    key={`scrollViewkey-${index}`}
                    itemKey={`scrollViewkey-${item}-${index}`}
                    onShow={(exposeType: number) => {
                      this.onShowHandler(`scrollView--${index}`, exposeType);
                    }}
                  >
                    <ScrollViewContentWrapper
                      width={this.screenWidth}
                      height={150 + 100 * Math.random()}
                      backgroundColor="rgba(255, 0, 0, 0.75)"
                    >
                      <ScrollViewContentText>
                        {`scrollView内容 -- ${index}`}
                      </ScrollViewContentText>
                    </ScrollViewContentWrapper>
                  </ScrollAnalyticComp>
                );
              })}
            </ScrollView>
          </ScrollAnalyticWapper>
        </DisableWrapper>
      </PageWrapper>
    );
  };

  render() {
    return (
      <TotalWrapper>
        <ScrollableTabView onChangeTab={this.onTabChange} initialPage={0}>
          {this.createFlatListTab()}
          {this.createScrollViewTab()}
        </ScrollableTabView>
      </TotalWrapper>
    );
  }
}

```

<br/>

### 组件
<br/>

1. DisableWrapper

| prop | 类型 | 含义 | 是否必传 |
| :-- | :-- | :-- | :-- |
| id    | string  | 列表的唯一id值   | 是 |
| defalutValue | boolean | 列表是否关闭监听曝光事件的默认值 | 是 |

<br/>
<br/>

1. ScrollAnalyticWapper

| prop | 类型 | 含义 | 是否必传 |
| :-- | :-- | :-- | :-- |
| id    | string  | 列表的唯一id值    | 是 |
| useNavigation | Function | 获取当前所处的路由对象的hook，import { useNavigation } from '@react-navigation/native'; | 否 |

<br/>
<br/>

3. ScrollAnalyticComp

| prop | 类型 | 含义 | 是否必传 |
| :-- | :-- | :-- | :-- |
| itemKey    | React.Key  | 元素项的唯一key值    | 是 |
| onShow | (type: number) => void | 列表元素曝光事件 | 是 |
| onHide | () => void | 列表元素隐藏事件 | 否 |
| onRefresh | () => void | 列表元素刷新事件 | 否 |

<br/>

### API
<br/>

   1. ScrollEventSender.send(id, event)
<br/>

作用：发送通知，在列表滚动，内容刷新，开启/关闭曝光监听时调用，参数为列表的唯一id值和事件名
<br/>

| 参数 | 类型 | 描述 |
| :--| :-- | :-- |
| id | string | 列表id值|
| event | string | 事件名<br/>可选值包括：<br/>'scroll'&nbsp;&nbsp;滚动<br />'refreshed'&nbsp;&nbsp;刷新<br/>'hide'&nbsp;&nbsp;隐藏<br/> 'show'&nbsp;&nbsp; 显示<br/> 'disable'&nbsp;&nbsp; 关闭曝光监听<br/> 'enable'&nbsp;&nbsp; 打开曝光监听 |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
