import React from 'react';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';
import Content from '../components/Content';
import { Container } from './StyledComponents';
import Utils from '../utils';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default class Tab1 extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: ['Screen1', 'Screen2', 'Screen3'],
  };

  componentDidMount() {
    this.asyncSetPageViewProps();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  // 同步设置页面props
  syncSetPageViewProps = () => {
    this.setPageViewProps({ currPageName: 'home' });
  };

  // 异步设置页面props
  asyncSetPageViewProps = async () => {
    await Utils.delay(2000);
    this.setPageViewProps({ currPageName: 'home' });
  };

  render() {
    return (
      <Container>
        <Content title="Tab1" />
      </Container>
    );
  }
}
