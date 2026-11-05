// Portuguese catalog. It is the source language: every key starts here, and the
// English catalog has to follow the same shape (the type checks it).
export const ptBR = {
  languageToggle: {
    label: 'Mudar o idioma para inglês',
  },

  common: {
    saving: 'Salvando...',
    sending: 'Enviando...',
  },

  auth: {
    socialDivider: 'ou continue com',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
    email: 'E-mail',
    emailPlaceholder: 'voce@email.com',
    newPassword: 'Nova senha',
    backToLogin: 'Voltar ao login',
  },

  profileFields: {
    username: 'Nome de usuário',
    usernamePlaceholder: 'seu_usuario',
    birthDate: 'Data de nascimento',
    birthDatePlaceholder: 'dd/mm/aaaa',
    gender: 'Gênero',
    genderPlaceholder: 'Selecione',
    genders: {
      feminino: 'Feminino',
      masculino: 'Masculino',
      outro: 'Outro',
      prefiro_nao_dizer: 'Prefiro não dizer',
    },
    phone: 'Telefone',
    errors: {
      usernameTooShort: 'Usuário deve ter ao menos {{min}} caracteres',
      usernameTooLong: 'Usuário deve ter no máximo {{max}} caracteres',
      usernameChars: 'Use apenas letras, números e underscore',
      birthDateRequired: 'Informe sua data de nascimento',
      birthDateInvalid: 'Data inválida',
      genderRequired: 'Selecione o gênero',
      phoneRequired: 'Informe seu telefone',
      phoneInvalid: 'Telefone inválido',
    },
  },

  register: {
    brandTitle: 'Comece sua jornada dev hoje.',
    brandLede: 'Crie sua conta gratuita e desbloqueie um novo desafio a cada dia.',
    benefits: {
      daily: 'Um desafio novo todos os dias',
      streak: 'Mantenha seu streak e ganhe XP',
      ranking: 'Suba no ranking global',
      progress: 'Acompanhe seu progresso por trilhas',
    },
    socialProof: 'Junte-se a <b>12.482</b> devs<br/>aprendendo agora.',
    title: 'Crie sua conta',
    subtitle: 'Leva menos de um minuto.',
    name: 'Nome',
    namePlaceholder: 'Seu nome',
    password: 'Senha',
    passwordPlaceholder: 'mínimo {{min}} caracteres',
    passwordRules: {
      length: 'Ao menos {{min}} caracteres',
      upper: 'Uma letra maiúscula',
      lower: 'Uma letra minúscula',
      digit: 'Um número',
      special: 'Um caractere especial',
    },
    errors: {
      name: 'Nome deve ter ao menos 2 caracteres',
      email: 'Email inválido',
      password: 'A senha não cumpre todos os requisitos',
      generic: 'Erro ao criar conta. Tente novamente.',
    },
    accountCreated: 'Conta criada. Verifique seu email para ativar o acesso.',
    submit: 'Criar conta grátis',
    submitting: 'Criando conta...',
    terms:
      'Ao criar a conta, você concorda com os <terms>Termos</terms> e a <privacy>Política de Privacidade</privacy>.',
    haveAccount: 'Já tem conta?',
    signIn: 'Entrar',
  },

  forgotPassword: {
    kicker: '<soft>sem </soft>estresse',
    headline: 'Recupere seu acesso',
    lede: 'Enviamos um código de 6 dígitos por email ou WhatsApp para você criar uma nova senha em segundos.',
    title: 'Esqueceu a senha?',
    chooseChannel: 'Como você quer receber o código de 6 dígitos?',
    viaWhatsApp: 'Receber no WhatsApp',
    viaEmail: 'Receber por email',
    remembered: 'Lembrou a senha?',
    enterCodeWhatsApp: 'Digite o código que enviamos no WhatsApp e a nova senha.',
    enterCodeEmail: 'Digite o código que enviamos por email e a nova senha.',
    code: 'Código (6 dígitos)',
    resetting: 'Redefinindo...',
    submit: 'Redefinir senha',
    otherChannel: 'Não recebeu? Escolher outro canal',
    done: 'Senha redefinida com sucesso. Você já pode fazer login.',
    errors: {
      sendCode: 'Não foi possível enviar o código. Tente novamente.',
      reset: 'Não foi possível redefinir a senha. Confira o código e a senha.',
    },
  },

  resetPassword: {
    kicker: '<soft>quase </soft>lá',
    headline: 'Crie uma nova senha',
    lede: 'Escolha uma senha forte e volte a estudar. O link é válido por 1 hora.',
    invalidTitle: 'Link inválido',
    invalidText: 'O link de redefinição está incompleto ou expirou.',
    requestNew: 'Pedir um novo link',
    doneTitle: 'Senha redefinida!',
    doneText: 'Já pode entrar com a sua nova senha.',
    goToLogin: 'Ir para o login',
    title: 'Criar nova senha',
    subtitle: 'Escolha uma senha forte para a sua conta.',
    hint: 'Mínimo 12 caracteres, com maiúscula, minúscula, número e símbolo.',
    confirmPassword: 'Confirmar senha',
    submit: 'Redefinir senha',
    errors: {
      mismatch: 'As senhas não coincidem.',
      generic: 'Não foi possível redefinir. O link pode ter expirado.',
    },
  },

  completeProfile: {
    brandTitle: 'Falta pouco para começar.',
    brandLede: 'Complete seu cadastro para acompanhar seu progresso e subir no ranking.',
    verified: 'Sua conta já está verificada',
    title: 'Quase lá',
    subtitle: 'Só faltam alguns dados para completar seu perfil.',
    submit: 'Concluir',
    leaveQuestion: 'Não quer continuar agora?',
    leave: 'Sair e voltar ao início',
    errors: {
      generic: 'Não foi possível salvar. Tente novamente.',
    },
  },

  landing: {
    nav: {
      features: 'Recursos',
      tracks: 'Trilhas',
      howItWorks: 'Como funciona',
    },
    signIn: 'Entrar',
    startFree: 'Começar grátis',
    hero: {
      badge: 'Um novo desafio todo dia',
      title: 'Aprenda a programar resolvendo <highlight>um desafio</highlight> por dia.',
      lede: 'O Ensina Dev transforma o aprendizado de programação em hábito. Desafios diários, trilhas guiadas, simulados de certificação e um ranking para te manter no ritmo, do zero à sua primeira vaga.',
      createAccount: 'Criar conta grátis',
      seeHow: 'Ver como funciona',
      proof: '<strong>{{students}} alunos</strong> já estudam no Ensina Dev',
      proofFallback: 'Comece hoje, de graça',
      screenshotAlt:
        'Tela de um desafio no Ensina Dev: enunciado à esquerda, editor de código à direita e o resultado dos testes aprovado',
    },
    technologies: {
      eyebrow: 'O que você aprende aqui',
      more: 'e mais {{tracks}} trilhas, de lógica de programação a machine learning',
      moreFallback: 'e muitas outras trilhas, de lógica de programação a machine learning',
    },
    stats: {
      students: 'alunos',
      lessons: 'aulas publicadas',
      challenges: 'desafios de código',
      exams: 'simulados de certificação',
    },
    lab: {
      eyebrow: 'Laboratório de verdade',
      title: 'Um Linux inteiro dentro da aula, e ele é só seu.',
      lede: 'Nas aulas de Linux você não lê sobre comando: você digita. Um Debian de verdade sobe na hora, com <code>sudo</code> liberado, e some quando você termina. Errar ali não quebra nada, porque a máquina é sua e é descartável.',
      noInstall: 'Sem instalar nada, sem máquina virtual, sem dual boot',
      realPermissions: 'Permissão negada de verdade, e o sudo resolvendo de verdade',
      lessons: 'Disponível em 20 aulas, da linha de comando ao bash',
      caption:
        'Terminal Linux dentro de uma aula: o comando falha com permissão negada e depois funciona com sudo',
    },
    features: {
      eyebrow: 'Por que Ensina Dev',
      title: 'Feito para criar o hábito de programar',
      subtitle: 'Tudo o que você precisa para sair da teoria e praticar de verdade, todos os dias.',
      dailyChallenge: {
        title: 'Desafio do dia',
        text: 'Um problema novo a cada dia, resolvido no editor da própria plataforma. Roda seus testes na hora e conta XP na primeira vez que passa.',
      },
      streak: {
        title: 'Streak que segura o hábito',
        text: 'Cada dia de estudo mantém sua sequência viva. É o lembrete diário de que constância vale mais do que maratona.',
      },
      ranking: {
        title: 'Ranking e ligas',
        text: 'Seu XP te posiciona entre os outros estudantes e sobe as ligas, de Bronze até Diamante.',
      },
      tracks: {
        title: 'Trilhas guiadas',
        text: 'Da lógica de programação ao Kubernetes, com aula, exemplo e quiz. Sem pular etapa e sem se perder na ordem.',
      },
      exams: {
        title: 'Simulados de certificação',
        text: 'Provas cronometradas no formato oficial, para AWS, Azure e mais. Ao errar, você vê a resolução passo a passo.',
      },
      progress: {
        title: 'Progresso que dá para ver',
        text: 'Mapa de atividade do ano, XP por trilha, conquistas e meta semanal. Sua evolução em números, não em sensação.',
      },
    },
    progress: {
      eyebrow: 'Sua evolução',
      title: 'Constância que dá para ver, não para sentir.',
      lede: 'Cada dia de estudo vira um quadrado no mapa do ano. Some XP, mantenha o streak e acompanhe o domínio de cada trilha. É o painel que mostra se você está mesmo avançando ou só se sentindo produtivo.',
      activityMap: 'Mapa de atividade do ano inteiro',
      xp: 'XP por trilha, conquistas e meta semanal',
      leagues: 'Ranking com ligas, de Bronze até Diamante',
      screenshotAlt:
        'Painel de progresso do Ensina Dev com XP total, meta semanal, mapa de atividade do ano, domínio por trilha e conquistas recentes',
    },
    steps: {
      eyebrow: 'Como funciona',
      title: 'Comece em 3 passos',
      signUp: {
        title: 'Crie sua conta grátis',
        text: 'Leva menos de um minuto. Sem cartão de crédito, sem complicação.',
      },
      choose: {
        title: 'Escolha por onde começar',
        text: 'Siga um roadmap de carreira, uma trilha específica ou vá direto no desafio do dia.',
      },
      comeBack: {
        title: 'Volte amanhã',
        text: 'Mantenha o streak, junte XP e acompanhe a evolução subindo no ranking.',
      },
    },
    community: {
      eyebrow: 'Quem já está aqui',
      sentence:
        'Os alunos do Ensina Dev já resolveram <strong>{{exercises}}</strong> exercícios e concluíram <strong>{{lessons}}</strong> aulas.',
    },
    cta: {
      title: 'Seu próximo desafio começa hoje.',
      text: 'Crie sua conta grátis, resolva o desafio do dia e comece seu streak agora mesmo.',
      button: 'Criar conta grátis',
      note: 'Sem cartão de crédito. Comece em segundos.',
    },
    footer: {
      tagline:
        '{{lessons}} aulas e {{questions}} questões para você praticar programação todo dia.',
      taglineFallback: 'Aprenda a programar resolvendo um desafio por dia.',
      platform: 'Plataforma',
      account: 'Conta',
      signIn: 'Entrar',
      createAccount: 'Criar conta',
      recoverPassword: 'Recuperar senha',
      legal: 'Legal',
      terms: 'Termos de Uso',
      privacy: 'Política de Privacidade',
      rights: '© {{year}} Ensina Dev. Todos os direitos reservados.',
    },
  },
};
