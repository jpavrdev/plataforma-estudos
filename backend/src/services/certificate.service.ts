import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../../db.ts";
import { certificates, lessonProgress, lessons, modules, trails } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { env } from "../config/env.ts";

const LANG_LABEL: Record<string, string> = { javascript: "JavaScript", python: "Python" };

function issuerConfigured() {
    return Boolean(env.CERT_RAZAO_SOCIAL && env.CERT_CNPJ && env.CERT_RESPONSAVEL);
}

function formatCpf(cpf: string) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function maskCpf(cpf: string) {
    return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

// No 0/O/1/I/L, so the code can be read out over the phone without ambiguity.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function generateCode() {
    let s = "";
    for (let i = 0; i < 12; i++) {
        s += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
    }
    return `ED-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

type RealCompletion = { language: string | null; startedAt: Date; completedAt: Date };

// Real completion: every published lesson (the neutral ones plus one complete track) without the manual mark.
async function realCompletion(trailId: string, userId: string): Promise<RealCompletion | null> {
    const trailLessons = await db
        .select({ id: lessons.id, language: lessons.language })
        .from(lessons)
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)));
    if (trailLessons.length === 0) return null;

    const progressRows = await db
        .select({ lessonId: lessonProgress.lessonId, completedAt: lessonProgress.completedAt })
        .from(lessonProgress)
        .where(
            and(
                eq(lessonProgress.userId, userId),
                eq(lessonProgress.manual, false),
                inArray(
                    lessonProgress.lessonId,
                    trailLessons.map((a) => a.id),
                ),
            ),
        );
    const completed = new Map(progressRows.map((p) => [p.lessonId, p.completedAt]));

    const neutral = trailLessons.filter((a) => a.language === null);
    if (!neutral.every((a) => completed.has(a.id))) return null;

    const languages = [
        ...new Set(trailLessons.map((a) => a.language).filter((l): l is string => !!l)),
    ];
    let track: string | null = null;
    if (languages.length > 0) {
        track =
            languages.find((l) =>
                trailLessons.filter((a) => a.language === l).every((a) => completed.has(a.id)),
            ) ?? null;
        if (!track) return null;
    }

    const counted = trailLessons.filter((a) => a.language === null || a.language === track);
    const times = counted
        .map((a) => completed.get(a.id))
        .filter((d): d is Date => d instanceof Date)
        .map((d) => d.getTime());
    return {
        language: track,
        startedAt: new Date(Math.min(...times)),
        completedAt: new Date(Math.max(...times)),
    };
}

async function hasOnlyManualCompletion(trailId: string, userId: string) {
    const trailLessons = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)));
    if (trailLessons.length === 0) return false;
    const total = await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(
            and(
                eq(lessonProgress.userId, userId),
                inArray(
                    lessonProgress.lessonId,
                    trailLessons.map((a) => a.id),
                ),
            ),
        );
    return total.length === trailLessons.length;
}

export async function findCertificateStatus(trailId: string, userId: string) {
    const [trail] = await db.select().from(trails).where(eq(trails.id, trailId));
    if (!trail) {
        throw new AppError(404, "Trilha não encontrada");
    }

    const [existing] = await db
        .select({ code: certificates.code, issuedAt: certificates.issuedAt })
        .from(certificates)
        .where(and(eq(certificates.userId, userId), eq(certificates.trailId, trailId)));
    if (existing) {
        return { emitido: existing, elegivel: false };
    }

    if (!issuerConfigured()) return { emitido: null, elegivel: false, motivo: "indisponivel" };
    if (!trail.workloadHours) return { emitido: null, elegivel: false, motivo: "carga_horaria" };

    const completion = await realCompletion(trailId, userId);
    if (!completion) {
        const reason = (await hasOnlyManualCompletion(trailId, userId)) ? "manual" : "progresso";
        return { emitido: null, elegivel: false, motivo: reason };
    }
    return { emitido: null, elegivel: true };
}

export async function createCertificate(
    trailId: string,
    userId: string,
    cpf: string,
    name: string,
) {
    const [trail] = await db.select().from(trails).where(eq(trails.id, trailId));
    if (!trail) {
        throw new AppError(404, "Trilha não encontrada");
    }
    if (!issuerConfigured()) {
        throw new AppError(503, "A emissão de certificados ainda não está disponível.");
    }
    if (!trail.workloadHours) {
        throw new AppError(409, "Esta trilha ainda não emite certificado.");
    }

    // Once issued the document is immutable: neither the CPF nor the name change, even on a repeated request.
    const [existing] = await db
        .select()
        .from(certificates)
        .where(and(eq(certificates.userId, userId), eq(certificates.trailId, trailId)));
    if (existing) return existing;

    const completion = await realCompletion(trailId, userId);
    if (!completion) {
        if (await hasOnlyManualCompletion(trailId, userId)) {
            throw new AppError(
                409,
                "O certificado só sai com as aulas concluídas de verdade, passando nos quizzes.",
            );
        }
        throw new AppError(409, "Conclua todas as aulas da trilha para emitir o certificado.");
    }

    for (let attempt = 0; attempt < 5; attempt++) {
        const [created] = await db
            .insert(certificates)
            .values({
                code: generateCode(),
                userId,
                trailId,
                studentName: name,
                cpf,
                trailName: trail.name,
                workloadHours: trail.workloadHours,
                language: completion.language,
                startedAt: completion.startedAt,
                completedAt: completion.completedAt,
            })
            .onConflictDoNothing({ target: certificates.code })
            .returning();
        if (created) return created;
        // Race on the unique (userId, trailId): another request issued it first.
        const [racing] = await db
            .select()
            .from(certificates)
            .where(and(eq(certificates.userId, userId), eq(certificates.trailId, trailId)));
        if (racing) return racing;
    }
    throw new AppError(500, "Não foi possível gerar o código do certificado.");
}

export async function checkCertificate(code: string) {
    const [cert] = await db.select().from(certificates).where(eq(certificates.code, code));
    if (!cert) {
        throw new AppError(404, "Certificado não encontrado");
    }
    return {
        code: cert.code,
        studentName: cert.studentName,
        cpf: maskCpf(cert.cpf),
        trailName: cert.trailName,
        language: cert.language ? (LANG_LABEL[cert.language] ?? cert.language) : null,
        workloadHours: cert.workloadHours,
        startedAt: cert.startedAt,
        completedAt: cert.completedAt,
        issuedAt: cert.issuedAt,
    };
}

const longDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
});
const shortDate = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" });

const INK = "#1f2430";
const ACCENT = "#4f46e5";
const GRAY = "#6b7280";

export async function buildCertificatePdf(code: string, userId: string) {
    const [cert] = await db.select().from(certificates).where(eq(certificates.code, code));
    if (!cert) {
        throw new AppError(404, "Certificado não encontrado");
    }
    if (cert.userId !== userId) {
        throw new AppError(403, "Só o dono do certificado pode baixar o PDF.");
    }

    const moduleRows = await db
        .select({ id: modules.id, title: modules.title })
        .from(modules)
        .where(eq(modules.trailId, cert.trailId))
        .orderBy(asc(modules.position));
    const trailLessons = await db
        .select({ moduleId: lessons.moduleId, title: lessons.title, language: lessons.language })
        .from(lessons)
        .where(and(eq(lessons.trailId, cert.trailId), eq(lessons.published, true)))
        .orderBy(asc(lessons.position));
    const trackLessons = trailLessons.filter(
        (a) => a.language === null || a.language === cert.language,
    );

    const validationUrl = `${env.FRONTEND_URL}/certificados/${cert.code}`;
    const qr = await QRCode.toBuffer(validationUrl, { type: "png", margin: 1, width: 220 });

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const W = doc.page.width;
    const H = doc.page.height;

    // ---- Front ----
    doc.rect(0, 0, W, H).fill("#ffffff");
    doc.lineWidth(2)
        .strokeColor(ACCENT)
        .rect(24, 24, W - 48, H - 48)
        .stroke();
    doc.lineWidth(0.7)
        .strokeColor(GRAY)
        .rect(30, 30, W - 60, H - 60)
        .stroke();

    doc.font("Helvetica-Bold").fontSize(20).fillColor(ACCENT);
    doc.text("Ensina Dev", 0, 64, { width: W, align: "center" });
    doc.font("Helvetica").fontSize(11).fillColor(GRAY);
    doc.text("CERTIFICADO DE CONCLUSÃO", 0, 92, {
        width: W,
        align: "center",
        characterSpacing: 3,
    });

    doc.fontSize(12).fillColor(INK);
    doc.text("Certificamos que", 0, 200, { width: W, align: "center" });
    doc.font("Helvetica-Bold").fontSize(28);
    doc.text(cert.studentName, 60, 224, { width: W - 120, align: "center" });
    doc.font("Helvetica").fontSize(10).fillColor(GRAY);
    doc.text(`CPF ${formatCpf(cert.cpf)}`, 0, doc.y + 4, { width: W, align: "center" });

    const languageText = cert.language
        ? ` na linguagem ${LANG_LABEL[cert.language] ?? cert.language}`
        : "";
    doc.fontSize(13).fillColor(INK);
    doc.text(
        `concluiu o curso livre ${cert.trailName}${languageText}, na modalidade a distância, ` +
            `com carga horária de ${cert.workloadHours} horas, realizado no período de ` +
            `${shortDate.format(cert.startedAt)} a ${shortDate.format(cert.completedAt)}.`,
        130,
        doc.y + 22,
        { width: W - 260, align: "center", lineGap: 4 },
    );

    const baseY = H - 150;
    doc.moveTo(100, baseY + 42)
        .lineTo(370, baseY + 42)
        .lineWidth(0.8)
        .strokeColor(INK)
        .stroke();
    doc.font("Helvetica-Bold").fontSize(11).fillColor(INK);
    doc.text(env.CERT_RESPONSAVEL ?? "", 100, baseY + 48, { width: 270, align: "center" });
    doc.font("Helvetica").fontSize(8.5).fillColor(GRAY);
    doc.text(env.CERT_RAZAO_SOCIAL ?? "", 100, doc.y + 3, { width: 270, align: "center" });
    doc.text(`CNPJ ${env.CERT_CNPJ ?? ""}`, 100, doc.y + 2, { width: 270, align: "center" });

    doc.image(qr, W - 210, baseY - 4, { width: 84 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(INK);
    doc.text(cert.code, W - 226, baseY + 84, { width: 116, align: "center" });
    doc.font("Helvetica").fontSize(7.5).fillColor(GRAY);
    doc.text("Valide a autenticidade em", W - 226, baseY + 96, { width: 116, align: "center" });
    doc.text(`${env.FRONTEND_URL.replace(/^https?:\/\//, "")}/certificados`, W - 246, baseY + 106, {
        width: 156,
        align: "center",
    });

    doc.fontSize(9).fillColor(GRAY);
    doc.text(`Emitido em ${longDate.format(cert.issuedAt)}.`, 0, H - 52, {
        width: W,
        align: "center",
    });

    // ---- Back: syllabus ----
    doc.addPage({ size: "A4", layout: "landscape", margin: 0 });
    doc.lineWidth(0.7)
        .strokeColor(GRAY)
        .rect(30, 30, W - 60, H - 60)
        .stroke();
    doc.font("Helvetica-Bold").fontSize(14).fillColor(INK);
    doc.text("Conteúdo programático", 0, 52, { width: W, align: "center" });
    doc.font("Helvetica").fontSize(10).fillColor(GRAY);
    doc.text(`${cert.trailName} · ${cert.workloadHours} horas · ${cert.code}`, 0, 72, {
        width: W,
        align: "center",
    });

    const columns = [
        { x: 60, y: 104 },
        { x: W / 2 + 20, y: 104 },
    ];
    const columnWidth = W / 2 - 90;
    const maxY = H - 56;
    let col = 0;
    const measure = (text: string, font: string, size: number) => {
        doc.font(font).fontSize(size);
        return doc.heightOfString(text, { width: columnWidth });
    };
    const advanceIfNeeded = (neededHeight: number) => {
        if (columns[col].y + neededHeight <= maxY) return;
        if (col === 0) {
            col = 1;
        } else {
            doc.addPage({ size: "A4", layout: "landscape", margin: 0 });
            doc.lineWidth(0.7)
                .strokeColor(GRAY)
                .rect(30, 30, W - 60, H - 60)
                .stroke();
            col = 0;
            columns[0] = { x: 60, y: 56 };
            columns[1] = { x: W / 2 + 20, y: 56 };
        }
    };
    const write = (text: string, font: string, size: number, color: string, gap: number) => {
        const height = measure(text, font, size);
        advanceIfNeeded(height);
        doc.font(font).fontSize(size).fillColor(color);
        doc.text(text, columns[col].x, columns[col].y, { width: columnWidth });
        columns[col].y += height + gap;
    };
    for (const m of moduleRows) {
        const moduleLessons = trackLessons.filter((a) => a.moduleId === m.id);
        if (moduleLessons.length === 0) continue;
        // The module title never sits alone at the bottom of a column: it moves down with its first lesson.
        advanceIfNeeded(
            measure(m.title, "Helvetica-Bold", 10) +
                3 +
                measure(`•  ${moduleLessons[0].title}`, "Helvetica", 9),
        );
        write(m.title, "Helvetica-Bold", 10, INK, 3);
        for (const a of moduleLessons) {
            write(`•  ${a.title}`, "Helvetica", 9, "#374151", 2);
        }
        columns[col].y += 6;
    }

    doc.end();
    return { doc, filename: `certificado-${cert.code}.pdf` };
}
