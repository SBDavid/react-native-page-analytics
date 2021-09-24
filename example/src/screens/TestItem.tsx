import * as React from 'react';
import { View, Text } from 'react-native';
import ScrollAnalytics from '../../../src/ScrollAnalytic';

export default class TestItem1 extends React.PureComponent<
  { text: string },
  { hasInteracted: Boolean; hasViewed: Boolean; isViewable: Boolean }
> {
  constructor(prop: any) {
    super(prop);
    this.state = {
      hasInteracted: false,
      hasViewed: false,
      isViewable: false,
    };
  }

  render() {
    return (
      <ScrollAnalytics
        onShow={(e) => {
          console.info(this.props.text, '曝光');
          this.setState(e);
          this.setState({ isViewable: true });
        }}
        onHide={() => {
          console.info(this.props.text, '隐藏');
          this.setState({ isViewable: false });
        }}
        // disable
      >
        <View style={{ height: 200, width: 300, opacity: 1 }}>
          <Text style={{ fontSize: 20 }}>{`${this.props.text}`}</Text>
          <Text style={{ fontSize: 20 }}>
            {'isViewable: ' + this.state.isViewable}
          </Text>
          <Text style={{ fontSize: 20 }}>
            {'hasInteracted: ' + this.state.hasInteracted}
          </Text>
          <Text style={{ fontSize: 20 }}>
            {'hasViewed: ' + this.state.hasViewed}
          </Text>
        </View>
      </ScrollAnalytics>
    );
  }
}
