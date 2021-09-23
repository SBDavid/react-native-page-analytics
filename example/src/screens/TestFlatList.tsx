import * as React from 'react';
import TestItem1 from './TestItem';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { View, Button } from 'react-native';

export default class TestFlatList extends React.PureComponent<
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
        <FlatList
          horizontal
          data={['11', 'p']}
          renderItem={(innerInfo: ListRenderItemInfo<string>) => {
            return <TestItem1 key={innerInfo.item} text={innerInfo.item} />;
          }}
          key={info.index}
          // getItemCount={(data) => data.length}
          // getItem={(data, index) => data[index]}
          keyExtractor={(item) => item}
        />
      );
    }

    if (info.item === 'b') {
      return (
        <FlatList
          horizontal
          data={['21', '22']}
          renderItem={(innerInfo: ListRenderItemInfo<string>) => {
            return <TestItem1 key={innerInfo.item} text={innerInfo.item} />;
          }}
          key={info.index}
          // getItemCount={(data) => data.length}
          // getItem={(data, index) => data[index]}
          keyExtractor={(item) => item}
        />
      );
    }

    return <TestItem1 text={info.item} key={info.item} />;
  }

  listRef = React.createRef<FlatList>();

  render() {
    return (
      <View>
        <Button
          title={'手动隐藏'}
          onPress={() => {
            // @ts-ignore
            this.listRef?.current?.triggerManuallyHide();
          }}
        />
        <Button
          title={'手动曝光'}
          onPress={() => {
            // @ts-ignore
            this.listRef?.current?.triggerManuallyShow();
          }}
        />
        <FlatList
          data={this.listData}
          renderItem={this.renderItem}
          ref={this.listRef}
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
      </View>
    );
  }
}
