import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type EvidenceMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Evidence {
  readonly id: string;
  readonly name?: string | null;
  readonly file?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Evidence, EvidenceMetaData>);
  static copyOf(source: Evidence, mutator: (draft: MutableModel<Evidence, EvidenceMetaData>) => MutableModel<Evidence, EvidenceMetaData> | void): Evidence;
}