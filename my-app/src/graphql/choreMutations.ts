import { gql } from "@apollo/client";

export const ADD_CHORE = gql`
  mutation AddChore($title: String!, $assignedTo: ID, $status: ChoreStatus, $dueDate: String, $recurring: RecurringType) {
    addChore(title: $title, assignedTo: $assignedTo, status: $status, dueDate: $dueDate, recurring: $recurring) {
      id
      title
      status
      assignedTo {
        id
        name
        color
      }
      createdBy {
        id
        name
        color
      }
      dueDate
      recurring
    }
  }
`;

export const DELETE_CHORE = gql`
  mutation DeleteChore($id: ID!) {
    deleteChore(id: $id) {
      id
    }
  }
`;

export const UPDATE_CHORE = gql`
  mutation UpdateChore($id: ID!, $status: ChoreStatus, $title: String, $assignedTo: ID) {
    updateChore(id: $id, status: $status, title: $title, assignedTo: $assignedTo) {
      id
      title
      status
      assignedTo {
        id
        name
        color
      }
      createdBy {
        id
        name
        color
      }
    }
  }
`;
