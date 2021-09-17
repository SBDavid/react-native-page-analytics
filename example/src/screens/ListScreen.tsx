import React from 'react';
import PageAnalytics, { AnalyticProps, ScrollShowEvent } from '../../../src';
import {
  ScrollView,
  TouchableHighlight,
  NativeModules,
  FlatList,
  View,
  Text,
} from 'react-native';

import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default class ListScreen extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  //
  pageViewId: number = 0;
  //
  pageExitId: number = 0;
  //
  currPage: string = 'listScreen';

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: Array(10).fill('name'),
  };

  componentDidMount() {
    // 添加pageView数据
    this.syncSetPageViewProps();
    // 添加pageExit数据，如果每次页面离开时发送的prop数据不同，可以多次调用这个方法更新prop
    this.setPageExitProps({ trackId: String(100) });
  }

  componentWillUnmount() {
    // 移除监听
    super.componentWillUnmount();
  }

  // 用户自定义的页面展示埋点上传方法
  // customPageView = () => {
  //   console.log(
  //     `发送页面pageView埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
  //   );
  // };

  // 用户自定义的页面离开埋点上传方法
  // customPageExit = () => {
  //   console.log(
  //     `发送页面pageExit埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
  //   );
  // };

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

  handlePress = (item: string) => {
    if (item === RouterName.NativeScreen) {
      // 跳转到账号绑定页
      // NativeModules.Page.start('iting://open?msg_type=84');
      NativeModules.Page.start(
        'iting://open?msg_type=14&url=https://www.baidu.com'
      );
    } else {
      this.props?.navigation?.navigate(item);
    }
  };

  createItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <PageAnalytics.ScrollAnalyticItem
        key={index}
        {...this.props}
        onShow={(e: ScrollShowEvent) => {
          console.log(
            `show -- ${index} hasInteracted: ${e.hasInteracted} hasViewed: ${e.hasViewed}`
          );
        }}
        onHide={() => {
          console.log(`hide-- ${index}`);
        }}
      >
        <View
          style={{
            width: 200,
            height: 200,
            backgroundColor: 'red',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{ color: 'white', fontSize: 15 }}
          >{`${item} -- ${index}`}</Text>
        </View>
      </PageAnalytics.ScrollAnalyticItem>
    );
  };

  createSeperator = () => <View style={{ width: '100%', height: 10 }} />;

  render() {
    return (
      <Container>
        <Content title="ListScreen" />

        <FlatList
          data={this.state.list}
          renderItem={this.createItem}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={this.createSeperator}
        />
      </Container>
    );
  }
}
