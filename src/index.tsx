import Screen from './Screen';
import PureScreen from './PureScreen';
import useScreen from './useScreen';
// import ScrollAnalyticWapper from './ScrollAnalyticWapper';
// import DisableWapper from './DisableWrapper';
// import ScrollAnalyticComp from './ScrollAnalyticComp2';
// import type { ShowEvent } from './ScrollAnalytic';
export { default as ScrollAnalyticComp } from './ScrollAnalyticComp2';
export { default as ScrollAnalyticWapper } from './ScrollAnalyticWapper';
export { default as DisableWrapper } from './DisableWrapper';
export { default as ScrollEventSender } from './ScrollEventSender';
export {
  CustomPageViewFuncType,
  Props as AnalyticProps,
  AnalyticDataProps as AnalyticPropsParams,
  PageExitDataGener as PageExitDataGenerType,
} from './Screen';
export { ShowEvent as ScrollShowEvent } from './ScrollAnalytic';

// export type AnalyticProps = Props;
// export type AnalyticPropsParams = AnalyticDataProps;
// export type PageExitDataGenerType = PageExitDataGener;
// export type ScrollShowEvent = ShowEvent;

export default {
  Screen,
  PureScreen,
  useScreen,
};
