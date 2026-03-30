\"use client\";

import { useEffect, useState } from "react";

const ZAPIER_WEBHOOK =
  "https://script.google.com/macros/s/AKfycbycodw8q2aMWGecIe2gEj3drEcR2MYY11KJjLJrqbXNxV7-m1dxX_XZTSiDN9L8yr9Z/exec";

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
  Hijra: [
    { name: "Yanis DJERBI", languages: ["French"] },
    { name: "Leila NGOULOURE", languages: ["French", "English"] },
  ],
  Entrepreneurship: [
    { name: "Sharene Lee", languages: ["English"] },
    { name: "Morrad Irsane", languages: ["English", "French"] },
    { name: "Zohaib AHMAD", languages: ["English"] },
    { name: "Salman WASIM", languages: ["French"] },
  ],
};

const FIELDS = Object.keys(FIELD_MENTORS);

const SESSION_INFO: Record<string, string> = {
  basic: "2 sessions (30 minutes each) per quarter",
  premium: "8 sessions (30 minutes each) per quarter",
};

const translations = {
  en: {
    altLogo: "LifeDAO Logo",
    title: "Book your mentoring session",
    subtitle:
      "Check your eligibility and submit a session request to your mentor.",
    basic: "Basic",
    premium: "Premium",
    step1: "Check your eligibility",
    emailAddress: "Email address",
    emailPlaceholder: "you@example.com",
    checkEligibility: "Check eligibility",
    notEligibleTitle: "You are not eligible to book a session at this time.",
    blockedReason: "Your account is blocked.",
    notEligibleReason: "Not eligible for this quarter.",
    eligibleTitle: "You are eligible!",
    eligibleTextStart: "Your",
    eligibleTextMiddle: "plan gives you access to",
    step2: "Select your mentor",
    field: "Field",
    preferredLanguage: "Preferred language",
    mentor: "Mentor",
    selectField: "Select a field…",
    chooseLanguage: "Choose a language…",
    selectFieldFirst: "Select a field first…",
    chooseMentor: "Choose a mentor…",
    selectLanguageFirst: "Select a language first…",
    step3: "Prepare your session",
    top3Questions: "Your top 3 questions",
    questionPlaceholder: "Question",
    mainGoal: "Main goal for the session",
    goalPlaceholder: "What do you want to achieve?",
    step4: "Supporting documents",
    documentLink: "Document link",
    uploadToDrive: "Upload to Google Drive",
    docPlaceholder: "Paste link here...",
    agreement: "I confirm that I have read the",
    menteeAgreement: "Mentee Agreement",
    submitRequest: "Submit request",
    submittedMessage:
      "Your request has been submitted. The mentor will review it within 48 hours.",
    footerText: "Have questions? Reach out to",
    loading: "Loading…",
    somethingWentWrong: "Something went wrong.",
    errorUserNotFound:
      "We couldn't find your account. Please check your email.",
    errorMembershipFailed:
      "We couldn't load your membership details. Try again.",
    tryAgainHint: "Please try again in a moment.",
    languageOptions: {
      English: "English",
      French: "French",
      Urdu: "Urdu",
    },
    fieldOptions: {
      "Finance Literacy & Crypto": "Finance Literacy & Crypto",
      "Career Accelerator": "Career Accelerator",
      Hijra: "Hijra",
      Entrepreneurship: "Entrepreneurship",
    },
    docHints: {
      "Career Accelerator":
        "Please share your CV, LinkedIn profile, or any document relevant to your goal and questions",
      Entrepreneurship:
        "Please share your pitch deck, website or video, or any document relevant to your goal and questions",
      "Finance Literacy & Crypto":
        "Please share your portfolio or budget sheet, or any document relevant to your goal and questions",
      Hijra:
        "Please share your LinkedIn profile or any document relevant to your goal and questions",
    },
  },
  fr: {
    altLogo: "Logo LifeDAO",
    title: "Réservez votre session de mentorat",
    subtitle:
      "Vérifiez votre éligibilité et envoyez une demande de session à votre mentor.",
    basic: "Basic",
    premium: "Premium",
    step1: "Vérifiez votre éligibilité",
    emailAddress: "Adresse e-mail",
    emailPlaceholder: "vous@exemple.com",
    checkEligibility: "Vérifier l’éligibilité",
    notEligibleTitle:
      "Vous n’êtes pas éligible pour réserver une session pour le moment.",
    blockedReason: "Votre compte est bloqué.",
    notEligibleReason: "Non éligible pour ce trimestre.",
    eligibleTitle: "Vous êtes éligible !",
    eligibleTextStart: "Votre formule",
    eligibleTextMiddle: "vous donne accès à",
    step2: "Choisissez votre mentor",
    field: "Domaine",
    preferredLanguage: "Langue préférée",
    mentor: "Mentor",
    selectField: "Sélectionnez un domaine…",
    chooseLanguage: "Choisissez une langue…",
    selectFieldFirst: "Sélectionnez d’abord un domaine…",
    chooseMentor: "Choisissez un mentor…",
    selectLanguageFirst: "Sélectionnez d’abord une langue…",
    step3: "Préparez votre session",
    top3Questions: "Vos 3 questions principales",
    questionPlaceholder: "Question",
    mainGoal: "Objectif principal de la session",
    goalPlaceholder: "Que souhaitez-vous accomplir ?",
    step4: "Documents justificatifs",
    documentLink: "Lien du document",
    uploadToDrive: "Téléverser sur Google Drive",
    docPlaceholder: "Collez le lien ici...",
    agreement: "Je confirme avoir lu le",
    menteeAgreement: "Mentee Agreement",
    submitRequest: "Envoyer la demande",
    submittedMessage:
      "Votre demande a été envoyée. Le mentor l’examinera sous 48 heures.",
    footerText: "Des questions ? Contactez",
    loading: "Chargement…",
    somethingWentWrong: "Une erreur s’est produite.",
    errorUserNotFound:
      "Nous n’avons pas trouvé votre compte. Veuillez vérifier votre e-mail.",
    errorMembershipFailed:
      "Nous n’avons pas pu charger les détails de votre abonnement. Réessayez.",
    tryAgainHint: "Veuillez réessayer dans un instant.",
    languageOptions: {
      English: "Anglais",
      French: "Français",
      Urdu: "Ourdou",
    },
    fieldOptions: {
      "Finance Literacy & Crypto": "Finance & Crypto",
      "Career Accelerator": "Accélérateur de carrière",
      Hijra: "Hijra",
      Entrepreneurship: "Entrepreneuriat",
    },
    docHints: {
      "Career Accelerator":
        "Veuillez partager votre CV, votre profil LinkedIn ou tout document pertinent pour votre objectif et vos questions",
      Entrepreneurship:
        "Veuillez partager votre pitch deck, votre site web ou vidéo, ou tout document pertinent pour votre objectif et vos questions",
      "Finance Literacy & Crypto":
        "Veuillez partager votre portefeuille, votre budget ou tout document pertinent pour votre objectif et vos questions",
      Hijra:
        "Veuillez partager votre profil LinkedIn ou tout document pertinent pour votre objectif et vos questions",
    },
  },
};

type Lang = "en" | "fr";
type TranslationSet = (typeof translations)[Lang];
type ErrorKey =
  | "errorUserNotFound"
  | "errorMembershipFailed"
  | "somethingWentWrong";

type EligibilityResult = {
  eligible: boolean;
  plan: string;
  reason: string;
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

function getFriendlyErrorKey(message: string): ErrorKey {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("user information")) {
    return "errorUserNotFound";
  }

  if (normalizedMessage.includes("membership")) {
    return "errorMembershipFailed";
  }

  return "somethingWentWrong";
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const t: TranslationSet = translations[lang];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);

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
    const urlLang = params.get("uiLang");

    if (urlLang === "fr") {
      setLang("fr");
    }

    const pf = matchField(params.get("field"));
    const pl = matchLanguage(pf, params.get("language"));
    const pm = matchMentor(pf, params.get("mentor"));

    if (pf) {
      setPrefillField(pf);
      setField(pf);
    }

    if (pl) {
      setPrefillLanguage(pl);
      setLanguage(pl);
    }

    if (pm) {
      setPrefillMentor(pm);
      setMentor(pm);
    }
  }, []);

  const bothPrefilled = !!prefillField && !!prefillLanguage && !!prefillMentor;

  const resetForm = () => {
    setQuestions(["", "", ""]);
    setGoal("");
    setDocLink("");
    setConfirmed(false);
    setSubmitted(false);
    setSubmitError(null);

    if (!prefillField) setField("");
    if (!prefillLanguage) setLanguage("");
    if (!prefillMentor) setMentor("");
  };

  const checkEligibility = async () => {
    try {
      setLoading(true);
      setResult(null);
      setErrorKey(null);
      resetForm();

      const res = await fetch(
        `/api/check-eligibility?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || t.somethingWentWrong);
      }

      setResult({
        eligible: data.isEligible && !data.isBlocked,
        plan: String(data.membershipType || "").toLowerCase(),
        reason: data.isBlocked ? t.blockedReason : t.notEligibleReason,
      });
    } catch (err: unknown) {
      const rawMessage =
        err instanceof Error ? err.message : t.somethingWentWrong;
      setErrorKey(getFriendlyErrorKey(rawMessage));
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
      ui_language: lang,
    });

    const timeout = new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const request = fetch(ZAPIER_WEBHOOK, {
        method: "POST",
        body: params,
      });

      await Promise.race([request, timeout]);
    } catch {
      setSubmitError(null);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const mentorsForField = field
    ? FIELD_MENTORS[field as keyof typeof FIELD_MENTORS] ?? []
    : [];

  const availableLanguages = Array.from(
    new Set(mentorsForField.flatMap((m) => m.languages))
  );

  const availableMentors = language
    ? mentorsForField.filter((m) => m.languages.includes(language))
    : [];

  const docHint = field ? t.docHints[field as keyof typeof t.docHints] : null;

  const questionsValid = questions.some((q) => q.trim().length > 0);

  const canSubmit =
    field &&
    language &&
    mentor &&
    questionsValid &&
    goal.trim() &&
    docLink.trim() &&
    confirmed &&
    !submitting;

  const displayField = (value: string) =>
    t.fieldOptions[value as keyof typeof t.fieldOptions] || value;

  const displayLanguage = (value: string) =>
    t.languageOptions[value as keyof typeof t.languageOptions] || value;

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-end">
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  lang === "en"
                    ? "bg-[#7c16ff] text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  lang === "fr"
                    ? "bg-[#7c16ff] text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                FR
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <img
              src="https://thelifedao.io/logos/life-logo.svg"
              alt={t.altLogo}
              className="h-20 object-contain"
            />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {t.title}
          </h1>

          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            {t.subtitle}
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bb87ff] shrink-0"></span>
              <span>
                <span className="font-medium text-gray-800">{t.basic}</span> —{" "}
                {SESSION_INFO.basic}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7c16ff] shrink-0"></span>
              <span>
                <span className="font-medium text-gray-800">{t.premium}</span>{" "}
                — {SESSION_INFO.premium}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          {!submitted ? (
            <>
              <SectionTitle number="1" title={t.step1} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.emailAddress}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    isValidEmail &&
                    !loading &&
                    checkEligibility()
                  }
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
                />
              </div>

              <button
                onClick={checkEligibility}
                disabled={loading || !isValidEmail}
                className="w-full py-3 px-6 rounded-xl bg-[#7c16ff] text-white text-sm font-medium transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Spinner text={t.loading} /> : t.checkEligibility}
              </button>

              {errorKey && (
                <AlertBox type="error">
                  <p className="font-medium">{t[errorKey]}</p>
                  <p className="mt-1 text-xs">{t.tryAgainHint}</p>
                </AlertBox>
              )}

              {result && !result.eligible && (
                <AlertBox type="warning">
                  <p className="font-medium">{t.notEligibleTitle}</p>
                  {result.reason && <p className="mt-1">{result.reason}</p>}
                </AlertBox>
              )}

              {result && result.eligible && (
                <div className="space-y-5 pt-2">
                  <AlertBox type="success">
                    <p className="font-medium">{t.eligibleTitle}</p>
                    <p className="mt-0.5 text-xs">
                      {t.eligibleTextStart}{" "}
                      <span className="font-semibold capitalize">
                        {result.plan}
                      </span>{" "}
                      {t.eligibleTextMiddle}{" "}
                      <span className="font-semibold">
                        {SESSION_INFO[result.plan]}
                      </span>
                      .
                    </p>
                  </AlertBox>

                  <div className="border-t border-gray-100 pt-5 space-y-5">
                    <SectionTitle number="2" title={t.step2} />

                    {bothPrefilled ? (
                      <div className="space-y-3">
                        <ReadOnlyField
                          label={t.field}
                          value={displayField(field)}
                        />
                        <ReadOnlyField
                          label={t.preferredLanguage}
                          value={displayLanguage(language)}
                        />
                        <ReadOnlyField label={t.mentor} value={mentor} />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            {t.field}
                            <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={field}
                            onChange={(e) => {
                              setField(e.target.value);
                              setLanguage("");
                              setMentor("");
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
                          >
                            <option value="">{t.selectField}</option>
                            {FIELDS.map((f) => (
                              <option key={f} value={f}>
                                {displayField(f)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            {t.preferredLanguage}
                            <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={language}
                            onChange={(e) => {
                              setLanguage(e.target.value);
                              setMentor("");
                            }}
                            disabled={!field}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {field ? t.chooseLanguage : t.selectFieldFirst}
                            </option>
                            {availableLanguages.map((langOption) => (
                              <option key={langOption} value={langOption}>
                                {displayLanguage(langOption)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            {t.mentor}
                            <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={mentor}
                            onChange={(e) => setMentor(e.target.value)}
                            disabled={!language}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {language
                                ? t.chooseMentor
                                : t.selectLanguageFirst}
                            </option>
                            {availableMentors.map((m) => (
                              <option key={m.name} value={m.name}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="border-t border-gray-100 pt-5 space-y-4">
                      <SectionTitle number="3" title={t.step3} />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t.top3Questions}{" "}
                          <span className="text-red-400">*</span>
                        </label>

                        <div className="space-y-2">
                          {questions.map((q, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="mt-3 text-xs font-medium text-gray-400 w-4 shrink-0">
                                {i + 1}.
                              </span>
                              <input
                                type="text"
                                value={q}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[i] = e.target.value;
                                  setQuestions(updated);
                                }}
                                placeholder={`${t.questionPlaceholder} ${i + 1}`}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t.mainGoal} <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          placeholder={t.goalPlaceholder}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition resize-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-5 space-y-3">
                      <SectionTitle number="4" title={t.step4} />

                      {docHint && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <p className="text-xs text-blue-700">{docHint}</p>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-end mb-1.5">
                          <label className="block text-sm font-medium text-gray-700">
                            {t.documentLink}{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <a
                            href="https://drive.google.com/drive/my-drive"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-medium text-[#7c16ff] hover:underline"
                          >
                            {t.uploadToDrive}
                          </a>
                        </div>

                        <input
                          type="text"
                          value={docLink}
                          onChange={(e) => setDocLink(e.target.value)}
                          placeholder={t.docPlaceholder}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition"
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
                        <span className="text-sm text-gray-600">
                          {t.agreement}{" "}
                          <a
                            href="https://docs.google.com/document/d/1UnzhvBGZDzefqhHtCNKArOByVAHwfHxfYd5_3NEPc0k/preview"
                            target="_blank"
                            className="underline font-medium text-gray-900"
                          >
                            {t.menteeAgreement}
                          </a>
                        </span>
                      </label>
                    </div>

                    {submitError && (
                      <AlertBox type="error">{submitError}</AlertBox>
                    )}

                    <button
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="w-full py-3 px-6 rounded-xl bg-[#7c16ff] text-white text-sm font-medium transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Spinner text={t.loading} />
                      ) : (
                        t.submitRequest
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <AlertBox type="success">{t.submittedMessage}</AlertBox>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t.footerText}{" "}
          <a
            href="mailto:mentorship@takadao.io"
            className="underline hover:text-gray-600 transition-colors"
          >
            mentorship@takadao.io
          </a>
        </p>
      </div>
    </div>
  );
}

function SectionTitle({
  number,
  title,
}: {
  number: string | number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#7c16ff] text-white text-xs font-semibold shrink-0">
        {number}
      </span>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 text-sm">
        {value}
      </div>
    </div>
  );
}

function AlertBox({
  type,
  children,
}: {
  type: "error" | "warning" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "bg-red-50 border-red-100 text-red-700",
    warning: "bg-amber-50 border-amber-100 text-amber-800",
    success: "bg-emerald-50 border-emerald-100 text-emerald-800",
    info: "bg-blue-50 border-blue-100 text-blue-800",
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${styles[type]}`}
    >
      <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center font-bold">
        !
      </div>
      <div>{children}</div>
    </div>
  );
}

function Spinner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      <span>{text}</span>
    </div>
  );
}
