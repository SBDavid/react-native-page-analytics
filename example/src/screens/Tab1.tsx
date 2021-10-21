import React from 'react';
import PageAnalytics, { AnalyticProps } from '../../../src';
import { ScrollView, TouchableHighlight, NativeModules } from 'react-native';

import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';

interface HomePageProps {}

interface HomePageState {
  list: RouterName[];
}

export default class Tab1 extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  // //
  // pageViewId: number = 0;
  // //
  // pageExitId: number = 0;
  // //
  // currPage: string = 'tab1';

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: [
      RouterName.SCREEN1,
      RouterName.SCREEN2,
      RouterName.H5,
      RouterName.ScrollScreen,
      // RouterName.VirtualizedList,
      // RouterName.FlatList,
      // RouterName.SectionList,
      // RouterName.TestSameDirectionList,
      // RouterName.TestRecycleView,
      // RouterName.TestWrapper,
    ],
  };

  componentDidMount() {
    // this.setPageViewProps;
    // // 添加pageView数据
    // this.syncSetPageViewProps();
    // // 添加pageExit数据，如果每次页面离开时发送的prop数据不同，可以多次调用这个方法更新prop
    // this.setPageExitProps({ trackId: String(100) });
  }

  componentWillUnmount() {
    // 移除监听
    super.componentWillUnmount();
  }

  // 用户自定义的页面展示埋点上传方法
  customPageView = () => {
    console.log(`发送页面pageView埋点 自定义 页面名: Tab1 pageExitId: 0`);
  };

  // customPageView = () => {

  // };

  // 用户自定义的页面离开埋点上传方法
  customPageExit = () => {
    console.log(`发送页面pageExit埋点 自定义 页面名: Tab1 pageExitId: 0`);
  };

  // // 同步设置pageViewProps
  // syncSetPageViewProps = () => {
  //   this.setPageViewProps({
  //     customData: 'customData',
  //   });
  // };

  // // 异步设置pageViewProps
  // asyncSetPageViewProps = async () => {
  //   await Utils.delay(500);
  //   this.setPageViewProps({
  //     customData: 'customData',
  //   });
  // };

  handlePress = (item: RouterName) => {
    if (item === RouterName.H5) {
      // 跳转到账号绑定页
      // NativeModules.Page.start('iting://open?msg_type=84');
      NativeModules.Page.start(
        'iting://open?msg_type=14&url=https://www.baidu.com'
      );
    } else {
      this.props?.navigation?.navigate(item);
    }
  };

  render() {
    return (
      <Container>
        <Content title="Tab1" />

        <ScrollView>
          {this.state.list.map((item, index) => {
            return (
              <TouchableHighlight
                key={index}
                onPress={() => this.handlePress(item)}
              >
                <Item key={index}>
                  <ItemText>{item}</ItemText>
                </Item>
              </TouchableHighlight>
            );
          })}
        </ScrollView>
      </Container>
    );
  }
}
