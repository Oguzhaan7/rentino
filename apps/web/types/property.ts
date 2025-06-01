// Property types based on backend schema
export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  totalArea: number;
  yearBuilt?: number;
  numberOfRooms?: number;
  numberOfBaths?: number;
  floor?: number;
  description?: string;
  buildingId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  building?: {
    id: string;
    name: string;
    address: string;
  };
  _count?: {
    contracts: number;
    documents: number;
    maintenanceRecords: number;
  };
}

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "OFFICE"
  | "SHOP"
  | "LAND"
  | "WAREHOUSE";

export type PropertyStatus =
  | "AVAILABLE"
  | "RENTED"
  | "UNDER_MAINTENANCE"
  | "ON_SALE"
  | "SOLD";

export interface CreatePropertyData {
  title: string;
  type: PropertyType;
  status?: PropertyStatus;
  address: string;
  city: string;
  district: string;
  postalCode?: string;
  totalArea: number;
  yearBuilt?: number;
  numberOfRooms?: number;
  numberOfBaths?: number;
  floor?: number;
  description?: string;
  buildingId?: string;
  isActive?: boolean;
}

export interface UpdatePropertyData {
  title?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  totalArea?: number;
  yearBuilt?: number;
  numberOfRooms?: number;
  numberOfBaths?: number;
  floor?: number;
  description?: string;
  buildingId?: string;
  isActive?: boolean;
}

export interface PropertyFilters {
  search?: string;
  status?: PropertyStatus;
  type?: PropertyType;
  city?: string;
  district?: string;
  minArea?: number;
  maxArea?: number;
  minRooms?: number;
  maxRooms?: number;
  buildingId?: string;
}

export interface PropertyStats {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  maintenanceProperties: number;
  totalArea: number;
  averageRent: number;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  title: string;
  type: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyMaintenance {
  id: string;
  propertyId: string;
  title: string;
  description?: string;
  cost?: number;
  date: string;
  maintenanceType: string;
  contractor?: string;
  invoiceNumber?: string;
  warranty?: string;
  createdAt: string;
  updatedAt: string;
}
