import React from 'react';
import {
  ScrollEventSender,
  ScrollAnalyticComp,
  ScrollAnalyticWapper,
  DisableWrapper,
} from '../../../src';
import {
  ScrollView,
  TouchableHighlight,
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
        <VerticalListItemWrapper width={this.screenWidth}>
          <InnerListItemText>{`${item}--${index}`}</InnerListItemText>
        </VerticalListItemWrapper>
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
