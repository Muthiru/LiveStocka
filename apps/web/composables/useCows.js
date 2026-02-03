export const useCows = () => {
  const { $supabase } = useNuxtApp()
  const cows = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchCows = async ({ limit = null, status = null, orderBy = 'created_at' } = {}) => {
    loading.value = true
    try {
      // Get current user to ensure RLS (Row Level Security) works or just to be safe if table isn't partition by auth.uid() automatically by policy
      // Assuming Supabase client handles auth context automatically
      
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
      
      // If simply fetching a subset or specific list, return it.
      // If fetching "main" list (no limit, default sort), update state.
      // For flexibility, always return data, and only update state if it's a "standard" fetch.
      
      if (!limit && !status) {
         cows.value = data || []
      }
      return data || []

    } catch (e) {
      error.value = e.message
      console.error('Error fetching cows:', e)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchCowsPaginated = async ({ page = 1, pageSize = 12, search = '', status = '', breed = '' } = {}) => {
    loading.value = true
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = $supabase
        .from('cows')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (search) {
        // Or filter specifically if using ilike
        // ilike syntax is column.ilike.pattern
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
    } catch (e) {
      console.error('Error fetching paginated cows:', e)
      return { data: [], count: 0 }
    } finally {
      loading.value = false
    }
  }

  const getCowById = async (id) => {
    try {
      const { data, error: err } = await $supabase
        .from('cows')
        .select('*')
        .eq('id', id)
        .single()
      
      if (err) throw err
      return data
    } catch (e) {
      console.error('Error fetching cow:', e)
      return null
    }
  }

  const addCow = async (cowData) => {
    loading.value = true
    try {
      // Assuming auth is handled or we need to get user
      const { data: { user } } = await $supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: err } = await $supabase
        .from('cows')
        .insert([{
          ...cowData,
          farm_id: user.id
        }])
        .select()
        .single()
      
      if (err) throw err
      
      cows.value = [data, ...cows.value]
      return data
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const getStatusClass = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      pregnant: 'bg-purple-100 text-purple-800',
      dry: 'bg-orange-100 text-orange-800',
      calf: 'bg-blue-100 text-blue-800',
      bull: 'bg-gray-100 text-gray-800',
      sold: 'bg-yellow-100 text-yellow-800',
      deceased: 'bg-red-100 text-red-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
  }

  const cowStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'pregnant', label: 'Pregnant' },
    { value: 'dry', label: 'Dry' },
    { value: 'calf', label: 'Calf' },
    { value: 'bull', label: 'Bull' },
    { value: 'sold', label: 'Sold' },
    { value: 'deceased', label: 'Deceased' }
  ]

  /**
   * Check if a cow can produce milk
   * Bulls, calves, and dry cows cannot produce milk
   * @param {string} status - The cow's status
   * @returns {boolean} - True if the cow can produce milk
   */
  const isMilkable = (status) => {
    const normalizedStatus = (status || 'active').toLowerCase()
    return normalizedStatus !== 'bull' && 
           normalizedStatus !== 'calf' && 
           normalizedStatus !== 'dry'
  }

  return {
    cows,
    loading,
    error,
    fetchCows,
    fetchCowsPaginated,
    getCowById,
    addCow,
    getStatusClass,
    cowStatuses,
    isMilkable
  }
}
