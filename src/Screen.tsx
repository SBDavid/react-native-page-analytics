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
interface PageViewExitPropsType {
  metaId: number;
  currPage: string;
  props: AnalyticPropsType;
}

type PageExitDataGenerType = () => PageViewExitPropsType;

export type SendAnalyticFunc = (
  metaId: number,
  currPage: string,
  props: AnalyticPropsType
) => void;

export default class Screen<P, S> extends React.PureComponent<P & Props, S> {
  // focus事件订阅
  private focusSubs?: () => void;

  // blur事件订阅
  private blurSubs?: () => void;

  // pageview属性
  private pageViewProps: AnalyticPropsType = {};

  // 设置pageViewProps等待promise
  private pageViewPropsPromise: Promise<any>;

  // 设置pageViewProps等待resolve
  private pageViewPropsResolve?: (r: any) => void;

  // pageExit属性
  private pageExitProps: AnalyticPropsType = {};

  // 动态获取pageExit属性方法
  private pageExitDataGener?: PageExitDataGenerType;

  // 发送数据操作
  private static sendAnalyticAction: SendAnalyticFunc;

  // 设置发送操作
  static setSendAnalyticAction(cb: SendAnalyticFunc) {
    Screen.sendAnalyticAction = cb;
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
    // console.log('analytic page constructor');
    this.focusSubs = this.props.navigation.addListener('focus', this.onFocus);
    this.blurSubs = this.props.navigation.addListener('blur', this.onBlur);
  }

  // 页面显示操作
  private onFocus = async () => {
    Screen.currentPage = this.props.currentPage;
    await this.pageViewPropsPromise;
    this.sendAnalyticAction('focus');
  };

  // 页面离开操作
  private onBlur = () => {
    this.sendAnalyticAction('blur');
  };

  // 设置

  // 发送数据操作
  private sendAnalyticAction = (type: 'focus' | 'blur') => {
    if (!Screen.sendAnalyticAction) {
      return;
    }

    if (type === 'focus') {
      console.log(`页面focus事件 页面名: ${Screen.currentPage}`);
      Screen.sendAnalyticAction(
        this.props.pageViewId,
        Screen.currentPage,
        this.pageViewProps
      );
    } else {
      console.log(`页面blur事件 页面名: ${Screen.currentPage}`);
      if (this.pageExitDataGener) {
        const { metaId, currPage, props } = this.pageExitDataGener();
        Screen.sendAnalyticAction(metaId, currPage, props);
      } else {
        Screen.sendAnalyticAction(
          this.props.pageExitId,
          Screen.currentPage,
          this.pageExitProps
        );
      }
    }
  };

  // 设置页面属性
  protected setPageViewProps = (props: AnalyticPropsType) => {
    this.pageViewProps = props;
    this.pageViewPropsResolve && this.pageViewPropsResolve(null);
  };

  // // 设置页面离开属性
  // protected setPageExitProps = (props: AnalyticPropsType) => {
  //   this.pageExitProps = props;
  // };

  // 设置 动态获取页面离开埋点属性 方法
  protected setPageExitPropsGener = (cb: PageExitDataGenerType) => {
    this.pageExitDataGener = cb;
  };

  componentWillUnmount() {
    if (this.focusSubs) {
      this.focusSubs();
    }

    if (this.blurSubs) {
      this.blurSubs();
    }
  }
}
