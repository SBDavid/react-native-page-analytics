import React from 'react';
import { ScrollView, TouchableHighlight } from 'react-native';
import PageAnalytics, {
  AnalyticProps,
  AnalyticPropsParams,
  SendAnalyticFuncType,
} from 'react-native-page-analytics';
import { Container, Item, ItemText } from './StyledComponents';
import RouterName from '../router';
import Utils from '../utils';

interface HomePageProps {}

interface HomePageState {
  list: RouterName[];
}

export default class HomePage extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
    PageAnalytics.Screen.setSendAnalyticAction(HomePage.sendAnalyTicOperation);
  }

  static sendAnalyTicOperation: SendAnalyticFuncType = (
    metaId: number,
    currPage: string,
    props: AnalyticPropsParams
  ) => {
    // console.log(`发送数据 ${metaId} ${currPage} ${props}`);
  };

  state: HomePageState = {
    list: [RouterName.SCREEN1, RouterName.SCREEN2, RouterName.TAB],
  };

  componentDidMount() {
    // super.componentDidMount();
    this.syncSetPageViewProps();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  // 同步设置页面props
  syncSetPageViewProps = () => {
    this.setPageViewProps({ currPageName: 'home' });
  };

  // 异步设置页面props
  asyncSetPageViewProps = async () => {
    await Utils.delay(2000);
    this.setPageViewProps({ currPageName: 'home' });
  };

  handlePress = (item: RouterName) => {
    this.props.navigation.navigate(item);
  };

  render() {
    return (
      <Container>
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
