import React from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

type Props = {
  navigation: NavigationProp<ParamListBase>;
  pageViewId: number;
  pageExitId: number;
  currentPage: string;
};

export default class Screen<P, S> extends React.PureComponent<P & Props, S> {
  // 取消订阅
  focusSubscripe?: () => void;
  blurSubscripe?: () => void;

  // pageview属性
  pageViewProps: any;
  pageViewPropsPromise: Promise<any>;
  pageViewPropsResolve?: (r: any) => void;

  // 全局currPage
  static currentPage?: string;

  constructor(p: P & Props) {
    super(p);

    this.pageViewProps = {};
    this.pageViewPropsPromise = new Promise((resolve) => {
      this.pageViewPropsResolve = resolve;
    });
  }

  async onFocus() {
    Screen.currentPage = this.props.currentPage;
    await this.pageViewPropsPromise;
    // 发送数据
  }
  onBlur() {
    // 发送数据
  }

  setPageViewProps(props: any) {
    this.pageViewProps = props;
    this.pageViewPropsResolve && this.pageViewPropsResolve(null);
  }

  componentDidMount() {
    this.focusSubscripe = this.props.navigation.addListener(
      'focus',
      this.onFocus
    );
    this.blurSubscripe = this.props.navigation.addListener('blur', this.onBlur);
  }

  componentWillUnmount() {
    if (this.focusSubscripe) {
      this.focusSubscripe();
    }

    if (this.blurSubscripe) {
      this.blurSubscripe();
    }
  }
}
