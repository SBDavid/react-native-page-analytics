import React from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  AppState,
  AppStateStatus,
  EmitterSubscription,
  Platform,
} from 'react-native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import ScreenUtils from './utils';

// FIXME
// 1. 开发反馈 ios端首次打开项目执行了onResume，安卓端不会，
//     本地开发调试的时候现象：ios端不会执行onResume，控制台中提示了发送onResume事件没有接收者，安卓端首次打开执行了onResume
//     开发反馈，打包出来后的包执行起来的效果和他说的一样，需要打包验证一下
// 2. ios端通过inactive状态去监听切换到多任务状态、下拉控制中心、下拉通知栏，在几个过程中会出现多次触发inactive和active的现象，需要处理

export const PageEventEmitter = new NativeEventEmitter(NativeModules.Page);

export const isIos: boolean = Platform.OS === 'ios';

// 自定义APPstate状态，前台/后台，兼容ios端的active/background/inactive三种状态，inactive视为后台状态
export enum CustomAppState {
  active = 'active',
  background = 'background',
}

// 触发onFocus, onBlur动作的事件来源，分为 Page状态变化、APPstate状态变化、navigation状态变化三种
export enum PageViewExitEventSource {
  page = 'page',
  appState = 'appState',
  navigation = 'navigation',
}

export type Props = {
  navigation?: NavigationProp<ParamListBase>;
  [index: string]: any;
};

export interface AnalyticDataProps {
  [key: string]: string;
}
export interface PageViewExitPropsType {
  props: AnalyticDataProps;
}

export type PageExitDataGener = () => PageViewExitPropsType;

export type PageTraceType = 'focus' | 'blur';

export default abstract class Screen<P, S> extends React.Component<
  P & Props,
  S
> {
  // focus事件订阅
  private focusSubs?: () => void;

  // blur事件订阅
  private blurSubs?: () => void;

  // onResume事件订阅
  private onResumeSubs?: EmitterSubscription;

  // onPause事件订阅
  private onPauseSubs?: EmitterSubscription;

  // 安卓端是否已经添加过page/appstate变化监听
  // 安卓端这两个事件监听功能相同，都能同时监听onPause/onResume active/background 事件避免重复监听
  private androidHasAddPageAppstateListener: boolean = false;

  // 当前页面维护的APPstate数组
  private appStateList: CustomAppState[] = [];

  // debounce时长
  private readonly debounceDuration: number = 1500;

  // 处理页面APPstate变化防抖timer
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // debounce函数里面使用的appstate
  private debounceUseAppState: AppStateStatus | null = null;

  // customAppState与Appstate映射关系
  private customAppStateMap: Map<AppStateStatus, CustomAppState> = new Map([
    ['active', CustomAppState.active],
    ['background', CustomAppState.background],
    ['inactive', CustomAppState.background],
  ]);

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

  // 是否首次setPageViewProps
  private hasSetPageViewProps: boolean = false;

  // 当前已经出发的pageView和pageExit事件记录
  private pageTraceList: PageTraceType[] = [];

  //
  private delayCheckTimer: ReturnType<typeof setTimeout> | null = null;

  // // 动态获取pageExit属性方法
  // private pageExitDataGener?: PageExitDataGener;

  // // 发送数据操作
  // private static sendAnalyticAction?: SendAnalyticFunc;

  // // 设置发送操作
  // static setSendAnalyticAction(cb: SendAnalyticFunc) {
  //   Screen.sendAnalyticAction = cb;
  // }

  // 自定义pageView埋点发送方法
  protected customPageView?: () => void;

  // 自定义pageExit埋点发送方法
  protected customPageExit?: () => void;

  // 页面key
  protected pageKey: string;

  // // 全局currPage
  // protected static currentPage: string;

  // 是否是首次发送 页面展示，由于首次进入页面后navigation的focus事件 与 page的onResume事件/APPstate的active事件 都会触发一次
  // 导致重复发送 页面展示 埋点，过滤掉首次发送页面展示的埋点
  // private static isFirstPageView: boolean = true;

  // // 获取全局currPage
  // static getCurrPage() {
  //   return Screen.currentPage;
  // }

  constructor(p: P & Props) {
    super(p);
    this.pageViewPropsPromise = new Promise((resolve) => {
      this.pageViewPropsResolve = resolve;
    });
    this.pageKey = Date.now().toString();
    console.log('screen中添加监听');
    // this.pageShow();
    // 添加路由监听
    this.addNavigationListener();
    // 添加page状态变化监听
    this.addPageListener();
    // 添加APPstate变化监听
    this.addAppStateListener();
  }

  // 添加路由监听
  private addNavigationListener = () => {
    if (this.props.addFocusListener) {
      this.focusSubs = this.props.addFocusListener(this.onNavigationFocus);
    } else if (this.props.navigation) {
      this.focusSubs = this.props.navigation.addListener(
        'focus',
        this.onNavigationFocus
      );
    }
    if (this.props.addBlurListener) {
      this.blurSubs = this.props.addBlurListener(this.onNavigationBlur);
    } else if (this.props.navigation) {
      this.blurSubs = this.props.navigation.addListener(
        'blur',
        this.onNavigationBlur
      );
    }
  };

  // 根据不同的平台添加page状态变化监听
  private addPageListener = () => {
    if (isIos) {
      this.addPageChangeHandler();
      return;
    }
    if (this.androidHasAddPageAppstateListener) {
      return;
    }
    this.addPageChangeHandler();
    this.androidHasAddPageAppstateListener = true;
  };

  // 添加RN页面状态变化监听，从RN页面跳转到Native页面时触发onPause，回到RN页面时触发onResume
  private addPageChangeHandler = () => {
    this.onResumeSubs = PageEventEmitter.addListener(
      'onResume',
      this.onResumeHandler
    );
    this.onPauseSubs = PageEventEmitter.addListener(
      'onPause',
      this.onPauseHandler
    );
  };

  // 根据不同的平台添加appState状态变化监听
  private addAppStateListener = () => {
    if (isIos) {
      this.addAppStateChangeHandler();
      return;
    }
    if (this.androidHasAddPageAppstateListener) {
      return;
    }
    this.addAppStateChangeHandler();
    this.androidHasAddPageAppstateListener = true;
  };

  // 添加APPstate状态变化监听，切换到后台触发background，回来触发active
  private addAppStateChangeHandler = () => {
    AppState.addEventListener('change', this.appStateChangeHandler);
  };

  // APPstate状态更新防抖
  private appStateChangeHandler = (status: AppStateStatus) => {
    console.log(
      `appStateChangeHandler ${status} ${this.currPage} ${Date.now()}`
    );
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }

    if (status === this.debounceUseAppState) {
      return;
    }

    this.debounceTimer && clearTimeout(this.debounceTimer);
    this.debounceUseAppState = status;
    this.debounceTimer = setTimeout(() => {
      this.handleAppState(status);
    }, this.debounceDuration);
  };

  // APPstate状态变化处理
  private handleAppState = (status: AppStateStatus) => {
    // if (status === 'active') {
    //   console.log(`appstate变化，active 页面名：${this.currPage}`);
    //   this.onFocus();
    // } else if (status === 'background') {
    //   console.log(`appstate变化，background 页面名：${this.currPage}`);
    //   this.onBlur();
    // } else if (status === 'inactive') {
    //   console.log(`appstate变化 inactive 页面名：${this.currPage}`);
    // }

    const formerAppState = this.appStateList[this.appStateList.length - 1];
    const currentAppState = this.customAppStateMap.get(status);

    if (!currentAppState || formerAppState === currentAppState) {
      return;
    }
    this.appStateList.push(currentAppState);

    if (currentAppState === CustomAppState.active) {
      console.log(
        `appstate变化，active 页面名：${this.currPage} ${Date.now()}`
      );
      this.onFocus(PageViewExitEventSource.appState);
    } else {
      console.log(
        `appstate变化，background 页面名：${this.currPage} ${Date.now()}`
      );
      this.onBlur();
    }
  };

  // 页面与native页面相互跳转的处理
  private onResumeHandler = () => {
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }
    console.log(`onResume事件： 页面名：${this.currPage}`);
    this.pageShow();
    this.onFocus(PageViewExitEventSource.page);
  };

  // 页面与native页面相互跳转的处理
  private onPauseHandler = () => {
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }
    console.log(`onPause事件： 页面名：${this.currPage}`);
    this.onBlur();
  };

  // navigationOnFocus事件
  private onNavigationFocus = () => {
    console.log(`onNavigationFocus事件： 页面名：${this.currPage}`);
    this.pageShow();
    this.onFocus(PageViewExitEventSource.navigation);
  };

  // navigationOnBlur事件
  private onNavigationBlur = () => {
    console.log(`onNavigationBlur事件： 页面名：${this.currPage}`);
    this.onBlur();
  };

  // 页面显示操作
  private onFocus = async (source: PageViewExitEventSource) => {
    // 有navigation的情况下，首次页面展示埋点如果是由onResume事件触发（可能有，可能没有）,过滤此次页面展示埋点，
    // 由首次页面展示埋点由onNavigatiionChange去触发
    if (
      this.focusSubs &&
      this.blurSubs &&
      source === PageViewExitEventSource.page &&
      ScreenUtils.getIsFirstPageView()
    ) {
      console.log('首次发送页面pageView埋点，触发来源为onResume，不发送');
      ScreenUtils.updateIsFirstPageView(false);
      return;
    }

    if (ScreenUtils.getIsFirstPageView()) {
      ScreenUtils.updateIsFirstPageView(false);
    }
    await this.pageViewPropsPromise;
    ScreenUtils.currPage = this.currPage;
    this.sendAnalyticAction('focus');
  };

  // 页面离开操作
  private onBlur = () => {
    this.sendAnalyticAction('blur');
  };

  // 上传pageKey
  private pageShow() {
    ScreenUtils.getPageShowAction()({ __pageKey: this.pageKey });
  }

  // 设置pageView埋点属性
  protected setPageViewProps = (props: AnalyticDataProps) => {
    if (!this.hasSetPageViewProps) {
      this.hasSetPageViewProps = true;
      this.delayCheckFirstPageView();
    }
    this.pageViewProps = props;
    this.pageViewPropsResolve && this.pageViewPropsResolve(null);
  };

  // 设置pageExit埋点属性
  protected setPageExitProps = (props: AnalyticDataProps) => {
    this.pageExitProps = props;
  };

  // 延时去检查是否发送了首次的页面pageView事件，如果没有发送，说明没有收到onNavigationFocus和onResume事件，手动补上一次pageView事件(首次pageView)
  private delayCheckFirstPageView = () => {
    this.delayCheckTimer = setTimeout(() => {
      if (!this.pageTraceList.includes('focus')) {
        this.pageShow();
        this.onFocus(PageViewExitEventSource.page);
      }
    }, 500);
  };

  // 检查能否发送pageView或者pageExit事件，这两个事件应该是成对出现，避免连续发送pageView或者pageExit事件，
  // 除了首次，首次可以直接发送pageView事件
  private shouldSend = (type: PageTraceType): boolean => {
    return (
      (this.pageTraceList.length === 0 && type === 'focus') ||
      (this.pageTraceList.length > 0 &&
        this.pageTraceList[this.pageTraceList.length - 1] !== type)
    );
  };

  // 发送数据操作
  private sendAnalyticAction = (type: PageTraceType) => {
    const sendActions = ScreenUtils.getSendAnalyticActions();

    if (!sendActions) {
      console.log(`没有设置sendAnalyticAction，发送${type}事件失败`);
      return;
    }

    const { pageView, pageExit } = sendActions;

    if (!this.shouldSend(type)) {
      return;
    }

    if (type === 'focus') {
      // console.log('sendAnalyticAction focus');
      if (this.customPageView) {
        // console.log('customPageView 存在 执行');
        this.pageTraceList.push('focus');
        this.customPageView();
        return;
      }
      console.log(
        `发送页面pageView埋点 页面名: ${ScreenUtils.currPage} pageViewId: ${
          this.pageViewId
        } props: ${this.pageViewProps} ${Date.now()}`
      );
      if (!pageView) {
        return;
      }
      this.pageTraceList.push('focus');
      pageView(this.pageViewId, this.currPage, this.pageViewProps || {});
      return;
    }

    if (type === 'blur') {
      // console.log('sendAnalyticAction blur');
      if (this.customPageExit) {
        // console.log('customPageExit 存在 执行');
        this.pageTraceList.push('blur');
        this.customPageExit();
        return;
      }
      console.log(
        `发送页面pageExit埋点 页面名: ${ScreenUtils.currPage} pageExitId: ${
          this.pageExitId
        } props: ${this.pageExitProps} ${Date.now()}`
      );
      if (!pageExit) {
        return;
      }
      this.pageTraceList.push('blur');
      pageExit(this.pageExitId, this.currPage, this.pageExitProps || {});
      return;
    }
  };

  // // 设置 动态获取页面离开埋点属性 方法
  // protected setPageExitPropsGener = (cb: PageExitDataGener) => {
  //   this.pageExitDataGener = cb;
  // };

  componentWillUnmount() {
    this.focusSubs && this.focusSubs();
    this.blurSubs && this.blurSubs();
    this.onResumeSubs && this.onResumeSubs.remove();
    this.onPauseSubs && this.onPauseSubs.remove();
    this.debounceTimer && clearTimeout(this.debounceTimer);
    this.delayCheckTimer && clearTimeout(this.delayCheckTimer);
    AppState.removeEventListener('change', this.appStateChangeHandler);
  }
}
