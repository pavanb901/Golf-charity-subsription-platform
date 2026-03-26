import { NextResponse } from "next/server";

import { bootstrapProfile } from "@/lib/platform-store";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 400 });
  }

  const body = await request.json();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        full_name: body.name
      }
    }
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  if (data.user) {
    await bootstrapProfile({
      id: data.user.id,
      name: body.name,
      email: body.email,
      charityId: body.charityId,
      plan: body.plan
    });
  }

  return NextResponse.json({ ok: true, needsEmailConfirmation: !data.session });
}
