import React, { useEffect } from 'react';
import PageAnalytics, {
  AnalyticProps,
  PageExitDataGenerType,
} from '../../../src';
import { ScrollView, TouchableHighlight } from 'react-native';
import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';

interface HomePageProps {}

interface HomePageState {
  list: RouterName[];
}

export function Tab2(props: HomePageProps & AnalyticProps) {
  const pageViewId: number = 0;
  const pageExitId: number = 0;
  const currPage: string = 'tab2';

  // 用户自定义的页面展示埋点上传方法
  function customPageView() {
    console.log(
      `发送页面pageView埋点 自定义 页面名: ${currPage} pageExitId: ${pageViewId}`
    );
  }

  // 用户自定义的页面离开埋点上传方法
  function customPageExit() {
    console.log(
      `发送页面pageExit埋点 自定义 页面名: ${currPage} pageExitId: ${pageViewId}`
    );
  }

  const { setPageViewProps, setPageExitProps } = PageAnalytics.useScreen({
    pageViewId,
    pageExitId,
    currPage,
    customPageView,
    customPageExit,
    ...props,
  });

  const list: RouterName[] = [RouterName.SCREEN1, RouterName.SCREEN2];

  function handlePress(item: RouterName) {
    props.navigation.navigate(item);
  }

  useEffect(() => {
    Utils.delay(500).then(() => {
      setPageViewProps({
        customData: 'customData',
      });
      setPageExitProps({ trackId: 100 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <Content title="Tab2" />

      <ScrollView>
        {list.map((item, index) => {
          return (
            <TouchableHighlight key={index} onPress={() => handlePress(item)}>
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

export default class Tab2 extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  //
  pageViewId: number = 0;
  //
  pageExitId: number = 0;
  //
  currPage: string = 'tab2';

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: [RouterName.SCREEN1, RouterName.SCREEN2],
  };

  componentDidMount() {
    // 添加pageView数据
    this.asyncSetPageViewProps();
    // 添加pageExit数据，如果每次页面离开时发送的prop数据不同，可以多次调用这个方法更新prop
    this.setPageExitProps({ trackId: 100 });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  // 同步设置pageViewProps
  syncSetPageViewProps = () => {
    this.setPageViewProps({
      customData: 'customData',
    });
  };

  // 异步设置pageViewProps
  asyncSetPageViewProps = async () => {
    await Utils.delay(500);
    this.setPageViewProps({
      customData: 'customData',
    });
  };

  // 用户自定义的页面展示埋点上传方法
  customPageView = () => {
    console.log(
      `发送页面pageView埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
    );
  };

  // 用户自定义的页面离开埋点上传方法
  customPageExit = () => {
    console.log(
      `发送页面pageExit埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
    );
  };

  handlePress = (item: RouterName) => {
    this.props.navigation.navigate(item);
  };

  render() {
    return (
      <Container>
        <Content title="Tab2" />

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
