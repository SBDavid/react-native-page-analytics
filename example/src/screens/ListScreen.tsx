// import React from 'react';
// import PageAnalytics, {
//   AnalyticProps,
//   ScrollShowEvent,
//   ScrollEventSender,
//   ScrollAnalyticComp,
//   ScrollAnalyticWapper,
//   DisableWrapper,
// } from '../../../src';
// import {
//   ScrollView,
//   TouchableHighlight,
//   NativeModules,
//   FlatList,
//   View,
//   Text,
//   Dimensions,
//   StyleSheet,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// import Content from '../components/Content';
// import { Container, Item, ItemText } from './StyledComponents';
// import Utils from '../utils';
// import RouterName from '../router';
// import Button from '../components/Button';

// interface HomePageProps {}

// interface HomePageState {
//   list1: string[];
//   list2: string[];
//   tabList: number[];
//   selectedTab: number;
//   list1Diabled: boolean;
//   list2Diabled: boolean;
// }

// export default class ListScreen extends React.Component<
//   HomePageProps & AnalyticProps,
//   HomePageState
// > {
//   constructor(props: HomePageProps & AnalyticProps) {
//     super(props);
//     this.screenWidth = Dimensions.get('screen').width;
//   }

//   state: HomePageState = {
//     list1: Array(10).fill('list1'),
//     list2: Array(6).fill('list2'),
//     tabList: [0, 1],
//     selectedTab: 0,
//     list1Diabled: false,
//     list2Diabled: true,
//   };

//   screenWidth: number;

//   list1Id: string = 'list1Id';

//   list2Id: string = 'list2Id';

//   componentDidMount() {}

//   componentWillUnmount() {}

//   pressHandler = () => {
//     NativeModules.Page.start(
//       'iting://open?msg_type=14&url=https://www.baidu.com'
//     );
//   };

//   createItem = ({ item, index }: { item: string; index: number }) => {
//     // return <TestUseNavigation title={item} />;
//     return (
//       <ScrollAnalyticComp
//         itemKey={item + '  ' + index}
//         // key={index}
//         onShow={(exposeType: number) => {
//           console.log(
//             `onShow  ${item}  index:${index + 1}  type: ${exposeType}`
//           );
//         }}
//         onHide={() => {
//           console.log(`onHide  ${item}  index:${index + 1}`);
//         }}
//         onRefreshed={() => {
//           console.log(`onRefreshed  ${item}  index:${index + 1}`);
//         }}
//         // useNavigation={useNavigation}
//         {...this.props}
//       >
//         <TouchableHighlight onPress={this.pressHandler}>
//           <View
//             style={{
//               width: this.screenWidth,
//               height: 120,
//               backgroundColor: 'red',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}
//           >
//             <Text style={{ color: 'white', fontSize: 15 }}>{`${item} -- ${
//               index + 1
//             }`}</Text>
//           </View>
//         </TouchableHighlight>
//       </ScrollAnalyticComp>
//     );
//   };

//   createSeperator = () => <View style={{ width: '100%', height: 10 }} />;

//   tabHandler = (item: number) => {
//     if (item === 0) {
//       this.setState({ list1Diabled: false, list2Diabled: true });
//       ScrollEventSender.send(this.list1Id, 'show');
//       ScrollEventSender.send(this.list2Id, 'hide');
//     } else {
//       this.setState({ list1Diabled: true, list2Diabled: false });
//       ScrollEventSender.send(this.list1Id, 'hide');
//       ScrollEventSender.send(this.list2Id, 'show');
//     }
//     this.setState({ selectedTab: item });
//   };

//   refreshHandler = (item: number) => {
//     if (item === this.state.tabList[0]) {
//       ScrollEventSender.send(this.list1Id, 'refreshed');
//     } else {
//       ScrollEventSender.send(this.list2Id, 'refreshed');
//     }
//   };

//   createTab = () => {
//     return (
//       <View
//         style={{
//           display: 'flex',
//           flexDirection: 'row',
//           justifyContent: 'center',
//         }}
//       >
//         {this.state.tabList.map((item) => (
//           <View
//             style={{
//               display: 'flex',
//               flexDirection: 'column',
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}
//             key={item}
//           >
//             <Button
//               title={item.toString()}
//               handler={() => this.tabHandler(item)}
//               selected={this.state.selectedTab === item}
//             />

//             <View style={{ marginTop: 5 }}>
//               <TouchableHighlight onPress={() => this.refreshHandler(item)}>
//                 <Text style={{ fontSize: 20, color: 'white' }}>刷新</Text>
//               </TouchableHighlight>
//             </View>
//           </View>
//         ))}
//       </View>
//     );
//   };

//   handleList1Scroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//     // console.log(event);
//     ScrollEventSender.send(this.list1Id, 'scroll');
//   };

//   handleList2Scroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
//     // console.log(event);
//     ScrollEventSender.send(this.list2Id, 'scroll');
//   };

//   render() {
//     return (
//       <>
//         {this.createTab()}
//         <View
//           style={{
//             width: this.screenWidth,
//             height: 400,
//             display: 'flex',
//             flexDirection: 'row',
//             marginTop: 20,
//             marginLeft:
//               this.state.selectedTab === this.state.tabList[0]
//                 ? 0
//                 : -this.screenWidth,
//           }}
//         >
//           <View
//             style={{
//               paddingHorizontal: 10,
//               width: this.screenWidth,
//               display: 'flex',
//               justifyContent: 'center',
//             }}
//           >
//             <DisableWrapper disable={this.state.list1Diabled}>
//               <ScrollAnalyticWapper
//                 id={this.list1Id}
//                 useNavigation={useNavigation}
//               >
//                 <FlatList
//                   onScroll={this.handleList1Scroll}
//                   data={this.state.list1}
//                   renderItem={this.createItem}
//                   keyExtractor={(item, index) => index.toString()}
//                   ItemSeparatorComponent={this.createSeperator}
//                 />
//               </ScrollAnalyticWapper>
//             </DisableWrapper>
//           </View>
//           <View
//             style={{
//               paddingHorizontal: 10,
//               width: this.screenWidth,
//               display: 'flex',
//               justifyContent: 'center',
//             }}
//           >
//             <DisableWrapper disable={this.state.list2Diabled}>
//               <ScrollAnalyticWapper
//                 id={this.list2Id}
//                 useNavigation={useNavigation}
//               >
//                 <FlatList
//                   onScroll={this.handleList2Scroll}
//                   data={this.state.list2}
//                   renderItem={this.createItem}
//                   keyExtractor={(item, index) => index.toString()}
//                   ItemSeparatorComponent={this.createSeperator}
//                 />
//               </ScrollAnalyticWapper>
//             </DisableWrapper>
//           </View>
//         </View>
//       </>
//     );
//   }
// }

import React from 'react';
import PageAnalytics, {
  AnalyticProps,
  ScrollShowEvent,
  ScrollEventSender,
  ScrollAnalyticComp,
  ScrollAnalyticWapper,
  DisableWrapper,
} from '../../../src';
import {
  ScrollView,
  TouchableHighlight,
  NativeModules,
  FlatList,
  View,
  Text,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScrollableTabView, {
  ChangeTabProperties,
} from 'react-native-scrollable-tab-view';
import styled from 'styled-components';

import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';
import Button from '../components/Button';

const PageWrapper = styled(View)<{
  screenWidth: number;
  [index: string]: any;
}>`
  padding: 0 10px 0 10px;
  width: ${(props) => props.screenWidth}px;
  display: flex;
  justify-content: center;
`;

interface HomePageProps {}

interface HomePageState {
  list1: string[];
  list2: string[];
  tabList: number[];
  selectedTab: number;
  list1Diabled: boolean;
  list2Diabled: boolean;
  list1Refreshing: boolean;
  list2Refreshing: boolean;
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
    list1Refreshing: false,
    list2Refreshing: false,
  };

  screenWidth: number;

  list1Id: string = 'list1Id';

  list2Id: string = 'list2Id';

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
      <ScrollAnalyticComp
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
        // useNavigation={useNavigation}
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
      </ScrollAnalyticComp>
    );
  };

  createSeperator = () => <View style={{ width: '100%', height: 10 }} />;

  tabHandler = (item: number) => {
    if (item === 0) {
      this.setState({ list1Diabled: false, list2Diabled: true });
      ScrollEventSender.send(this.list1Id, 'show');
      ScrollEventSender.send(this.list2Id, 'hide');
    } else {
      this.setState({ list1Diabled: true, list2Diabled: false });
      ScrollEventSender.send(this.list1Id, 'hide');
      ScrollEventSender.send(this.list2Id, 'show');
    }
    this.setState({ selectedTab: item });
  };

  refreshHandler = (item: number) => {
    if (item === this.state.tabList[0]) {
      ScrollEventSender.send(this.list1Id, 'refreshed');
    } else {
      ScrollEventSender.send(this.list2Id, 'refreshed');
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

  handleList1Scroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log(event);
    ScrollEventSender.send(this.list1Id, 'scroll');
  };

  handleList2Scroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log(event);
    ScrollEventSender.send(this.list2Id, 'scroll');
  };

  onList1Refresh = () => {
    this.setState({ list1Refreshing: true });
    setTimeout(() => {
      this.setState({ list1Refreshing: false });
      ScrollEventSender.send(this.list1Id, 'refreshed');
    }, 1500);
  };

  onList2Refresh = () => {
    this.setState({ list2Refreshing: true });
    setTimeout(() => {
      this.setState({ list2Refreshing: false });
      ScrollEventSender.send(this.list2Id, 'refreshed');
    }, 1500);
  };

  onTabChange = (value: ChangeTabProperties) => {
    console.log(`onTabChange from: ${value.from}   i: ${value.i}`);
    if (value.i === value.from) {
      return;
    }
    if (value.i === 0) {
      console.log('切换到list1');
      this.setState({ list1Diabled: false, list2Diabled: true }, () => {
        ScrollEventSender.send(this.list1Id, 'show');
        ScrollEventSender.send(this.list2Id, 'hide');
      });
    } else {
      console.log('切换到list2');
      this.setState({ list1Diabled: true, list2Diabled: false }, () => {
        ScrollEventSender.send(this.list1Id, 'hide');
        ScrollEventSender.send(this.list2Id, 'show');
      });
    }
  };

  render() {
    return (
      <ScrollableTabView
        tabBarUnderlineStyle={{ backgroundColor: 'white', borderRadius: 5 }}
        tabBarTextStyle={{ color: 'white', fontSize: 18 }}
        tabBarActiveTextColor=""
        onChangeTab={this.onTabChange}
        initialPage={0}
      >
        <PageWrapper screenWidth={this.screenWidth} tabLabel="Tab1">
          <DisableWrapper disable={this.state.list1Diabled}>
            <ScrollAnalyticWapper
              id={this.list1Id}
              useNavigation={useNavigation}
            >
              <FlatList
                onScroll={this.handleList1Scroll}
                data={this.state.list1}
                renderItem={this.createItem}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={this.createSeperator}
                refreshControl={
                  <RefreshControl
                    tintColor="#eee"
                    colors={['#eee']}
                    refreshing={this.state.list1Refreshing}
                    onRefresh={this.onList1Refresh}
                  />
                }
              />
            </ScrollAnalyticWapper>
          </DisableWrapper>
        </PageWrapper>

        <PageWrapper screenWidth={this.screenWidth} tabLabel="Tab2">
          <DisableWrapper disable={this.state.list2Diabled}>
            <ScrollAnalyticWapper
              id={this.list2Id}
              useNavigation={useNavigation}
            >
              <FlatList
                onScroll={this.handleList2Scroll}
                data={this.state.list2}
                renderItem={this.createItem}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={this.createSeperator}
                refreshControl={
                  <RefreshControl
                    enabled={true}
                    tintColor="#eee"
                    colors={['#eee']}
                    refreshing={this.state.list2Refreshing}
                    onRefresh={this.onList2Refresh}
                  />
                }
              />
            </ScrollAnalyticWapper>
          </DisableWrapper>
        </PageWrapper>
      </ScrollableTabView>
    );
  }
}
