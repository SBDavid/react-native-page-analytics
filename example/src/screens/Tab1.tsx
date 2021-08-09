import React from 'react';
import PageAnalytics, {
  AnalyticProps,
  PageExitDataGenerType,
} from 'react-native-page-analytics';
import { ScrollView, TouchableHighlight } from 'react-native';

import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';

interface HomePageProps {}

interface HomePageState {
  list: RouterName[];
}

export default class Tab1 extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  //
  metaId: number;
  //
  currPage: string;
  //
  viewProps: { [index: string]: any };

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
    this.metaId = 0;
    this.currPage = 'tab1';
    this.viewProps = { customData: 'customData' };
  }

  state: HomePageState = {
    list: [RouterName.SCREEN1, RouterName.SCREEN2],
  };

  componentDidMount() {
    this.syncSetPageViewProps();
    this.setPageExitPropsGener(this.customPageExitDataGener);
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  // 生成页面离开埋点数据
  customPageExitDataGener: PageExitDataGenerType = () => ({
    metaId: this.metaId,
    currPage: this.currPage,
    props: { customData: 'customData' },
  });

  // 同步设置页面props
  syncSetPageViewProps = () => {
    this.setPageViewProps({
      metaId: this.metaId,
      currPage: this.currPage,
      props: this.viewProps,
    });
  };

  // 异步设置页面props
  asyncSetPageViewProps = async () => {
    await Utils.delay(500);
    this.setPageViewProps({
      metaId: this.metaId,
      currPage: this.currPage,
      props: this.viewProps,
    });
  };

  handlePress = (item: RouterName) => {
    this.props.navigation.navigate(item);
  };

  render() {
    return (
      <Container>
        <Content title="Tab1" />

        <ScrollView>
          {this.state.list.map((item, index) => {
            return (
              <TouchableHighlight
                key={index}
                onPress={() => this.handlePress(item)}
              >
                <Item key={index}>
                  <ItemText>{item}</ItemText>
                </Item>
              </TouchableHighlight>
            );
          })}
        </ScrollView>
      </Container>
    );
  }
}
