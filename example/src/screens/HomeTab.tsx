import React from 'react';
import { TouchableHighlight } from 'react-native';
import PageAnalytics, {
  AnalyticProps,
  AnalyticPropsParams,
  SendAnalyticFuncType,
} from 'react-native-page-analytics';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

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

interface HomePageProps {}

interface HomePageState {
  list: RouterName[];
}

const Tab = createBottomTabNavigator();

export function TabButton({ state, navigation }: BottomTabBarProps) {
  return (
    <TabButtonContainer>
      {state.routes.map((item) => {
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

export default class HomeTab extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  constructor(props: HomePageProps & AnalyticProps) {
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

  state: HomePageState = {
    list: [RouterName.SCREEN1, RouterName.SCREEN2],
  };

  componentDidMount() {
    this.syncSetPageViewProps();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  // 同步设置页面pageViewProps
  syncSetPageViewProps = () => {
    this.setPageViewProps({ currPageName: 'home' });
  };

  // 异步设置页面pageViewProps
  asyncSetPageViewProps = async () => {
    await Utils.delay(2000);
    this.setPageViewProps({ currPageName: 'home' });
  };

  handlePress = (item: RouterName) => {
    this.props.navigation.navigate(item);
  };

  render() {
    return (
      <Tab.Navigator
        initialRouteName={RouterName.TAB1}
        tabBar={(props) => <TabButton {...props} />}
      >
        <Tab.Screen name={RouterName.TAB1} component={Tab1} />
        <Tab.Screen name={RouterName.TAB2} component={Tab2} />
        <Tab.Screen name={RouterName.TAB3} component={Tab3} />
      </Tab.Navigator>
    );
  }
}
