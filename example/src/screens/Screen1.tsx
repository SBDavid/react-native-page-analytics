import React from 'react';
import { ScrollView } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';
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
