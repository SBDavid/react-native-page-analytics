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
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';
import Button from '../components/Button';
import ScrollAnalyticWapper from '../../../src/ScrollAnalyticWapper';
import DisableWrapper from '../../../src/DisableWrapper';

interface HomePageProps {}

interface HomePageState {
  list1: string[];
  list2: string[];
  tabList: number[];
  selectedTab: number;
  list1Diabled: boolean;
  list2Diabled: boolean;
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
    list1Diabled: false,
    list2Diabled: true,
  };

  screenWidth: number;

  list1Ref: React.RefObject<ScrollAnalyticWapper> = React.createRef();

  list2Ref: React.RefObject<ScrollAnalyticWapper> = React.createRef();

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
        itemKey={item + '  ' + index}
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
      this.setState({ list1Diabled: false, list2Diabled: true });
      this.list2Ref.current?.triggerHide();
      this.list1Ref.current?.triggerShow();
    } else {
      this.setState({ list1Diabled: true, list2Diabled: false });
      this.list1Ref.current?.triggerHide();
      this.list2Ref.current?.triggerShow();
    }
    this.setState({ selectedTab: item });
  };

  refreshHandler = (item: number) => {
    if (item === this.state.tabList[0]) {
      this.list1Ref.current?.triggerRefreshed();
    } else {
      this.list2Ref.current?.triggerRefreshed();
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
            key={item}
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
            marginTop: 20,
            marginLeft:
              this.state.selectedTab === this.state.tabList[0]
                ? 0
                : -this.screenWidth,
          }}
        >
          <View
            style={{
              paddingHorizontal: 10,
              width: this.screenWidth,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <DisableWrapper disable={this.state.list1Diabled}>
              <ScrollAnalyticWapper
                ref={this.list1Ref}
                buildChildren={(onScroll, onRefreshed) => {
                  return (
                    <FlatList
                      onScroll={onScroll}
                      data={this.state.list1}
                      renderItem={this.createItem}
                      keyExtractor={(item, index) => index.toString()}
                      ItemSeparatorComponent={this.createSeperator}
                    />
                  );
                }}
              />
            </DisableWrapper>
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              width: this.screenWidth,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <DisableWrapper disable={this.state.list2Diabled}>
              <ScrollAnalyticWapper
                ref={this.list2Ref}
                buildChildren={(onScroll, onRefreshed) => {
                  return (
                    <FlatList
                      onScroll={onScroll}
                      data={this.state.list2}
                      renderItem={this.createItem}
                      keyExtractor={(item, index) => index.toString()}
                      ItemSeparatorComponent={this.createSeperator}
                    />
                  );
                }}
              />
            </DisableWrapper>
          </View>
        </View>
      </>
    );
  }
}
