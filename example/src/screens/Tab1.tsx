import React from 'react';
import PageAnalytics, {
  AnalyticProps,
  PageExitDataGenerType,
  BasicAnalyticType,
} from 'react-native-page-analytics';
import { ScrollView, TouchableHighlight } from 'react-native';

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
  //
  pageViewId: number = 0;
  //
  pageExitId: number = 0;
  //
  currPage: string = 'tab1';

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: [RouterName.SCREEN1, RouterName.SCREEN2],
  };

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

  // 用户自定义的页面展示埋点上传方法
  // customPageView = () => {
  //   console.log(
  //     `页面focus事件 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
  //   );
  // };

  // 用户自定义的页面离开埋点上传方法
  // customPageExit = () => {
  //   console.log(
  //     `页面blur事件 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
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

  handlePress = (item: RouterName) => {
    this.props.navigation.navigate(item);
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
