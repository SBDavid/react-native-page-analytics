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

interface HomePageProps {}

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

export default class HomeTab extends PageAnalytics.Screen<
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
    this.currPage = 'home_tab';
    this.viewProps = { customData: 'customData' };
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

  // 同步设置页面pageViewProps
  syncSetPageViewProps = () => {
    this.setPageViewProps({
      metaId: this.metaId,
      currPage: this.currPage,
      props: this.viewProps,
    });
  };

  // 异步设置页面pageViewProps
  asyncSetPageViewProps = async () => {
    await Utils.delay(2000);
    this.setPageViewProps({
      metaId: this.metaId,
      currPage: this.currPage,
      props: this.viewProps,
    });
  };

  handlePress = (item: RouterName) => {
    this.props.navigation.navigate(item);
  };

  render() {
    return (
      <Tab.Navigator
        // initialRouteName={RouterName.TAB1}
        tabBar={(props) => <TabButton {...props} />}
      >
        <Tab.Screen
          name={RouterName.TAB1}
          component={Tab1}
          // component={(props) => {
          //   return (
          //     <LazyLoad
          //       fallback={null}
          //       factory={() => import('./Tab1')}
          //       name="tab1页面"
          //       {...props}
          //     />
          //   );
          // }}
        />
        <Tab.Screen name={RouterName.TAB2} component={Tab2} />
        <Tab.Screen name={RouterName.TAB3} component={Tab3} />
      </Tab.Navigator>
    );
  }
}
