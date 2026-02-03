/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref } from 'vue'
import type { Cow, CowFormData } from '~/types'
import type { Database } from '~/types/supabase'
import { getCowStatusColor } from '~/utils/statusHelpers'

// Helper function to convert form data to database insert format
const convertCowFormToDbInsert = (formData: CowFormData, farmId: string): Database['public']['Tables']['cows']['Insert'] => {
  const { age, weight, ...rest } = formData
  return {
    ...rest,
    farm_id: farmId,
    age: age ? Number.parseInt(age, 10) : null,
    weight: weight ? Number.parseFloat(weight) : null
  }
}

// Helper function to convert form data to database update format  
const convertCowFormToDbUpdate = (formData: Partial<CowFormData>): Database['public']['Tables']['cows']['Update'] => {
  const { age, weight, ...rest } = formData
  const updates: Database['public']['Tables']['cows']['Update'] = { ...rest }
  
  if (age !== undefined) {
    updates.age = age ? Number.parseInt(age, 10) : null
  }
  if (weight !== undefined) {
    updates.weight = weight ? Number.parseFloat(weight) : null
  }
  
  return updates
}

interface FetchCowsParams {
  limit?: number | null
  status?: string | null
  orderBy?: string
}

interface FetchCowsPaginatedParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  breed?: string
}

interface PaginatedCowsResult {
  data: Cow[]
  count: number
}

interface CowStatus {
  value: string
  label: string
}

export const useCows = () => {
  const { $supabase } = useNuxtApp()
  const cows: Ref<Cow[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  const fetchCows = async ({ limit = null, status = null, orderBy = 'created_at' }: FetchCowsParams = {}): Promise<Cow[]> => {
    loading.value = true
    try {
      // Get current user to ensure RLS (Row Level Security) works
      let query = $supabase
        .from('cows')
        .select('*')
      
      if (status) {
        query = query.eq('status', status)
      }

      if (orderBy === 'name') {
        query = query.order('name', { ascending: true })
      } else {
        query = query.order(orderBy, { ascending: false })
      }
      
      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: err } = await query
      
      if (err) throw err
      
      // If fetching main list (no limit, default sort), update state.
      if (!limit && !status) {
         cows.value = data || []
      }
      return data || []

    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching cows:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCowsPaginated = async ({ 
    page = 1, 
    pageSize = 12, 
    search = '', 
    status = '', 
    breed = '' 
  }: FetchCowsPaginatedParams = {}): Promise<PaginatedCowsResult> => {
    loading.value = true
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = $supabase
        .from('cows')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`name.ilike.%${search}%,tag_id.ilike.%${search}%`)
      }

      if (status) {
        query = query.eq('status', status)
      }

      if (breed) {
        query = query.eq('breed', breed)
      }

      const { data, count, error: err } = await query.range(from, to)

      if (err) throw err

      return { data: data || [], count: count || 0 }
    } catch (e: any) {
      console.error('Error fetching paginated cows:', e)
      return { data: [], count: 0 }
    } finally {
      loading.value = false
    }
  }

  const getCowById = async (id: string): Promise<Cow | null> => {
    try {
      const { data, error: err } = await $supabase
        .from('cows')
        .select('*')
        .eq('id', id)
        .single()
      
      if (err) throw err
      return data
    } catch (e: any) {
      console.error('Error fetching cow:', e)
      return null
    }
  }

  const addCow = async (cowData: CowFormData): Promise<Cow> => {
    loading.value = true
    try {
      // Get authenticated user
      const { data: { user } } = await $supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const result = await ($supabase as any)
        .from('cows')
        .insert([convertCowFormToDbInsert(cowData, user.id)])
        .select()
        .single()
      
      const { data, error: err } = result as unknown as { data: Cow | null; error: any }
      
      if (err) throw err
      
      cows.value = [data, ...cows.value]
      return data
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateCow = async (id: string, updates: Partial<CowFormData>): Promise<Cow | null> => {
    loading.value = true
    try {
      const result = await ($supabase as any)
        .from('cows')
        .update(convertCowFormToDbUpdate(updates))
        .eq('id', id)
        .select()
        .single()
      
      const { data, error: err } = result as unknown as { data: Cow | null; error: any }
      
      if (err) throw err
      
      // Update local state
      const index = cows.value.findIndex(cow => cow.id === id)
      if (index !== -1) {
        cows.value[index] = data
      }
      
      return data
    } catch (e: any) {
      error.value = e.message
      console.error('Error updating cow:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteCow = async (id: string): Promise<boolean> => {
    loading.value = true
    try {
      const { error: err } = await $supabase
        .from('cows')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      
      // Remove from local state
      cows.value = cows.value.filter(cow => cow.id !== id)
      return true
    } catch (e: any) {
      error.value = e.message
      console.error('Error deleting cow:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // Use centralized status class helper
  const getStatusClass = getCowStatusColor

  // Cow statuses for dropdowns
  const cowStatuses: CowStatus[] = [
    { value: 'active', label: 'Active' },
    { value: 'lactating', label: 'Lactating' },
    { value: 'pregnant', label: 'Pregnant' },
    { value: 'dry', label: 'Dry' },
    { value: 'calf', label: 'Calf' },
    { value: 'bull', label: 'Bull' },
    { value: 'sick', label: 'Sick' },
    { value: 'sold', label: 'Sold' },
    { value: 'deceased', label: 'Deceased' }
  ]

  /**
   * Check if a cow can produce milk
   * Bulls, calves, dry, sold, and deceased cows cannot produce milk
   */
  const isMilkable = (status: string): boolean => {
    const normalizedStatus = (status || 'active').toLowerCase()
    return normalizedStatus !== 'bull' && 
           normalizedStatus !== 'calf' && 
           normalizedStatus !== 'dry' &&
           normalizedStatus !== 'sold' &&
           normalizedStatus !== 'deceased'
  }

  return {
    cows,
    loading,
    error,
    fetchCows,
    fetchCowsPaginated,
    getCowById,
    addCow,
    updateCow,
    deleteCow,
    getStatusClass,
    cowStatuses,
    isMilkable
  }
}