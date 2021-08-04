import 'react-native-gesture-handler';
import * as React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/Home';
import Screen1 from './screens/Screen1';
import Screen2 from './screens/Screen2';
import Tab from './screens/Tab';
import RouterName from './router';

const Stack = createStackNavigator();

const LazyScreen1 = React.lazy(() => import('./screens/Screen1'));
const LazyScreen2 = React.lazy(() => import('./screens/Screen2'));

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={RouterName.HOME}>
        <Stack.Screen
          name={RouterName.HOME}
          component={(props) => (
            <Home
              currentPage="homePage"
              pageViewId={0}
              pageExitId={1}
              {...props}
            />
          )}
        />
        <Stack.Screen
          name={RouterName.SCREEN1 as string}
          component={(props) => (
            <Screen1
              currentPage="screen1"
              pageViewId={0}
              pageExitId={1}
              {...props}
            />
            // <React.Suspense fallback={null}>
            //   <LazyScreen1
            //     currentPage="screen1"
            //     pageViewId={0}
            //     pageExitId={1}
            //     {...props}
            //   />
            // </React.Suspense>
          )}
        />
        <Stack.Screen
          name={RouterName.SCREEN2 as string}
          component={(props) => (
            <Screen2
              currentPage="screen2"
              pageViewId={0}
              pageExitId={1}
              {...props}
            />
            // <React.Suspense fallback={null}>
            //   <LazyScreen2
            //     currentPage="screen2"
            //     pageViewId={0}
            //     pageExitId={1}
            //     {...props}
            //   />
            // </React.Suspense>
          )}
        />
        <Stack.Screen
          name={RouterName.TAB}
          component={(props) => (
            <Tab
              currentPage="tabPage"
              pageViewId={0}
              pageExitId={1}
              {...props}
            />
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
