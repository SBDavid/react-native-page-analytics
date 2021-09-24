import * as React from 'react';
import TestItem1 from './TestItem';
import {
  FlatList,
  ListRenderItemInfo,
  SectionList,
  SectionListRenderItemInfo,
  SafeAreaView,
  Text,
} from 'react-native';
import { View, Button } from 'react-native';

export default class TestSectionList extends React.PureComponent<
  {},
  { refreshing: boolean }
> {
  // listData = ['0', 'p', 'v', 'b', '2', '3', '4', '5', '6', '7', '8'];
  listData = [
    {
      title: 'Main dishes',
      data: ['Pizza', 'Burger'],
    },
    {
      title: 'Sides',
      data: ['French Fries', 'Onion Rings', 'Fried Shrimps'],
    },
    {
      title: 'Drinks',
      data: ['Water', 'Coke', 'Beer'],
    },
    {
      title: 'Desserts',
      data: ['Cheese Cake', 'Ice Cream'],
    },
  ];

  constructor(prop: any) {
    super(prop);
    this.renderItem = this.renderItem.bind(this);

    this.state = {
      refreshing: false,
    };
  }

  listRef = React.createRef<SectionList>();

  renderItem(info: SectionListRenderItemInfo<string>) {
    if (info.item === 'Pizza') {
      return (
        <FlatList
          horizontal
          data={['11', '12']}
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

    return <TestItem1 text={info.item} />;
  }

  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          paddingTop: 10,
          marginHorizontal: 16,
        }}
      >
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
          <SectionList
            ref={this.listRef}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => {
              return index + item;
            }}
            sections={this.listData}
            progressViewOffset={100}
            renderSectionHeader={({ section: { title } }) => (
              <Text>{title}</Text>
            )}
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
      </SafeAreaView>
    );
  }
}
