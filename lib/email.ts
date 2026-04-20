import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const FROM_EMAIL = "mentorship@takadao.io";

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Email to MENTOR when new request is submitted ──────────────
export async function sendMentorRequestEmail({
  mentorName,
  mentorEmail,
  menteeEmail,
  field,
  language,
  plan,
  question1,
  question2,
  question3,
  goal,
  documentLink,
  requestId,
  approveUrl,
  rejectUrl,
}: {
  mentorName: string;
  mentorEmail: string;
  menteeEmail: string;
  field: string;
  language: string;
  plan: string;
  question1: string;
  question2: string;
  question3: string;
  goal: string;
  documentLink: string;
  requestId: string;
  approveUrl: string;
  rejectUrl: string;
}) {
  const html = `
    <div style="margin:0;padding:16px;background:#f6f4fb;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="background:#7c16ff;padding:20px 24px;">
          <div style="font-size:20px;font-weight:700;color:#ffffff;">New Mentorship Request</div>
          <div style="margin-top:4px;font-size:12px;color:#efe7ff;">Request ID: ${escapeHtml(requestId)}</div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;font-size:15px;">Hello ${escapeHtml(mentorName)},</p>
          <p style="margin:0 0 20px;font-size:15px;">You have received a new mentorship request.</p>

          <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">Request Details</div>
            <div style="padding:16px;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:6px 0;font-weight:700;width:130px;">Mentee Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(menteeEmail)}" style="color:#7c16ff;">${escapeHtml(menteeEmail)}</a></td></tr>
                <tr><td style="padding:6px 0;font-weight:700;">Field</td><td style="padding:6px 0;">${escapeHtml(field)}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;">Language</td><td style="padding:6px 0;">${escapeHtml(language)}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;">Plan</td><td style="padding:6px 0;text-transform:capitalize;">${escapeHtml(plan)}</td></tr>
              </table>
            </div>
          </div>

          <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">Top 3 Questions</div>
            <div style="padding:16px;">
              <ol style="margin:0;padding-left:18px;font-size:14px;line-height:1.8;">
                <li>${escapeHtml(question1) || "-"}</li>
                <li>${escapeHtml(question2) || "-"}</li>
                <li>${escapeHtml(question3) || "-"}</li>
              </ol>
            </div>
          </div>

          <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">Main Goal</div>
            <div style="padding:16px;font-size:14px;line-height:1.8;white-space:pre-wrap;">${escapeHtml(goal) || "-"}</div>
          </div>

          <div style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">Supporting Document</div>
            <div style="padding:16px;font-size:14px;">
              ${documentLink ? `<a href="${escapeHtml(documentLink)}" target="_blank" style="color:#7c16ff;">Open document</a>` : "-"}
            </div>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="padding:4px;"><a href="${approveUrl}" style="display:block;width:100%;padding:14px 0;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;text-align:center;box-sizing:border-box;">✓ Accept</a></td></tr>
            <tr><td style="padding:4px;"><a href="${rejectUrl}" style="display:block;width:100%;padding:14px 0;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;text-align:center;box-sizing:border-box;">✗ Reject</a></td></tr>
          </table>

          <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">LifeDAO Mentorship</p>
        </div>
      </div>
    </div>
  `;

  await sgMail.send({
    to: mentorEmail,
    from: FROM_EMAIL,
    subject: `New Mentorship Request - ${requestId}`,
    html,
  });
}

// ── Confirmation email to MENTEE ───────────────────────────────
export async function sendMenteeConfirmationEmail({
  menteeEmail,
  mentorName,
  field,
  language,
  plan,
  question1,
  question2,
  question3,
  goal,
  documentLink,
  requestId,
  uiLanguage,
}: {
  menteeEmail: string;
  mentorName: string;
  field: string;
  language: string;
  plan: string;
  question1: string;
  question2: string;
  question3: string;
  goal: string;
  documentLink: string;
  requestId: string;
  uiLanguage: string;
}) {
  const isFr = uiLanguage === "fr";

  const subject = isFr
    ? `Demande de mentorat reçue - ${requestId}`
    : `Mentorship Request Received - ${requestId}`;

  const html = `
    <div style="margin:0;padding:16px;background:#f6f4fb;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="background:#7c16ff;padding:20px 24px;">
          <div style="font-size:20px;font-weight:700;color:#ffffff;">${isFr ? "Demande de mentorat" : "Mentorship Request"}</div>
          <div style="margin-top:4px;font-size:12px;color:#efe7ff;">Request ID: ${escapeHtml(requestId)}</div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;font-size:15px;">${isFr ? "Bonjour," : "Hello,"}</p>
          <p style="margin:0 0 20px;font-size:15px;">${isFr ? "Votre demande a bien été reçue. Votre mentor l'examinera dans les 48 heures." : "Your request has been received. Your mentor will review it within 48 hours."}</p>

          <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">${isFr ? "Détails de la demande" : "Request Details"}</div>
            <div style="padding:16px;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:6px 0;font-weight:700;width:130px;">Mentor</td><td style="padding:6px 0;">${escapeHtml(mentorName)}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;">${isFr ? "Domaine" : "Field"}</td><td style="padding:6px 0;">${escapeHtml(field)}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;">${isFr ? "Langue" : "Language"}</td><td style="padding:6px 0;">${escapeHtml(language)}</td></tr>
                <tr><td style="padding:6px 0;font-weight:700;">${isFr ? "Formule" : "Plan"}</td><td style="padding:6px 0;text-transform:capitalize;">${escapeHtml(plan)}</td></tr>
              </table>
            </div>
          </div>

          <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">${isFr ? "Vos 3 questions principales" : "Top 3 Questions"}</div>
            <div style="padding:16px;">
              <ol style="margin:0;padding-left:18px;font-size:14px;line-height:1.8;">
                <li>${escapeHtml(question1) || "-"}</li>
                <li>${escapeHtml(question2) || "-"}</li>
                <li>${escapeHtml(question3) || "-"}</li>
              </ol>
            </div>
          </div>

          <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">${isFr ? "Objectif principal" : "Main Goal"}</div>
            <div style="padding:16px;font-size:14px;line-height:1.8;white-space:pre-wrap;">${escapeHtml(goal) || "-"}</div>
          </div>

          <div style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">${isFr ? "Document préparatoire" : "Supporting Document"}</div>
            <div style="padding:16px;font-size:14px;">
              ${documentLink ? `<a href="${escapeHtml(documentLink)}" target="_blank" style="color:#7c16ff;">${isFr ? "Ouvrir le document" : "Open document"}</a>` : "-"}
            </div>
          </div>

          <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">${isFr ? "LifeDAO Mentorat" : "LifeDAO Mentorship"}</p>
        </div>
      </div>
    </div>
  `;

  await sgMail.send({ to: menteeEmail, from: FROM_EMAIL, subject, html });
}

// ── Email to MENTEE when request is APPROVED ───────────────────
export async function sendApprovalEmail({
  menteeEmail,
  mentorName,
  calendlyLink,
  requestId,
  uiLanguage,
}: {
  menteeEmail: string;
  mentorName: string;
  calendlyLink: string;
  requestId: string;
  uiLanguage: string;
}) {
  const isFr = uiLanguage === "fr";

  const html = `
    <div style="margin:0;padding:16px;background:#f6f4fb;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="background:#16a34a;padding:20px 24px;">
          <div style="font-size:20px;font-weight:700;color:#ffffff;">${isFr ? "Demande acceptée ✓" : "Request Accepted ✓"}</div>
          <div style="margin-top:4px;font-size:12px;color:#dcfce7;">Request ID: ${escapeHtml(requestId)}</div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;font-size:15px;">${isFr ? "Bonjour," : "Hello,"}</p>
          <p style="margin:0 0 20px;font-size:15px;">${isFr ? `Votre demande de mentorat avec <strong>${escapeHtml(mentorName)}</strong> a été acceptée !` : `Your mentorship request with <strong>${escapeHtml(mentorName)}</strong> has been accepted!`}</p>
          <p style="margin:0 0 24px;font-size:15px;">${isFr ? "Veuillez réserver votre session en cliquant sur le bouton ci-dessous :" : "Please book your session using the button below:"}</p>

          <a href="${escapeHtml(calendlyLink)}" style="display:block;width:100%;padding:16px 0;background:#7c16ff;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;text-align:center;box-sizing:border-box;">
            ${isFr ? "Réserver ma session" : "Book your session"}
          </a>

          <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">${isFr ? "LifeDAO Mentorat" : "LifeDAO Mentorship"}</p>
        </div>
      </div>
    </div>
  `;

  await sgMail.send({
    to: menteeEmail,
    from: FROM_EMAIL,
    subject: isFr ? `Demande acceptée - ${requestId}` : `Request Accepted - ${requestId}`,
    html,
  });
}

// ── Email to MENTEE when request is REJECTED ───────────────────
export async function sendRejectionEmail({
  menteeEmail,
  mentorName,
  reason,
  requestId,
  uiLanguage,
}: {
  menteeEmail: string;
  mentorName: string;
  reason: string;
  requestId: string;
  uiLanguage: string;
}) {
  const isFr = uiLanguage === "fr";

  const html = `
    <div style="margin:0;padding:16px;background:#f6f4fb;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
        <div style="background:#dc2626;padding:20px 24px;">
          <div style="font-size:20px;font-weight:700;color:#ffffff;">${isFr ? "Demande non acceptée" : "Request Not Accepted"}</div>
          <div style="margin-top:4px;font-size:12px;color:#fee2e2;">Request ID: ${escapeHtml(requestId)}</div>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;font-size:15px;">${isFr ? "Bonjour," : "Hello,"}</p>
          <p style="margin:0 0 20px;font-size:15px;">${isFr ? `Votre demande de mentorat avec <strong>${escapeHtml(mentorName)}</strong> n'a pas été acceptée.` : `Your mentorship request with <strong>${escapeHtml(mentorName)}</strong> was not accepted.`}</p>

          ${reason ? `
          <div style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#fafafa;padding:12px 16px;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">${isFr ? "Raison" : "Reason"}</div>
            <div style="padding:16px;font-size:14px;line-height:1.8;white-space:pre-wrap;">${escapeHtml(reason)}</div>
          </div>
          ` : ""}

          <p style="margin:20px 0 0;font-size:13px;color:#6b7280;">${isFr ? "LifeDAO Mentorat" : "LifeDAO Mentorship"}</p>
        </div>
      </div>
    </div>
  `;

  await sgMail.send({
    to: menteeEmail,
    from: FROM_EMAIL,
    subject: isFr ? `Demande non acceptée - ${requestId}` : `Request Not Accepted - ${requestId}`,
    html,
  });
}