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

  static childContextTypes = {
    isDisablePageAnalytics: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);
    this.isDisablePageAnalytics = this.isDisablePageAnalytics.bind(this);
  }

  getChildContext() {
    return {
      isDisablePageAnalytics: this.isDisablePageAnalytics,
    };
  }

  isDisablePageAnalytics() {
    if (this.props.disable === true) {
      return true;
    } else if (this.context?.isDisablePageAnalytics !== undefined) {
      return this.context?.isDisablePageAnalytics();
    } else {
      return false;
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return this.props.children;
  }
}
