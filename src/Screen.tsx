import React from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

export type Props = {
  navigation: NavigationProp<ParamListBase>;
  [index: string]: any;
  // pageViewId: number;
  // pageExitId: number;
  // currentPage: string;
};

export interface AnalyticPropsType {
  [key: string]: any;
}
interface PageViewExitPropsType {
  metaId: number;
  currPage: string;
  props: AnalyticPropsType;
}

export type PageExitDataGener = () => PageViewExitPropsType;

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
  private pageViewProps: PageViewExitPropsType | null = null;

  // 设置pageViewProps等待promise
  private pageViewPropsPromise: Promise<any>;

  // 设置pageViewProps等待resolve
  private pageViewPropsResolve?: (r: any) => void;

  // 动态获取pageExit属性方法
  private pageExitDataGener?: PageExitDataGener;

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
    if (this.props.addFocusListener) {
      // console.log(`页面有addFocusListener ${this.props.name}`);
      this.focusSubs = this.props.addFocusListener(this.onFocus);
    } else {
      // console.log(`页面没有addFocusListener ${this.props.name}`);
      this.focusSubs = this.props.navigation.addListener('focus', this.onFocus);
    }

    if (this.props.addBlurListener) {
      // console.log(`页面有addBlurListener ${this.props.name}`);
      this.blurSubs = this.props.addBlurListener(this.onBlur);
    } else {
      // console.log(`页面没有addBlurListener ${this.props.name}`);
      this.blurSubs = this.props.navigation.addListener('blur', this.onBlur);
    }
    // this.focusSubs = this.props.navigation?.addListener('focus', this.onFocus);
    // this.blurSubs = this.props.navigation?.addListener('blur', this.onBlur);
  }

  // 页面显示操作
  private onFocus = async () => {
    await this.pageViewPropsPromise;
    Screen.currentPage = (this.pageViewProps as PageViewExitPropsType).currPage;
    this.sendAnalyticAction('focus');
  };

  // 页面离开操作
  private onBlur = () => {
    // console.log('触发onBlur事件');
    this.sendAnalyticAction('blur');
  };

  // 发送数据操作
  private sendAnalyticAction = (type: 'focus' | 'blur') => {
    if (!Screen.sendAnalyticAction) {
      console.log(`没有设置sendAnalyticAction，发送${type}事件失败`);
      return;
    }

    if (type === 'focus') {
      console.log(`页面focus事件 页面名: ${Screen.currentPage}`);
      if (!this.pageViewProps) {
        console.log('没有pageView数据，发送focus事件失败');
        return;
      }
      const { metaId, currPage, props } = this.pageViewProps;
      Screen.sendAnalyticAction(metaId, currPage, props);
      return;
    }

    if (type === 'blur') {
      console.log(`页面blur事件 页面名: ${Screen.currentPage}`);
      if (!this.pageExitDataGener) {
        console.log('没有pageExitDataGener，发送blur事件失败');
        return;
      }
      const { metaId, currPage, props } = this.pageExitDataGener();
      Screen.sendAnalyticAction(metaId, currPage, props);
      return;
    }
  };

  // 设置页面属性
  protected setPageViewProps = (props: PageViewExitPropsType) => {
    this.pageViewProps = props;
    this.pageViewPropsResolve && this.pageViewPropsResolve(null);
  };

  // 设置 动态获取页面离开埋点属性 方法
  protected setPageExitPropsGener = (cb: PageExitDataGener) => {
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
