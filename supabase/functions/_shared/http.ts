import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders } from './cors.ts';

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}

export function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function createEdgeSupabaseClient() {
  const supabaseUrl = getRequiredEnv('SUPABASE_URL');
  const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

export function createEdgeHelpers() {
  const supabase = createEdgeSupabaseClient();

  return {
    supabase,
    jsonResponse,
    getUserAndFarm: (req: Request) => getUserAndFarm(req, supabase),
  };
}

type AuthResult = { user: unknown; farm_id: string } | { error: string };

export async function getUserAndFarm(req: Request, supabase: ReturnType<typeof createEdgeSupabaseClient>): Promise<AuthResult> {
  const auth = req.headers.get('authorization') || '';
  const token = auth.split(' ')[1];
  if (!token) return { error: 'missing_authorization' };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { error: 'invalid_token' };

  let farm_id: string | undefined;
  try {
    const b64 = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/');
    const payload = JSON.parse(atob(b64));
    farm_id = payload.farm_id;
  } catch {
    // Ignore malformed tokens that do not include a farm_id claim.
  }

  if (!farm_id) {
    // cows.farm_id references auth.users(id), so use the authenticated user's own ID as the farm identifier.
    farm_id = data.user.id;
  }

  const resolvedFarmId = farm_id;
  if (!resolvedFarmId) return { error: 'no_farm_access' };

  return { user: data.user, farm_id: resolvedFarmId };
}
