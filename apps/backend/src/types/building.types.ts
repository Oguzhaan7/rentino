export interface CreateBuildingBody {
  name: string;
  address: string;
  city: string;
  district: string;
  totalUnits: number;
  constructionYear?: number;
  isActive?: boolean;
  managerId: string;
}

// Bina güncelleme için veri tipi
export interface UpdateBuildingBody {
  name?: string;
  address?: string;
  city?: string;
  district?: string;
  totalUnits?: number;
  constructionYear?: number;
  isActive?: boolean;
  managerId?: string;
}

// Bina listeleme parametreleri
export interface ListBuildingsQuery {
  page?: number;
  limit?: number;
  orderBy?: string;
  search?: string;
  city?: string;
  district?: string;
  isActive?: boolean;
  managerId?: string;
}

// Bina gideri ekleme için veri tipi
export interface AddBuildingExpenseBody {
  title: string;
  description?: string;
  amount: number;
  expenseDate: string | Date;
  expenseType: string;
  invoiceNumber?: string;
  paidAt?: string | Date;
  isPaid?: boolean;
}

// Aidat tanımlama için veri tipi
export interface CreateDuesBody {
  period: string | Date;
  amount: number;
  dueDate: string | Date;
  description?: string;
}

// URL Parametreleri
export interface BuildingIdParam {
  id: string;
}

export interface BuildingIdWithQuery extends BuildingIdParam {
  permanent?: boolean;
}

export interface BuildingExpenseParam {
  buildingId: string;
  expenseId?: string;
}

export interface BuildingDuesParam {
  buildingId: string;
  duesId?: string;
}
