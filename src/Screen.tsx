import React from 'react';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';

export type Props = {
  navigation: NavigationProp<ParamListBase>;
  [index: string]: any;
  // pageViewId: number;
  // pageExitId: number;
  // currentPage: string;
};

export interface AnalyticDataProps {
  [key: string]: any;
}
interface PageViewExitPropsType {
  props: AnalyticDataProps;
}

export interface BasicAnalytic {
  metaId: number;
  currPage: string;
}

export type PageExitDataGener = () => PageViewExitPropsType;

export type SetBasicAnalyticData = () => BasicAnalytic;

export type SendAnalyticFunc = (
  metaId: number,
  currPage: string,
  props: AnalyticDataProps
) => void;

export default abstract class Screen<P, S> extends React.PureComponent<
  P & Props,
  S
> {
  // focus事件订阅
  private focusSubs?: () => void;

  // blur事件订阅
  private blurSubs?: () => void;

  // currPage
  protected abstract currPage: string;

  // pageViewMetaId
  protected abstract pageViewId: number;

  // pageExitMetaId
  protected abstract pageExitId: number;

  // pageview属性
  private pageViewProps: AnalyticDataProps | null = null;

  // pageExit属性
  private pageExitProps: AnalyticDataProps | null = null;

  // 设置pageViewProps等待promise
  private pageViewPropsPromise: Promise<any>;

  // 设置pageViewProps等待resolve
  private pageViewPropsResolve?: (r: any) => void;

  // // 动态获取pageExit属性方法
  // private pageExitDataGener?: PageExitDataGener;

  // 发送数据操作
  private static sendAnalyticAction: SendAnalyticFunc;

  // 设置发送操作
  static setSendAnalyticAction(cb: SendAnalyticFunc) {
    Screen.sendAnalyticAction = cb;
  }

  // 自定义pageView埋点发送方法
  protected customPageView?: () => void;

  // 自定义pageExit埋点发送方法
  protected customPageExit?: () => void;

  // 全局currPage
  protected static currentPage: string;

  // 获取全局currPage
  static getCurrPage() {
    return Screen.currentPage;
  }

  // 设置pageView埋点属性
  protected setPageViewProps = (props: AnalyticDataProps) => {
    this.pageViewProps = props;
    this.pageViewPropsResolve && this.pageViewPropsResolve(null);
  };

  // 设置pageExit埋点属性
  protected setPageExitProps = (props: AnalyticDataProps) => {
    this.pageExitProps = props;
  };

  constructor(p: P & Props) {
    super(p);
    this.pageViewPropsPromise = new Promise((resolve) => {
      this.pageViewPropsResolve = resolve;
    });

    if (this.props.addFocusListener) {
      this.focusSubs = this.props.addFocusListener(this.onFocus);
    } else {
      this.focusSubs = this.props.navigation.addListener('focus', this.onFocus);
    }

    if (this.props.addBlurListener) {
      this.blurSubs = this.props.addBlurListener(this.onBlur);
    } else {
      this.blurSubs = this.props.navigation.addListener('blur', this.onBlur);
    }
  }

  // 页面显示操作
  private onFocus = async () => {
    await this.pageViewPropsPromise;
    Screen.currentPage = this.currPage;
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
      // console.log('sendAnalyticAction focus');
      if (this.customPageView) {
        // console.log('customPageView 存在 执行');
        this.customPageView();
        return;
      }
      console.log(
        `页面focus事件 页面名: ${Screen.currentPage} pageViewId: ${this.pageViewId} props: ${this.pageViewProps}`
      );
      Screen.sendAnalyticAction(
        this.pageViewId,
        this.currPage,
        this.pageViewProps || {}
      );
      return;
    }

    if (type === 'blur') {
      // console.log('sendAnalyticAction blur');
      if (this.customPageExit) {
        // console.log('customPageExit 存在 执行');
        this.customPageExit();
        return;
      }
      console.log(
        `页面blur事件 页面名: ${Screen.currentPage} pageExitId: ${this.pageExitId} props: ${this.pageExitProps}`
      );
      Screen.sendAnalyticAction(
        this.pageExitId,
        this.currPage,
        this.pageExitProps || {}
      );
      return;
    }
  };

  // // 设置 动态获取页面离开埋点属性 方法
  // protected setPageExitPropsGener = (cb: PageExitDataGener) => {
  //   this.pageExitDataGener = cb;
  // };

  componentWillUnmount() {
    if (this.focusSubs) {
      this.focusSubs();
    }
    if (this.blurSubs) {
      this.blurSubs();
    }
  }
}
