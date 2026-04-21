export type EntityStatus = "Active" | "Inactive";

export interface Entity {
  id: string;
  name: string;
  type: string;
  status: EntityStatus;
  createdAt: any;
}
export type CreateEntityInput = {
  name: string;
  type: string;
  status: EntityStatus;
};