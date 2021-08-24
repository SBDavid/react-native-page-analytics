import type { SendAnalyticFunc } from './Screen';

export default class ScreenUtils {
  // 发送数据操作
  static sendAnalyticAction?: SendAnalyticFunc;

  // 设置发送操作
  static setSendAnalyticAction(cb: SendAnalyticFunc) {
    ScreenUtils.sendAnalyticAction = cb;
  }

  //
  static getSendAnalyticAction(): SendAnalyticFunc | undefined {
    return ScreenUtils.sendAnalyticAction;
  }

  // 是否是首次发送 页面展示，由于首次进入页面后navigation的focus事件 与 page的onResume事件/APPstate的active事件 都会触发一次
  // 导致重复发送 页面展示 埋点，过滤掉首次发送页面展示的埋点
  static isFirstPageView: boolean = true;

  //
  static updateIsFirstPageView(value: boolean) {
    ScreenUtils.isFirstPageView = value;
  }

  static getIsFirstPageView(): boolean {
    return ScreenUtils.isFirstPageView;
  }

  // 全局currPage
  static currPage: string;
}
