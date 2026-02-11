export interface Alert {
    id: string
    type: string
    cow_id: string
    cow_name?: string
    title: string
    description?: string
    date?: string
    severity?: 'low' | 'medium' | 'high'
    recordType?: string
}

/**
 * Generate navigation URL from an alert
 * Routes users to the appropriate cow page with pre-selected tab and action
 */
function getAlertNavigationUrl(alert: Alert): string {
    const baseUrl = `/cow-records/${alert.cow_id}`
    const params = new URLSearchParams()

    // Check recordType first for specific health record types
    if (alert.recordType) {
        if (['vaccination', 'medication', 'disease', 'treatment', 'checkup', 'injury'].includes(alert.recordType)) {
            params.set('tab', 'health')
            params.set('action', 'add')
            params.set('recordType', alert.recordType)
            return `${baseUrl}?${params.toString()}`
        }
    }

    // Fallback to type-based routing
    if (alert.type === 'overdue_checkup' || alert.type === 'vaccination_due' || alert.type.includes('health') || alert.type === 'overdue' || alert.type === 'due_today' || alert.type === 'due_tomorrow') {
        params.set('tab', 'health')
        if (alert.type === 'overdue' || alert.type === 'due_today' || alert.type === 'due_tomorrow') {
            params.set('action', 'add')
        }
    } else if (alert.type === 'low_production' || alert.type.includes('production')) {
        // Milk production is on the main cow profile page
        return `/cow/${alert.cow_id}?tab=milk&action=view`
    } else if (alert.type === 'heat_detected' || alert.type === 'pregnancy_check_due' || alert.type.includes('breeding')) {
        params.set('tab', 'breeding')
        params.set('action', 'add')
    } else {
        // Default to overview tab on main cow profile
        return `/cow/${alert.cow_id}?tab=overview`
    }

    return `${baseUrl}?${params.toString()}`
}

/**
 * Check if an alert is actionable (clickable)
 */
function isAlertActionable(alert: Alert): boolean {
    return !!alert.cow_id
}

export function useAlertNavigation() {
    return {
        getAlertNavigationUrl,
        isAlertActionable
    }
}
