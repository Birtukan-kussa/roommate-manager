import { gql } from "@apollo/client";

export const GET_CHORES = gql`
  query GetChores {
    chores {
      id
      title
      description
      status
      assignedTo {
        id
        name
        color
      }
      dueDate
      recurring
    }
  }
`;
