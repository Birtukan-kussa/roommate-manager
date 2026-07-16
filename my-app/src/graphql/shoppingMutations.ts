import { gql } from "@apollo/client";

export const ADD_SHOPPING_ITEM = gql`
  mutation AddShoppingItem($name: String!, $addedBy: ID, $assignedTo: ID) {
    addShoppingItem(name: $name, addedBy: $addedBy, assignedTo: $assignedTo) {
      id
      name
      purchased
      addedBy {
        id
        name
        color
      }
      assignedTo {
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
  mutation UpdateShoppingItem($id: ID!, $name: String, $assignedTo: ID) {
    updateShoppingItem(id: $id, name: $name, assignedTo: $assignedTo) {
      id
      name
      purchased
      addedBy {
        id
        name
        color
      }
      assignedTo {
        id
        name
        color
      }
    }
  }
`;
