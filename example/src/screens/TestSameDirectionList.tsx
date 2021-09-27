import * as React from 'react';
import TestItem1 from './TestItem2';
import { VirtualizedList, ListRenderItemInfo } from 'react-native';
import { TestVirtralLizedList } from './TestVirtualizedList2';

export default class TestSameDirectionList extends React.PureComponent<
  {},
  { refreshing: boolean }
> {
  listData = ['1'];

  constructor(prop: any) {
    super(prop);
    this.renderItem = this.renderItem.bind(this);

    this.state = {
      refreshing: false,
    };
  }

  renderItem(info: ListRenderItemInfo<string>) {
    if (info.item === '1') {
      return <TestVirtralLizedList />;
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
