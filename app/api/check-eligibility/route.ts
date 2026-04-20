import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
export const dynamic = "force-dynamic";

function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${q}`;
}

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const quarter = getCurrentQuarter();

    // ── STEP 1: Check Supabase first ──────────────────────────
    const { data: member } = await supabaseAdmin
      .from("members")
      .select("*")
      .eq("email", normalizedEmail)
      .single();

    if (member) {
      if (member.is_blocked) {
        return NextResponse.json({ isEligible: false, isBlocked: true, membershipType: member.plan });
      }

      if (!member.is_eligible) {
        return NextResponse.json({ isEligible: false, isBlocked: false, membershipType: member.plan });
      }

      // Get or create credits
      let { data: credits } = await supabaseAdmin
        .from("credits")
        .select("*")
        .eq("member_id", member.id)
        .eq("quarter", quarter)
        .single();

      const defaultLimit = member.plan === "premium" ? 8 : 2;

      if (!credits) {
        const { data: newCredits } = await supabaseAdmin
          .from("credits")
          .insert({ member_id: member.id, quarter, used: 0, limit_count: defaultLimit })
          .select()
          .single();
        credits = newCredits;
      }

      const used = credits?.used ?? 0;
      const creditLimit = credits?.limit_count ?? defaultLimit;
      const remaining = creditLimit - used;

      return NextResponse.json({
        isEligible: true,
        isBlocked: false,
        membershipType: member.plan,
        used,
        limit: creditLimit,
        remaining,
        hasCredits: remaining > 0,
      });
    }

    // ── STEP 2: Member not in Supabase → use external API ─────
    const baseUrl = process.env.CONSULTATION_API_BASE_URL;
    const apiKey = process.env.CONSULTATION_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json({ message: "Server configuration is missing." }, { status: 500 });
    }

    const url = new URL("/api/v2/data/consultation-session", baseUrl);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("email", normalizedEmail);

    const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || data?.error || "Failed to check eligibility." },
        { status: response.status }
      );
    }

    if (data?.message && (!("isEligible" in data) || !("membershipType" in data))) {
      return NextResponse.json({ message: data.message }, { status: 400 });
    }

    const isEligible = data.isEligible && !data.isBlocked;
    const plan = String(data.membershipType || "").toLowerCase();

    if (!isEligible) {
      return NextResponse.json({ isEligible: false, isBlocked: data.isBlocked, membershipType: plan });
    }

    // Auto-create member in Supabase
    const { data: newMember } = await supabaseAdmin
      .from("members")
      .insert({ email: normalizedEmail, plan, is_blocked: false, is_eligible: true })
      .select()
      .single();

    const defaultLimit = plan === "premium" ? 8 : 2;

    let { data: credits } = await supabaseAdmin
      .from("credits")
      .select("*")
      .eq("member_id", newMember.id)
      .eq("quarter", quarter)
      .single();

    if (!credits) {
      const { data: newCredits } = await supabaseAdmin
        .from("credits")
        .insert({ member_id: newMember.id, quarter, used: 0, limit_count: defaultLimit })
        .select()
        .single();
      credits = newCredits;
    }

    const used = credits?.used ?? 0;
    const remaining = defaultLimit - used;

    return NextResponse.json({
      isEligible: true,
      isBlocked: false,
      membershipType: plan,
      used,
      limit: defaultLimit,
      remaining,
      hasCredits: remaining > 0,
    });

  } catch {
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}