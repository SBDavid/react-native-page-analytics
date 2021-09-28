import * as React from 'react';
import { ListRenderItemInfo, VirtualizedList } from 'react-native';
import ScrollAnalyticWapper from '../../../src/ScrollAnalyticWapper';
import TestItem1 from '../../src/screens/TestItem3';

export default class TestWrapper extends React.PureComponent<
  {},
  { refreshing: boolean }
> {
  listData = ['0', 'p', '1', '2', '3', '4', '5', '6', '7', '8'];

  constructor(prop: any) {
    super(prop);
    this.renderItem = this.renderItem.bind(this);

    this.state = {
      refreshing: false,
    };
  }

  triggerScroll: (() => void) | undefined;

  renderItem(info: ListRenderItemInfo<string>) {
    if (info.item === 'p') {
      return (
        <VirtualizedList
          horizontal
          data={['p1', 'p2']}
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

  render() {
    return (
      <ScrollAnalyticWapper
        buildChildren={(triggerScroll, triggerRefreshed) => {
          this.triggerScroll = triggerScroll;
          return (
            <VirtualizedList
              ref={this.listRef}
              data={this.listData}
              renderItem={this.renderItem}
              getItemCount={(data) => data.length}
              getItem={(data, index) => data[index]}
              keyExtractor={(item) => item}
              refreshing={this.state.refreshing}
              onScroll={() => {
                triggerScroll();
              }}
              onRefresh={() => {
                this.setState({ refreshing: true });
                setTimeout(() => {
                  triggerRefreshed();
                  this.setState({ refreshing: false });
                }, 200);
              }}
            />
          );
        }}
      />
    );
  }
}
