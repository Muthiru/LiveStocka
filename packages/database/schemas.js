// Database schemas (DEPRECATED - replaced by TypeScript types)
// Use apps/web/types/supabase.ts for actual implementation

// This file is kept for backwards compatibility
// Migrate to TypeScript types in apps/web/types/ for better type safety

export const userSchema = {
  id: 'uuid',
  email: 'string',
  name: 'string',
  farm_id: 'uuid'
};

export const cowSchema = {
  id: 'uuid',
  farm_id: 'uuid',
  name: 'string',
  breed: 'string',
  tag_id: 'string',
  color: 'string',
  age: 'integer',
  weight: 'integer'
};

export const healthRecordSchema = {
  id: 'uuid',
  cow_id: 'uuid',
  type: 'string', // vaccination, medication, disease, checkup
  description: 'string',
  date: 'date'
};