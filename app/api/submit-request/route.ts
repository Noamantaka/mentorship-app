import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendMentorRequestEmail, sendMenteeConfirmationEmail } from "@/lib/email";

function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `${now.getFullYear()}-Q${q}`;
}

function generateRequestId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REQ-MEN-${timestamp}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const email = body.get("email") as string;
    const field = body.get("field") as string;
    const language = body.get("language") as string;
    const mentorName = body.get("mentor") as string;
    const question_1 = body.get("question_1") as string;
    const question_2 = body.get("question_2") as string;
    const question_3 = body.get("question_3") as string;
    const goal = body.get("goal") as string;
    const document_link = body.get("document_link") as string;
    const ui_language = (body.get("ui_language") as string) || "en";
    const plan = (body.get("plan") as string) || "basic";

    // Get member
    const { data: member } = await supabaseAdmin
      .from("members")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!member) {
      return NextResponse.json({ message: "Member not found." }, { status: 404 });
    }

    // Get mentor with email and calendly
    const { data: mentor } = await supabaseAdmin
      .from("mentors")
      .select("*")
      .eq("name", mentorName)
      .single();

    const quarter = getCurrentQuarter();
    const requestId = generateRequestId();

    // Insert session request
    await supabaseAdmin.from("session_requests").insert({
      member_id: member.id,
      mentor_id: mentor?.id ?? null,
      field,
      language,
      question_1,
      question_2,
      question_3,
      goal,
      document_link,
      quarter,
      ui_language,
      status: "pending",
      request_id: requestId,
    });

    // Increment credits used
    const { data: credits } = await supabaseAdmin
      .from("credits")
      .select("*")
      .eq("member_id", member.id)
      .eq("quarter", quarter)
      .single();

    if (credits) {
      await supabaseAdmin
        .from("credits")
        .update({ used: credits.used + 1 })
        .eq("id", credits.id);
    }

    // Build approve/reject URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mentorship-app.vercel.app";
    const approveUrl = `${baseUrl}/api/session-action?action=approve&requestId=${requestId}&menteeEmail=${encodeURIComponent(email)}`;
    const rejectUrl = `${baseUrl}/api/session-action?action=reject&requestId=${requestId}&menteeEmail=${encodeURIComponent(email)}`;

    // Send emails (non-blocking)
    const emailPromises = [];

    // Email to mentor
    if (mentor?.email) {
      emailPromises.push(
        sendMentorRequestEmail({
          mentorName,
          mentorEmail: mentor.email,
          menteeEmail: email,
          field,
          language,
          plan,
          question1: question_1,
          question2: question_2,
          question3: question_3,
          goal,
          documentLink: document_link,
          requestId,
          approveUrl,
          rejectUrl,
        })
      );
    }

    // Confirmation email to mentee
    emailPromises.push(
      sendMenteeConfirmationEmail({
        menteeEmail: email,
        mentorName,
        field,
        language,
        plan,
        question1: question_1,
        question2: question_2,
        question3: question_3,
        goal,
        documentLink: document_link,
        requestId,
        uiLanguage: ui_language,
      })
    );

    await Promise.allSettled(emailPromises);

    return NextResponse.json({ success: true, requestId });

  } catch (err: any) {
    console.error("Submit request error:", err);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}