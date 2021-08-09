import React from 'react';
import { ScrollView } from 'react-native';
import PageAnalytics, {
  AnalyticProps,
  PageExitDataGenerType,
} from 'react-native-page-analytics';
import Content from '../components/Content';
import Button from '../components/Button';
import { Container } from './StyledComponents';
import RouterName from '../router';
import Utils from '../utils';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default class Screen1 extends PageAnalytics.Screen<
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
    this.currPage = 'screen1';
    this.viewProps = { customData: 'customData' };
  }

  state: HomePageState = {
    list: ['Screen1', 'Screen2', 'Screen3'],
  };

  componentDidMount() {
    // 添加pageView数据
    this.syncSetPageViewProps();
    // 添加pageExit数据生成函数
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

  // 同步设置pageViewProps
  syncSetPageViewProps = () => {
    this.setPageViewProps({
      metaId: this.metaId,
      currPage: this.currPage,
      props: this.viewProps,
    });
  };

  // 异步设置pageViewProps
  asyncSetPageViewProps = async () => {
    await Utils.delay(500);
    this.setPageViewProps({
      metaId: this.metaId,
      currPage: this.currPage,
      props: this.viewProps,
    });
  };

  render() {
    return (
      <Container>
        <ScrollView>
          <Content title="Screen1" />
          <Button
            handler={() => {
              this.props.navigation.navigate(RouterName.SCREEN2);
            }}
            title="跳转到Screen2"
          />
        </ScrollView>
      </Container>
    );
  }
}
