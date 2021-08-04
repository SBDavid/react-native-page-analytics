import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { Container } from './StyledComponents';
import RouterName from '../router';
import styled from 'styled-components';
import Utils from '../utils';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

const TabButtonContainer = styled(View)`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: white;
`;

const TabButtonItem = styled(View)`
  padding: 5px 10px;
  border: 1px solid red;
  background-color: white;
  border-radius: 5px;
`;

const TabButtonItemText = styled(Text)`
  font-size: 20px;
  color: green;
`;

const Tab = createBottomTabNavigator();

function TabButton({ state, navigation }: BottomTabBarProps) {
  return (
    <TabButtonContainer>
      {state.routes.map((item, index) => {
        return (
          <TouchableHighlight
            onPress={() => {
              navigation.navigate(item.name);
            }}
          >
            <TabButtonItem>
              <TabButtonItemText>{item.name}</TabButtonItemText>
            </TabButtonItem>
          </TouchableHighlight>
        );
      })}
    </TabButtonContainer>
  );
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
        <Tab.Navigator tabBar={(props) => <TabButton {...props} />}>
          <Tab.Screen name={RouterName.TAB1} component={Tab1} />
          <Tab.Screen name={RouterName.TAB2} component={Tab2} />
          <Tab.Screen name={RouterName.TAB3} component={Tab3} />
        </Tab.Navigator>
      </Container>
    );
  }
}
