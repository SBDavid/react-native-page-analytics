import React from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

export type Props = {
  navigation: NavigationProp<ParamListBase>;
  pageViewId: number;
  pageExitId: number;
  currentPage: string;
};

export interface AnalyticPropsType {
  [key: string]: any;
}

export type SendAnalyticFunc = (
  metaId: number,
  currPage: string,
  props: AnalyticPropsType
) => void;

export default class Screen<P, S> extends React.PureComponent<P & Props, S> {
  // 取消订阅
  focusSubscripe?: () => void;
  blurSubscripe?: () => void;

  // pageview属性
  pageViewProps: AnalyticPropsType = {};
  pageViewPropsPromise: Promise<any>;
  pageViewPropsResolve?: (r: any) => void;

  // pageExit属性
  pageExitProps: AnalyticPropsType = {};

  // 发送数据操作
  private static sendAnalytic: SendAnalyticFunc;

  // 设置发送操作
  static setSendAnalyticAction(cb: SendAnalyticFunc) {
    Screen.sendAnalytic = cb;
  }

  // 全局currPage
  private static currentPage: string;

  // 获取全局currPage
  static getCurrPage() {
    return Screen.currentPage;
  }

  constructor(p: P & Props) {
    super(p);
    this.pageViewPropsPromise = new Promise((resolve) => {
      this.pageViewPropsResolve = resolve;
    });

    console.log('analytic page constructor');
    this.focusSubscripe = this.props.navigation.addListener(
      'focus',
      this.onFocus
    );
    this.blurSubscripe = this.props.navigation.addListener('blur', this.onBlur);
  }

  // 页面显示操作
  onFocus = async () => {
    Screen.currentPage = this.props.currentPage;
    await this.pageViewPropsPromise;
    // 发送数据
    this.sendAnalyticAction('focus');
  };

  // 页面离开操作
  onBlur = () => {
    // 发送数据
    this.sendAnalyticAction('blur');
  };

  // 发送数据操作
  sendAnalyticAction = (type: 'focus' | 'blur') => {
    if (!Screen.sendAnalytic) {
      return;
    }
    if (type === 'focus') {
      console.log(`页面focus事件 页面名: ${Screen.currentPage}`);
      Screen.sendAnalytic(
        this.props.pageViewId,
        Screen.currentPage,
        this.pageViewProps
      );
    } else {
      console.log(`页面blur事件 页面名: ${Screen.currentPage}`);
      Screen.sendAnalytic(
        this.props.pageExitId,
        Screen.currentPage,
        this.pageExitProps
      );
    }
  };

  // 设置页面属性
  setPageViewProps = (props: AnalyticPropsType) => {
    this.pageViewProps = props;
    this.pageViewPropsResolve && this.pageViewPropsResolve(null);
  };

  // 设置页面离开属性
  setPageExitProps = (props: AnalyticPropsType) => {
    this.pageExitProps = props;
  };

  componentDidMount() {
    // console.log('analytic page didmount');
    // this.focusSubscripe = this.props.navigation.addListener(
    //   'focus',
    //   this.onFocus
    // );
    // this.blurSubscripe = this.props.navigation.addListener('blur', this.onBlur);
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
