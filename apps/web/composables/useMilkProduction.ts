/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue'

export interface ProductionRecord {
    id: string
    cow_id: string
    production_date: string
    morning_yield: number
    midday_yield: number
    evening_yield: number
    total_yield: number
    morning_time?: string
    midday_time?: string
    evening_time?: string
    notes?: string
    cows?: {
        name: string
        tag_id: string
    }
}

export interface ProductionFormData {
    cow_id: string
    production_date: string
    morning_yield?: number
    midday_yield?: number
    evening_yield?: number
    morning_time?: string
    midday_time?: string
    evening_time?: string
    notes?: string
}

export const useMilkProduction = () => {
    const { $supabase } = useNuxtApp()
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Helper to get auth token (consistent with all other composables)
    const getAuthToken = async (): Promise<string | null> => {
        const { data } = await $supabase.auth.getSession()
        return data?.session?.access_token || null
    }

    const fetchProduction = async (date?: string): Promise<ProductionRecord[]> => {
        loading.value = true
        error.value = null
        try {
            const token = await getAuthToken()
            if (!token) throw new Error('User not authenticated')

            let query = 'milkProductionService/production_records'
            if (date) {
                query += `?date=${date}`
            }

            const { data: responseData, error: err } = await $supabase.functions.invoke(query, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (err) throw err
            if (responseData?.error) throw new Error(responseData.error)

            return responseData?.records || []
        } catch (e: any) {
            error.value = e.message
            console.error('Error fetching production records:', e)
            return []
        } finally {
            loading.value = false
        }
    }

    const addProduction = async (record: ProductionFormData): Promise<any> => {
        loading.value = true
        error.value = null
        try {
            const token = await getAuthToken()
            if (!token) throw new Error('User not authenticated')

            const { data: responseData, error: err } = await $supabase.functions.invoke('milkProductionService/create_production', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: record
            })

            if (err) throw err
            if (responseData?.error) throw new Error(responseData.error)

            return responseData
        } catch (e: any) {
            error.value = e.message
            throw e
        } finally {
            loading.value = false
        }
    }

    const fetchStats = async () => {
        loading.value = true
        try {
            const token = await getAuthToken()
            if (!token) throw new Error('User not authenticated')

            const { data: responseData, error: err } = await $supabase.functions.invoke('milkProductionService/production_stats', {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })

            if (err) throw err
            if (responseData?.error) throw new Error(responseData.error)

            return responseData
        } catch (e: any) {
            console.error('Error fetching milk stats:', e)
            return null
        } finally {
            loading.value = false
        }
    }

    const bulkAddProduction = async (records: ProductionFormData[]): Promise<any> => {
        loading.value = true
        error.value = null
        try {
            const token = await getAuthToken()
            if (!token) throw new Error('User not authenticated')

            const { data: responseData, error: err } = await $supabase.functions.invoke('milkProductionService/bulk_create_production', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: { records }
            })

            if (err) throw err
            if (responseData?.error) throw new Error(responseData.error)

            return responseData
        } catch (e: any) {
            error.value = e.message
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        fetchProduction,
        addProduction,
        bulkAddProduction,
        fetchStats
    }
}
