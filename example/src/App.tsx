import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import RouterName from './router';
import HomeTab from './screens/HomeTab';
import Screen1 from './screens/Screen1';
import Screen2 from './screens/Screen2';
// import LazyLoad from './screens/LazyLoad';
import LazyLoad from 'react-navigation-lazy-screen';

const Stack = createStackNavigator();

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

export default function App() {
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
