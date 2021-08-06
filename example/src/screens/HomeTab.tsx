import React from 'react';
import { TouchableHighlight, View } from 'react-native';
import PageAnalytics, {
  AnalyticProps,
  AnalyticPropsParams,
  SendAnalyticFuncType,
  PageExitDataGenerType,
} from 'react-native-page-analytics';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import LazyScreen from 'react-navigation-lazy-screen';
import LazyLoad from './LazyLoad';

import RouterName from '../router';
import {
  TabButtonContainer,
  TabButtonItem,
  TabButtonItemText,
} from './StyledComponents';
import Utils from '../utils';
import Tab1 from './Tab1';
import Tab2 from './Tab2';
import Tab3 from './Tab3';

interface HomeTabProps {}

interface HomePageState {
  list: RouterName[];
}

const Tab = createBottomTabNavigator();

const LazyTab1: React.FC = (props) => {
  return (
    <LazyLoad fallback={null} factory={() => import('./Tab1')} {...props} />
  );
};

const LazyTab2: React.FC = (props) => {
  return (
    <LazyLoad fallback={null} factory={() => import('./Tab2')} {...props} />
  );
};

const LazyTab3: React.FC = (props) => {
  return (
    <LazyLoad fallback={null} factory={() => import('./Tab3')} {...props} />
  );
};

function TabButton({ state, navigation }: BottomTabBarProps) {
  return (
    <TabButtonContainer>
      {state.routes.map((item, index) => {
        return (
          <TouchableHighlight
            key={index}
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

export default class HomeTab extends React.Component<HomeTabProps> {
  constructor(props: HomeTabProps) {
    super(props);
    PageAnalytics.Screen.setSendAnalyticAction(HomeTab.sendAnalyTicOperation);
  }

  static sendAnalyTicOperation: SendAnalyticFuncType = (
    metaId: number,
    currPage: string,
    props: AnalyticPropsParams
  ) => {
    // let result = `发送数据 ${metaId} ${currPage} ${props}`;
    // console.log(`发送数据 ${metaId} ${currPage} ${props}`);
  };

  render() {
    return (
      <Tab.Navigator
        // initialRouteName={RouterName.TAB1}
        tabBar={(props) => <TabButton {...props} />}
      >
        <Tab.Screen name={RouterName.TAB1} component={LazyTab1} />
        <Tab.Screen name={RouterName.TAB2} component={LazyTab2} />
        <Tab.Screen name={RouterName.TAB3} component={LazyTab3} />
      </Tab.Navigator>
    );
  }
}
