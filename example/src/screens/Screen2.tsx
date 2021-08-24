import React from 'react';
import { ScrollView } from 'react-native';
import PageAnalytics, { AnalyticProps } from '../../../src';
import Content from '../components/Content';
import { Container } from './StyledComponents';
import Button from '../components/Button';
import RouterName from '../router';
import Utils from '../utils';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default class Screen2 extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  //
  pageViewId: number = 0;
  //
  pageExitId: number = 0;
  //
  currPage: string = 'screen2';

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: ['页面1', '页面2', '页面3'],
  };

  componentDidMount() {
    // 添加pageView数据
    this.asyncSetPageViewProps();
    // 添加pageExit数据，如果每次页面离开时发送的prop数据不同，可以多次调用这个方法更新prop
    this.setPageExitProps({ trackId: 100 });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  // 同步设置pageViewProps
  syncSetPageViewProps = () => {
    this.setPageViewProps({
      customPageProp: 'data',
    });
  };

  // 异步设置pageViewProps
  asyncSetPageViewProps = async () => {
    await Utils.delay(500);
    this.setPageViewProps({
      customPageProp: 'data',
    });
  };

  // 用户自定义的页面展示埋点上传方法
  customPageView = () => {
    console.log(
      `发送页面pageView埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
    );
  };

  // 用户自定义的页面离开埋点上传方法
  customPageExit = () => {
    console.log(
      `发送页面pageExit埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
    );
  };

  render() {
    return (
      <Container>
        <ScrollView>
          <Content title="Screen2" />
          <Button
            handler={() => {
              this.props.navigation.navigate(RouterName.HOME_TAB);
            }}
            title="跳转到首页"
          />
        </ScrollView>
      </Container>
    );
  }
}
