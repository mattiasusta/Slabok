import { z } from "zod";

// Tutte le foto caricate tramite /api/upload finiscono sotto questo host: usato per
// validare che il campo "foto" di una segnalazione non sia un link esterno arbitrario.
// Definita qui (non in lib/uploads.ts) perché questo file è importato anche da
// componenti client, e uploads.ts carica l'SDK Cloudinary (solo server, usa `fs`).
export const CLOUDINARY_URL_PREFIX = "https://res.cloudinary.com/";

export const GRADING_COMPANIES = ["PSA", "BECKETT", "CGC", "TAG"] as const;
export type GradingCompany = (typeof GRADING_COMPANIES)[number];

// Scala voti comune alle compagnie di grading: "Autentica" (nessun voto numerico,
// es. carte alterate/danneggiate) oppure 1...10 con mezzi punti.
export const GRADES = [
  "AUTHENTIC",
  "1",
  "1.5",
  "2",
  "2.5",
  "3",
  "3.5",
  "4",
  "4.5",
  "5",
  "5.5",
  "6",
  "6.5",
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
] as const;
export type Grade = (typeof GRADES)[number];

export function gradeLabel(grade: string): string {
  return grade === "AUTHENTIC" ? "Autentica (nessun voto)" : grade;
}

/** Normalizza un numero di certificato per evitare duplicati (spazi, maiuscole). */
export function normalizeCert(cert: string): string {
  return cert.trim().toUpperCase().replace(/\s+/g, "");
}

export const checkQuerySchema = z.object({
  company: z.enum(GRADING_COMPANIES),
  cert: z.string().min(1).max(40),
});

// Telefono facoltativo: accetta cifre, spazi, +, - per restare permissivo sui formati internazionali.
const phoneRegex = /^[0-9+\-\s]{6,20}$/;

// Le foto vengono caricate tramite /api/upload, che le salva su Cloudinary: evita
// che si possa passare un URL esterno arbitrario come "foto".
function isCloudinaryUrl(url: string): boolean {
  return url.startsWith(CLOUDINARY_URL_PREFIX);
}

// Campi modificabili sia in creazione che in modifica: compagnia e numero certificato
// restano fissi dopo la creazione (identificano univocamente la segnalazione).
const cardEditableFields = {
  cardName: z.string().min(1, "Inserisci il nome della carta.").max(200),
  grade: z.enum(GRADES, { errorMap: () => ({ message: "Seleziona un voto valido." }) }),
  certUrl: z.string().url().max(500).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  photoUrl: z.string().refine(isCloudinaryUrl, "Carica una foto valida della carta.").optional().or(z.literal("")),
  contactPhone: z.string().regex(phoneRegex, "Numero di telefono non valido.").optional().or(z.literal("")),
  signed: z.boolean().optional().default(false),
  signatureGrade: z.enum(GRADES).optional().or(z.literal("")),
  certifyOwnership: z.literal(true, {
    errorMap: () => ({ message: "Devi dichiarare che la carta è di tua proprietà." }),
  }),
};

function requireSignatureGradeIfSigned(data: { signed?: boolean; signatureGrade?: string }) {
  return !data.signed || !!data.signatureGrade;
}

export const createCardSchema = z
  .object({
    gradingCompany: z.enum(GRADING_COMPANIES),
    certNumber: z.string().min(1).max(40),
    ...cardEditableFields,
  })
  .refine(requireSignatureGradeIfSigned, {
    message: "Indica il voto della firma.",
    path: ["signatureGrade"],
  });

export const updateCardSchema = z.object(cardEditableFields).refine(requireSignatureGradeIfSigned, {
  message: "Indica il voto della firma.",
  path: ["signatureGrade"],
});

export const registerSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(72),
    confirmPassword: z.string(),
    acceptedTos: z.literal(true, {
      errorMap: () => ({ message: "Devi accettare i Termini di Servizio." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le due password non coincidono.",
    path: ["confirmPassword"],
  });

const verificationCodeRegex = /^[0-9]{6}$/;

export const verifyEmailSchema = z.object({
  email: z.string().email().max(255),
  code: z.string().regex(verificationCodeRegex, "Il codice deve essere di 6 cifre."),
});

export const resendVerificationSchema = z.object({
  email: z.string().email().max(255),
});
