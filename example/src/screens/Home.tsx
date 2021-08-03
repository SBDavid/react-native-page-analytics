import React from 'react';
import { View, Text, ScrollView, TouchableHighlight } from 'react-native';
import PageAnalytics, { AnalyticProps } from 'react-native-page-analytics';
import styled from 'styled-components';
import { Container, Item, ItemText } from './StyledComponents';

interface HomePageProps {}

interface HomePageState {
  list: string[];
}

export default class HomePage extends PageAnalytics.Screen<
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
