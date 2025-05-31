import { PropertyStatus, PropertyType } from "@prisma/client";

// Mülk oluşturma için veri tipi
export interface CreatePropertyBody {
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

// Mülk güncelleme için veri tipi
export interface UpdatePropertyBody {
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

// Mülk listeleme parametreleri
export interface ListPropertiesQuery {
  page?: number;
  limit?: number;
  orderBy?: string;
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

// Mülk belge ekleme için veri tipi
export interface AddPropertyDocumentBody {
  title: string;
  type: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  description?: string;
}

// Mülk bakım kaydı ekleme için veri tipi
export interface AddPropertyMaintenanceBody {
  title: string;
  description?: string;
  cost?: number;
  date: string | Date;
  maintenanceType: string;
  contractor?: string;
  invoiceNumber?: string;
  warranty?: string | Date;
}

// URL Parametreleri
export interface PropertyIdParam {
  id: string;
}

export interface PropertyIdWithQuery extends PropertyIdParam {
  permanent?: boolean;
}

export interface PropertyMaintenanceParam {
  propertyId: string;
}
