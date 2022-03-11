/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createEvidence = /* GraphQL */ `
  mutation CreateEvidence(
    $input: CreateEvidenceInput!
    $condition: ModelEvidenceConditionInput
  ) {
    createEvidence(input: $input, condition: $condition) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;
export const updateEvidence = /* GraphQL */ `
  mutation UpdateEvidence(
    $input: UpdateEvidenceInput!
    $condition: ModelEvidenceConditionInput
  ) {
    updateEvidence(input: $input, condition: $condition) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;
export const deleteEvidence = /* GraphQL */ `
  mutation DeleteEvidence(
    $input: DeleteEvidenceInput!
    $condition: ModelEvidenceConditionInput
  ) {
    deleteEvidence(input: $input, condition: $condition) {
      id
      name
      description
      createdAt
      updatedAt
    }
  }
`;
