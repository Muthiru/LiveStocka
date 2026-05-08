import { ref } from 'vue'
import type { Ancestor, Descendant } from '~/types'

export const useGeneticsService = () => {
    const { $supabase } = useNuxtApp()
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Helper to get auth token (consistent with all other composables)
    const getAuthToken = async (): Promise<string | null> => {
        const { data } = await $supabase.auth.getSession()
        return data?.session?.access_token || null
    }

    const fetchAncestors = async (cowId: string, depth: number = 5): Promise<Ancestor[]> => {
        loading.value = true
        error.value = null
        try {
            const token = await getAuthToken()
            if (!token) throw new Error('User not authenticated')

            const params = new URLSearchParams()
            params.append('cow_id', cowId)
            params.append('depth', String(depth))

            const { data: responseData, error: err } = await $supabase.functions.invoke(
                `geneticsService/get_ancestors?${params.toString()}`,
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            if (err) {
                if ((err as { status?: number }).status === 401) {
                    throw new Error('Unauthorized (401). Please sign out and sign in again.')
                }
                throw err
            }
            if (responseData?.error) throw new Error(responseData.error)

            return responseData?.ancestors || []
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch ancestors'
            console.error('Genetics Service Fetch Error (Ancestors):', e)
            return []
        } finally {
            loading.value = false
        }
    }

    const fetchDescendants = async (cowId: string, depth: number = 5): Promise<Descendant[]> => {
        loading.value = true
        error.value = null
        try {
            const token = await getAuthToken()
            if (!token) throw new Error('User not authenticated')

            const params = new URLSearchParams()
            params.append('cow_id', cowId)
            params.append('depth', String(depth))

            const { data: responseData, error: err } = await $supabase.functions.invoke(
                `geneticsService/get_descendants?${params.toString()}`,
                {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            if (err) {
                if ((err as { status?: number }).status === 401) {
                    throw new Error('Unauthorized (401). Please sign out and sign in again.')
                }
                throw err
            }
            if (responseData?.error) throw new Error(responseData.error)

            return responseData?.descendants || []
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to fetch descendants'
            console.error('Genetics Service Fetch Error (Descendants):', e)
            return []
        } finally {
            loading.value = false
        }
    }

    const checkCompatibility = async (cowId: string, sireId: string): Promise<{ compatible: boolean; shared_ancestors: string[] } | null> => {
        loading.value = true
        error.value = null
        try {
            const token = await getAuthToken()
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
        } catch (e: unknown) {
            error.value = e instanceof Error ? e.message : 'Failed to check compatibility'
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
