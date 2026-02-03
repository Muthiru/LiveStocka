/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { HealthRecord, HealthRecordFormData } from '~/types'

// Helper function to convert form data to database insert format
const convertHealthRecordFormToDbInsert = (formData: HealthRecordFormData, farmId: string): any => {
  const { cost, next_checkup_date, record_date, ...rest } = formData
  return {
    ...rest,
    farm_id: farmId,
    date: record_date, // Map record_date to date column
    record_date: record_date,
    cost: cost ? Number.parseFloat(cost) : null,
    next_due_date: next_checkup_date || null
  }
}

// Helper function to convert form data to database update format
const convertHealthRecordFormToDbUpdate = (formData: Partial<HealthRecordFormData>): any => {
  const { cost, next_checkup_date, record_date, ...rest } = formData
  const updates: any = { ...rest }
  
  if (record_date !== undefined) {
    updates.date = record_date
    updates.record_date = record_date
  }
  
  if (cost !== undefined) {
    updates.cost = cost ? Number.parseFloat(cost) : null
  }
  
  if (next_checkup_date !== undefined) {
    updates.next_due_date = next_checkup_date || null
  }
  
  return updates
}

export const useHealthRecords = () => {
  const { $supabase } = useNuxtApp()
  const toast = useToast()

  const healthRecords: Ref<HealthRecord[]> = ref([])
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const upcomingEvents: Ref<any[]> = ref([])

  // Fetch all health records or by cow
  const fetchHealthRecords = async (cowId: string | null = null): Promise<HealthRecord[]> => {
    loading.value = true
    error.value = null

    try {
      const { data: user } = await $supabase.auth.getUser()
      if (!user?.user?.id) {
        throw new Error('User not authenticated')
      }

      let query = $supabase
        .from('health_records')
        .select(`
          *,
          cows (
            id,
            name,
            tag_id,
            breed
          )
        `)
        .eq('farm_id', user.user.id)
        .order('record_date', { ascending: false })

      if (cowId) {
        query = query.eq('cow_id', cowId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      healthRecords.value = data || []
      return data || []
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
      const { data: user } = await $supabase.auth.getUser()
      if (!user?.user?.id) return []

      const { data, error: fetchError } = await $supabase
        .from('upcoming_health_events')
        .select('*')
        .eq('farm_id', user.user.id)

      if (fetchError) throw fetchError

      upcomingEvents.value = data || []
      return data || []
    } catch (err: any) {
      console.error('Failed to fetch upcoming events:', err)
      return []
    }
  }

  // Add new health record
  const addHealthRecord = async (recordData: HealthRecordFormData): Promise<HealthRecord | null> => {
    loading.value = true
    error.value = null

    try {
      const { data: user } = await $supabase.auth.getUser()
      if (!user?.user?.id) {
        throw new Error('User not authenticated')
      }

      const result = await ($supabase as any)
        .from('health_records')
        .insert([convertHealthRecordFormToDbInsert(recordData, user.user.id)])
        .select(`
          *,
          cows (
            id,
            name,
            tag_id
          )
        `)
        .single()

      const { data, error: insertError } = result as unknown as { data: any; error: any }

      if (insertError) {
        throw insertError
      }

      // Add to local state
      healthRecords.value = [data, ...healthRecords.value]

      toast.success('Health record added successfully')

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Failed to add health record:', err)
      toast.error(err.message || 'Failed to add health record')
      return null
    } finally {
      loading.value = false
    }
  }

  // Update health record
  const updateHealthRecord = async (id: string, updates: Partial<HealthRecordFormData>): Promise<HealthRecord | null> => {
    loading.value = true
    error.value = null

    try {
      const { data: user } = await $supabase.auth.getUser()
      if (!user?.user?.id) {
        throw new Error('User not authenticated')
      }

      const result = await ($supabase as any)
        .from('health_records')
        .update(convertHealthRecordFormToDbUpdate(updates))
        .eq('id', id)
        .eq('farm_id', user.user.id)
        .select(`
          *,
          cows (
            id,
            name,
            tag_id
          )
        `)
        .single()

      const { data, error: updateError } = result as unknown as { data: any; error: any }

      if (updateError) throw updateError

      // Update local state
      const index = healthRecords.value.findIndex(r => r.id === id)
      if (index !== -1) {
        healthRecords.value[index] = data
      }

      toast.success('Health record updated successfully')

      return data
    } catch (err: any) {
      error.value = err.message
      console.error('Failed to update health record:', err)
      toast.error(err.message || 'Failed to update health record')
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete health record
  const deleteHealthRecord = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { data: user } = await $supabase.auth.getUser()
      if (!user?.user?.id) {
        throw new Error('User not authenticated')
      }

      const { error: deleteError } = await $supabase
        .from('health_records')
        .delete()
        .eq('id', id)
        .eq('farm_id', user.user.id)

      if (deleteError) throw deleteError

      // Remove from local state
      healthRecords.value = healthRecords.value.filter(r => r.id !== id)

      toast.success('Health record deleted successfully')

      return true
    } catch (err: any) {
      error.value = err.message
      console.error('Failed to delete health record:', err)
      toast.error(err.message || 'Failed to delete health record')
      return false
    } finally {
      loading.value = false
    }
  }

  // Get overdue vaccinations/checkups
  const getOverdueVaccinations = (): HealthRecord[] => {
    const today = new Date().toISOString().split('T')[0]
    return healthRecords.value.filter(record => 
      record.next_checkup_date &&
      record.next_checkup_date < today
    )
  }

  // Get record type statistics
  const getRecordTypeStats = (): Record<string, number> => {
    const stats: Record<string, number> = {}
    healthRecords.value.forEach(record => {
      stats[record.record_type] = (stats[record.record_type] || 0) + 1
    })
    return stats
  }

  return {
    healthRecords,
    loading,
    error,
    upcomingEvents,
    fetchHealthRecords,
    fetchUpcomingEvents,
    addHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
    getOverdueVaccinations,
    getRecordTypeStats
  }
}