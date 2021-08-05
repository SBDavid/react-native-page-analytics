import React from 'react';
import { ScrollView } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';
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
  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: ['页面1', '页面2', '页面3'],
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
