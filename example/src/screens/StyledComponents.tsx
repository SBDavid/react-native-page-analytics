import { View, Text } from 'react-native';
import styled from 'styled-components';

export const Container = styled(View)`
  width: 100%;
  height: 100%;
  background-color: green;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Item = styled(View)`
  width: 200px;
  height: 30px;
  margin-top: 25px;
  margin-left: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  border: 1px solid red;
`;

export const ItemText = styled(Text)`
  font-size: 15px;
  color: green;
  font-weight: bold;
`;

export const TabButtonContainer = styled(View)`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: white;
`;

export const TabButtonItem = styled(View)`
  padding: 5px 10px;
  border: 1px solid red;
  background-color: white;
  border-radius: 5px;
`;

export const TabButtonItemText = styled(Text)`
  font-size: 20px;
  color: green;
  font-weight: bold;
`;
