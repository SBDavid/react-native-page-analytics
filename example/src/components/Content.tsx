import React from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

export const ContentContainer = styled(View)`
  background-color: green;
  margin-top: 30px;
  margin-left: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

export const ContentText = styled(Text)`
  font-size: 30px;
  color: white;
`;

interface CurrentPropType {
  title: string;
}

export default function Content(props: CurrentPropType) {
  return (
    <ContentContainer>
      <ContentText>{props.title}</ContentText>
    </ContentContainer>
  );
}
