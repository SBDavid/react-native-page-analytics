import * as React from 'react';
import TestItem1 from './TestItem';
import { VirtualizedList, ListRenderItemInfo } from 'react-native';
import ScrollAnalyticWapper from '../../../src/ScrollAnalyticWapper';

export class TestVirtralLizedList extends React.PureComponent<
  {},
  { refreshing: boolean }
> {
  // listData = ['0', 'p', 'v', 'b', '2', '3', '4', '5', '6', '7', '8'];

  listData = ['v'];

  constructor(prop: any) {
    super(prop);
    this.renderItem = this.renderItem.bind(this);

    this.state = {
      refreshing: false,
    };
  }

  triggerScroll: Function | undefined;

  renderItem(info: ListRenderItemInfo<string>) {
    if (info.item === 'v') {
      return (
        <VirtualizedList
          initialNumToRender={3}
          windowSize={2}
          removeClippedSubviews={false}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={30}
          scrollEventThrottle={20}
          getItemLayout={(data, index) => ({
            length: 300,
            offset: 300 * index,
            index,
          })}
          horizontal
          data={['11', '12', '13', '14', '15']}
          renderItem={(innerInfo: ListRenderItemInfo<string>) => {
            return <TestItem1 text={innerInfo.item} />;
          }}
          getItemCount={(data) => data.length}
          getItem={(data, index) => data[index]}
          keyExtractor={(item) => item}
          onScroll={() => {
            this.triggerScroll && this.triggerScroll();
          }}
        />
      );
    }

    if (info.item === 'b') {
      return (
        <VirtualizedList
          initialNumToRender={3}
          windowSize={2}
          removeClippedSubviews={false}
          maxToRenderPerBatch={2}
          updateCellsBatchingPeriod={30}
          scrollEventThrottle={20}
          horizontal
          data={['21', '22', '23', '24', '25']}
          renderItem={(innerInfo: ListRenderItemInfo<string>) => {
            return <TestItem1 text={innerInfo.item} />;
          }}
          getItemCount={(data) => data.length}
          getItem={(data, index) => data[index]}
          keyExtractor={(item) => item}
          onScroll={() => {
            this.triggerScroll && this.triggerScroll();
          }}
        />
      );
    }

    return <TestItem1 text={info.item} />;
  }

  listRef = React.createRef<VirtualizedList<string>>();

  componentDidMount() {
    setTimeout(() => {
      // console.info(this.listRef.current?._frames);
    }, 500);
  }

  render() {
    return (
      <ScrollAnalyticWapper
        buildChildren={(triggerScroll, triggerRefresh) => {
          this.triggerScroll = triggerScroll;
          return (
            <VirtualizedList
              ref={this.listRef}
              data={this.listData}
              renderItem={this.renderItem}
              getItemCount={(data) => data.length}
              getItem={(data, index) => data[index]}
              keyExtractor={(item) => item}
              onScroll={triggerScroll}
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.setState({ refreshing: true });
                setTimeout(() => {
                  this.setState({ refreshing: false });
                  triggerRefresh();
                }, 200);
              }}
            />
          );
        }}
      />
    );
  }
}
