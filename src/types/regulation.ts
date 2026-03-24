export type RegulationStatus = "Active" | "Inactive";

export interface Regulation {
  id: string;
  title: string;
  code: string;
  status: RegulationStatus;
  createdAt: any;
}

export type CreateRegulationInput = {
  title: string;
  code: string;
  status: RegulationStatus;
};