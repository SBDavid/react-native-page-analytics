import * as React from 'react';
import {
  ListRenderItemInfo,
  VirtualizedList,
  View,
  Button,
  FlatList,
} from 'react-native';
import ScrollAnalyticWapper from '../../../src/ScrollAnalyticWapper';
import DisableWrapper from '../../../src/DisableWrapper';
import TestItem1 from '../../src/screens/TestItem3';

export default class TestWrapper extends React.PureComponent<
  {},
  { refreshing: boolean; disable: boolean }
> {
  listData = ['0', 'p', '1', '2', '3', '4', '5', '6', '7', '8'];

  constructor(prop: any) {
    super(prop);
    this.renderItem = this.renderItem.bind(this);

    this.state = {
      refreshing: false,
      disable: false,
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

  listRef = React.createRef<ScrollAnalyticWapper>();

  render() {
    return (
      <View>
        <Button
          title={'手动隐藏'}
          onPress={() => {
            // @ts-ignore
            this.listRef?.current?.triggerHide();
          }}
        />
        <Button
          title={'手动曝光'}
          onPress={() => {
            // @ts-ignore
            this.listRef?.current?.triggerShow();
          }}
        />
        <Button
          title={'打开曝光'}
          onPress={() => {
            this.setState({ disable: false });
          }}
        />
        <Button
          title={'关闭曝光'}
          onPress={() => {
            this.setState({ disable: true });
          }}
        />
        <DisableWrapper disable={this.state.disable}>
          <DisableWrapper disable={false}>
            <ScrollAnalyticWapper
              ref={this.listRef}
              buildChildren={(triggerScroll, triggerRefreshed) => {
                this.triggerScroll = triggerScroll;
                return (
                  <FlatList
                    data={this.listData}
                    renderItem={this.renderItem}
                    // getItemCount={(data) => data.length}
                    // getItem={(data, index) => data[index]}
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
          </DisableWrapper>
        </DisableWrapper>
      </View>
    );
  }
}
