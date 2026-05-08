/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref } from 'vue'
import type { HealthRecord, HealthRecordFormData } from '~/types'

export const useHealthRecords = () => {
  const { $supabase } = useNuxtApp()
  const toast = useAppToast()

  const healthRecords: Ref<HealthRecord[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const upcomingEvents: Ref<any[]> = ref([])

  // Helper to get auth token
  const getAuthToken = async (): Promise<string | null> => {
    const { data } = await $supabase.auth.getSession()
    return data?.session?.access_token || null
  }

  // Fetch all health records or by cow
  const fetchHealthRecords = async (cowId: string | null = null): Promise<HealthRecord[]> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      const endpoint = cowId
        ? `healthRecordService/health_records?cow_id=${cowId}`
        : 'healthRecordService/health_records'

      const { data, error: fetchError } = await $supabase.functions.invoke(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (fetchError) throw fetchError
      if (data?.error) throw new Error(data.error)

      healthRecords.value = data?.records || []
      return data?.records || []
    } catch (err: any) {
      error.value = err.message
      console.error('Failed to fetch health records:', err)
      toast.error('Failed to fetch health records')
      return []
    } finally {
      loading.value = false
    }
  }

  // Fetch upcoming vaccinations and appointments
  const fetchUpcomingEvents = async (): Promise<any[]> => {
    try {
      const token = await getAuthToken()
      if (!token) return []

      const { data, error: fetchError } = await $supabase.functions.invoke('healthRecordService/upcoming_events', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (fetchError) throw fetchError
      if (data?.error) throw new Error(data.error)

      upcomingEvents.value = data?.upcoming || []
      return data?.upcoming || []
    } catch (err: any) {
      console.error('Failed to fetch upcoming events:', err)
      return []
    }
  }

  // Get overdue vaccinations
  const getOverdueVaccinations = async (): Promise<any[]> => {
    try {
      const token = await getAuthToken()
      if (!token) return []

      const { data, error: fetchError } = await $supabase.functions.invoke('healthRecordService/overdue_checkups', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (fetchError) throw fetchError
      if (data?.error) throw new Error(data.error)

      return data?.overdue || []
    } catch (err: any) {
      console.error('Failed to fetch overdue vaccinations:', err)
      return []
    }
  }

  // Add new health record
  const addHealthRecord = async (formData: HealthRecordFormData): Promise<HealthRecord | null> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      const { data, error: createError } = await $supabase.functions.invoke('healthRecordService/create_health_record', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: formData
      })

      if (createError) throw createError
      if (data?.error) throw new Error(data.error)

      toast.success('Health record added successfully')

      // Refresh the list
      await fetchHealthRecords()

      return data?.record || null
    } catch (err: any) {
      error.value = err.message
      console.error('Failed to add health record:', err)
      toast.error(err.message || 'Failed to add health record')
      return null
    } finally {
      loading.value = false
    }
  }

  // Update existing health record
  const updateHealthRecord = async (id: string, updates: Partial<HealthRecordFormData>): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      const { data, error: updateError } = await $supabase.functions.invoke('healthRecordService/update_health_record', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          id,
          ...updates
        }
      })

      if (updateError) throw updateError
      if (data?.error) throw new Error(data.error)

      toast.success('Health record updated successfully')

      // Refresh the list
      await fetchHealthRecords()

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Failed to update health record:', err)
      toast.error(err.message || 'Failed to update health record')
      return false
    } finally {
      loading.value = false
    }
  }

  // Delete health record
  const deleteHealthRecord = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error('User not authenticated')
      }

      // Use POST for deletes: some proxies/browsers can be flaky with DELETE + JSON body.
      const { data, error: deleteError } = await $supabase.functions.invoke('healthRecordService/delete_health_record', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: { id }
      })

      if (deleteError) throw deleteError
      if (data?.error) throw new Error(data.error)

      toast.success('Health record deleted successfully')

      // Refresh the list
      await fetchHealthRecords()

      return true
    } catch (err: any) {
      // Fallback: if edge function call fails, attempt direct delete via PostgREST.
      // This is useful in local dev when Edge Functions are not reachable.
      try {
        console.error('Failed to delete health record via edge function:', err)
        const msg = String(err?.message || '')
        if (msg.includes('Edge Function') || msg.includes('Functions')) {
          const { error: directErr } = await $supabase.from('health_records').delete().eq('id', id)
          if (directErr) throw directErr
          toast.success('Health record deleted successfully')
          await fetchHealthRecords()
          return true
        }
      } catch (fallbackErr: any) {
        console.error('Fallback direct delete failed:', fallbackErr)
        error.value = fallbackErr.message || err.message
        toast.error((fallbackErr?.message || err?.message) || 'Failed to delete health record')
        return false
      }

      error.value = err.message
      toast.error(err.message || 'Failed to delete health record')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    healthRecords,
    loading,
    error,
    upcomingEvents,
    fetchHealthRecords,
    fetchUpcomingEvents,
    getOverdueVaccinations,
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord
  }
}
