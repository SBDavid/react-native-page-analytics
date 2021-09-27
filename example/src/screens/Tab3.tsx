import React from 'react';
import PageAnalytics, {
  AnalyticProps,
  PageExitDataGenerType,
} from '../../../src';
import Content from '../components/Content';
import { Container } from './StyledComponents';
import Utils from '../utils';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default class Tab3 extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  // //
  // pageViewId: number = 0;
  // //
  // pageExitId: number = 0;
  // //
  // currPage: string = 'tab3';

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: ['Screen1', 'Screen2', 'Screen3'],
  };

  componentDidMount() {
    // // 添加pageView数据
    // this.syncSetPageViewProps();
    // // 添加pageExit数据，如果每次页面离开时发送的prop数据不同，可以多次调用这个方法更新prop
    // this.setPageExitProps({ trackId: '100' });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

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

  // 用户自定义的页面展示埋点上传方法
  customPageView = () => {
    console.log(`发送页面pageView埋点 自定义 页面名: Tab3 pageExitId: 0`);
  };

  // 用户自定义的页面离开埋点上传方法
  customPageExit = () => {
    console.log(`发送页面pageExit埋点 自定义 页面名: Tab3 pageExitId: 0`);
  };

  render() {
    return (
      <Container>
        <Content title="Tab3" />
      </Container>
    );
  }
}
