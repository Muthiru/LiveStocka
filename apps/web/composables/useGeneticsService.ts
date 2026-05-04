/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref } from 'vue'
import type { Ancestor, Descendant } from '~/types'

export const useGeneticsService = () => {
    const { $supabase } = useNuxtApp()
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchAncestors = async (cowId: string, depth: number = 5): Promise<Ancestor[]> => {
        loading.value = true
        error.value = null
        try {
            const { data } = await $supabase.auth.getSession()
            const token = data?.session?.access_token
            if (!token) throw new Error('User not authenticated')

            const params = new URLSearchParams()
            params.append('cow_id', cowId)
            params.append('depth', String(depth))
            // Add token to query param as fallback for header stripping issues
            params.append('auth_token', token)

            const queryString = params.toString()
            const projectUrl = ($supabase as any).supabaseUrl
            const fullUrl = `${projectUrl}/functions/v1/geneticsService/get_ancestors?${queryString}`

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const responseData = await response.json()

            if (!response.ok) {
                console.error('Genetics Service Fetch Error (Ancestors):', response.status, responseData)
                if (response.status === 401) {
                    throw new Error('Unauthorized (401). Please sign out and sign in again.')
                }
                throw new Error(responseData?.error || responseData?.message || 'Failed to fetch ancestors')
            }

            return responseData?.ancestors || []
        } catch (e: any) {
            error.value = e.message
            return []
        } finally {
            loading.value = false
        }
    }

    const fetchDescendants = async (cowId: string, depth: number = 5): Promise<Descendant[]> => {
        loading.value = true
        error.value = null
        try {
            const { data } = await $supabase.auth.getSession()
            const token = data?.session?.access_token
            if (!token) throw new Error('User not authenticated')

            const params = new URLSearchParams()
            params.append('cow_id', cowId)
            params.append('depth', String(depth))
            params.append('auth_token', token)

            const queryString = params.toString()
            const projectUrl = ($supabase as any).supabaseUrl
            const fullUrl = `${projectUrl}/functions/v1/geneticsService/get_descendants?${queryString}`

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            const responseData = await response.json()

            if (!response.ok) {
                console.error('Genetics Service Fetch Error (Descendants):', response.status, responseData)
                if (response.status === 401) {
                    throw new Error('Unauthorized (401). Please sign out and sign in again.')
                }
                throw new Error(responseData?.error || responseData?.message || 'Failed to fetch descendants')
            }

            return responseData?.descendants || []
        } catch (e: any) {
            error.value = e.message
            return []
        } finally {
            loading.value = false
        }
    }

    const checkCompatibility = async (cowId: string, sireId: string): Promise<{ compatible: boolean; shared_ancestors: string[] } | null> => {
        loading.value = true
        error.value = null
        try {
            const { data } = await $supabase.auth.getSession()
            const token = data?.session?.access_token
            if (!token) throw new Error('User not authenticated')

            const { data: responseData, error: err } = await $supabase.functions.invoke('geneticsService/check_breeding_compatibility', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: { cow_id: cowId, sire_id: sireId }
            })

            if (err) throw err
            if (responseData?.error) throw new Error(responseData.error)

            return responseData
        } catch (e: any) {
            error.value = e.message
            console.error('Error checking compatibility:', e)
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        fetchAncestors,
        fetchDescendants,
        checkCompatibility
    }
}
