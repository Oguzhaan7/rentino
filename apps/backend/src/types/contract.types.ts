import { ContractStatus, PaymentMethod, RenewalType } from "@prisma/client";

// Sözleşme oluşturma için veri tipi
export interface CreateContractBody {
  title: string;
  propertyId: string;
  tenantId: string; // User ID olarak kiracı
  startDate: string | Date;
  endDate: string | Date;
  monthlyRent: number;
  depositAmount: number;
  paymentDay: number; // Ayın kaçında ödeme yapılacağı
  paymentMethod: PaymentMethod;
  renewalType: RenewalType;
  noticePeriod: number; // Bildirim süresi (gün)
  notes?: string;
}

// Sözleşme güncelleme için veri tipi
export interface UpdateContractBody {
  title?: string;
  status?: ContractStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  monthlyRent?: number;
  depositAmount?: number;
  paymentDay?: number;
  paymentMethod?: PaymentMethod;
  renewalType?: RenewalType;
  noticePeriod?: number;
  notes?: string;
}

// Sözleşme listeleme parametreleri
export interface ListContractsQuery {
  page?: number;
  limit?: number;
  orderBy?: string;
  search?: string;
  status?: ContractStatus;
  propertyId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

// Sözleşme sonlandırma için veri tipi
export interface TerminateContractBody {
  terminationReason: string;
  terminationDate: string | Date;
  penaltyAmount?: number;
  returnDepositAmount?: number;
  notes?: string;
}

// Kira ödemesi ekleme için veri tipi
export interface AddRentPaymentBody {
  amount: number;
  paymentDate: string | Date;
  paymentMethod: PaymentMethod;
  periodStartDate: string | Date;
  periodEndDate: string | Date;
  receiptNumber?: string;
  isPaid: boolean;
  notes?: string;
}

// URL Parametreleri
export interface ContractIdParam {
  id: string;
}

export interface ContractIdWithQuery extends ContractIdParam {
  permanent?: boolean;
}

export interface RentPaymentParam {
  contractId: string;
  paymentId?: string;
}
