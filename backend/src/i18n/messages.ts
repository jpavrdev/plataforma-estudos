import { DEFAULT_LOCALE, type Locale } from "./locale.ts";

// Every message the API sends to people, in both languages. Placeholders use
// {name} and must be the same in both texts. A Portuguese text that changes must
// change here too: until each area moves to keys, the bridge below finds the key
// by the exact pt-BR text the code still sends.
type Entry = { "pt-BR": string; en: string; aliases?: string[] };

export const MESSAGES = {
    // ---------------------------------------------------------------- common
    "common.invalidData": { "pt-BR": "Dados inválidos", en: "Invalid data" },
    "common.internalError": { "pt-BR": "Erro interno do servidor", en: "Internal server error" },
    "common.fileTooLarge": { "pt-BR": "Arquivo muito grande", en: "File too large" },
    "common.invalidRequest": { "pt-BR": "Requisição inválida", en: "Invalid request" },
    "common.notFound": { "pt-BR": "Não encontrado", en: "Not found" },
    "common.notAuthenticated": {
        "pt-BR": "Não autenticado",
        en: "Not authenticated",
        aliases: ["Nao autenticado"],
    },
    "common.unauthorized": { "pt-BR": "Não autorizado", en: "Unauthorized" },
    "common.accessCheckFailed": {
        "pt-BR": "Erro ao verificar acesso",
        en: "Could not check access",
    },
    "common.nothingToUpdate": { "pt-BR": "Nada para atualizar", en: "Nothing to update" },
    "common.slugFromNameFailed": {
        "pt-BR": "Não foi possível gerar um slug a partir do nome",
        en: "Could not generate a slug from the name",
    },

    // ---------------------------------------------------------------- auth
    "auth.invalidCredentials": { "pt-BR": "Credenciais inválidas", en: "Invalid credentials" },
    "auth.verifyEmailFirst": {
        "pt-BR": "Verifique seu email antes de entrar",
        en: "Verify your email before signing in",
    },
    "auth.tooManyAttempts": {
        "pt-BR": "Muitas tentativas. Tente novamente mais tarde.",
        en: "Too many attempts. Try again later.",
    },
    "auth.usernameTaken": {
        "pt-BR": "Esse nome de usuário já está em uso",
        en: "This username is already taken",
    },
    "auth.emailTaken": { "pt-BR": "Este email já está em uso", en: "This email is already in use" },
    "auth.emailAlreadyRegistered": {
        "pt-BR": "Email já cadastrado",
        en: "Email already registered",
    },
    "auth.accountCreated": {
        "pt-BR": "Conta criada. Verifique seu email para ativar o acesso.",
        en: "Account created. Check your email to activate access.",
    },
    "auth.emailVerified": {
        "pt-BR": "Email verificado com sucesso. Você já pode fazer login.",
        en: "Email verified. You can sign in now.",
    },
    "auth.passwordReset": {
        "pt-BR": "Senha redefinida com sucesso. Você já pode fazer login.",
        en: "Password reset. You can sign in now.",
    },
    "auth.resetLinkSent": {
        "pt-BR": "Se houver uma conta com esse email, enviamos um link para redefinir a senha.",
        en: "If there is an account with this email, we sent a link to reset the password.",
    },
    "auth.resetCodeSent": {
        "pt-BR": "Se houver uma conta com esse email, enviamos um código para redefinir a senha.",
        en: "If there is an account with this email, we sent a code to reset the password.",
    },
    "auth.verificationResent": {
        "pt-BR": "Se houver uma conta pendente de confirmação com esse email, reenviamos o link.",
        en: "If there is an account pending confirmation with this email, we sent the link again.",
    },
    "auth.invalidLink": {
        "pt-BR": "Link inválido ou expirado. Peça um novo.",
        en: "Invalid or expired link. Request a new one.",
    },
    "auth.invalidCode": {
        "pt-BR": "Código inválido ou expirado. Peça um novo.",
        en: "Invalid or expired code. Request a new one.",
    },
    "auth.invalidRefreshToken": {
        "pt-BR": "Refresh token inválido",
        en: "Invalid refresh token",
    },
    "auth.missingToken": { "pt-BR": "Token não fornecido", en: "Token not provided" },
    "auth.invalidToken": { "pt-BR": "Token inválido", en: "Invalid token" },
    "auth.notAdmin": { "pt-BR": "Usuário não é administrador", en: "User is not an administrator" },
    "auth.wrongCurrentPassword": {
        "pt-BR": "Senha atual incorreta.",
        en: "Wrong current password.",
    },
    "auth.invalidSession": {
        "pt-BR": "Sessão inválida. Entre de novo.",
        en: "Invalid session. Sign in again.",
    },

    // ---------------------------------------------------------------- two-step verification
    "twoFactor.required": {
        "pt-BR":
            "Ative a verificação em duas etapas no seu perfil para usar as funções de administrador.",
        en: "Turn on two-step verification in your profile to use the admin features.",
    },
    "twoFactor.sessionNotVerified": {
        "pt-BR":
            "Entre de novo e confirme com o código do app autenticador para usar as funções de administrador.",
        en: "Sign in again and confirm with the authenticator app code to use the admin features.",
    },
    "twoFactor.challengeExpired": {
        "pt-BR": "O tempo para digitar o código acabou. Entre de novo.",
        en: "The time to enter the code is over. Sign in again.",
    },
    "twoFactor.wrongCode": { "pt-BR": "Código incorreto.", en: "Wrong code." },
    "twoFactor.wrongSetupCode": {
        "pt-BR":
            "Código incorreto. Confira se o horário do celular está certo e use o código atual.",
        en: "Wrong code. Check that your phone's clock is right and use the current code.",
    },
    "twoFactor.alreadyEnabled": {
        "pt-BR": "A verificação em duas etapas já está ativa.",
        en: "Two-step verification is already on.",
    },
    "twoFactor.alreadyEnabledSetup": {
        "pt-BR":
            "A verificação em duas etapas já está ativa. Desative antes de configurar de novo.",
        en: "Two-step verification is already on. Turn it off before setting it up again.",
    },
    "twoFactor.notEnabled": {
        "pt-BR": "A verificação em duas etapas não está ativa.",
        en: "Two-step verification is not on.",
    },
    "twoFactor.restartSetup": {
        "pt-BR": "Comece a configuração de novo.",
        en: "Start the setup again.",
    },
    "twoFactor.setupChanged": {
        "pt-BR": "A configuração mudou no meio do caminho.",
        en: "The setup changed midway.",
    },

    // ---------------------------------------------------------------- rate limits
    "rateLimit.api": {
        "pt-BR": "Muitas requisições em pouco tempo. Aguarde um instante.",
        en: "Too many requests in a short time. Wait a moment.",
    },
    "rateLimit.generic": {
        "pt-BR": "Muitas requisições. Tente novamente em alguns minutos.",
        en: "Too many requests. Try again in a few minutes.",
    },
    "rateLimit.attempts": {
        "pt-BR": "Muitas tentativas. Tente novamente em alguns minutos.",
        en: "Too many attempts. Try again in a few minutes.",
    },
    "rateLimit.login": {
        "pt-BR": "Muitas tentativas de login. Tente novamente em alguns minutos.",
        en: "Too many sign-in attempts. Try again in a few minutes.",
    },
    "rateLimit.register": {
        "pt-BR": "Muitas tentativas de cadastro. Tente novamente em alguns minutos.",
        en: "Too many sign-up attempts. Try again in a few minutes.",
    },
    "rateLimit.verification": {
        "pt-BR": "Muitos pedidos de verificação. Tente novamente em alguns minutos.",
        en: "Too many verification requests. Try again in a few minutes.",
    },
    "rateLimit.passwordReset": {
        "pt-BR": "Muitos pedidos de redefinição. Tente novamente em alguns minutos.",
        en: "Too many reset requests. Try again in a few minutes.",
    },
    "rateLimit.codes": {
        "pt-BR": "Muitos pedidos de código. Tente novamente em alguns minutos.",
        en: "Too many code requests. Try again in a few minutes.",
    },
    "rateLimit.twoFactor": {
        "pt-BR": "Muitas tentativas de código. Tente novamente em alguns minutos.",
        en: "Too many code attempts. Try again in a few minutes.",
    },
    "rateLimit.uploads": {
        "pt-BR": "Muitos envios de imagem. Aguarde alguns minutos.",
        en: "Too many image uploads. Wait a few minutes.",
    },
    "rateLimit.labs": {
        "pt-BR": "Muitas aberturas de laboratório seguidas. Aguarde alguns minutos.",
        en: "Too many lab openings in a row. Wait a few minutes.",
    },
    "rateLimit.runs": {
        "pt-BR": "Muitas execuções seguidas. Aguarde um instante e tente de novo.",
        en: "Too many runs in a row. Wait a moment and try again.",
    },
    "rateLimit.resume": {
        "pt-BR": "Muitas análises seguidas. Aguarde alguns minutos.",
        en: "Too many analyses in a row. Wait a few minutes.",
    },
    "rateLimit.community": {
        "pt-BR": "Você está publicando rápido demais. Aguarde alguns minutos.",
        en: "You are posting too fast. Wait a few minutes.",
    },

    // ---------------------------------------------------------------- users and profile
    "user.notFound": { "pt-BR": "Usuário não encontrado", en: "User not found" },
    "profile.notFound": { "pt-BR": "Perfil não encontrado", en: "Profile not found" },
    "profile.invalidLanguage": {
        "pt-BR": "Linguagem inválida: {name}",
        en: "Invalid language: {name}",
    },
    "profile.usernameCooldown": {
        "pt-BR": "Você só poderá mudar o usuário novamente em {date}.",
        en: "You can change your username again on {date}.",
    },
    "profile.usePhoneSettings": {
        "pt-BR": "Para trocar o telefone, use a página de Perfil.",
        en: "To change your phone, use the Profile page.",
    },
    "profile.phoneRequired": {
        "pt-BR": "Cadastre um telefone antes de verificar.",
        en: "Add a phone number before verifying.",
    },
    "profile.phoneAlreadyVerified": {
        "pt-BR": "Este telefone já está verificado.",
        en: "This phone is already verified.",
    },
    "profile.codeCooldown": {
        "pt-BR": "Espere um pouco para pedir outro código: é um por minuto.",
        en: "Wait a little before asking for another code: one per minute.",
    },
    "profile.whatsappCodeSent": {
        "pt-BR": "Enviamos um código por WhatsApp para o seu telefone.",
        en: "We sent a code to your phone on WhatsApp.",
    },

    // ---------------------------------------------------------------- images
    "image.missing": { "pt-BR": "Imagem ausente", en: "Image missing" },
    "image.empty": { "pt-BR": "Imagem vazia", en: "Empty image" },
    "image.invalidFormat": { "pt-BR": "Formato de imagem invalido", en: "Invalid image format" },
    "image.unsupportedType": {
        "pt-BR": "Use uma imagem PNG, JPG ou WEBP",
        en: "Use a PNG, JPG or WEBP image",
    },
    "image.tooLarge": {
        "pt-BR": "Imagem muito grande (maximo {mb}MB)",
        en: "Image too large (maximum {mb}MB)",
    },

    // ---------------------------------------------------------------- support (apoio)
    "support.unavailable": {
        "pt-BR": "O apoio ainda não está disponível. Volte em breve!",
        en: "Support is not available yet. Come back soon!",
    },
    "support.pixAutoUnavailable": {
        "pt-BR": "O Pix Automático ainda não está disponível. Use o plano mensal ou anual.",
        en: "Automatic Pix is not available yet. Use the monthly or yearly plan.",
    },
    "support.tooManyCharges": {
        "pt-BR": "Muitas cobranças geradas. Aguarde um pouco e tente de novo.",
        en: "Too many charges generated. Wait a little and try again.",
    },
    "support.noActiveSubscription": {
        "pt-BR": "Você não tem uma assinatura ativa.",
        en: "You do not have an active subscription.",
    },
    "support.invalidSecret": { "pt-BR": "Segredo inválido", en: "Invalid secret" },
    "support.colorsForSupporters": {
        "pt-BR": "Cores personalizadas são um benefício de apoiador.",
        en: "Custom colors are a supporter benefit.",
    },
    "support.backgroundForSupporters": {
        "pt-BR": "Imagem de fundo é um benefício de apoiador.",
        en: "A background image is a supporter benefit.",
    },
    "payment.gatewayTimeout": {
        "pt-BR": "O gateway de pagamento não respondeu. Tente de novo em instantes.",
        en: "The payment gateway did not respond. Try again in a moment.",
    },

    // ---------------------------------------------------------------- tracks, lessons and quizzes
    "trail.notFound": { "pt-BR": "Trilha não encontrada", en: "Track not found" },
    "trail.publishedMustBeBoolean": {
        "pt-BR": "Campo 'published' deve ser booleano",
        en: "The 'published' field must be a boolean",
    },
    "trail.startBeforeReview": {
        "pt-BR": "Comece a trilha para poder avaliar",
        en: "Start the track to be able to rate it",
    },
    "module.notFound": { "pt-BR": "Módulo não encontrado", en: "Module not found" },
    "lesson.notFound": { "pt-BR": "Aula não encontrada", en: "Lesson not found" },
    "quiz.noQuestions": {
        "pt-BR": "Esta aula não tem questões",
        en: "This lesson has no questions",
    },
    "quiz.questionNotFound": { "pt-BR": "Questão não encontrada", en: "Question not found" },
    "quiz.noAnswerKey": { "pt-BR": "Questão sem gabarito", en: "Question without an answer key" },
    "quiz.answerAll": {
        "pt-BR": "Responda todas as questões da aula.",
        en: "Answer every question of the lesson.",
    },
    "book.noPublishedLessons": {
        "pt-BR": "Esta trilha ainda não tem aulas publicadas",
        en: "This track has no published lessons yet",
    },
    "studio.lessonNeedsQuestions": {
        "pt-BR": "Para publicar, a aula precisa de ao menos {min} questões.",
        en: "To publish, the lesson needs at least {min} questions.",
    },
    "studio.questionStatementTooShort": {
        "pt-BR": "Questão {n}: enunciado muito curto.",
        en: "Question {n}: statement too short.",
    },
    "studio.questionNeedsTwoOptions": {
        "pt-BR": "Questão {n}: precisa de ao menos 2 alternativas.",
        en: "Question {n}: needs at least 2 options.",
    },
    "studio.questionNeedsOneCorrect": {
        "pt-BR": "Questão {n}: marque exatamente uma alternativa correta.",
        en: "Question {n}: mark exactly one correct option.",
    },
    "tag.notFound": { "pt-BR": "Tag não encontrada", en: "Tag not found" },
    "tag.nameTaken": {
        "pt-BR": "Já existe uma tag com esse nome",
        en: "A tag with this name already exists",
    },
    "language.notFound": { "pt-BR": "Linguagem não encontrada", en: "Language not found" },
    "language.nameTaken": {
        "pt-BR": "Já existe uma linguagem com esse nome",
        en: "A language with this name already exists",
    },
    "glossary.termNotFound": { "pt-BR": "Termo não encontrado", en: "Term not found" },
    "glossary.termTaken": {
        "pt-BR": "Já existe um termo com esse nome",
        en: "A term with this name already exists",
    },
    "achievement.notFound": { "pt-BR": "Conquista não encontrada", en: "Achievement not found" },
    "achievement.nameTaken": {
        "pt-BR": "Já existe uma conquista com esse nome",
        en: "An achievement with this name already exists",
    },

    // ---------------------------------------------------------------- certificates
    "certificate.notFound": { "pt-BR": "Certificado não encontrado", en: "Certificate not found" },
    "certificate.unavailable": {
        "pt-BR": "A emissão de certificados ainda não está disponível.",
        en: "Certificate issuing is not available yet.",
    },
    "certificate.trailWithoutCertificate": {
        "pt-BR": "Esta trilha ainda não emite certificado.",
        en: "This track does not issue a certificate yet.",
    },
    "certificate.completeTrailFirst": {
        "pt-BR": "Conclua todas as aulas da trilha para emitir o certificado.",
        en: "Complete every lesson of the track to issue the certificate.",
    },
    "certificate.realCompletionRequired": {
        "pt-BR": "O certificado só sai com as aulas concluídas de verdade, passando nos quizzes.",
        en: "The certificate only comes with lessons actually completed, passing the quizzes.",
    },
    "certificate.codeFailed": {
        "pt-BR": "Não foi possível gerar o código do certificado.",
        en: "Could not generate the certificate code.",
    },
    "certificate.ownerOnly": {
        "pt-BR": "Só o dono do certificado pode baixar o PDF.",
        en: "Only the certificate owner can download the PDF.",
    },

    // ---------------------------------------------------------------- practice exams
    "practiceExam.notFound": { "pt-BR": "Simulado não encontrado", en: "Practice exam not found" },
    "practiceExam.slugTaken": {
        "pt-BR": "Já existe um simulado com esse slug",
        en: "A practice exam with this slug already exists",
    },
    "practiceExam.attemptNotFound": {
        "pt-BR": "Tentativa não encontrada",
        en: "Attempt not found",
    },
    "practiceExam.alreadySubmitted": {
        "pt-BR": "Simulado já enviado",
        en: "Practice exam already submitted",
    },
    "practiceExam.timeUp": { "pt-BR": "Tempo esgotado", en: "Time is up" },
    "practiceExam.questionNotInAttempt": {
        "pt-BR": "Questão não faz parte da tentativa",
        en: "The question is not part of the attempt",
    },
    "practiceExam.questionNotInExam": {
        "pt-BR": "Questão não pertence a este simulado",
        en: "The question does not belong to this practice exam",
    },
    "practiceExam.invalidOption": {
        "pt-BR": "Opção inválida para esta questão",
        en: "Invalid option for this question",
    },
    "practiceExam.notPracticeAttempt": {
        "pt-BR": "Esta tentativa não é do modo de prática",
        en: "This attempt is not in practice mode",
    },
    "practiceExam.answerBeforeChecking": {
        "pt-BR": "Responda a questão antes de conferir",
        en: "Answer the question before checking",
    },
    "practiceExam.noQuestions": {
        "pt-BR": "Simulado ainda não tem questões",
        en: "This practice exam has no questions yet",
    },
    "practiceExam.noQuestionsInTopics": {
        "pt-BR": "Nenhuma questão nos temas escolhidos",
        en: "No questions in the chosen topics",
    },
    "practiceExam.questionAlreadyChecked": {
        "pt-BR": "Questão já conferida",
        en: "Question already checked",
    },

    // ---------------------------------------------------------------- challenges and runner
    "challenge.notFound": { "pt-BR": "Desafio não encontrado", en: "Challenge not found" },
    "challenge.dateTaken": {
        "pt-BR": "Já existe um desafio nessa data",
        en: "There is already a challenge on this date",
    },
    "challenge.noExamples": {
        "pt-BR": "Este desafio não tem exemplos",
        en: "This challenge has no examples",
    },
    "challenge.noTestCases": {
        "pt-BR": "Este desafio ainda não tem casos de teste",
        en: "This challenge has no test cases yet",
    },
    "challenge.solveFirst": {
        "pt-BR": "Resolva o desafio para ver as soluções da comunidade",
        en: "Solve the challenge to see the community's solutions",
    },
    "challenge.ownCommentsOnly": {
        "pt-BR": "Você só pode excluir os próprios comentários",
        en: "You can only delete your own comments",
    },
    "runner.unavailable": {
        "pt-BR": "O executor de código está indisponível. Tente de novo em instantes.",
        en: "The code runner is unavailable. Try again in a moment.",
    },
    "runner.failed": {
        "pt-BR": "O executor de código falhou. Tente de novo.",
        en: "The code runner failed. Try again.",
    },
    "lab.unavailable": {
        "pt-BR": "O laboratório está indisponível. Tente de novo em instantes.",
        en: "The lab is unavailable. Try again in a moment.",
    },

    // ---------------------------------------------------------------- roadmaps
    "roadmap.notFound": { "pt-BR": "Roadmap não encontrado", en: "Roadmap not found" },
    "roadmap.slugTaken": {
        "pt-BR": "Já existe um roadmap com esse slug",
        en: "A roadmap with this slug already exists",
    },
    "roadmap.stageNotFound": { "pt-BR": "Estágio não encontrado", en: "Stage not found" },
    "roadmap.refNotFound": { "pt-BR": "Referência não encontrada", en: "Reference not found" },
    "roadmap.refContentMissing": {
        "pt-BR": "O conteúdo referenciado não existe",
        en: "The referenced content does not exist",
    },

    // ---------------------------------------------------------------- review and interviews
    "flashcard.notFound": { "pt-BR": "Cartão não encontrado.", en: "Card not found." },
    "flashcard.notInDeck": {
        "pt-BR": "Cartão não encontrado no seu baralho.",
        en: "Card not found in your deck.",
    },
    "flashcard.invalidSource": { "pt-BR": "Origem inválida.", en: "Invalid source." },
    "flashcard.invalidAnswer": { "pt-BR": "Resposta inválida.", en: "Invalid answer." },
    "interview.invalidLevel": { "pt-BR": "Nível inválido.", en: "Invalid level." },

    // ---------------------------------------------------------------- community
    "community.postNotFound": { "pt-BR": "Publicação não encontrada", en: "Post not found" },
    "community.commentNotFound": { "pt-BR": "Comentário não encontrado", en: "Comment not found" },
    "community.cannotFollowSelf": {
        "pt-BR": "Você não pode seguir a si mesmo.",
        en: "You cannot follow yourself.",
    },
    "community.imagesForSupporters": {
        "pt-BR": "Enviar imagens na comunidade é um benefício de apoiador.",
        en: "Posting images in the community is a supporter benefit.",
    },

    // ---------------------------------------------------------------- announcements
    "announcement.notFound": { "pt-BR": "Comunicado não encontrado", en: "Announcement not found" },
    "announcement.noAnswers": {
        "pt-BR": "Este comunicado não aceita resposta",
        en: "This announcement does not accept answers",
    },
    "announcement.alreadyAnswered": {
        "pt-BR": "Você já respondeu este comunicado",
        en: "You already answered this announcement",
    },

    // ---------------------------------------------------------------- raffles
    "raffle.notFound": { "pt-BR": "Sorteio não encontrado", en: "Raffle not found" },
    "raffle.periodTaken": {
        "pt-BR": "Já existe um sorteio nesse período",
        en: "There is already a raffle in this period",
    },
    "raffle.endBeforeStart": {
        "pt-BR": "O fim deve ser depois do início",
        en: "The end must be after the start",
    },
    "raffle.drawnNotEditable": {
        "pt-BR": "Um sorteio já feito não pode ser editado",
        en: "A raffle already drawn cannot be edited",
    },
    "raffle.signupClosed": {
        "pt-BR": "As inscrições deste sorteio estão fechadas",
        en: "Sign-ups for this raffle are closed",
    },
    "raffle.usernameRequired": {
        "pt-BR": "Complete o perfil com um @ para participar",
        en: "Complete your profile with a username to take part",
    },
    "raffle.alreadyEntered": {
        "pt-BR": "Você já está inscrito neste sorteio",
        en: "You are already signed up for this raffle",
    },
    "raffle.alreadyDrawn": {
        "pt-BR": "Este sorteio já foi feito",
        en: "This raffle has already been drawn",
    },
    "raffle.drawAfterEnd": {
        "pt-BR": "O sorteio só pode ser feito depois do fim das inscrições",
        en: "The draw can only happen after sign-ups close",
    },
    "raffle.noEntries": {
        "pt-BR": "Ninguém se inscreveu neste sorteio",
        en: "Nobody signed up for this raffle",
    },
    "raffle.secondaryContactChannel": {
        "pt-BR": "O contato secundário precisa ser de outro canal",
        en: "The secondary contact must use another channel",
    },

    // ---------------------------------------------------------------- resume analysis
    "resume.forSupporters": {
        "pt-BR": "A análise de currículo é um benefício de apoiador.",
        en: "Resume analysis is a supporter benefit.",
    },
    "resume.analysisNotFound": { "pt-BR": "Análise não encontrada.", en: "Analysis not found." },
    "resume.pdfRequired": {
        "pt-BR": "Envie o currículo em PDF.",
        en: "Send your resume as a PDF.",
    },
    "resume.notPdf": {
        "pt-BR": "O arquivo enviado não é um PDF.",
        en: "The uploaded file is not a PDF.",
    },
    "resume.pdfTooLarge": {
        "pt-BR": "O PDF passa de 5 MB. Exporte o currículo com menos imagens.",
        en: "The PDF is over 5 MB. Export your resume with fewer images.",
    },
    "resume.pdfWithoutText": {
        "pt-BR":
            "Esse PDF não tem texto selecionável (parece uma imagem ou um currículo escaneado). Exporte o currículo como PDF de texto e envie de novo.",
        en: "This PDF has no selectable text (it looks like an image or a scanned resume). Export your resume as a text PDF and send it again.",
    },
    "resume.pdfUnreadable": {
        "pt-BR": "Não conseguimos ler esse PDF. Confira se o arquivo não está corrompido.",
        en: "We could not read this PDF. Check that the file is not corrupted.",
    },
    "resume.jobDescriptionTooShort": {
        "pt-BR": "Cole a descrição da vaga inteira: com poucas linhas a análise não diz nada.",
        en: "Paste the whole job description: with only a few lines the analysis says nothing.",
    },
    "resume.jobDescriptionTooLong": {
        "pt-BR": "Essa descrição de vaga é longa demais. Cole só o texto da vaga.",
        en: "This job description is too long. Paste only the job text.",
    },
    "resume.monthlyLimit": {
        "pt-BR":
            "Você já fez {limit} análises nos últimos 30 dias. O limite volta conforme as análises antigas saem da janela.",
        en: "You have already run {limit} analyses in the last 30 days. The limit comes back as older analyses leave the window.",
    },
} satisfies Record<string, Entry>;

export type MessageKey = keyof typeof MESSAGES;
type Params = Record<string, string | number>;

const isKey = (value: string): value is MessageKey => Object.hasOwn(MESSAGES, value);

function fill(template: string, params: Params = {}) {
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
}

export function t(locale: Locale, key: MessageKey, params?: Params): string {
    return fill(MESSAGES[key][locale], params);
}

// --- Bridge for the areas that still send the Portuguese text --------------------

// Trailing spaces and a final period are inconsistent in the old texts
// ("Refresh token inválido", "Refresh token inválido.", "Refresh token inválido. ").
const normalize = (text: string) => text.trim().replace(/\.$/, "");

const keyByText = new Map<string, MessageKey>();
const patterns: { regex: RegExp; key: MessageKey; names: string[] }[] = [];

for (const [key, entry] of Object.entries(MESSAGES) as [MessageKey, Entry][]) {
    for (const text of [entry["pt-BR"], ...(entry.aliases ?? [])]) {
        const names = [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
        if (names.length === 0) {
            keyByText.set(normalize(text), key);
            continue;
        }
        const source = normalize(text)
            .split(/\{\w+\}/)
            .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("(.+?)");
        patterns.push({ regex: new RegExp(`^${source}$`), key, names });
    }
}

const reportedMissing = new Set<string>();

// Turns a message on its way out into the requested language: a key becomes its
// text, and a Portuguese text the code still sends is found through the catalog.
// pt-BR literals go out byte for byte as they came in.
export function translateMessage(locale: Locale, value: string): string {
    if (isKey(value)) return t(locale, value);
    if (locale === DEFAULT_LOCALE) return value;

    const normalized = normalize(value);
    const key = keyByText.get(normalized);
    if (key) return t(locale, key);
    for (const { regex, key: patternKey, names } of patterns) {
        const match = normalized.match(regex);
        if (match) {
            const params = Object.fromEntries(names.map((name, i) => [name, match[i + 1]]));
            return t(locale, patternKey, params);
        }
    }

    if (!reportedMissing.has(value)) {
        reportedMissing.add(value);
        console.warn(`[i18n] message without a ${locale} translation: ${value}`);
    }
    return value;
}
