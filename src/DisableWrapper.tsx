import * as React from 'react';
import PropTypes from 'prop-types';

type Props = {
  disable: boolean;
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
    this.isDisable = this.props.disable;
    this.isDisablePageAnalytics = this.isDisablePageAnalytics.bind(this);
  }

  getChildContext() {
    return {
      isDisablePageAnalytics: this.isDisablePageAnalytics,
    };
  }

  isDisablePageAnalytics() {
    // console.info('isDisablePageAnalytics', this.isDisable);
    if (this.isDisable === true) {
      return true;
    } else if (this.context?.isDisablePageAnalytics !== undefined) {
      return this.context?.isDisablePageAnalytics();
    } else {
      return false;
    }
  }

  shouldComponentUpdate() {
    this.isDisable = this.props.disable;

    // console.info('shouldComponentUpdate', this.isDisable);
    return true;
  }

  render() {
    return this.props.children;
  }
}
