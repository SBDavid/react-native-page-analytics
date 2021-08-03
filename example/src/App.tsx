import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import 'react-native-gesture-handler';
import PageAnalytics from 'react-native-page-analytics';
import Home from './screens/Home';
import Screen1 from './screens/Screen1';
import Screen2 from './screens/Screen2';

const Stack = createNativeStackNavigator();

export default function App() {
  const [result] = React.useState<number | undefined>();

  React.useEffect(() => {
    console.info(PageAnalytics);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="screen1" component={Screen1} />
        <Stack.Screen name="screen1" component={Screen2} />
      </Stack.Navigator>
      <View style={styles.container}>
        <Text>Result: {result}</Text>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
