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

export default function Tab2(props: HomePageProps & AnalyticProps) {
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
