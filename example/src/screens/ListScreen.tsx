import React from 'react';
import PageAnalytics, { AnalyticProps, ScrollShowEvent } from '../../../src';
import {
  ScrollView,
  TouchableHighlight,
  NativeModules,
  FlatList,
  View,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';
import { TestUseNavigation } from './Screen1';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default class ListScreen extends React.Component {
  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: Array(10).fill('name'),
    // list: ['0'],
  };

  componentDidMount() {}

  componentWillUnmount() {}

  pressHandler = () => {
    NativeModules.Page.start(
      'iting://open?msg_type=14&url=https://www.baidu.com'
    );
  };

  createItem = ({ item, index }: { item: string; index: number }) => {
    // return <TestUseNavigation title={item} />;
    return (
      <PageAnalytics.ScrollAnalyticItem
        key={index}
        {...this.props}
        onShow={(e: ScrollShowEvent) => {
          console.log(
            `show -- ${index} hasInteracted: ${e.hasInteracted} hasViewed: ${e.hasViewed}`
          );
        }}
        onHide={() => {
          console.log(`hide-- ${index}`);
        }}
        useNavigation={useNavigation}
      >
        <TouchableHighlight onPress={this.pressHandler}>
          <View
            style={{
              width: 200,
              height: 200,
              backgroundColor: 'red',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ color: 'white', fontSize: 15 }}
            >{`${item} -- ${index}`}</Text>
          </View>
        </TouchableHighlight>
      </PageAnalytics.ScrollAnalyticItem>
    );
  };

  createSeperator = () => <View style={{ width: '100%', height: 10 }} />;

  render() {
    return (
      <Container>
        <FlatList
          data={this.state.list}
          renderItem={this.createItem}
          keyExtractor={(item, index) => index.toString()}
          ItemSeparatorComponent={this.createSeperator}
        />
      </Container>
    );
  }
}
