import { gql } from "@apollo/client";

export const ADD_EXPENSE = gql`
  mutation AddExpense($title: String!, $amount: Float!, $paidBy: ID!, $splitBetween: [ID]) {
    addExpense(title: $title, amount: $amount, paidBy: $paidBy, splitBetween: $splitBetween) {
      id
      title
      amount
      paidBy {
        id
        name
        color
      }
      splitBetween {
        id
        name
      }
      date
    }
  }
`;

export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id) {
      id
    }
  }
`;

export const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: ID!, $title: String, $amount: Float, $paidBy: ID, $splitBetween: [ID]) {
    updateExpense(id: $id, title: $title, amount: $amount, paidBy: $paidBy, splitBetween: $splitBetween) {
      id
      title
      amount
      paidBy {
        id
        name
        color
      }
    }
  }
`;
