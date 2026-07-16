import { gql } from "@apollo/client";

export const ADD_SHOPPING_ITEM = gql`
  mutation AddShoppingItem($name: String!, $addedBy: ID) {
    addShoppingItem(name: $name, addedBy: $addedBy) {
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

export const DELETE_SHOPPING_ITEM = gql`
  mutation DeleteShoppingItem($id: ID!) {
    deleteShoppingItem(id: $id) {
      id
    }
  }
`;

export const TOGGLE_PURCHASED = gql`
  mutation TogglePurchased($id: ID!) {
    togglePurchased(id: $id) {
      id
      purchased
    }
  }
`;

export const UPDATE_SHOPPING_ITEM = gql`
  mutation UpdateShoppingItem($id: ID!, $name: String) {
    updateShoppingItem(id: $id, name: $name) {
      id
      name
      purchased
      addedBy {
        id
        name
        color
      }
    }
  }
`;
