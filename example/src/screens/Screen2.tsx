import React from 'react';
import { ScrollView } from 'react-native';
import PageAnalytics, {
  AnalyticProps,
  PageExitDataGenerType,
} from 'react-native-page-analytics';
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
  metaId: number;
  //
  currPage: string;
  //
  viewProps: { [index: string]: any };

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
    this.metaId = 0;
    this.currPage = 'screen2';
    this.viewProps = { customData: 'customData' };
  }

  state: HomePageState = {
    list: ['页面1', '页面2', '页面3'],
  };

  componentDidMount() {
    this.asyncSetPageViewProps();
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
