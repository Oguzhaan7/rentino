// types/building.ts
export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  district: string;
  totalUnits: number;
  constructionYear?: number;
  isActive: boolean;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    properties: number;
    dues: number;
    expenses: number;
  };
  // Status derived from isActive field
  status?: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
}

export interface BuildingStats {
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  totalIncome: number;
}

export interface CreateBuildingData extends Record<string, unknown> {
  name: string;
  address: string;
  city: string;
  district: string;
  totalUnits: number;
  managerId: string;
  constructionYear?: number;
  isActive?: boolean;
}

export interface UpdateBuildingData extends Partial<CreateBuildingData> {
  status?: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
}
