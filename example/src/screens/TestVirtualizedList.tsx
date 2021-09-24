import * as React from 'react';
import TestItem1 from './TestItem';
import { VirtualizedList, ListRenderItemInfo } from 'react-native';

export class TestVirtralLizedList extends React.PureComponent<
  {},
  { refreshing: boolean }
> {
  listData = ['0', 'p', 'v', 'b', '2', '3', '4', '5', '6', '7', '8'];

  constructor(prop: any) {
    super(prop);
    this.renderItem = this.renderItem.bind(this);

    this.state = {
      refreshing: false,
    };
  }

  renderItem(info: ListRenderItemInfo<string>) {
    if (info.item === 'v') {
      return (
        <VirtualizedList
          horizontal
          data={['11', 'p']}
          renderItem={(innerInfo: ListRenderItemInfo<string>) => {
            return <TestItem1 text={innerInfo.item} />;
          }}
          getItemCount={(data) => data.length}
          getItem={(data, index) => data[index]}
          keyExtractor={(item) => item}
        />
      );
    }

    if (info.item === 'b') {
      return (
        <VirtualizedList
          horizontal
          data={['21', '22']}
          renderItem={(innerInfo: ListRenderItemInfo<string>) => {
            return <TestItem1 text={innerInfo.item} />;
          }}
          getItemCount={(data) => data.length}
          getItem={(data, index) => data[index]}
          keyExtractor={(item) => item}
        />
      );
    }

    return <TestItem1 text={info.item} />;
  }

  listRef = React.createRef<VirtualizedList<string>>();

  render() {
    return (
      <VirtualizedList
        ref={this.listRef}
        data={this.listData}
        renderItem={this.renderItem}
        getItemCount={(data) => data.length}
        getItem={(data, index) => data[index]}
        keyExtractor={(item) => item}
        refreshing={this.state.refreshing}
        onRefresh={() => {
          this.setState({ refreshing: true });
          setTimeout(() => {
            // @ts-ignore
            this.listRef?.current?.triggerManuallyRefreshed();
            this.setState({ refreshing: false });
          }, 200);
        }}
      />
    );
  }
}
