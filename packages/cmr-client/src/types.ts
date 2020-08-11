export type ConceptType = 'collection' | 'granule';

export interface ParsedCmrXmlResponse {
  Collection?: {
    DataSetId: string
  },
  Granule?: {
    GranuleUR: string
  },
  errors?: {
    error: unknown
  }
}
