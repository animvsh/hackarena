# Supabase Edge Functions

These functions run in the Deno runtime, not Node.js.

**Note:** The TypeScript errors shown in VS Code are expected because:
- These files use Deno-specific imports (e.g., `https://deno.land/std@0.168.0/http/server.ts`)
- The Deno runtime resolves these imports dynamically at runtime
- VS Code cannot statically analyze Deno's URL-based imports

These functions will work perfectly when deployed to Supabase's Edge Functions environment.

