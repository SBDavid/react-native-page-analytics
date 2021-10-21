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
import {
  AnalyticProps,
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

import Button from '../components/Button';
import { Toast } from '@xmly/rn-sdk';

const PageWrapper = styled(View)<{
  screenWidth: number;
  [index: string]: any;
}>`
  padding: 0 10px 0 10px;
  width: ${(props) => props.screenWidth}px;
  display: flex;
  justify-content: center;
`;

const TotalWrapper = styled(View)`
  height: 500px;
  border: 1px solid red;
`;

const ScrollViewContentWrapper = styled(View)<{
  width: number;
  height: number;
  backgroundColor: string;
}>`
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  display: flex;
  background-color: ${(props) => props.backgroundColor};
  justify-content: center;
  align-items: center;
  margin: 10px 0;
  border-radius: 5px;
`;

const ScrollViewContentText = styled(Text)`
  font-size: 20px;
  color: white;
`;

const InnerListItemWrapper = styled(View)`
  width: 120px;
  height: 120px;
  border-radius: 5px;
  background-color: rgba(0, 0, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InnerListItemText = styled(Text)`
  font-size: 18px;
  color: white;
`;

const VerticalListItemWrapper = styled(View)<{ width: number }>`
  width: ${(props) => props.width}px;
  height: 120px;
  border-radius: 5px;
  background-color: rgba(255, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
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

type ListType = 'list1' | 'list2';
export default class ListScreen extends React.Component<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
    this.screenWidth = Dimensions.get('screen').width;
  }

  state: HomePageState = {
    list1: Array(5).fill('list1'),
    list2: Array(5).fill('list2'),
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

  onShowHandler = (name: string, exposeType: number) => {
    console.log(`onShow  type: ${exposeType}  name: ${name}`);
  };

  createHorizontalListItem = ({
    item,
    index,
    outerIndex,
    type,
  }: {
    item: string;
    index: number;
    outerIndex: number;
    type: ListType;
  }) => {
    return (
      <ScrollAnalyticComp
        itemKey={(outerIndex + item + index).toString()}
        onShow={(exposeType: number) => {
          this.onShowHandler(`${type}--${outerIndex}--${index}`, exposeType);
        }}
        onHide={() => {}}
        onRefreshed={() => {}}
      >
        <InnerListItemWrapper>
          <InnerListItemText>{`${type}--${outerIndex}--${index}`}</InnerListItemText>
        </InnerListItemWrapper>
      </ScrollAnalyticComp>
    );
  };

  createHorizontalList = (index: number, type: ListType): JSX.Element => {
    const list = Array(4 + Number((Math.random() * 10).toFixed(0))).fill('');
    return (
      <FlatList
        horizontal
        onScroll={(e) => {
          if (type === 'list1') {
            this.handleList1HorizontalScroll(e);
          } else {
            this.handleList2HorizontalScroll(e);
          }
        }}
        data={list}
        renderItem={({ item, index: innerIndex }) => {
          return this.createHorizontalListItem({
            item,
            index: innerIndex,
            outerIndex: index,
            type,
          });
        }}
        keyExtractor={(item, innerIndex) => innerIndex.toString()}
        ItemSeparatorComponent={this.createHorizontalSeperator}
      />
    );
  };

  createVerticalItem = ({
    item,
    index,
    type,
  }: {
    item: string;
    index: number;
    type: ListType;
  }) => {
    // return <TestUseNavigation title={item} />;
    if (index !== 0 && index % 2 === 0) {
      return this.createHorizontalList(index, type);
    } else {
      return (
        <ScrollAnalyticComp
          itemKey={item + '  ' + index}
          // key={index}
          onShow={(exposeType: number) => {
            this.onShowHandler(`${item}--${index}`, exposeType);
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
            <VerticalListItemWrapper width={this.screenWidth}>
              <InnerListItemText>{`${item}--${index}`}</InnerListItemText>
            </VerticalListItemWrapper>
          </TouchableHighlight>
        </ScrollAnalyticComp>
      );
    }
  };

  createSeperator = () => <View style={{ width: '100%', height: 10 }} />;

  createHorizontalSeperator = () => <View style={{ width: 10, height: 5 }} />;

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

  handleList1HorizontalScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    // console.log(event);
    ScrollEventSender.send(this.list1Id, 'scroll');
  };

  handleList2HorizontalScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    // console.log(event);
    ScrollEventSender.send(this.list2Id, 'scroll');
  };

  onList1Refresh = async () => {
    this.setState({ list1Refreshing: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newList = this.state.list1.map((item) => item + '*');
    this.setState({ list1: newList, list1Refreshing: false });
    ScrollEventSender.send(this.list1Id, 'refreshed');
    Toast.info('list1内容刷新成功');
  };

  onList2Refresh = async () => {
    this.setState({ list2Refreshing: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newList = this.state.list1.map((item) => item + '*');
    this.setState({ list2: newList, list2Refreshing: false });
    ScrollEventSender.send(this.list2Id, 'refreshed');
    Toast.info('list2内容刷新成功');
  };

  onTabChange = async (value: ChangeTabProperties) => {
    console.log(`onTabChange from: ${value.from}   i: ${value.i}`);
    if (value.i === value.from) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (value.i === 0) {
      console.log('切换到list1');
      ScrollEventSender.send(this.list1Id, 'enable');
      ScrollEventSender.send(this.list2Id, 'disable');

      ScrollEventSender.send(this.list1Id, 'show');
      ScrollEventSender.send(this.list2Id, 'hide');
    } else {
      console.log('切换到list2');
      ScrollEventSender.send(this.list1Id, 'disable');
      ScrollEventSender.send(this.list2Id, 'enable');

      console.log('切换到list2 show');
      ScrollEventSender.send(this.list1Id, 'hide');
      ScrollEventSender.send(this.list2Id, 'show');
    }
  };

  onEndReacheHandler = async (type: ListType) => {
    if (type === 'list1') {
      if (this.state.list1.length < 30) {
        this.setState({
          list1: [...this.state.list1, ...Array(5).fill('list1')],
        });
      }
    } else {
      if (this.state.list2.length < 30) {
        this.setState({
          list2: [...this.state.list2, ...Array(5).fill('list2')],
        });
      }
    }
  };

  createFlatList = (): JSX.Element => {
    return (
      <PageWrapper screenWidth={this.screenWidth} tabLabel="FlatList">
        <DisableWrapper id={this.list1Id} defalutValue={false} debugKey={'1'}>
          <ScrollAnalyticWapper id={this.list1Id} useNavigation={useNavigation}>
            <FlatList
              onScroll={this.handleList1Scroll}
              data={this.state.list1}
              renderItem={({ item, index }) => {
                return this.createVerticalItem({
                  item,
                  index,
                  type: 'list1',
                });
              }}
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
              onEndReached={() => {
                this.onEndReacheHandler('list1');
              }}
              onEndReachedThreshold={0.5}
            />
          </ScrollAnalyticWapper>
        </DisableWrapper>
      </PageWrapper>
    );
  };

  handleScrollViewScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    ScrollEventSender.send(this.list2Id, 'scroll');
  };

  createScrollView = (): JSX.Element => {
    return (
      <PageWrapper screenWidth={this.screenWidth} tabLabel="ScrollView">
        <DisableWrapper
          defalutValue={true}
          id={this.list2Id}
          debugKey={this.list2Id}
        >
          <ScrollAnalyticWapper
            key={this.list2Id}
            id={this.list2Id}
            useNavigation={useNavigation}
          >
            <ScrollView onScroll={this.handleScrollViewScroll}>
              {[1, 2, 3, 4, 5].map((item, index) => {
                return (
                  <ScrollAnalyticComp
                    key={`scrollViewkey-${index}`}
                    itemKey={`scrollViewkey-${index}`}
                    onShow={(exposeType: number) => {
                      this.onShowHandler(`scrollView--${index}`, exposeType);
                    }}
                  >
                    <ScrollViewContentWrapper
                      width={this.screenWidth}
                      height={150 + 100 * Math.random()}
                      backgroundColor="rgba(255, 0, 0, 0.75)"
                    >
                      <ScrollViewContentText>
                        {`scrollView内容 -- ${index}`}
                      </ScrollViewContentText>
                    </ScrollViewContentWrapper>
                  </ScrollAnalyticComp>
                );
              })}
            </ScrollView>
          </ScrollAnalyticWapper>
        </DisableWrapper>
      </PageWrapper>
    );
  };

  render() {
    return (
      <TotalWrapper>
        <ScrollableTabView
          tabBarUnderlineStyle={{ backgroundColor: 'white', borderRadius: 5 }}
          tabBarTextStyle={{ color: 'white', fontSize: 18 }}
          tabBarActiveTextColor=""
          onChangeTab={this.onTabChange}
          initialPage={0}
        >
          {this.createFlatList()}
          {this.createScrollView()}
        </ScrollableTabView>
      </TotalWrapper>
    );
  }
}
