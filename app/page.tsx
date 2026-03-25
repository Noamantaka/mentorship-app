"use client";

import { useState, useEffect } from "react";

const API_ENDPOINT = "https://REPLACE_ME/check-eligibility";
const ZAPIER_WEBHOOK = "https://script.google.com/macros/s/AKfycbwC33mWE_c2fpBMHzj3BsctNeE_zEZwkGOLGefu15Werwc3V2OwouEGGsRNrD0NNE4W/exec";

const FIELD_MENTORS = {
  "Finance Literacy & Crypto": ["Farha KIRUBI", "Samuel VERDON", "Dr Nouran Saeed"],
  "Career Accelerator": ["Asma CHAUDHRY", "Sarah BRABRA", "Huda PARVEZ"],
  "Hijra": ["Yanis DJERBI", "Olivier THOMAS", "Leila NGOULOURE"],
  "Entrepreneurship": ["Sharene Lee", "Morrad Irsane", "Zohaib AHMAD", "Salman WASIM"],
};

const FIELD_DOC_HINT = {
  "Career Accelerator": "Please share your CV, LinkedIn profile, or any document relevant to your goal and questions",
  "Entrepreneurship": "Please share your pitch deck, website or video, or any document relevant to your goal and questions",
  "Finance Literacy & Crypto": "Please share your portfolio or budget sheet, or any document relevant to your goal and questions",
  "Hijra": "Please share your LinkedIn profile or any document relevant to your goal and questions",
};

const FIELDS = Object.keys(FIELD_MENTORS);

const SESSION_INFO: Record<string, string> = {
  basic: "2 sessions (30 minutes each) per quarter",
  premium: "8 sessions (30 minutes each) per quarter",
};

function normalizeParam(str: string | null | undefined) {
  return str?.toLowerCase().trim() ?? "";
}

function matchField(param: string | null) {
  if (!param) return "";
  return (
    FIELDS.find(
      (f) =>
        normalizeParam(f).includes(normalizeParam(param)) ||
        normalizeParam(param).includes(normalizeParam(f).split(" ")[0])
    ) ?? ""
  );
}

function matchMentor(field: string, param: string | null) {
  if (!field || !param) return "";
  const mentors = FIELD_MENTORS[field as keyof typeof FIELD_MENTORS] ?? [];
  return (
    mentors.find(
      (m) =>
        normalizeParam(m).includes(normalizeParam(param)) ||
        normalizeParam(param).includes(normalizeParam(m).split(" ")[0])
    ) ?? ""
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [field, setField] = useState("");
  const [mentor, setMentor] = useState("");
  const [questions, setQuestions] = useState(["", "", ""]);
  const [goal, setGoal] = useState("");
  const [docLink, setDocLink] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [prefillField, setPrefillField] = useState("");
  const [prefillMentor, setPrefillMentor] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pf = matchField(params.get("field"));
    const pm = matchMentor(pf, params.get("mentor"));
    if (pf) {
      setPrefillField(pf);
      setField(pf);
    }
    if (pm) {
      setPrefillMentor(pm);
      setMentor(pm);
    }
  }, []);

  const bothPrefilled = !!prefillField && !!prefillMentor;

  const getMockResult = () => {
    if (email.endsWith("@test.com")) {
      return { eligible: true, plan: "premium", reason: "" };
    }
    return { eligible: false, plan: "basic", reason: "Not eligible for this quarter." };
  };

  const resetForm = () => {
    setQuestions(["", "", ""]);
    setGoal("");
    setDocLink("");
    setConfirmed(false);
    setSubmitted(false);
    if (!prefillField) setField("");
    if (!prefillMentor) setMentor("");
  };

  const checkEligibility = async () => {
    try {
      setLoading(true);
      setResult(null);
      setError(null);
      resetForm();

      if (API_ENDPOINT.includes("REPLACE_ME")) {
        await new Promise((r) => setTimeout(r, 1000));
        setResult(getMockResult());
      } else {
        const res = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) throw new Error("Server error. Please try again.");

        setResult(await res.json());
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const params = new URLSearchParams({
      email,
      field,
      mentor,
      question_1: questions[0],
      question_2: questions[1],
      question_3: questions[2],
      goal,
      document_link: docLink,
      plan: result?.plan || "",
    });

    const timeout = new Promise((r) => setTimeout(r, 3000));

    try {
      const request = fetch(ZAPIER_WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        body: params,
      });

      await Promise.race([request, timeout]);
    } catch (_) {
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const availableMentors = field ? FIELD_MENTORS[field as keyof typeof FIELD_MENTORS] ?? [] : [];
  const docHint = field ? FIELD_DOC_HINT[field as keyof typeof FIELD_DOC_HINT] : null;
  const questionsValid = questions.some((q) => q.trim().length > 0);
  const canSubmit =
    field && mentor && questionsValid && goal.trim() && docLink.trim() && confirmed && !submitting;

  return (
<div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center px-4 py-12">

  <div className="w-full max-w-lg">

    <div className="mb-10 text-center">

      <div className="mb-6 flex justify-center">
        <img
          src="https://thelifedao.io/logos/life-logo.svg"
          alt="LifeDAO Logo"
          className="h-20 object-contain"
        />
      </div>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Book your mentoring session</h1>

          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            Check your eligibility and submit a session request to your mentor.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bb87ff] shrink-0"></span>
              <span><span className="font-medium text-gray-800">Basic</span> — {SESSION_INFO.basic}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c16ff] shrink-0"></span>
              <span><span className="font-medium text-gray-800">Premium</span> — {SESSION_INFO.premium}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Each session is 30 minutes. Premium members can use up to 2 sessions per topic per quarter.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <SectionTitle number="1" title="Check your eligibility" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setResult(null);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && isValidEmail && !loading && checkEligibility()}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
            />
          </div>

          <button
            onClick={checkEligibility}
            disabled={loading || !isValidEmail}
            className="w-full py-3 px-6 rounded-xl bg-[#7c16ff] text-white text-sm font-medium transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Spinner /> : "Check eligibility"}
          </button>

          {error && <AlertBox type="error">{error}</AlertBox>}

          {result && !result.eligible && (
            <AlertBox type="warning">
              <p className="font-medium">You are not eligible to book a session at this time.</p>
              {result.reason && <p className="mt-1">{result.reason}</p>}
            </AlertBox>
          )}

          {result && result.eligible && !submitted && (
            <div className="space-y-5 pt-2">
              <AlertBox type="success">
                <p className="font-medium">You are eligible!</p>
                <p className="mt-0.5 text-xs">
                  Your <span className="font-semibold capitalize">{result.plan}</span> plan gives you access to{" "}
                  <span className="font-semibold">{SESSION_INFO[result.plan]}</span>.
                </p>
              </AlertBox>

              <div className="border-t border-gray-100 pt-5 space-y-5">
                <SectionTitle number="2" title="Select your mentor" />

                {bothPrefilled ? (
                  <div className="space-y-3">
                    <ReadOnlyField label="Field" value={field} />
                    <ReadOnlyField label="Mentor" value={mentor} />
                  </div>
                ) : (
                  <>
                    {prefillField ? (
                      <ReadOnlyField label="Field" value={field} />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Field</label>
                        <select
                          value={field}
                          onChange={(e) => {
                            setField(e.target.value);
                            setMentor("");
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
                        >
                          <option value="">Select a field…</option>
                          {FIELDS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {prefillMentor ? (
                      <ReadOnlyField label="Mentor" value={mentor} />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mentor</label>
                        <select
                          value={mentor}
                          onChange={(e) => setMentor(e.target.value)}
                          disabled={!field}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">{field ? "Choose a mentor…" : "Select a field first…"}</option>
                          {availableMentors.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <SectionTitle number="3" title="Prepare your session" />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your top 3 questions <span className="text-red-400">*</span>
                    </label>
                    <p className="text-xs text-gray-400 mb-2">At least one question is required.</p>

                    <div className="space-y-2">
                      {questions.map((q, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="mt-3 text-xs font-medium text-gray-400 w-4 shrink-0">{i + 1}.</span>
                          <input
                            type="text"
                            value={q}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[i] = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder={`Question ${i + 1}${i === 0 ? " (required)" : " (optional)"}`}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Main goal for the session <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="What do you want to achieve or walk away with after this session?"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition resize-none"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <SectionTitle number="4" title="Supporting documents" />

                  {docHint && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <svg className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <p className="text-xs text-blue-700">{docHint}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Document link <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={docLink}
                      onChange={(e) => setDocLink(e.target.value)}
                      placeholder="e.g. Google Drive, Notion, Figma, LinkedIn URL…"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
                    />
                  </div>
                </div>

<div className="border-t border-gray-100 pt-5">
  <label className="flex items-start gap-3 cursor-pointer group">
    <input
      type="checkbox"
      checked={confirmed}
      onChange={(e) => setConfirmed(e.target.checked)}
      className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-black cursor-pointer"
    />
    <span className="text-sm text-gray-600 leading-snug group-hover:text-gray-800 transition">
      I confirm that I have provided all required information, have read the{" "}
      <a
        href="https://docs.google.com/document/d/1UnzhvBGZDzefqhHtCNKArOByVAHwfHxfYd5_3NEPc0k/edit?tab=t.0"
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium text-gray-900"
      >
        Mentee Agreement
      </a>
      , and understand the session expectations.
    </span>
  </label>
</div>

                {submitError && <AlertBox type="error">{submitError}</AlertBox>}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full py-3 px-6 rounded-xl bg-black text-white text-sm font-medium transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Spinner /> : "Submit request"}
                </button>
              </div>
            </div>
          )}

          {submitted && (
            <AlertBox type="success">
              Your request has been submitted. The mentor will review it within 48 hours.
            </AlertBox>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Have questions? Reach out to your program coordinator.
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string | number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#7c16ff] text-white text-xs font-semibold shrink-0">
        {number}
      </span>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 text-sm">
        {value}
      </div>
    </div>
  );
}

function AlertBox({ type, children }: { type: "error" | "warning" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "bg-red-50 border-red-100 text-red-700",
    warning: "bg-amber-50 border-amber-100 text-amber-800",
    success: "bg-emerald-50 border-emerald-100 text-emerald-800",
    info: "bg-blue-50 border-blue-100 text-blue-800",
  };

  const icons = {
    error: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    ),
    warning: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
    success: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]}`}>
      <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {icons[type]}
      </svg>
      <div>{children}</div>
    </div>
  );
}

function Spinner() {
  return (
    <>
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v8z" />
      </svg>
      Loading…
    </>
  );
}