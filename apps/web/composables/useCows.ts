/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref } from 'vue'
import type { Cow, CowFormData } from '~/types'
import { getCowStatusColor } from '~/utils/statusHelpers'

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

interface CowStats {
  total: number
  active: number
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

  // Helper to get auth token
  const getAuthToken = async (): Promise<string | null> => {
    const { data } = await $supabase.auth.getSession()
    return data?.session?.access_token || null
  }

  const fetchCows = async ({ limit = null, status = null, orderBy = 'created_at' }: FetchCowsParams = {}): Promise<Cow[]> => {
    loading.value = true
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('User not authenticated')

      const params = new URLSearchParams()
      if (limit) params.append('limit', String(limit))
      if (status) params.append('status', status)
      if (orderBy) params.append('order_by', orderBy)

      const { data, error: err } = await $supabase.functions.invoke(`cowService/get_cows?${params.toString()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (err) throw err
      if (data?.error) throw new Error(data.error)

      const result = data?.cows || []

      // If fetching main list (no limit, default sort), update state.
      if (!limit && !status) {
        cows.value = result
      }
      return result
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
      const token = await getAuthToken()
      if (!token) throw new Error('User not authenticated')

      const params = new URLSearchParams()
      params.append('page', String(page))
      params.append('page_size', String(pageSize))
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      if (breed) params.append('breed', breed)

      const { data, error: err } = await $supabase.functions.invoke(`cowService/get_cows?${params.toString()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (err) throw err
      if (data?.error) throw new Error(data.error)

      return { data: data?.cows || [], count: data?.count || 0 }
    } catch (e: any) {
      console.error('Error fetching paginated cows:', e)
      return { data: [], count: 0 }
    } finally {
      loading.value = false
    }
  }

  const getCowById = async (id: string): Promise<Cow | null> => {
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('User not authenticated')

      const { data, error: err } = await $supabase.functions.invoke(`cowService/get_cow?id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (err) throw err
      if (data?.error) throw new Error(data.error)

      return data?.cow || null
    } catch (e: any) {
      // Fallback: in local dev, edge functions may not be reachable; try direct PostgREST.
      try {
        console.error('Error fetching cow via edge function:', e)
        const msg = String(e?.message || '')
        if (msg.includes('Edge Function') || msg.includes('Functions')) {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

          let query = $supabase.from('cows').select('*');
          if (isUuid) {
            query = query.eq('id', id).single();
          } else {
            query = query.eq('name', id).limit(1).maybeSingle();
          }

          const { data, error: directErr } = await query;
          if (directErr) throw directErr
          return (data as Cow) || null
        }
      } catch (fallbackErr) {
        console.error('Fallback direct cow fetch failed:', fallbackErr)
      }

      return null
    }
  }

  const addCow = async (cowData: CowFormData): Promise<Cow> => {
    loading.value = true
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('User not authenticated')

      const { data, error: err } = await $supabase.functions.invoke('cowService/create_cow', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: cowData
      })

      if (err) throw err
      if (data?.error) throw new Error(data.error)

      const newCow = data?.cow
      if (newCow) {
        cows.value = [newCow, ...cows.value]
      }
      return newCow
    } catch (e: any) {
      // Fallback: try direct insert if edge functions are unreachable (local dev).
      try {
        console.error('Error adding cow via edge function:', e)
        const msg = String(e?.message || '')
        if (msg.includes('Edge Function') || msg.includes('Functions')) {
          const { data, error: directErr } = await ($supabase.from('cows') as any).insert(cowData).select('*').single()
          if (directErr) throw directErr
          if (data) cows.value = [data as Cow, ...cows.value]
          return data as Cow
        }
      } catch (fallbackErr: any) {
        console.error('Fallback direct cow insert failed:', fallbackErr)
        error.value = fallbackErr.message || e.message
        throw fallbackErr
      }

      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const tryFallbackUpdateCow = async (id: string, updates: Partial<CowFormData>, originalErrorMsg: string): Promise<Cow | null> => {
    try {
      const { data, error: directErr } = await ($supabase.from('cows') as any).update(updates).eq('id', id).select('*').single()
      if (directErr) throw directErr
      const updated = data as Cow
      const index = cows.value.findIndex(cow => cow.id === id)
      if (index !== -1 && updated) cows.value[index] = updated
      return updated || null
    } catch (fallbackErr: any) {
      console.error('Fallback direct cow update failed:', fallbackErr)
      error.value = fallbackErr.message || originalErrorMsg
      return null
    }
  }

  const updateCow = async (id: string, updates: Partial<CowFormData>): Promise<Cow | null> => {
    loading.value = true
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('User not authenticated')

      const { data, error: err } = await $supabase.functions.invoke('cowService/update_cow', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: { id, ...updates }
      })

      if (err) throw err
      if (data?.error) throw new Error(data.error)

      const updatedCow = data?.cow

      // Update local state
      const index = cows.value.findIndex(cow => cow.id === id)
      if (index !== -1 && updatedCow) {
        cows.value[index] = updatedCow
      }

      return updatedCow
    } catch (e: any) {
      console.error('Error updating cow via edge function:', e)
      const msg = String(e?.message || '')
      if (msg.includes('Edge Function') || msg.includes('Functions')) {
        return await tryFallbackUpdateCow(id, updates, e.message)
      }
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteCow = async (id: string): Promise<boolean> => {
    loading.value = true
    try {
      const token = await getAuthToken()
      if (!token) throw new Error('User not authenticated')

      const { data, error: err } = await $supabase.functions.invoke('cowService/delete_cow', {
        // Use POST for deletes: avoids issues with DELETE + body in some environments.
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: { id }
      })

      if (err) throw err
      if (data?.error) throw new Error(data.error)

      // Remove from local state
      cows.value = cows.value.filter(cow => cow.id !== id)
      return true
    } catch (e: any) {
      // Fallback: attempt direct table delete if Edge Function invocation fails.
      try {
        console.error('Error deleting cow via edge function:', e)
        const msg = String(e?.message || '')
        if (msg.includes('Edge Function') || msg.includes('Functions')) {
          const { error: directErr } = await $supabase.from('cows').delete().eq('id', id)
          if (directErr) throw directErr
          cows.value = cows.value.filter(cow => cow.id !== id)
          return true
        }
      } catch (fallbackErr: any) {
        console.error('Fallback direct cow delete failed:', fallbackErr)
        error.value = fallbackErr.message || e.message
        return false
      }

      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async (): Promise<CowStats> => {
    loading.value = true
    try {
      const token = await getAuthToken()
      if (!token) return { total: 0, active: 0 }

      const { data, error: err } = await $supabase.functions.invoke('cowService/get_stats', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (err) throw err
      if (data?.error) throw new Error(data.error)

      return data || { total: 0, active: 0 }
    } catch (e: any) {
      console.error('Error fetching cow stats:', e)
      return { total: 0, active: 0 }
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
    fetchStats,
    getStatusClass,
    cowStatuses,
    isMilkable
  }
}
