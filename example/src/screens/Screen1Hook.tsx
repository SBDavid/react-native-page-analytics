import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
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

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default function Screen1Hook(props: HomePageProps & AnalyticProps) {
  const { setPageExitProps, setPageViewProps } = PageAnalytics.useScreen({
    pageViewId: 0,
    pageExitId: 0,
    currPage: 'screen1',
    ...props,
  });

  // 同步设置pageViewProps
  const syncSetPageViewProps = useCallback(async () => {
    setPageViewProps({
      customPageProp: 'data',
    });
  }, [setPageViewProps]);

  const clearAction = useCallback(() => {
    console.log('screen1Hook willunmount');
  }, []);

  useEffect(() => {
    console.log('screen1Hook didmount');
    syncSetPageViewProps();
    return clearAction;
  }, [syncSetPageViewProps, clearAction]);

  // 用户自定义的页面展示埋点上传方法
  // customPageView = () => {
  //   console.log(
  //     `发送页面pageView埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageViewId}`
  //   );
  // };

  // 用户自定义的页面离开埋点上传方法
  // customPageExit = () => {
  //   console.log(`发送页面pageExit埋点 自定义 页面名: ${this.currPage} pageExitId: ${this.pageExitId}`);
  // };

  return (
    <Container>
      <View style={{ height: 200 }}>
        <ListScreen {...props} />
      </View>
      <ScrollView>
        <Content title="Screen1" />
        <Button
          handler={() => {
            props?.navigation?.navigate(RouterName.SCREEN2);
          }}
          title="跳转到Screen2"
        />
      </ScrollView>
    </Container>
  );
}
