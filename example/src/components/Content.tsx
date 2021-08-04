import React from 'react';
import { ContentContainer, ContentText } from '../screens/StyledComponents';

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
