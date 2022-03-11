/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getEvidence = /* GraphQL */ `
  query GetEvidence($id: ID!) {
    getEvidence(id: $id) {
      id
      name
      description
      image
      createdAt
      updatedAt
    }
  }
`;
export const listEvidences = /* GraphQL */ `
  query ListEvidences(
    $filter: ModelEvidenceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEvidences(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        description
        image
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
