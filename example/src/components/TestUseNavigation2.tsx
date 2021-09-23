import * as React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import { useNavigation, NavigationContext } from '@react-navigation/native';

export default function TestUseNavigation2(props: { title: string }) {
  const navigation = useNavigation();
  // const navigation = React.useContext(NavigationContext);
  console.log(`testUseNavigation2InProject print ${navigation}`);

  return (
    <TouchableHighlight onPress={() => navigation.navigate('screen2')}>
      <View>
        <Text style={{ fontSize: 25, color: 'red' }}>{props.title}</Text>
      </View>
    </TouchableHighlight>
  );
}
