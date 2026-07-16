import { gql } from "@apollo/client";

export const GET_SHOPPING_ITEMS = gql`
  query GetShoppingItems {
    shoppingItems {
      id
      name
      purchased
      addedBy {
        id
        name
        color
      }
      createdAt
    }
  }
`;
