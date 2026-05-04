// Edge Function: Health Record Service
// Endpoints:
//  - POST /validate_health_record
//  - POST /create_health_record
//  - POST /update_health_record
//  - DELETE /delete_health_record
//  - GET /health_records
//  - GET /overdue_checkups
//  - GET /upcoming_events

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createEdgeHelpers } from '../_shared/http.ts';

const { supabase, jsonResponse, getUserAndFarm } = createEdgeHelpers();

// Validation helpers
const VALID_RECORD_TYPES = new Set(['vaccination', 'medication', 'disease', 'treatment', 'checkup', 'injury', 'other']);

function validateRecordType(type: string): { valid: boolean; error?: string } {
    if (!VALID_RECORD_TYPES.has(type)) {
        return { valid: false, error: 'invalid_record_type' };
    }
    return { valid: true };
}

function validateRecordDate(date_string: string): { valid: boolean; error?: string } {
    const date = new Date(date_string);

    if (Number.isNaN(date.getTime())) {
        return { valid: false, error: 'invalid_record_date' };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
        return { valid: false, error: 'record_date_in_future' };
    }

    return { valid: true };
}

function validateCost(cost: number | null | undefined): { valid: boolean; error?: string } {
    if (cost === null || cost === undefined) {
        return { valid: true }; // Optional field
    }

    if (cost < 0) {
        return { valid: false, error: 'cost_cannot_be_negative' };
    }

    return { valid: true };
}

// Helper function to validate health record inputs
async function validateHealthRecordInputs(body: any, farm_id: string) {
    // Validate cow ownership
    const { data: cows, error: cowErr } = await supabase
        .from('cows')
        .select('id')
        .eq('id', body.cow_id)
        .eq('farm_id', farm_id)
        .limit(1);

    if (cowErr) return { valid: false, response: jsonResponse({ error: 'db_error', detail: cowErr.message }, 500) };
    if (!cows || cows.length === 0) return { valid: false, response: jsonResponse({ error: 'cow_not_found_or_no_access' }, 404) };

    // Validate record type
    const typeValidation = validateRecordType(body.record_type);
    if (!typeValidation.valid) return { valid: false, response: jsonResponse({ error: typeValidation.error }, 400) };

    // Validate record date
    const dateValidation = validateRecordDate(body.record_date);
    if (!dateValidation.valid) return { valid: false, response: jsonResponse({ error: dateValidation.error }, 400) };

    // Validate cost if provided
    const costValidation = validateCost(body.cost);
    if (!costValidation.valid) return { valid: false, response: jsonResponse({ error: costValidation.error }, 400) };

    return { valid: true };
}

// Helper function to build health record insert object
function buildHealthRecordInsert(body: any, farm_id: string) {
    const insert: any = {
        farm_id,
        cow_id: body.cow_id,
        record_type: body.record_type,
        title: body.title,
        record_date: body.record_date,
        date: body.record_date,
        description: body.description || null,
        record_time: body.record_time || null,
        notes: body.notes || null,
        cost: body.cost ? Number.parseFloat(body.cost) : null,
        next_due_date: body.next_checkup_date || null
    };

    // Add type-specific fields
    if (body.vaccine_name) insert.vaccine_name = body.vaccine_name;
    if (body.medication_name) insert.medication_name = body.medication_name;
    if (body.dosage) insert.dosage = body.dosage;
    if (body.vet_name) insert.vet_name = body.vet_name;
    if (body.vet_contact) insert.vet_contact = body.vet_contact;
    if (body.disease_name) insert.disease_name = body.disease_name;
    if (body.symptoms) insert.symptoms = body.symptoms;
    if (body.diagnosis) insert.diagnosis = body.diagnosis;
    if (body.treatment_plan) insert.treatment_plan = body.treatment_plan;
    if (body.recovery_status) insert.recovery_status = body.recovery_status;

    return insert;
}

// Helper function to build health record updates object
// Helper to add type-specific fields to updates
function addTypeSpecificUpdates(updates: any, body: any) {
    if (body.vaccine_name !== undefined) updates.vaccine_name = body.vaccine_name || null;
    if (body.medication_name !== undefined) updates.medication_name = body.medication_name || null;
    if (body.dosage !== undefined) updates.dosage = body.dosage || null;
    if (body.vet_name !== undefined) updates.vet_name = body.vet_name || null;
    if (body.vet_contact !== undefined) updates.vet_contact = body.vet_contact || null;
    if (body.disease_name !== undefined) updates.disease_name = body.disease_name || null;
    if (body.symptoms !== undefined) updates.symptoms = body.symptoms || null;
    if (body.diagnosis !== undefined) updates.diagnosis = body.diagnosis || null;
    if (body.treatment_plan !== undefined) updates.treatment_plan = body.treatment_plan || null;
    if (body.recovery_status !== undefined) updates.recovery_status = body.recovery_status || null;
}

// Helper function to build health record updates object
function buildHealthRecordUpdates(body: any) {
    const updates: any = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description || null;
    if (body.record_time !== undefined) updates.record_time = body.record_time || null;
    if (body.notes !== undefined) updates.notes = body.notes || null;

    if (body.record_date !== undefined) {
        const dateValidation = validateRecordDate(body.record_date);
        if (!dateValidation.valid) return { valid: false, error: dateValidation.error };
        updates.record_date = body.record_date;
        updates.date = body.record_date;
    }

    if (body.cost !== undefined) {
        const costValidation = validateCost(body.cost);
        if (!costValidation.valid) return { valid: false, error: costValidation.error };
        updates.cost = body.cost ? Number.parseFloat(body.cost) : null;
    }

    if (body.next_checkup_date !== undefined) {
        updates.next_due_date = body.next_checkup_date || null;
    }

    // Add type-specific fields
    addTypeSpecificUpdates(updates, body);

    return { valid: true, updates };
}

// Route handlers
async function handleValidateHealthRecord(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body?.cow_id || !body?.record_type || !body?.record_date) {
        return jsonResponse({ error: 'cow_id_record_type_and_record_date_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    // Validate cow ownership
    const { data: cows, error: cowErr } = await supabase
        .from('cows')
        .select('id')
        .eq('id', body.cow_id)
        .eq('farm_id', farm_id)
        .limit(1);

    if (cowErr) return jsonResponse({ error: 'db_error', detail: cowErr.message }, 500);
    if (!cows || cows.length === 0) return jsonResponse({ error: 'cow_not_found_or_no_access' }, 404);

    // Validate record type
    const typeValidation = validateRecordType(body.record_type);
    if (!typeValidation.valid) return jsonResponse({ error: typeValidation.error }, 400);

    // Validate record date
    const dateValidation = validateRecordDate(body.record_date);
    if (!dateValidation.valid) return jsonResponse({ error: dateValidation.error }, 400);

    // Validate cost if provided
    const costValidation = validateCost(body.cost);
    if (!costValidation.valid) return jsonResponse({ error: costValidation.error }, 400);

    return jsonResponse({ valid: true });
}

async function handleCreateHealthRecord(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body?.cow_id || !body?.record_type || !body?.record_date || !body?.title) {
        return jsonResponse({ error: 'cow_id_record_type_record_date_and_title_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    // Validate inputs using helper
    const validation = await validateHealthRecordInputs(body, farm_id);
    if (!validation.valid) return validation.response;

    // Build insert object using helper
    const insert = buildHealthRecordInsert(body, farm_id);

    const { data, error: insertErr } = await supabase
        .from('health_records')
        .insert(insert)
        .select(`
      *,
      cows (
        id,
        name,
        tag_id
      )
    `)
        .limit(1);

    if (insertErr) return jsonResponse({ error: 'insert_failed', detail: insertErr.message }, 500);

    return jsonResponse({ record: data?.[0], created: true });
}

async function handleUpdateHealthRecord(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body?.id) {
        return jsonResponse({ error: 'record_id_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
        .from('health_records')
        .select('id, cow_id')
        .eq('id', body.id)
        .eq('farm_id', farm_id)
        .limit(1);

    if (fetchErr) return jsonResponse({ error: 'db_error', detail: fetchErr.message }, 500);
    if (!existing || existing.length === 0) return jsonResponse({ error: 'health_record_not_found' }, 404);

    // Build updates using helper
    const updateResult = buildHealthRecordUpdates(body);
    if (!updateResult.valid) return jsonResponse({ error: updateResult.error }, 400);

    if (Object.keys(updateResult.updates).length === 0) {
        return jsonResponse({ error: 'no_fields_to_update' }, 400);
    }

    const { data, error: updateErr } = await supabase
        .from('health_records')
        .update(updateResult.updates)
        .eq('id', body.id)
        .eq('farm_id', farm_id)
        .select(`
      *,
      cows (
        id,
        name,
        tag_id
      )
    `)
        .limit(1);

    if (updateErr) return jsonResponse({ error: 'update_failed', detail: updateErr.message }, 500);

    return jsonResponse({ record: data?.[0], updated: true });
}

async function handleDeleteHealthRecord(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body?.id) {
        return jsonResponse({ error: 'record_id_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const { error: deleteErr } = await supabase
        .from('health_records')
        .delete()
        .eq('id', body.id)
        .eq('farm_id', farm_id);

    if (deleteErr) return jsonResponse({ error: 'delete_failed', detail: deleteErr.message }, 500);

    return jsonResponse({ deleted: true });
}

async function handleGetHealthRecords(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const url = new URL(req.url);
    const cowId = url.searchParams.get('cow_id');

    let query = supabase
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
        .eq('farm_id', farm_id)
        .order('record_date', { ascending: false });

    if (cowId) {
        query = query.eq('cow_id', cowId);
    }

    const { data, error: fetchErr } = await query;

    if (fetchErr) return jsonResponse({ error: 'fetch_failed', detail: fetchErr.message }, 500);

    return jsonResponse({ records: data || [] });
}

async function handleGetOverdueCheckups(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const today = new Date().toISOString().split('T')[0];

    const { data, error: fetchErr } = await supabase
        .from('health_records')
        .select(`
      *,
      cows (
        id,
        name,
        tag_id
      )
    `)
        .eq('farm_id', farm_id)
        .not('next_due_date', 'is', null)
        .lt('next_due_date', today)
        .order('next_due_date', { ascending: true });

    if (fetchErr) return jsonResponse({ error: 'fetch_failed', detail: fetchErr.message }, 500);

    return jsonResponse({ overdue: data || [] });
}

async function handleGetUpcomingEvents(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data, error: fetchErr } = await supabase
        .from('health_records')
        .select(`
      *,
      cows (
        id,
        name,
        tag_id
      )
    `)
        .eq('farm_id', farm_id)
        .not('next_due_date', 'is', null)
        .gte('next_due_date', today)
        .lte('next_due_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .order('next_due_date', { ascending: true });

    if (fetchErr) return jsonResponse({ error: 'fetch_failed', detail: fetchErr.message }, 500);

    return jsonResponse({ upcoming: data || [] });
}

serve(async (req: Request) => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method === 'POST' && path.endsWith('/validate_health_record')) return handleValidateHealthRecord(req);
    if (req.method === 'POST' && path.endsWith('/create_health_record')) return handleCreateHealthRecord(req);
    if (req.method === 'POST' && path.endsWith('/update_health_record')) return handleUpdateHealthRecord(req);
    if (req.method === 'DELETE' && path.endsWith('/delete_health_record')) return handleDeleteHealthRecord(req);
    if (req.method === 'GET' && path.endsWith('/health_records')) return handleGetHealthRecords(req);
    if (req.method === 'GET' && path.endsWith('/overdue_checkups')) return handleGetOverdueCheckups(req);
    if (req.method === 'GET' && path.endsWith('/upcoming_events')) return handleGetUpcomingEvents(req);

    return new Response('Not found', { status: 404, headers: corsHeaders });
});
