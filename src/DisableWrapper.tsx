import * as React from 'react';
import PropTypes from 'prop-types';
import Sender from './ScrollEventSender';

type Props = {
  id: String;
  debugKey?: String;
  defalutValue: boolean;
};

// 返回真表示关闭
export default class DisableWapper extends React.Component<Props> {
  static contextTypes = {
    isDisablePageAnalytics: PropTypes.func,
  };

  isDisable: boolean;

  static childContextTypes = {
    isDisablePageAnalytics: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);
    this.isDisable = this.props.defalutValue;
    this.isDisablePageAnalytics = this.isDisablePageAnalytics.bind(this);
    this.globalEventHandler = this.globalEventHandler.bind(this);
  }

  getChildContext() {
    return {
      isDisablePageAnalytics: this.isDisablePageAnalytics,
    };
  }

  isDisablePageAnalytics() {
    if (this.isDisable === true) {
      return true;
    } else if (this.context?.isDisablePageAnalytics !== undefined) {
      return this.context?.isDisablePageAnalytics();
    } else {
      return false;
    }
  }

  componentDidMount() {
    Sender.addListener(this.globalEventHandler);
  }

  componentWillUnmount() {
    Sender.removeListener(this.globalEventHandler);
  }

  globalEventHandler(event: {
    id: String;
    name: 'disable' | 'enable';
  }) {
    if (event.id === this.props.id) {
      // console.info('DisableWapper', event);

      if (event.name === 'disable') {
        this.isDisable = true;
      }

      if (event.name === 'enable') {
        this.isDisable = false;
      }
    }
  }

  render() {
    return this.props.children;
  }
}
