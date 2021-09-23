import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  TouchableHighlight,
  Text,
  NativeModules,
  View,
} from 'react-native';
import PageAnalytics, { AnalyticProps } from '../../../src';
import Content from '../components/Content';
import { Container, Item, ItemText } from './StyledComponents';
import Utils from '../utils';
import RouterName from '../router';
import ListScreen from './ListScreen';

interface HomePageProps {}

interface HomePageState {
  list: RouterName[];
}

export default function Tab2(props: HomePageProps & AnalyticProps) {
  const pageViewId: number = 0;
  const pageExitId: number = 0;
  const currPage: string = 'tab2';

  // let timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  let [count, setCount] = useState(0);

  const customPageView = useCallback(() => {
    console.log(
      `发送页面pageView埋点 自定义 页面名: ${currPage} pageExitId: ${pageViewId}`
    );
  }, []);

  const customPageExit = useCallback(() => {
    console.log(
      `发送页面pageExit埋点 自定义 页面名: ${currPage} pageExitId: ${pageViewId}`
    );
  }, []);

  // 用户自定义的页面展示埋点上传方法
  // function customPageView() {
  //   console.log(
  //     `发送页面pageView埋点 自定义 页面名: ${currPage} pageExitId: ${pageViewId}`
  //   );
  // }

  // 用户自定义的页面离开埋点上传方法
  // function customPageExit() {
  //   console.log(
  //     `发送页面pageExit埋点 自定义 页面名: ${currPage} pageExitId: ${pageViewId}`
  //   );
  // }

  const { setPageViewProps, setPageExitProps } = PageAnalytics.useScreen({
    pageViewId,
    pageExitId,
    currPage,
    customPageView,
    customPageExit,
    ...props,
  });

  // setPageViewProps({
  //   customData: 'customData',
  // });
  // setPageExitProps({ trackId: String(100) });

  const list = useRef<RouterName[]>([
    RouterName.SCREEN1,
    RouterName.SCREEN2,
    RouterName.NativeScreen,
  ]);

  const handlePress = useCallback(
    (item: RouterName) => {
      if (item === RouterName.NativeScreen) {
        // 跳转到账号绑定页
        NativeModules.Page.start('iting://open?msg_type=84');
      } else {
        props?.navigation?.navigate(item);
      }
    },
    [props?.navigation]
  );

  // function handlePress(item: RouterName) {
  //   props?.navigation?.navigate(item);
  // }

  useEffect(() => {
    Utils.delay(500).then(() => {
      setPageViewProps({
        customData: 'customData',
      });
      setPageExitProps({ trackId: String(100) });
    });
    // timer.current = setTimeout(() => {
    //   setCount(count + 1);
    // }, 1000);
    console.log('Tab2Hook didmount');
    return () => {
      console.log('Tab2Hook willunmount');
      // timer.current && clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // setPageViewProps({
  //   customData: 'customData',
  // });
  // setPageExitProps({ trackId: String(100) });

  console.log('tab2Hook render');

  return (
    <Container>
      <Content title="Tab2" />
      <View style={{ height: 200 }}>
        <ListScreen {...props} />
      </View>
      <ScrollView>
        {list.current.map((item, index) => {
          return (
            <TouchableHighlight key={index} onPress={() => handlePress(item)}>
              <Item key={index}>
                <ItemText>{item}</ItemText>
              </Item>
            </TouchableHighlight>
          );
        })}

        <TouchableHighlight
          onPress={() => setCount(count + 1)}
          style={{ marginTop: 30 }}
        >
          <Text style={{ fontSize: 20, color: 'white' }}>增加count</Text>
        </TouchableHighlight>

        <Text
          style={{ fontSize: 25, color: 'red', marginTop: 20 }}
        >{`count: ${count}`}</Text>
      </ScrollView>
    </Container>
  );
}
