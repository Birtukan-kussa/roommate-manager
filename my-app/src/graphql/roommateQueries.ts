import { gql } from "@apollo/client";

export const GET_ROOMMATES = gql`
  query GetRoommates {
    roommates {
      id
      name
      email
      color
      createdAt
    }
  }
`;