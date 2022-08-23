# 1. 简介
实现了对滑动组件元素的曝光检测，滑动停止后，当组件元素完全显示在可视区域内时，会触发曝光事件，支持FlatList, ScrollView, SectionList等常用组件，支持嵌套列表组件元素、Tab组件元素的曝光检测。

# 2. 安装
npm install @xmly/react-native-page-analytics

# 3. 核心组件，接口

## 3.1. ScrollAnalyticWapper组件
包装在滑动组件外面，接收两个参数：id 为标识滑动组件的唯一id值，useNavigation 为获取navigation对象的hook，从@react-navigation/native库中获取，用来在曝光组件内监听页面跳转，当项目中有多个路由页面时，需要传入此参数

prop
类型
含义
是否必传
id
string
滑动组件唯一id值
是
useNavigation
Function
获取当前路由对象的hook，从@react-navigation/native库中获取
否 (项目中有多个路由页面时，需要传入此参数，单页面RN项目可不传)

##     3.2. ScrollAnalyticComp组件
包装列表的每一项元素上，用来添加元素的曝光处理函数，接收itemKey，onShow，onHide，onRefresh四个参数，itemKey为每个元素的唯一key值。当元素曝光时，执行onShow函数，onShow函数接收一个曝光类型type，隐藏和刷新时分别执行onHide和onRefresh函数

prop
类型
含义
是否必传
itemKey
React.Key
元素项的唯一key值
是
onShow
(type: number) => void
元素曝光回调
是
onHide
() => void
元素隐藏回调
否
onRefresh
() => void
元素刷新回调
否

##     3.3. ScrollEventSender.send 方法
用来发送事件，通知滑动曝光组件，计算出哪些元素该触发曝光事件，在以下几个场景中用到：列表滚动时，列表内容刷新时，改变是否对列表元素进行曝光监听时。发送事件时，需要传入列表组件的id和事件名。
参数
类型
描述
id
string
列表id
event
string
具体的事件名，包括以下值：
'scroll'         列表滚动
'refreshed'   列表内容刷新
'hide'          列表隐藏
'show'         列表显示
'disable'      关闭曝光监听
'enable'       打开曝光监听


##     3.4. DisableWrapper组件
用来设置是否对组件元素进行曝光监听，使用方式为包裹在组件外部，接收两个参数：id 为滑动组件的唯一id值，defaultValue 为是否监听曝光的初始值（注意，这里传true为关闭曝光监听，false为打开曝光监听），设置了初始值后，想要改变此值，可以通过事件通知的方式去实现，使用见 3.3 ScrollEventSender.send API部分。
prop
类型
含义
是否必传
id
string
列表的唯一id值
是
defaultValue
boolean
是否对组件元素进行曝光监听
否

##     3.5. 核心类的嵌套关系


# 1. 实例
    4.1. 普通纵向滚动列表
纵向列表，滑动时元素曝光，下拉刷新内容后元素重新曝光
```js
class Page extends React.Component {
  state = {
    listData: Array(10).fill(''),
    refreshing: false,
  };

  // 列表的唯一id值
  listId: string = 'listId';

    // 曝光事件
  onShowHandler = (exposeType: number) => {
    console.log(`onShow  type: ${exposeType}`);
  };
  
  // 列表滚动事件
  handleScroll = () => {
    // 滚动时发送事件通知，会触发新出现的组件的曝光事件
    ScrollEventSender.send(this.listId, 'scroll');
  };

    //
  renderItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <ScrollAnalyticComp
        // 每个元素设置一个唯一的key值
        itemKey={(item + index).toString()}
        // 曝光事件处理
        onShow={this.onShowHandler}
        // 隐藏事件处理    
        onHide={() => {}}
        // 刷新事件处理
        onRefreshed={() => {}}
      >
        <View style={{ width: 200, height: 100 }}>{item + index}</View>;
      </ScrollAnalyticComp>
    );
  };

  // 列表刷新
  onRefresh = async () => {
    this.setState({ refreshing: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.setState({
      refreshing: false,
      listData: [...this.state.listData, ''],
    });
    // 刷新内容时发送事件通知，触发组件元内显示元素的曝光事件
    ScrollEventSender.send(this.listId, 'refreshed');
  };

  render() {
    return (
      // 包装在列表组件外层
      <ScrollAnalyticWapper id={this.listId} useNavigation={useNavigation}>
        <FlatList
          onScroll={this.handleScroll}
          data={this.state.listData}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
        />
      </ScrollAnalyticWapper>
    );
  }
}
```


##    4.2. 纵向列表内嵌套横向列表
纵向列表中每项元素为一个横向的列表，纵向滑动/横向滑动时都会触发元素的曝光事件
```js
class Page extends React.Component {
  state = {
    listData: Array(10).fill(Array(5).fill('')),
  };

  // 列表的唯一id值
  listId: string = 'listId';

  // 曝光事件
  onShowHandler = (exposeType: number) => {
    console.log(`onShow  type: ${exposeType}`);
  };

  // 列表滚动事件
  handleScroll = () => {
    // 滚动时发送事件通知，会触发新出现的组件的曝光事件
    ScrollEventSender.send(this.listId, 'scroll');
  };

  //
  renderHorizontalList = ({
    item,
    index,
  }: {
    item: string[];
    index: number;
  }) => {
    return (
      <FlatList
          horizontal
        onScroll={this.handleScroll}
        data={item}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };

  //
  renderItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <ScrollAnalyticComp
        // 每个元素设置一个唯一的key值
        itemKey={(item + index).toString()}
        // 曝光事件处理
        onShow={this.onShowHandler}
        // 隐藏事件处理
        onHide={() => {}}
        // 刷新事件处理
        onRefreshed={() => {}}
      >
        <View style={{ width: 200, height: 100 }}>{item + index}</View>;
      </ScrollAnalyticComp>
    );
  };

  render() {
    return (
      <ScrollAnalyticWapper id={this.listId} useNavigation={useNavigation}>
        <FlatList
          onScroll={this.handleScroll}
          data={this.state.listData}
          renderItem={this.renderHorizontalList}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollAnalyticWapper>
    );
  }
}
```


##    4.3. Tab组件内包含两列纵向滚动列表
```js
class Page extends React.Component {
  constructor(props: CurrentProps) {
    super(props);
  }

  state = {
    tabList: [0, 1],
    flatList: {
      listId: 'flatListKey',
      data: Array(5).fill('list1'),
    },
    scrollView: {
      listId: 'scrollViewKey',
      data: Array(5).fill('list2'),
    },
  };

  // 曝光事件
  onShowHandler = (name: string, exposeType: number) => {
    console.log(`onShow  type: ${exposeType}  name: ${name}`);
  };

  // 列表滚动事件
  handleScroll = (listId: string) => {
    // 滚动时发送事件通知，会触发新出现的组件的曝光事件
    ScrollEventSender.send(listId, 'scroll');
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
    // 被隐藏的Tab页内容关闭曝光监听，显示的Tab页内容打开曝光监听，并触发一次曝光事件
    if (value.i === 0) {
      // 切换到FlatList页

      // 关闭ScrollView曝光监听，隐藏组件元素
      ScrollEventSender.send(scrollViewId, 'disable');
      ScrollEventSender.send(scrollViewId, 'hide');
      // 打开FlatList曝光监听，触发一次列表元素的曝光
      ScrollEventSender.send(flatListId, 'enable');
      ScrollEventSender.send(flatListId, 'show');
    } else {
      // 切换到ScrollView页

      // 关闭FlatList曝光监听，隐藏组件元素
      ScrollEventSender.send(flatListId, 'disable');
      ScrollEventSender.send(flatListId, 'hide');
      // 打开ScrollView曝光监听，触发一次列表元素的曝光
      ScrollEventSender.send(scrollViewId, 'enable');
      ScrollEventSender.send(scrollViewId, 'show');
    }
  };

  // 创建FlatList
  createFlatList = (): JSX.Element => {
    const { listId: flatListId, data: flatListData } = this.state.flatList;

    return (
      // 使用 DisableWrapper 和 ScrollAnalyticWapper 组件包装 滚动组件
      <DisableWrapper id={flatListId} defalutValue={false}>
        <ScrollAnalyticWapper id={flatListId} useNavigation={useNavigation}>
          <FlatList
            keyExtractor={(item, index) => index.toString()}
            onScroll={() => {
              // 发送滚动事件
              this.handleScroll(flatListId);
            }}
            data={flatListData}
            renderItem={({ item, index }: { item: string; index: number }) => {
              return (
                <ScrollAnalyticComp
                  key={`flatListKey-${item}-${index}`}
                  itemKey={`flatListKey-${item}-${index}`}
                  onShow={(exposeType: number) => {
                    this.onShowHandler('flatList', exposeType);
                  }}
                  onHide={() => {
                    console.log(`onHide  ${item}  index:${index + 1}`);
                  }}
                  onRefreshed={() => {
                    console.log(`onRefreshed  ${item}  index:${index + 1}`);
                  }}
                >
                  <View style={{ width: 200, height: 100 }}>
                    {item + index}
                  </View>
                </ScrollAnalyticComp>
              );
            }}
          />
        </ScrollAnalyticWapper>
      </DisableWrapper>
    );
  };

  // 创建ScrollView
  createScrollView = (): JSX.Element => {
    const { listId: scrollViewId, data: scrollViewData } =
      this.state.scrollView;

    return (
      // 使用 DisableWrapper 和 ScrollAnalyticWapper 组件包装 滚动组件
      <DisableWrapper id={scrollViewId} defalutValue={true}>
        <ScrollAnalyticWapper id={scrollViewId} useNavigation={useNavigation}>
          <ScrollView
            onScroll={() => {
              this.handleScroll(scrollViewId);
            }}
          >
            {scrollViewData.map((item, index) => {
              return (
                <ScrollAnalyticComp
                  key={`scrollViewkey-${item}-${index}`}
                  itemKey={`scrollViewkey-${item}-${index}`}
                  onShow={(exposeType: number) => {
                    this.onShowHandler('scrollView', exposeType);
                  }}
                  onHide={() => {
                    console.log(`onHide  ${item}  index:${index + 1}`);
                  }}
                  onRefreshed={() => {
                    console.log(`onRefreshed  ${item}  index:${index + 1}`);
                  }}
                >
                  <View style={{ width: 200, height: 100 }}>
                    {item + index}
                  </View>
                </ScrollAnalyticComp>
              );
            })}
          </ScrollView>
        </ScrollAnalyticWapper>
      </DisableWrapper>
    );
  };

  render() {
    return (
      <ScrollableTabView onChangeTab={this.onTabChange} initialPage={0}>
        {this.createFlatList()}
        {this.createScrollView()}
      </ScrollableTabView>
    );
  }
}
```

