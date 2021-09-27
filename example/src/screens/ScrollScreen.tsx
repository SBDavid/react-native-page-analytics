import React from 'react';
import { ScrollView, View, TouchableHighlight, Text } from 'react-native';
import PageAnalytics, {
  AnalyticProps,
  PageExitDataGenerType,
} from '../../../src';
import Content from '../components/Content';
import Button from '../components/Button';
import { Container } from './StyledComponents';
import RouterName from '../router';
import Utils from '../utils';
import ListScreen from './ListScreen';
import { useNavigation } from '@react-navigation/native';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

interface TestUseNavigationProps {
  title: string;
}

export function TestUseNavigation(props: TestUseNavigationProps) {
  const navigation = useNavigation();

  return (
    <TouchableHighlight onPress={() => navigation.navigate(RouterName.SCREEN2)}>
      <View>
        <Text style={{ fontSize: 25, color: 'red' }}>{props.title}</Text>
      </View>
    </TouchableHighlight>
  );
}
export default class ScrollScreen extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  //
  // pageViewId: number = 0;
  // //
  // pageExitId: number = 0;
  // //
  // currPage: string = 'screen1';

  // metaId: number = 0;

  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
    this.currPage = 'screen1';
  }

  state: HomePageState = {
    list: ['Screen1', 'Screen2', 'Screen3'],
  };

  componentDidMount() {
    // // 添加pageView数据
    // this.syncSetPageViewProps();
    // // 添加pageExit数据，如果每次页面离开时发送的prop数据不同，可以多次调用这个方法更新prop
    // this.setPageExitProps({ trackId: String(100) });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
  }

  // // 同步设置pageViewProps
  // syncSetPageViewProps = () => {
  //   this.setPageViewProps({
  //     customPageProp: 'data',
  //   });
  // };

  // // 异步设置pageViewProps
  // asyncSetPageViewProps = async () => {
  //   await Utils.delay(500);
  //   this.setPageViewProps({
  //     customPageProp: 'data',
  //   });
  // };

  // 用户自定义的页面展示埋点上传方法
  customPageView = () => {
    console.log(
      `发送页面pageView埋点 自定义 页面名: ScrollScreen pageExitId: 0`
    );
  };

  // 用户自定义的页面离开埋点上传方法
  customPageExit = () => {
    console.log(
      `发送页面pageExit埋点 自定义 页面名: ScrollScreen pageExitId: 0`
    );
  };

  render() {
    return (
      <Container style={{ justifyContent: 'flex-start' }}>
        <View style={{ height: 400, marginTop: 5 }}>
          {/* <TestUseNavigation title={'scree1test'} /> */}
          {/* <TestUseNavigation2
            title={'scree1test'}
            useNavigation={useNavigation}
          /> */}
          <ListScreen {...this.props} />
        </View>
        <View style={{ marginTop: 100 }}>
          <Button
            handler={() => {
              this.props?.navigation?.navigate(RouterName.SCREEN2);
            }}
            title="去Screen2"
          />
        </View>
      </Container>
    );
  }
}
