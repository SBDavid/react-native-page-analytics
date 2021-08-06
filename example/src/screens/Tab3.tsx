import React from 'react';
import PageAnalytics, {
  AnalyticProps,
  PageExitDataGenerType,
} from 'react-native-page-analytics';
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
  //
  metaId: number;
  //
  currPage: string;
  //
  viewProps: { [index: string]: any };

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
    this.metaId = 0;
    this.currPage = 'tab3';
    this.viewProps = { customData: 'customData' };
  }

  state: HomePageState = {
    list: ['Screen1', 'Screen2', 'Screen3'],
  };

  componentDidMount() {
    this.syncSetPageViewProps();
    this.setPageExitPropsGener(this.customPageExitDataGener);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  // 生成页面离开埋点数据
  customPageExitDataGener: PageExitDataGenerType = () => ({
    metaId: this.metaId,
    currPage: this.currPage,
    props: { customData: 'customData' },
  });

  // 同步设置页面props
  syncSetPageViewProps = () => {
    this.setPageViewProps({
      metaId: this.metaId,
      currPage: this.currPage,
      props: this.viewProps,
    });
  };

  // 异步设置页面props
  asyncSetPageViewProps = async () => {
    await Utils.delay(2000);
    this.setPageViewProps({
      metaId: this.metaId,
      currPage: this.currPage,
      props: this.viewProps,
    });
  };

  render() {
    return (
      <Container>
        <Content title="Tab3" />
      </Container>
    );
  }
}
