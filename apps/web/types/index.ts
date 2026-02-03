// Global type definitions for LiveStocka project
export interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
  }
}

export interface Cow {
  id: string
  farm_id: string
  name: string
  breed?: string
  tag_id: string
  color?: string
  age?: number
  weight?: number
  status: 'active' | 'sold' | 'deceased' | 'dry'
  birth_date?: string
  sire?: string
  dam?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface HealthRecord {
  id: string
  cow_id: string
  farm_id: string
  record_type: 'vaccination' | 'medication' | 'disease' | 'treatment' | 'checkup' | 'injury' | 'other'
  title: string
  record_date: string
  record_time?: string
  description?: string
  vaccine_name?: string
  medication_name?: string
  dosage?: string
  administered_by?: string
  next_checkup_date?: string
  disease_name?: string
  symptoms?: string
  diagnosis?: string
  treatment_plan?: string
  recovery_status?: 'recovering' | 'recovered' | 'ongoing' | 'critical'
  vet_name?: string
  vet_contact?: string
  appointment_date?: string
  cost?: number
  attachments?: unknown[]
  notes?: string
  created_at: string
  updated_at?: string
}

export interface MilkProduction {
  id: string
  cow_id: string
  farm_id: string
  production_date: string
  morning_yield: number
  morning_time?: string
  midday_yield?: number
  midday_time?: string
  evening_yield: number
  evening_time?: string
  total_yield: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

export interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  status?: string
  breed?: string
  dateFrom?: string
  dateTo?: string
  searchTerm?: string
}

// Form interfaces
export interface CowFormData {
  name: string
  breed?: string
  tag_id: string
  color?: string
  age?: string
  weight?: string
  status: string
  birth_date?: string
  sire?: string
  dam?: string
  notes?: string
}

export interface HealthRecordFormData {
  cow_id: string
  record_type: string
  title: string
  record_date: string
  record_time?: string
  description?: string
  vaccine_name?: string
  medication_name?: string
  dosage?: string
  administered_by?: string
  next_checkup_date?: string
  disease_name?: string
  symptoms?: string
  diagnosis?: string
  treatment_plan?: string
  recovery_status?: string
  vet_name?: string
  vet_contact?: string
  cost?: string
  notes?: string
}

// Computed/derived interfaces
export interface CowWithHealthRecords extends Cow {
  health_records?: HealthRecord[]
  milk_production?: MilkProduction[]
}

export interface HealthRecordWithCow extends HealthRecord {
  cows?: {
    id: string
    name: string
    tag_id: string
    breed?: string
  }
}

export interface MilkStats {
  totalProduction: number
  averageDaily: number
  recordsCount: number
  lastRecordDate?: string
}

// Component prop types
export interface BaseInputProps {
  modelValue?: string | number
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

// Composable return types
export interface UseAuthReturn {
  user: Ref<User | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData?: unknown) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export interface UseCowsReturn {
  cows: Ref<Cow[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchCows: () => Promise<Cow[]>
  getCowById: (id: string) => Promise<Cow | null>
  addCow: (cowData: CowFormData) => Promise<Cow | null>
  updateCow: (id: string, updates: Partial<CowFormData>) => Promise<Cow | null>
  deleteCow: (id: string) => Promise<boolean>
}

export interface UseHealthRecordsReturn {
  healthRecords: Ref<HealthRecord[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchHealthRecords: (cowId?: string) => Promise<HealthRecord[]>
  addHealthRecord: (recordData: HealthRecordFormData) => Promise<HealthRecord | null>
  updateHealthRecord: (id: string, updates: Partial<HealthRecordFormData>) => Promise<HealthRecord | null>
  deleteHealthRecord: (id: string) => Promise<boolean>
  getOverdueVaccinations: () => HealthRecord[]
  getRecordTypeStats: () => Record<string, number>
}

export interface UseToastReturn {
  toasts: Ref<ToastMessage[]>
  success: (message: string, timeout?: number) => void
  error: (message: string, timeout?: number) => void
  warning: (message: string, timeout?: number) => void
  info: (message: string, timeout?: number) => void
  remove: (id: string) => void
  clear: () => void
}