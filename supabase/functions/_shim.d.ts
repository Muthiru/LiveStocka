// Minimal type shims to help the editor/TS server resolve Deno and remote imports
declare module "https://deno.land/std@0.170.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string, opts?: any): any;
  export default createClient;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};
