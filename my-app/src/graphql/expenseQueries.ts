import { gql } from "@apollo/client";

export const GET_EXPENSES = gql`
  query GetExpenses {
    expenses {
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
