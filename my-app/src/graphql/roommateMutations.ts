import { gql } from "@apollo/client";

export const ADD_ROOMMATE = gql`
  mutation AddRoommate($name: String!, $email: String, $color: String) {
    addRoommate(name: $name, email: $email, color: $color) {
      id
      name
      email
      color
    }
  }
`;

export const UPDATE_ROOMMATE = gql`
  mutation UpdateRoommate($id: ID!, $name: String, $email: String, $color: String) {
    updateRoommate(id: $id, name: $name, email: $email, color: $color) {
      id
      name
      email
      color
    }
  }
`;

export const DELETE_ROOMMATE = gql`
  mutation DeleteRoommate($id: ID!) {
    deleteRoommate(id: $id) {
      id
    }
  }
`;