import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { action, requestId, reason } = await req.json();

    if (!action || !requestId) {
      return NextResponse.json({ success: false, message: "Missing parameters." }, { status: 400 });
    }

    // Get request
    const { data: request } = await supabaseAdmin
      .from("session_requests")
      .select("*, members(email, id), mentors(name, calendly_link)")
      .eq("request_id", requestId)
      .single();

    if (!request) {
      return NextResponse.json({ success: false, message: "Request not found." }, { status: 404 });
    }

    if (request.status !== "pending") {
      return NextResponse.json({ success: false, message: `Already ${request.status}.` }, { status: 400 });
    }

    if (action === "approve") {
      await supabaseAdmin.from("session_requests").update({ status: "approved" }).eq("request_id", requestId);

      try {
        await sendApprovalEmail({
          menteeEmail: request.members?.email,
          mentorName: request.mentors?.name || "",
          calendlyLink: request.mentors?.calendly_link || "",
          requestId,
          uiLanguage: request.ui_language || "en",
        });
      } catch (err) {
        console.error("Approval email failed:", err);
      }

      return NextResponse.json({ success: true, message: "Approved!" });
    }

    if (action === "reject") {
      await supabaseAdmin.from("session_requests").update({ status: "rejected" }).eq("request_id", requestId);

      // Refund credit
      const { data: credits } = await supabaseAdmin
        .from("credits")
        .select("*")
        .eq("member_id", request.members?.id)
        .eq("quarter", request.quarter)
        .single();

      if (credits && credits.used > 0) {
        await supabaseAdmin.from("credits").update({ used: credits.used - 1 }).eq("id", credits.id);
      }

      try {
        await sendRejectionEmail({
          menteeEmail: request.members?.email,
          mentorName: request.mentors?.name || "",
          reason: reason || "",
          requestId,
          uiLanguage: request.ui_language || "en",
        });
      } catch (err) {
        console.error("Rejection email failed:", err);
      }

      return NextResponse.json({ success: true, message: "Rejected!" });
    }

    return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });

  } catch (err: any) {
    console.error("Admin action error:", err);
    return NextResponse.json({ success: false, message: "Server error." }, { status: 500 });
  }
}