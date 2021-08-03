import React from 'react';
import { View, Text, ScrollView, TouchableHighlight } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';
import styled from 'styled-components';
import BackBtn from './BackBtn';
import { Container } from './StyledComponents';

const Item = styled(View)`
  width: 100px;
  height: 20px;
  background-color: rgba(
    255,
    0,
    0,
    ${(props: { index: number }) => 0.3 + props.index * 0.1}
  );
`;

const ItemText = styled(Text)`
  font-size: 20px;
  color: green;
  font-weight: bold;
`;

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default class Screen1 extends PageAnalytics.Screen<
  HomePageProps & AnalyticProps,
  HomePageState
> {
  constructor(props: HomePageProps & AnalyticProps) {
    super(props);
  }

  state: HomePageState = {
    list: ['页面1', '页面2', '页面3'],
  };

  componentDidMount() {}

  handlePress = (index: number) => {
    if (index === 0) {
    } else if (index === 1) {
    } else {
    }
  };

  render() {
    return (
      <Container>
        <ScrollView>
          <BackBtn backBtnHandler={() => {}} />
          {this.state.list.map((item, index) => {
            return (
              <TouchableHighlight onPress={() => this.handlePress(index)}>
                <Item key={index} index={index}>
                  <ItemText>{item}</ItemText>
                </Item>
              </TouchableHighlight>
            );
          })}
        </ScrollView>
      </Container>
    );
  }
}
