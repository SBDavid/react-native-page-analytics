import React from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  AppState,
  AppStateStatus,
  EmitterSubscription,
} from 'react-native';
import ScreenUtils from './utils';
import {
  isIos,
  CustomAppState,
  PageViewExitEventSource,
  Props,
  AnalyticDataProps,
  PageTraceType,
  CustomPageViewFuncType,
} from './Screen';

export const PageEventEmitter = new NativeEventEmitter(NativeModules.Page);

export default class PureScreen<P, S> extends React.PureComponent<
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
  protected currPage?: string;

  // pageViewMetaId
  protected pageViewId?: number;

  // pageExitMetaId
  protected pageExitId?: number;

  // // pageview属性
  // private pageViewProps: AnalyticDataProps | null = null;

  // // pageExit属性
  // private pageExitProps: AnalyticDataProps | null = null;

  // // 设置pageViewProps等待promise
  // private pageViewPropsPromise: Promise<any>;

  // // 设置pageViewProps等待resolve
  // private pageViewPropsResolve?: (r: any) => void;

  // // 是否首次setPageViewProps
  // private hasSetPageViewProps: boolean = false;

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
  protected customPageView?: CustomPageViewFuncType;

  // 自定义pageExit埋点发送方法
  protected customPageExit?: () => void;

  // 页面key
  private pageKey: string;

  // 页面newPageId
  private newPageId: string;

  // 仅仅有页面曝光追踪的功能，不添加ubtSource更新的功能
  protected onlyUsePageAnalytic: boolean = false;

  // // 全局currPage
  // protected static currentPage: string;

  // 是否是首次发送 页面展示，由于首次进入页面后navigation的focus事件 与 page的onResume事件/APPstate的active事件 都会触发一次
  // 导致重复发送 页面展示 埋点，过滤掉首次发送页面展示的埋点
  // private static isFirstPageView: boolean = true;

  // // 获取全局currPage
  // static getCurrPage() {
  //   return Screen.currentPage;
  // }

  // 记录AppState变化状态
  private currentAppState: CustomAppState | null = null;

  // 要延后执行的onPause任务列表，ios 在切换到后台之后，扫码进入一个native页面，会先收到onPause事件，再收到appState active事件，
  // 把onPause事件存起来，后续执行这个任务
  private hasOnPauseTask: boolean = false;

  constructor(p: P & Props) {
    super(p);
    // this.pageViewPropsPromise = new Promise((resolve) => {
    //   this.pageViewPropsResolve = resolve;
    // });
    this.firstPageViewPromise = new Promise((resolve) => {
      this.firstPageViewPromiseResolve = resolve;
    });
    this.pageKey = Date.now().toString();
    this.newPageId = ScreenUtils.getUUID() + '_' + Date.now().toString();
    console.log('screen中添加监听');
    // this.pageShow();
    // 添加路由监听
    this.addNavigationListener();
    // 添加page状态变化监听
    this.addPageListener();
    // 添加APPstate变化监听
    this.addAppStateListener();
    //
    this.delayCheckFirstPageView();
  }

  // 等待首次页面展示埋点的Promise
  private firstPageViewPromise: Promise<any>;

  // 等待首次页面展示埋点的promiseResolve
  private firstPageViewPromiseResolve?: (r: any) => void;

  // 首次页面展示埋点是否需要等待通知
  protected needNotifyFirstPageView: boolean = false;

  // 通知数据加载完成，可以发送首次页面展示埋点
  protected notifyFirstPageView = () => {
    this.firstPageViewPromiseResolve && this.firstPageViewPromiseResolve(null);
  };

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

    // 记录appState的变化
    this.currentAppState = currentAppState;

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
    if (isIos) {
      this.hasOnPauseTask = false;
    }
    this.pageShow();
    this.onFocus(PageViewExitEventSource.page);
  };

  // 页面与native页面相互跳转的处理
  private onPauseHandler = () => {
    if (this.props.navigation && !this.props.navigation.isFocused()) {
      return;
    }
    console.log(`onPause事件： 页面名：${this.currPage}`);
    // ios 在切换到后台状态下，扫码进入一个Native页面，会先收到onPause事件，把这个事件存起来，后面再执行
    if (isIos && this.currentAppState === CustomAppState.background) {
      this.hasOnPauseTask = true;
    }
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
    console.log('onFocus source', source);
    // 有navigation的情况下，首次页面展示埋点如果是由onResume事件触发（可能有，可能没有）,过滤此次页面展示埋点，
    // 由首次页面展示埋点由onNavigatiionChange去触发
    // if (
    //   this.focusSubs &&
    //   this.blurSubs &&
    //   source === PageViewExitEventSource.page &&
    //   ScreenUtils.getIsFirstPageView()
    // ) {
    //   console.log('首次发送页面pageView埋点，触发来源为onResume，不发送');
    //   ScreenUtils.updateIsFirstPageView(false);
    //   return;
    // }

    // if (ScreenUtils.getIsFirstPageView()) {
    //   ScreenUtils.updateIsFirstPageView(false);
    // }
    if (this.needNotifyFirstPageView) {
      await this.firstPageViewPromise;
    }
    await this.sendAnalyticAction('focus');
    this.handleOnPauseTask();
  };

  // 页面离开操作
  private onBlur = () => {
    if (this.needNotifyFirstPageView) {
      if (this.pageTraceList.length === 0) {
        this.notifyFirstPageView();
        this.firstPageViewPromise.then(() => {
          this.sendAnalyticAction('blur');
        });
      } else {
        this.sendAnalyticAction('blur');
      }
    } else {
      this.sendAnalyticAction('blur');
    }
  };

  // 处理onPauseTaskList任务
  private handleOnPauseTask = async () => {
    if (isIos && this.hasOnPauseTask) {
      this.hasOnPauseTask = false;
      setTimeout(this.onBlur, 0);
    }
  };

  // 上传pageKey
  private pageShow() {
    if (this.onlyUsePageAnalytic) {
      return;
    }
    ScreenUtils.getPageShowAction()({ __pageKey: this.pageKey });
  }

  // 设置pageView埋点属性
  protected setPageViewProps = (props: AnalyticDataProps) => {
    // if (!this.hasSetPageViewProps) {
    //   this.hasSetPageViewProps = true;
    //   this.delayCheckFirstPageView();
    // }
    // this.pageViewProps = props;
    // this.pageViewPropsResolve && this.pageViewPropsResolve(null);
    console.log(props);
    this.delayCheckFirstPageView();
  };

  // 设置pageExit埋点属性
  protected setPageExitProps = (props: AnalyticDataProps) => {
    // this.pageExitProps = props;
    console.log(props);
  };

  // 延时去检查是否发送了首次的页面pageView事件，如果没有发送，说明没有收到onNavigationFocus和onResume事件，手动补上一次pageView事件(首次pageView)
  private delayCheckFirstPageView = () => {
    this.delayCheckTimer && clearTimeout(this.delayCheckTimer);
    this.delayCheckTimer = setTimeout(() => {
      console.log('delaycheckfirstpageview');
      if (!this.pageTraceList.includes('focus')) {
        console.log('delaycheckfirstpageview onfocus');
        this.pageShow();
        this.onFocus(PageViewExitEventSource.page);
      }
    }, 1000);
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
  private sendAnalyticAction = async (type: PageTraceType) => {
    if (!this.shouldSend(type)) {
      console.log('not should send');
      return;
    }

    if (type === 'focus') {
      if (!this.customPageView) {
        return;
      }
      this.pageTraceList.push('focus');
      this.customPageView({ newPageId: this.newPageId });
    }

    if (type === 'blur') {
      if (!this.customPageExit) {
        return;
      }
      this.pageTraceList.push('blur');
      this.customPageExit();
    }
  };

  // // 设置 动态获取页面离开埋点属性 方法
  // protected setPageExitPropsGener = (cb: PageExitDataGener) => {
  //   this.pageExitDataGener = cb;
  // };

  // 包装click事件props属性方法
  addNewPageIdProp = (param: {
    [index: string]: string;
  }): { [index: string]: string } => {
    return { ...param, newPageId: this.newPageId };
  };

  componentWillUnmount() {
    try {
      this.focusSubs && this.focusSubs();
      this.blurSubs && this.blurSubs();
      this.onResumeSubs && this.onResumeSubs.remove();
      this.onPauseSubs && this.onPauseSubs.remove();
      this.debounceTimer && clearTimeout(this.debounceTimer);
      this.delayCheckTimer && clearTimeout(this.delayCheckTimer);
      AppState.removeEventListener('change', this.appStateChangeHandler);
    } catch (e) {}
  }
}
