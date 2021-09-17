import Screen, { Props, AnalyticDataProps, PageExitDataGener } from './Screen';
import PureScreen from './PureScreen';
import useScreen from './useScreen';
import ScrollAnalyticItem from './ScrollAnalyticComp';
import ScreenUtils, { SendAnalyticFunc } from './utils';
import type { ShowEvent } from './ScrollAnalytic';

ScreenUtils.setDefaultSendAnalyticActions();

export type AnalyticProps = Props;
export type AnalyticPropsParams = AnalyticDataProps;
export type SendAnalyticFuncType = SendAnalyticFunc;
export type PageExitDataGenerType = PageExitDataGener;
export type ScrollShowEvent = ShowEvent;

export default {
  Screen,
  PureScreen,
  useScreen,
  ScreenUtils,
  ScrollAnalyticItem,
};
