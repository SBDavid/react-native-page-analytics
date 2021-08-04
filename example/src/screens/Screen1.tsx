import React from 'react';
import { ScrollView } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';
import BackBtn from '../components/BackBtn';
import Content from '../components/Content';
import Button from '../components/Button';
import { Container } from './StyledComponents';
import RouterName from '../router';

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

  componentDidMount() {}

  render() {
    return (
      <Container>
        <ScrollView>
          <BackBtn backBtnHandler={this.props.navigation.goBack} />
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
