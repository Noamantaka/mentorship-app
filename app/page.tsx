"use client";

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

  return null;
}
