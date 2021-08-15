import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native';

import RouterName from './router';
import HomeTab from './screens/HomeTab';
import Screen1 from './screens/Screen1';
import Screen2 from './screens/Screen2';
// import LazyLoad from './screens/LazyLoad';
import LazyLoad from 'react-navigation-lazy-screen';

const Stack = createStackNavigator();
const EventEmitter = new NativeEventEmitter(NativeModules.Page);

const LazyScreen1: React.FC = (props) => {
  return (
    <LazyLoad
      fallback={null}
      factory={() => import('./screens/Screen1')}
      {...props}
    />
  );
};

const LazyScreen2: React.FC = (props) => {
  return (
    <LazyLoad
      fallback={null}
      factory={() => import('./screens/Screen2')}
      {...props}
    />
  );
};

export default class App extends React.PureComponent {
  // onPauseSubs: EmitterSubscription;
  // onResumeSubs: EmitterSubscription;

  constructor(props: any) {
    super(props);
    // this.onPauseSubs = EventEmitter.addListener('onPause', () => {
    //   console.log('最外层收到onPause事件');
    // });
    // this.onResumeSubs = EventEmitter.addListener('onResume', () => {
    //   console.log('最外层收到onResume事件');
    // });
  }

  componentWillUnmount() {
    // this.onPauseSubs?.remove();
    // this.onResumeSubs?.remove();
  }

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={RouterName.HOME_TAB}>
          <Stack.Screen name={RouterName.HOME_TAB} component={HomeTab} />

          {/* 懒加载页面 */}
          <Stack.Screen
            name={RouterName.SCREEN1 as string}
            component={LazyScreen1}
          />
          <Stack.Screen
            name={RouterName.SCREEN2 as string}
            component={LazyScreen2}
          />

          {/* 非懒加载页面 */}
          {/* <Stack.Screen name={RouterName.SCREEN1 as string} component={Screen1} /> */}
          {/* <Stack.Screen name={RouterName.SCREEN2 as string} component={Screen2} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
