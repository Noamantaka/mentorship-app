import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendApprovalEmail, sendRejectionEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  const requestId = req.nextUrl.searchParams.get("requestId");
  const menteeEmail = req.nextUrl.searchParams.get("menteeEmail");

  if (!action || !requestId || !menteeEmail) {
    return htmlResponse(renderPage("Error", "Missing parameters.", false));
  }

  if (action === "approve") return handleApprove(requestId, menteeEmail);
  if (action === "reject") return renderRejectPage(requestId, menteeEmail);
  if (action === "submitReject") {
    const reason = req.nextUrl.searchParams.get("reason") || "";
    return handleReject(requestId, menteeEmail, reason);
  }

  return htmlResponse(renderPage("Error", "Invalid action.", false));
}

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  const requestId = req.nextUrl.searchParams.get("requestId");
  const menteeEmail = req.nextUrl.searchParams.get("menteeEmail");

  if (action === "submitReject") {
    const body = await req.formData();
    const reason = (body.get("reason") as string) || "";
    return handleReject(requestId!, menteeEmail!, reason);
  }

  return htmlResponse(renderPage("Error", "Invalid request.", false));
}

// ── Used by Admin Panel ────────────────────────────────────────
export async function approveFromAdmin(requestId: string): Promise<{ success: boolean; message: string }> {
  const { data: request } = await supabaseAdmin
    .from("session_requests")
    .select("*, members(email), mentors(name, calendly_link)")
    .eq("request_id", requestId)
    .single();

  if (!request) return { success: false, message: "Request not found." };
  if (request.status !== "pending") return { success: false, message: `Already ${request.status}.` };

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

  return { success: true, message: "Approved!" };
}

export async function rejectFromAdmin(requestId: string, reason: string): Promise<{ success: boolean; message: string }> {
  const { data: request } = await supabaseAdmin
    .from("session_requests")
    .select("*, members(email, id), mentors(name)")
    .eq("request_id", requestId)
    .single();

  if (!request) return { success: false, message: "Request not found." };
  if (request.status !== "pending") return { success: false, message: `Already ${request.status}.` };

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
      reason,
      requestId,
      uiLanguage: request.ui_language || "en",
    });
  } catch (err) {
    console.error("Rejection email failed:", err);
  }

  return { success: true, message: "Rejected!" };
}

// ── Internal handlers ─────────────────────────────────────────
async function handleApprove(requestId: string, menteeEmail: string) {
  const { data: request } = await supabaseAdmin
    .from("session_requests")
    .select("*, members(email), mentors(name, calendly_link)")
    .eq("request_id", requestId)
    .single();

  if (!request) {
    return htmlResponse(renderPage("Not Found", "Request not found.", false));
  }

  if (request.status !== "pending") {
    return htmlResponse(renderPage(
      "Already Processed",
      `This request has already been ${request.status}.`,
      false
    ));
  }

  await supabaseAdmin.from("session_requests").update({ status: "approved" }).eq("request_id", requestId);

  try {
    await sendApprovalEmail({
      menteeEmail,
      mentorName: request.mentors?.name || "",
      calendlyLink: request.mentors?.calendly_link || "",
      requestId,
      uiLanguage: request.ui_language || "en",
    });
  } catch (err) {
    console.error("Approval email failed:", err);
  }

  return htmlResponse(renderPage("Accepted!", "The mentee has been notified and received the booking link.", true));
}

async function renderRejectPage(requestId: string, menteeEmail: string) {
  // Check if already processed
  const { data: request } = await supabaseAdmin
    .from("session_requests")
    .select("status")
    .eq("request_id", requestId)
    .single();

  if (request && request.status !== "pending") {
    return htmlResponse(renderPage(
      "Already Processed",
      `This request has already been ${request.status}.`,
      false
    ));
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const submitUrl = `${baseUrl}/api/session-action?action=submitReject&requestId=${requestId}&menteeEmail=${encodeURIComponent(menteeEmail)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #7c16ff, #a855f7); display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 16px; }
        .container { background: white; width: 100%; max-width: 440px; border-radius: 16px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
        h2 { font-size: 20px; color: #111827; margin-bottom: 6px; }
        p { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
        .hint { font-size: 12px; color: #9ca3af; margin-bottom: 18px; padding: 10px 12px; background: #f9fafb; border-left: 3px solid #7c16ff; border-radius: 4px; line-height: 1.5; }
        textarea { width: 100%; height: 120px; border-radius: 10px; border: 1px solid #e5e7eb; padding: 12px; font-size: 14px; resize: none; outline: none; font-family: Arial, sans-serif; }
        textarea:focus { border-color: #7c16ff; }
        button { width: 100%; margin-top: 16px; padding: 14px; border-radius: 10px; border: none; background: #dc2626; color: white; font-size: 15px; font-weight: bold; cursor: pointer; }
        button:hover { background: #b91c1c; }
        button:disabled { background: #9ca3af; cursor: not-allowed; }
      </style>
    </head>
    <body>
      <div class="container" id="formContainer">
        <h2>Reject Request</h2>
        <p>Please provide a reason for rejection</p>
        <div class="hint">Your feedback will be shared directly with the mentee.</div>
        <textarea id="reason" placeholder="Write the reason here..."></textarea>
        <button id="submitBtn" onclick="submitForm()">Submit Rejection</button>
      </div>
      <script>
        function submitForm() {
          const btn = document.getElementById("submitBtn");
          const reason = document.getElementById("reason").value;
          if (!reason.trim()) { alert("Please enter a reason"); return; }
          btn.disabled = true;
          btn.innerText = "Submitting...";
          fetch("${submitUrl}", {
            method: "POST",
            body: new URLSearchParams({ reason }),
          })
          .then(() => {
            document.getElementById("formContainer").innerHTML = '<div style="text-align:center;padding:20px;"><h3 style="color:#16a34a;margin-bottom:10px;">Rejected successfully</h3><p style="color:#6b7280;">The mentee has been notified.</p></div>';
          })
          .catch(() => {
            document.getElementById("formContainer").innerHTML = '<div style="text-align:center;padding:20px;"><h3 style="color:#16a34a;margin-bottom:10px;">Rejected successfully</h3><p style="color:#6b7280;">The mentee has been notified.</p></div>';
          });
        }
      </script>
    </body>
    </html>
  `;

  return htmlResponse(html);
}

async function handleReject(requestId: string, menteeEmail: string, reason: string) {
  const { data: request } = await supabaseAdmin
    .from("session_requests")
    .select("*, members(email, id), mentors(name)")
    .eq("request_id", requestId)
    .single();

  if (!request) return htmlResponse(renderPage("Not Found", "Request not found.", false));

  if (request.status !== "pending") {
    return htmlResponse(renderPage(
      "Already Processed",
      `This request has already been ${request.status}.`,
      false
    ));
  }

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
      menteeEmail,
      mentorName: request.mentors?.name || "",
      reason,
      requestId,
      uiLanguage: request.ui_language || "en",
    });
  } catch (err) {
    console.error("Rejection email failed:", err);
  }

  return htmlResponse(renderPage("Rejected", "The mentee has been notified.", true));
}

function htmlResponse(html: string) {
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

function renderPage(title: string, message: string, success: boolean) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #7c16ff, #a855f7); display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 16px; }
        .container { background: white; width: 100%; max-width: 420px; border-radius: 16px; padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); text-align: center; }
        h2 { color: ${success ? "#16a34a" : "#dc2626"}; margin-bottom: 10px; font-size: 20px; }
        p { color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${title}</h2>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}