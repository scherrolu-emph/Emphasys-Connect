import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  caseId: string;
  mentionedUserIds: string[];
  messagePreview: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { caseId, mentionedUserIds, messagePreview }: RequestBody = await req.json();

    if (!caseId || !Array.isArray(mentionedUserIds) || mentionedUserIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'caseId and mentionedUserIds are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: caseRow, error: caseErr } = await supabaseAdmin
      .from('cases')
      .select('title, hfa_id')
      .eq('id', caseId)
      .single();

    if (caseErr || !caseRow) {
      return new Response(
        JSON.stringify({ error: 'case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const uniqueIds = [...new Set(mentionedUserIds)];
    const inserted: string[] = [];

    for (const userId of uniqueIds) {
      const { error: insertErr } = await supabaseAdmin.from('notifications').insert({
        hfa_id: caseRow.hfa_id,
        user_id: userId,
        case_id: caseId,
        type: 'mention',
        title: `You were mentioned in ${caseRow.title}`,
        body: messagePreview ?? '',
      });

      if (!insertErr) {
        inserted.push(userId);
        // Hackathon stub: log email delivery instead of real dispatch
        console.log(`[mention-notification] email → user ${userId} re: case "${caseRow.title}"`);
      }
    }

    return new Response(
      JSON.stringify({ dispatched: inserted.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[dispatch-mention-notification] error:', err);
    return new Response(
      JSON.stringify({ error: 'internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
