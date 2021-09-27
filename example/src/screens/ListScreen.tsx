import React from 'react';
import PageAnalytics, { AnalyticProps, ScrollShowEvent } from '../../../src';
import {
  ScrollView,
  TouchableHighlight,
  NativeModules,
  FlatList,
  View,
  Text,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';
import Button from '../components/Button';

interface HomePageProps {}

interface HomePageState {
  list1: string[];
  list2: string[];
  tabList: number[];
  selectedTab: number;
}

export default class ListScreen extends React.Component<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
    this.screenWidth = Dimensions.get('screen').width;
  }

  state: HomePageState = {
    list1: Array(10).fill('list1'),
    list2: Array(6).fill('list2'),
    tabList: [0, 1],
    selectedTab: 0,
  };

  screenWidth: number;

  list1Ref: React.RefObject<
    FlatList & {
      triggerManuallyRefreshed: any;
      triggerManuallyHide: any;
      triggerManuallyShow: any;
    }
  > = React.createRef();

  list2Ref: React.RefObject<
    FlatList & {
      triggerManuallyRefreshed: any;
      triggerManuallyHide: any;
      triggerManuallyShow: any;
    }
  > = React.createRef();

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
      <PageAnalytics.ScrollAnalyticComp
        // key={index}
        onShow={(exposeType: number) => {
          console.log(
            `onShow  ${item}  index:${index + 1}  type: ${exposeType}`
          );
        }}
        onHide={() => {
          console.log(`onHide  ${item}  index:${index + 1}`);
        }}
        onRefreshed={() => {
          console.log(`onRefreshed  ${item}  index:${index + 1}`);
        }}
        useNavigation={useNavigation}
        {...this.props}
      >
        <TouchableHighlight onPress={this.pressHandler}>
          <View
            style={{
              width: this.screenWidth,
              height: 120,
              backgroundColor: 'red',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 15 }}>{`${item} -- ${
              index + 1
            }`}</Text>
          </View>
        </TouchableHighlight>
      </PageAnalytics.ScrollAnalyticComp>
    );
  };

  createSeperator = () => <View style={{ width: '100%', height: 10 }} />;

  tabHandler = (item: number) => {
    if (item === 0) {
      this.list2Ref.current?.triggerManuallyHide();
      this.list1Ref.current?.triggerManuallyShow();
    } else {
      this.list1Ref.current?.triggerManuallyHide();
      this.list2Ref.current?.triggerManuallyShow();
    }
    this.setState({ selectedTab: item });
  };

  refreshHandler = (item: number) => {
    if (item === this.state.tabList[0]) {
      this.list1Ref.current?.triggerManuallyRefreshed();
    } else {
      this.list2Ref.current?.triggerManuallyRefreshed();
    }
  };

  createTab = () => {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        {this.state.tabList.map((item) => (
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              title={item.toString()}
              handler={() => this.tabHandler(item)}
              selected={this.state.selectedTab === item}
            />

            <View style={{ marginTop: 5 }}>
              <TouchableHighlight onPress={() => this.refreshHandler(item)}>
                <Text style={{ fontSize: 20, color: 'white' }}>刷新</Text>
              </TouchableHighlight>
            </View>
          </View>
        ))}
      </View>
    );
  };

  render() {
    return (
      <>
        {this.createTab()}
        <View
          style={{
            width: this.screenWidth,
            height: 400,
            display: 'flex',
            flexDirection: 'row',
            // justifyContent: 'flex-start',
            marginTop: 20,
            marginLeft:
              this.state.selectedTab === this.state.tabList[0]
                ? 0
                : -this.screenWidth,
          }}
        >
          <View>
            <FlatList
              ref={this.list1Ref}
              data={this.state.list1}
              renderItem={this.createItem}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this.createSeperator}
            />
          </View>
          <View style={{ width: 10 }} />
          <View>
            <FlatList
              ref={this.list2Ref}
              data={this.state.list2}
              renderItem={this.createItem}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this.createSeperator}
            />
          </View>
        </View>
      </>
    );
  }
}
