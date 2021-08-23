import React, { useEffect, useRef } from 'react';
import { EmitterSubscription, AppState, AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  PageViewExitEventSource,
  AnalyticDataProps,
  Props,
  isIos,
  PageEventEmitter,
  CustomAppState,
  SendAnalyticFunc,
} from './Screen';

interface ScreenHookProps {
  pageViewId: number;
  pageExitId: number;
  currPage: string;
  customPageView?: () => void;
  customPageExit?: () => void;
  [index: string]: any;
}

interface UseScreenReturnType {
  setPageViewProps: (props: AnalyticDataProps) => void;
  setPageExitProps: (props: AnalyticDataProps) => void;
}

export class ScreenHookUtils {
  // 发送数据操作
  private static sendAnalyticAction?: SendAnalyticFunc;

  // 设置发送操作
  static setSendAnalyticAction(cb: SendAnalyticFunc) {
    ScreenHookUtils.sendAnalyticAction = cb;
  }

  //
  static getSendAnalyticAction(): SendAnalyticFunc | undefined {
    return ScreenHookUtils.sendAnalyticAction;
  }

  // 是否是首次发送 页面展示，由于首次进入页面后navigation的focus事件 与 page的onResume事件/APPstate的active事件 都会触发一次
  // 导致重复发送 页面展示 埋点，过滤掉首次发送页面展示的埋点
  private static isFirstPageView: boolean = true;

  //
  static updateIsFirstPageView(value: boolean) {
    ScreenHookUtils.isFirstPageView = value;
  }

  static getIsFirstPageView(): boolean {
    return ScreenHookUtils.isFirstPageView;
  }
}

export default function useScreen(props: ScreenHookProps): UseScreenReturnType {
  const {
    pageViewId,
    pageExitId,
    currPage,
    customPageView,
    customPageExit,
    // test,
  } = props;

  // 当前页面维护的APPstate数组
  const appStateList: CustomAppState[] = [];
  // focus事件订阅
  let focusSubs: () => void;

  // blur事件订阅
  let blurSubs: () => void;

  // onResume事件订阅
  let onResumeSubs: EmitterSubscription;

  // onPause事件订阅
  let onPauseSubs: EmitterSubscription;

  // pageview属性
  let pageViewProps: AnalyticDataProps | null = null;

  // pageExit属性
  let pageExitProps: AnalyticDataProps | null = null;

  // 设置pageViewProps等待resolve
  let pageViewPropsResolve: (r: any) => void;

  // 设置pageViewProps等待promise
  let pageViewPropsPromise: Promise<any> = new Promise((resolve) => {
    pageViewPropsResolve = resolve;
  });

  // 安卓端是否已经添加过page/appstate变化监听
  // 安卓端这两个事件监听功能相同，都能同时监听onPause/onResume active/background 事件避免重复监听
  let androidHasAddPageAppstateListener: boolean = false;

  // debounce时长
  const debounceDuration: number = 1500;

  // 处理页面APPstate变化防抖timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // debounce函数里面使用的appstate
  let debounceUseAppState: AppStateStatus | null = null;

  // customAppState与Appstate映射关系
  let customAppStateMap: Map<AppStateStatus, CustomAppState> = new Map([
    ['active', CustomAppState.active],
    ['background', CustomAppState.background],
    ['inactive', CustomAppState.background],
  ]);

  //
  // let navigation: ReturnType<typeof useNavigation> = useNavigation();
  let navigation = props.navigation;

  // 设置pageView埋点属性
  function setPageViewProps(prop: AnalyticDataProps) {
    pageViewProps = prop;
    pageViewPropsResolve && pageViewPropsResolve(null);
  }

  // 设置pageExit埋点属性
  function setPageExitProps(prop: AnalyticDataProps) {
    pageExitProps = prop;
  }

  // 发送数据操作
  function sendAnalyticAction(type: 'focus' | 'blur') {
    const sendAction = ScreenHookUtils.getSendAnalyticAction();
    if (!sendAction) {
      console.log(`没有设置sendAnalyticAction，发送${type}事件失败`);
      return;
    }

    if (type === 'focus') {
      // console.log('sendAnalyticAction focus');
      if (customPageView) {
        // console.log('customPageView 存在 执行');
        customPageView();
        return;
      }
      console.log(
        `发送页面pageView埋点 页面名: ${currPage} pageViewId: ${pageViewId} props: ${pageViewProps} ${Date.now()}`
      );
      sendAction(pageViewId, currPage, pageViewProps || {});
      return;
    }

    if (type === 'blur') {
      // console.log('sendAnalyticAction blur');
      if (customPageExit) {
        // console.log('customPageExit 存在 执行');
        customPageExit();
        return;
      }
      console.log(
        `发送页面pageExit埋点 页面名: ${currPage} pageExitId: ${pageExitId} props: ${pageExitProps} ${Date.now()}`
      );
      sendAction(pageExitId, currPage, pageExitProps || {});
      return;
    }
  }

  // 页面显示操作
  async function onFocus(source: PageViewExitEventSource) {
    if (
      source === PageViewExitEventSource.page &&
      ScreenHookUtils.getIsFirstPageView()
    ) {
      ScreenHookUtils.updateIsFirstPageView(false);
      return;
    }
    if (ScreenHookUtils.getIsFirstPageView()) {
      ScreenHookUtils.updateIsFirstPageView(false);
    }
    await pageViewPropsPromise;
    // Screen.currentPage = currPage;
    sendAnalyticAction('focus');
  }

  // 页面离开操作
  function onBlur() {
    sendAnalyticAction('blur');
  }

  // 添加路由监听
  function addNavigationListener(): Array<() => void> {
    focusSubs = () => {};
    blurSubs = () => {};
    if (props.addFocusListener) {
      focusSubs = props.addFocusListener(onNavigationFocus);
    } else {
      focusSubs = props.navigation.addListener('focus', onNavigationFocus);
    }
    if (props.addBlurListener) {
      blurSubs = props.addBlurListener(onNavigationBlur);
    } else {
      blurSubs = props.navigation.addListener('blur', onNavigationBlur);
    }

    return [focusSubs, blurSubs];
  }

  // navigationOnFocus事件
  function onNavigationFocus() {
    console.log(`onNavigationFocus事件： 页面名：${currPage}`);
    onFocus(PageViewExitEventSource.navigation);
  }

  // navigationOnBlur事件
  function onNavigationBlur() {
    console.log(`onNavigationBlur事件： 页面名：${currPage}`);
    onBlur();
  }

  // 页面与native页面相互跳转的处理
  function onResumeHandler() {
    if (!navigation.isFocused()) {
      return;
    }
    console.log(`onResume事件： 页面名：${currPage}`);
    onFocus(PageViewExitEventSource.page);
  }

  // 页面与native页面相互跳转的处理
  function onPauseHandler() {
    if (!navigation.isFocused()) {
      return;
    }
    console.log(`onPause事件： 页面名：${currPage}`);
    onBlur();
  }

  // 添加RN页面状态变化监听，从RN页面跳转到Native页面时触发onPause，回到RN页面时触发onResume
  function addPageChangeHandler(): Array<EmitterSubscription> {
    onResumeSubs = PageEventEmitter.addListener('onResume', onResumeHandler);
    onPauseSubs = PageEventEmitter.addListener('onPause', onPauseHandler);
    return [onResumeSubs, onPauseSubs];
  }

  // 根据不同的平台添加page状态变化监听
  function addPageListener() {
    if (isIos) {
      addPageChangeHandler();
      return;
    }
    if (androidHasAddPageAppstateListener) {
      return;
    }
    addPageChangeHandler();
    androidHasAddPageAppstateListener = true;
  }

  // APPstate状态变化处理
  function handleAppState(status: AppStateStatus) {
    // if (status === 'active') {
    //   console.log(`appstate变化，active 页面名：${this.currPage}`);
    //   this.onFocus();
    // } else if (status === 'background') {
    //   console.log(`appstate变化，background 页面名：${this.currPage}`);
    //   this.onBlur();
    // } else if (status === 'inactive') {
    //   console.log(`appstate变化 inactive 页面名：${this.currPage}`);
    // }

    const formerAppState = appStateList[appStateList.length - 1];
    const currentAppState = customAppStateMap.get(status);

    if (!currentAppState || formerAppState === currentAppState) {
      return;
    }
    appStateList.push(currentAppState);

    if (currentAppState === CustomAppState.active) {
      console.log(`appstate变化，active 页面名：${currPage} ${Date.now()}`);
      onFocus(PageViewExitEventSource.appState);
    } else {
      console.log(`appstate变化，background 页面名：${currPage} ${Date.now()}`);
      onBlur();
    }
  }

  // APPstate状态更新防抖
  function appStateChangeHandler(status: AppStateStatus) {
    console.log(`appStateChangeHandler ${status} ${currPage}  ${Date.now()}`);
    if (!navigation.isFocused()) {
      return;
    }

    if (status === debounceUseAppState) {
      return;
    }

    debounceTimer && clearTimeout(debounceTimer);
    debounceUseAppState = status;
    debounceTimer = setTimeout(() => {
      handleAppState(status);
    }, debounceDuration);
  }

  // 添加APPstate状态变化监听，切换到后台触发background，回来触发active
  function addAppStateChangeHandler() {
    AppState.addEventListener('change', appStateChangeHandler);
  }

  // 根据不同的平台添加appState状态变化监听
  function addAppStateListener() {
    if (isIos) {
      addAppStateChangeHandler();
      return;
    }
    if (androidHasAddPageAppstateListener) {
      return;
    }
    addAppStateChangeHandler();
    androidHasAddPageAppstateListener = true;
  }

  // 添加监听
  function addListeners() {
    addNavigationListener();
    addPageListener();
    addAppStateListener();
  }

  // 移除监听
  function removeListeners() {
    focusSubs && focusSubs();
    blurSubs && blurSubs();
    onResumeSubs && onResumeSubs.remove();
    onPauseSubs && onPauseSubs.remove();
    debounceTimer && clearTimeout(debounceTimer);
    AppState.removeEventListener('change', appStateChangeHandler);
  }

  useEffect(() => {
    addListeners();
    return removeListeners;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    setPageViewProps,
    setPageExitProps,
  };
}
