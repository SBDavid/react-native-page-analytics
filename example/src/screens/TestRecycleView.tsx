import * as React from 'react';
import TestItem1 from './TestItem';
import { VirtualizedList, ListRenderItemInfo, View } from 'react-native';
import RecyclerView from '@xmly/react-native-recycler-view';

export default class TestRecycleView extends React.PureComponent<
  {},
  { refreshing: boolean }
> {
  listData = [
    { title: '0' },
    { title: '0' },
    { title: '0' },
    { title: '0' },
    { title: '0' },
    { title: '0' },
  ];

  constructor(prop: any) {
    super(prop);
    this.renderItem = this.renderItem.bind(this);

    this.state = {
      refreshing: false,
    };
  }

  renderItem(info: ListRenderItemInfo<{ title: string }>) {
    // if (info.item.title === 'v') {
    //   return (
    //     <VirtualizedList
    //       horizontal
    //       data={['11', 'p']}
    //       renderItem={(innerInfo: ListRenderItemInfo<string>) => {
    //         return <TestItem1 text={innerInfo.item} />;
    //       }}
    //       getItemCount={(data) => data.length}
    //       getItem={(data, index) => data[index]}
    //       keyExtractor={(item) => item}
    //     />
    //   );
    // }

    // if (info.item.title === 'b') {
    //   return (
    //     <VirtualizedList
    //       horizontal
    //       data={['21', '22']}
    //       renderItem={(innerInfo: ListRenderItemInfo<string>) => {
    //         return <TestItem1 text={innerInfo.item} />;
    //       }}
    //       getItemCount={(data) => data.length}
    //       getItem={(data, index) => data[index]}
    //       keyExtractor={(item) => item}
    //     />
    //   );
    // }

    console.info(info);

    return <TestItem1 text={'111'} />;
  }

  listRef = React.createRef<VirtualizedList<string>>();

  componentDidMount() {
    setTimeout(() => {
      // console.info(this.listRef.current?._frames);
    }, 500);
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {/* <View style={{height: 100, backgroundColor: 'red'}} /> */}
        <RecyclerView
          View style={{ flex: 1 }}
          ref={this.listRef}
          data={this.listData}
          binderMap={{ title: String }}
          renderRow={[{ type: '1', renderFuc: this.renderItem }]}
          getItemCount={(data) => data.length}
          getItem={(data, index) => data[index]}
          keyExtractor={(item) => item.text}
          refreshing={this.state.refreshing}
          // onRefresh={() => {
          //   this.setState({ refreshing: true });
          //   setTimeout(() => {
          //     // @ts-ignore
          //     this.listRef?.current?.triggerManuallyRefreshed();
          //     this.setState({ refreshing: false });
          //   }, 200);
          // }}
        />
      </View>
    );
  }
}
