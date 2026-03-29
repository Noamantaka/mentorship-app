"use client";

import { useState, useEffect } from "react";

const API_ENDPOINT = "https://thelifedao.io/api/v2/data/consultation-session";
const API_SECRET_KEY = "gbj7utJduzEiu8FXwDQGTP06fTsBoCtm";
const ZAPIER_WEBHOOK = "https://script.google.com/macros/s/AKfycbycodw8q2aMWGecIe2gEj3drEcR2MYY11KJjLJrqbXNxV7-m1dxX_XZTSiDN9L8yr9Z/exec";

const FIELD_MENTORS = {
  "Finance Literacy & Crypto": [
    { name: "Farha KIRUBI", languages: ["English"] },
    { name: "Samuel VERDON", languages: ["French"] },
    { name: "Dr Nouran Sawy", languages: ["English"] },
  ],
  "Career Accelerator": [
    { name: "Asma CHAUDHRY", languages: ["English", "Urdu"] },
    { name: "Sarah BRABRA", languages: ["French", "English"] },
    { name: "Huda PARVEZ", languages: ["English"] },
  ],
  "Hijra": [
    { name: "Yanis DJERBI", languages: ["French"] },
    { name: "Leila NGOULOURE", languages: ["French", "English"] },
  ],
  "Entrepreneurship": [
    { name: "Sharene Lee", languages: ["English"] },
    { name: "Morrad Irsane", languages: ["English", "French"] },
    { name: "Zohaib AHMAD", languages: ["English"] },
    { name: "Salman WASIM", languages: ["French"] },
  ],
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

function matchLanguage(field: string, param: string | null) {
  if (!field || !param) return "";
  const mentors = FIELD_MENTORS[field as keyof typeof FIELD_MENTORS] ?? [];
  const languages = Array.from(new Set(mentors.flatMap((m) => m.languages)));
  return (
    languages.find(
      (lang) =>
        normalizeParam(lang).includes(normalizeParam(param)) ||
        normalizeParam(param).includes(normalizeParam(lang))
    ) ?? ""
  );
}

function matchMentor(field: string, param: string | null) {
  if (!field || !param) return "";
  const mentors = FIELD_MENTORS[field as keyof typeof FIELD_MENTORS] ?? [];
  return (
    mentors.find(
      (m) =>
        normalizeParam(m.name).includes(normalizeParam(param)) ||
        normalizeParam(param).includes(normalizeParam(m.name).split(" ")[0])
    )?.name ?? ""
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [field, setField] = useState("");
  const [language, setLanguage] = useState("");
  const [mentor, setMentor] = useState("");
  const [questions, setQuestions] = useState(["", "", ""]);
  const [goal, setGoal] = useState("");
  const [docLink, setDocLink] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [prefillField, setPrefillField] = useState("");
  const [prefillLanguage, setPrefillLanguage] = useState("");
  const [prefillMentor, setPrefillMentor] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pf = matchField(params.get("field"));
    const pl = matchLanguage(pf, params.get("language"));
    const pm = matchMentor(pf, params.get("mentor"));

    if (pf) { setPrefillField(pf); setField(pf); }
    if (pl) { setPrefillLanguage(pl); setLanguage(pl); }
    if (pm) { setPrefillMentor(pm); setMentor(pm); }
  }, []);

  const bothPrefilled = !!prefillField && !!prefillLanguage && !!prefillMentor;

  const resetForm = () => {
    setQuestions(["", "", ""]);
    setGoal("");
    setDocLink("");
    setConfirmed(false);
    setSubmitted(false);
    if (!prefillField) setField("");
    if (!prefillLanguage) setLanguage("");
    if (!prefillMentor) setMentor("");
  };

  const checkEligibility = async () => {
    try {
      setLoading(true);
      setResult(null);
      setError(null);
      resetForm();

      const url = new URL(API_ENDPOINT);
      url.searchParams.append("key", API_SECRET_KEY);
      url.searchParams.append("email", email);

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Server error. Please try again.");
      }

      const data = await res.json();
      
      setResult({
        eligible: data.isEligible && !data.isBlocked,
        plan: data.membershipType.toLowerCase(), 
        reason: data.isBlocked ? "Your account is blocked." : "Not eligible for this quarter."
      });

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
      language,
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
  const mentorsForField = field ? FIELD_MENTORS[field as keyof typeof FIELD_MENTORS] ?? [] : [];
  const availableLanguages = Array.from(new Set(mentorsForField.flatMap((m) => m.languages)));
  const availableMentors = language
    ? mentorsForField.filter((m) => m.languages.includes(language))
    : [];
  const docHint = field ? FIELD_DOC_HINT[field as keyof typeof FIELD_DOC_HINT] : null;
  const questionsValid = questions.some((q) => q.trim().length > 0);
  const canSubmit =
    field && language && mentor && questionsValid && goal.trim() && docLink.trim() && confirmed && !submitting;

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <img src="https://thelifedao.io/logos/life-logo.svg" alt="LifeDAO Logo" className="h-20 object-contain" />
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
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          {!submitted ? (
            <>
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

              {result && result.eligible && (
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
                        <ReadOnlyField label="Preferred language" value={language} />
                        <ReadOnlyField label="Mentor" value={mentor} />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Field<span className="text-red-400">*</span></label>
                          <select
                            value={field}
                            onChange={(e) => {
                              setField(e.target.value);
                              setLanguage("");
                              setMentor("");
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
                          >
                            <option value="">Select a field…</option>
                            {FIELDS.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Preferred language<span className="text-red-400">*</span></label>
                          <select
                            value={language}
                            onChange={(e) => {
                              setLanguage(e.target.value);
                              setMentor("");
                            }}
                            disabled={!field}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">{field ? "Choose a language…" : "Select a field first…"}</option>
                            {availableLanguages.map((lang) => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">Mentor<span className="text-red-400">*</span></label>
                          <select
                            value={mentor}
                            onChange={(e) => setMentor(e.target.value)}
                            disabled={!language}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">{language ? "Choose a mentor…" : "Select a language first…"}</option>
                            {availableMentors.map((m) => (
                              <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="border-t border-gray-100 pt-5 space-y-4">
                      <SectionTitle number="3" title="Prepare your session" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your top 3 questions <span className="text-red-400">*</span></label>
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
                                placeholder={`Question ${i + 1}`}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Main goal for the session <span className="text-red-400">*</span></label>
                        <textarea
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          placeholder="What do you want to achieve?"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition resize-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-5 space-y-3">
                      <SectionTitle number="4" title="Supporting documents" />
                      {docHint && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-xs text-blue-700">{docHint}</p>
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <label className="block text-sm font-medium text-gray-700">Document link <span className="text-red-400">*</span></label>
                          <a href="https://drive.google.com/drive/my-drive" target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-[#7c16ff] hover:underline">Upload to Google Drive</a>
                        </div>
                        <input
                          type="text"
                          value={docLink}
                          onChange={(e) => setDocLink(e.target.value)}
                          placeholder="Paste link here..."
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
                          <span className="text-red-400 mr-1">*</span>
                          I confirm that I have provided all required information, have read the{" "}
                          <a href="https://docs.google.com/document/d/1UnzhvBGZDzefqhHtCNKArOByVAHwfHxfYd5_3NEPc0k/preview" target="_blank" rel="noopener noreferrer" className="underline font-medium text-gray-900">Mentee Agreement</a>
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="w-full py-3 px-6 rounded-xl bg-[#7c16ff] text-white text-sm font-medium transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? <Spinner /> : "Submit request"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <AlertBox type="success">
              Your request has been submitted. The mentor will review it within 48 hours.
            </AlertBox>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Have questions? Reach out to <a href="mailto:mentorship@takadao.io" className="underline hover:text-gray-600 transition-colors">mentorship@takadao.io</a>
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string | number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#7c16ff] text-white text-xs font-semibold shrink-0">{number}</span>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 text-sm">{value}</div>
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
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]}`}>
      <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center font-bold">!</div>
      <div>{children}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center gap-2">
      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      <span>Loading…</span>
    </div>
  );
}