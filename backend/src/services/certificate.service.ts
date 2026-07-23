import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../../db.ts";
import { certificates, lessonProgress, lessons, modules, trails, users } from "../../schema.ts";
import { AppError } from "../errors/AppError.ts";
import { env } from "../config/env.ts";

const LANG_LABEL: Record<string, string> = { javascript: "JavaScript", python: "Python" };

function emissorConfigurado() {
    return Boolean(env.CERT_RAZAO_SOCIAL && env.CERT_CNPJ && env.CERT_RESPONSAVEL);
}

function formatarCpf(cpf: string) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function mascararCpf(cpf: string) {
    return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
}

// Sem 0/O/1/I/L para o código poder ser ditado por telefone sem ambiguidade.
const ALFABETO_CODIGO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function gerarCodigo() {
    const bytes = crypto.randomBytes(12);
    let s = "";
    for (let i = 0; i < 12; i++) {
        s += ALFABETO_CODIGO[bytes[i] % ALFABETO_CODIGO.length];
    }
    return `ED-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

type ConclusaoReal = { language: string | null; startedAt: Date; completedAt: Date };

// Conclusão de verdade: todas as aulas publicadas (neutras + um track completo) sem a marca manual.
async function conclusaoReal(trailId: string, userId: string): Promise<ConclusaoReal | null> {
    const aulas = await db
        .select({ id: lessons.id, language: lessons.language })
        .from(lessons)
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)));
    if (aulas.length === 0) return null;

    const progresso = await db
        .select({ lessonId: lessonProgress.lessonId, completedAt: lessonProgress.completedAt })
        .from(lessonProgress)
        .where(
            and(
                eq(lessonProgress.userId, userId),
                eq(lessonProgress.manual, false),
                inArray(
                    lessonProgress.lessonId,
                    aulas.map((a) => a.id),
                ),
            ),
        );
    const feitas = new Map(progresso.map((p) => [p.lessonId, p.completedAt]));

    const neutras = aulas.filter((a) => a.language === null);
    if (!neutras.every((a) => feitas.has(a.id))) return null;

    const languages = [...new Set(aulas.map((a) => a.language).filter((l): l is string => !!l))];
    let track: string | null = null;
    if (languages.length > 0) {
        track =
            languages.find((l) =>
                aulas.filter((a) => a.language === l).every((a) => feitas.has(a.id)),
            ) ?? null;
        if (!track) return null;
    }

    const consideradas = aulas.filter((a) => a.language === null || a.language === track);
    const datas = consideradas
        .map((a) => feitas.get(a.id))
        .filter((d): d is Date => d instanceof Date)
        .map((d) => d.getTime());
    return {
        language: track,
        startedAt: new Date(Math.min(...datas)),
        completedAt: new Date(Math.max(...datas)),
    };
}

async function temSoConclusaoManual(trailId: string, userId: string) {
    const aulas = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.trailId, trailId), eq(lessons.published, true)));
    if (aulas.length === 0) return false;
    const total = await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(
            and(
                eq(lessonProgress.userId, userId),
                inArray(
                    lessonProgress.lessonId,
                    aulas.map((a) => a.id),
                ),
            ),
        );
    return total.length === aulas.length;
}

export async function statusCertificado(trailId: string, userId: string) {
    const [trilha] = await db.select().from(trails).where(eq(trails.id, trailId));
    if (!trilha) {
        throw new AppError(404, "Trilha não encontrada");
    }

    const [existente] = await db
        .select({ code: certificates.code, issuedAt: certificates.issuedAt })
        .from(certificates)
        .where(and(eq(certificates.userId, userId), eq(certificates.trailId, trailId)));
    if (existente) {
        return { emitido: existente, elegivel: false };
    }

    if (!emissorConfigurado()) return { emitido: null, elegivel: false, motivo: "indisponivel" };
    if (!trilha.workloadHours) return { emitido: null, elegivel: false, motivo: "carga_horaria" };

    const conclusao = await conclusaoReal(trailId, userId);
    if (!conclusao) {
        const motivo = (await temSoConclusaoManual(trailId, userId)) ? "manual" : "progresso";
        return { emitido: null, elegivel: false, motivo };
    }
    return { emitido: null, elegivel: true };
}

export async function emitirCertificado(trailId: string, userId: string, cpf: string) {
    const [trilha] = await db.select().from(trails).where(eq(trails.id, trailId));
    if (!trilha) {
        throw new AppError(404, "Trilha não encontrada");
    }
    if (!emissorConfigurado()) {
        throw new AppError(503, "A emissão de certificados ainda não está disponível.");
    }
    if (!trilha.workloadHours) {
        throw new AppError(409, "Esta trilha ainda não emite certificado.");
    }

    const [existente] = await db
        .select()
        .from(certificates)
        .where(and(eq(certificates.userId, userId), eq(certificates.trailId, trailId)));
    if (existente) return existente;

    const conclusao = await conclusaoReal(trailId, userId);
    if (!conclusao) {
        if (await temSoConclusaoManual(trailId, userId)) {
            throw new AppError(
                409,
                "O certificado só sai com as aulas concluídas de verdade, passando nos quizzes.",
            );
        }
        throw new AppError(409, "Conclua todas as aulas da trilha para emitir o certificado.");
    }

    const [usuario] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, userId));

    for (let tentativa = 0; tentativa < 5; tentativa++) {
        const [criado] = await db
            .insert(certificates)
            .values({
                code: gerarCodigo(),
                userId,
                trailId,
                studentName: usuario.name,
                cpf,
                trailName: trilha.name,
                workloadHours: trilha.workloadHours,
                language: conclusao.language,
                startedAt: conclusao.startedAt,
                completedAt: conclusao.completedAt,
            })
            .onConflictDoNothing({ target: certificates.code })
            .returning();
        if (criado) return criado;
        // Corrida na unique (userId, trailId): outra requisição emitiu antes.
        const [corrida] = await db
            .select()
            .from(certificates)
            .where(and(eq(certificates.userId, userId), eq(certificates.trailId, trailId)));
        if (corrida) return corrida;
    }
    throw new AppError(500, "Não foi possível gerar o código do certificado.");
}

export async function validarCertificado(code: string) {
    const [cert] = await db.select().from(certificates).where(eq(certificates.code, code));
    if (!cert) {
        throw new AppError(404, "Certificado não encontrado");
    }
    return {
        code: cert.code,
        studentName: cert.studentName,
        cpf: mascararCpf(cert.cpf),
        trailName: cert.trailName,
        language: cert.language ? (LANG_LABEL[cert.language] ?? cert.language) : null,
        workloadHours: cert.workloadHours,
        startedAt: cert.startedAt,
        completedAt: cert.completedAt,
        issuedAt: cert.issuedAt,
    };
}

const dataLonga = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
});
const dataCurta = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" });

const TINTA = "#1f2430";
const ACENTO = "#4f46e5";
const CINZA = "#6b7280";

export async function pdfCertificado(code: string) {
    const [cert] = await db.select().from(certificates).where(eq(certificates.code, code));
    if (!cert) {
        throw new AppError(404, "Certificado não encontrado");
    }

    const mods = await db
        .select({ id: modules.id, title: modules.title })
        .from(modules)
        .where(eq(modules.trailId, cert.trailId))
        .orderBy(asc(modules.position));
    const aulas = await db
        .select({ moduleId: lessons.moduleId, title: lessons.title, language: lessons.language })
        .from(lessons)
        .where(and(eq(lessons.trailId, cert.trailId), eq(lessons.published, true)))
        .orderBy(asc(lessons.position));
    const doTrack = aulas.filter((a) => a.language === null || a.language === cert.language);

    const urlValidacao = `${env.FRONTEND_URL}/certificados/${cert.code}`;
    const qr = await QRCode.toBuffer(urlValidacao, { type: "png", margin: 1, width: 220 });

    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const W = doc.page.width;
    const H = doc.page.height;

    // ---- Frente ----
    doc.rect(0, 0, W, H).fill("#ffffff");
    doc.lineWidth(2).strokeColor(ACENTO).rect(24, 24, W - 48, H - 48).stroke();
    doc.lineWidth(0.7).strokeColor(CINZA).rect(30, 30, W - 60, H - 60).stroke();

    doc.font("Helvetica-Bold").fontSize(20).fillColor(ACENTO);
    doc.text("ensina.dev", 0, 64, { width: W, align: "center" });
    doc.font("Helvetica").fontSize(11).fillColor(CINZA);
    doc.text("CERTIFICADO DE CONCLUSÃO", 0, 92, {
        width: W,
        align: "center",
        characterSpacing: 3,
    });

    doc.fontSize(12).fillColor(TINTA);
    doc.text("Certificamos que", 0, 200, { width: W, align: "center" });
    doc.font("Helvetica-Bold").fontSize(28);
    doc.text(cert.studentName, 60, 224, { width: W - 120, align: "center" });
    doc.font("Helvetica").fontSize(10).fillColor(CINZA);
    doc.text(`CPF ${formatarCpf(cert.cpf)}`, 0, doc.y + 4, { width: W, align: "center" });

    const linguagem = cert.language
        ? ` na linguagem ${LANG_LABEL[cert.language] ?? cert.language}`
        : "";
    doc.fontSize(13).fillColor(TINTA);
    doc.text(
        `concluiu o curso livre ${cert.trailName}${linguagem}, na modalidade a distância, ` +
            `com carga horária de ${cert.workloadHours} horas, realizado no período de ` +
            `${dataCurta.format(cert.startedAt)} a ${dataCurta.format(cert.completedAt)}.`,
        130,
        doc.y + 22,
        { width: W - 260, align: "center", lineGap: 4 },
    );

    const yBase = H - 150;
    doc.moveTo(120, yBase + 42).lineTo(340, yBase + 42).lineWidth(0.8).strokeColor(TINTA).stroke();
    doc.font("Helvetica-Bold").fontSize(11).fillColor(TINTA);
    doc.text(env.CERT_RESPONSAVEL ?? "", 120, yBase + 48, { width: 220, align: "center" });
    doc.font("Helvetica").fontSize(9).fillColor(CINZA);
    doc.text(env.CERT_RAZAO_SOCIAL ?? "", 120, yBase + 62, { width: 220, align: "center" });
    doc.text(`CNPJ ${env.CERT_CNPJ ?? ""}`, 120, yBase + 74, { width: 220, align: "center" });

    doc.image(qr, W - 210, yBase - 4, { width: 84 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(TINTA);
    doc.text(cert.code, W - 226, yBase + 84, { width: 116, align: "center" });
    doc.font("Helvetica").fontSize(7.5).fillColor(CINZA);
    doc.text("Valide a autenticidade em", W - 226, yBase + 96, { width: 116, align: "center" });
    doc.text(`${env.FRONTEND_URL.replace(/^https?:\/\//, "")}/certificados`, W - 246, yBase + 106, {
        width: 156,
        align: "center",
    });

    doc.fontSize(9).fillColor(CINZA);
    doc.text(`Emitido em ${dataLonga.format(cert.issuedAt)}.`, 0, H - 52, {
        width: W,
        align: "center",
    });

    // ---- Verso: conteúdo programático ----
    doc.addPage({ size: "A4", layout: "landscape", margin: 0 });
    doc.lineWidth(0.7).strokeColor(CINZA).rect(30, 30, W - 60, H - 60).stroke();
    doc.font("Helvetica-Bold").fontSize(14).fillColor(TINTA);
    doc.text("Conteúdo programático", 0, 52, { width: W, align: "center" });
    doc.font("Helvetica").fontSize(10).fillColor(CINZA);
    doc.text(`${cert.trailName} · ${cert.workloadHours} horas · ${cert.code}`, 0, 72, {
        width: W,
        align: "center",
    });

    const colunas = [
        { x: 60, y: 104 },
        { x: W / 2 + 20, y: 104 },
    ];
    const larguraCol = W / 2 - 90;
    const limiteY = H - 56;
    let col = 0;
    const medir = (texto: string, fonte: string, tamanho: number) => {
        doc.font(fonte).fontSize(tamanho);
        return doc.heightOfString(texto, { width: larguraCol });
    };
    const avancarSePreciso = (alturaNecessaria: number) => {
        if (colunas[col].y + alturaNecessaria <= limiteY) return;
        if (col === 0) {
            col = 1;
        } else {
            doc.addPage({ size: "A4", layout: "landscape", margin: 0 });
            doc.lineWidth(0.7).strokeColor(CINZA).rect(30, 30, W - 60, H - 60).stroke();
            col = 0;
            colunas[0] = { x: 60, y: 56 };
            colunas[1] = { x: W / 2 + 20, y: 56 };
        }
    };
    const escrever = (texto: string, fonte: string, tamanho: number, cor: string, gap: number) => {
        const altura = medir(texto, fonte, tamanho);
        avancarSePreciso(altura);
        doc.font(fonte).fontSize(tamanho).fillColor(cor);
        doc.text(texto, colunas[col].x, colunas[col].y, { width: larguraCol });
        colunas[col].y += altura + gap;
    };
    for (const m of mods) {
        const doModulo = doTrack.filter((a) => a.moduleId === m.id);
        if (doModulo.length === 0) continue;
        // O título do módulo nunca fica sozinho no pé da coluna: desce junto com a 1ª aula.
        avancarSePreciso(
            medir(m.title, "Helvetica-Bold", 10) + 3 + medir(`•  ${doModulo[0].title}`, "Helvetica", 9),
        );
        escrever(m.title, "Helvetica-Bold", 10, TINTA, 3);
        for (const a of doModulo) {
            escrever(`•  ${a.title}`, "Helvetica", 9, "#374151", 2);
        }
        colunas[col].y += 6;
    }

    doc.end();
    return { doc, filename: `certificado-${cert.code}.pdf` };
}
