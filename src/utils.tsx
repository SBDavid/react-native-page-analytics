import { NativeModules } from 'react-native';
import type { AnalyticDataProps } from './Screen';

export type SendAnalyticFunc = (
  metaId: number,
  currPage: string,
  props: AnalyticDataProps
) => void;

interface PageKeyProps {
  __pageKey: string;
  [index: string]: string;
}
type PageShowFunc = (param: PageKeyProps) => void;
interface SendAnalyticActions {
  pageView: SendAnalyticFunc;
  pageExit: SendAnalyticFunc;
}
export default class ScreenUtils {
  // 发送数据操作
  private static sendAnalyticActions?: SendAnalyticActions;

  // 设置发送操作
  static setSendAnalyticActions(cbs: SendAnalyticActions) {
    ScreenUtils.sendAnalyticActions = cbs;
  }

  //
  static getSendAnalyticActions(): SendAnalyticActions | undefined {
    return ScreenUtils.sendAnalyticActions;
  }

  // 是否是首次发送 页面展示，由于首次进入页面后navigation的focus事件 与 page的onResume事件/APPstate的active事件 都会触发一次
  // 导致重复发送 页面展示 埋点，过滤掉首次发送页面展示的埋点
  private static isFirstPageView: boolean = true;

  //
  static updateIsFirstPageView(value: boolean) {
    ScreenUtils.isFirstPageView = value;
  }

  static getIsFirstPageView(): boolean {
    return ScreenUtils.isFirstPageView;
  }

  // 全局currPage
  static currPage: string;

  // 发送pageKey方法
  private static pageShow: PageShowFunc = (param: PageKeyProps) => {
    if (NativeModules.XMTrace.pageShow) {
      NativeModules.XMTrace.pageShow(param);
    }
  };

  //
  static getPageShowAction(): PageShowFunc {
    return ScreenUtils.pageShow;
  }
}
