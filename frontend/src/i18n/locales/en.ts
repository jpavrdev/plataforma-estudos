import type { ptBR } from './pt-BR';

// English catalog. The type makes it follow the Portuguese one key by key.
export const en: typeof ptBR = {
  languageToggle: {
    label: 'Switch the language to Portuguese',
  },

  common: {
    saving: 'Saving...',
    sending: 'Sending...',
  },

  auth: {
    socialDivider: 'or continue with',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    email: 'Email',
    emailPlaceholder: 'you@email.com',
    newPassword: 'New password',
    backToLogin: 'Back to sign in',
  },

  profileFields: {
    username: 'Username',
    usernamePlaceholder: 'your_username',
    birthDate: 'Date of birth',
    birthDatePlaceholder: 'dd/mm/yyyy',
    gender: 'Gender',
    genderPlaceholder: 'Select',
    genders: {
      feminino: 'Female',
      masculino: 'Male',
      outro: 'Other',
      prefiro_nao_dizer: 'Prefer not to say',
    },
    phone: 'Phone',
    errors: {
      usernameTooShort: 'The username needs at least {{min}} characters',
      usernameTooLong: 'The username can have at most {{max}} characters',
      usernameChars: 'Use only letters, numbers and underscores',
      birthDateRequired: 'Enter your date of birth',
      birthDateInvalid: 'Invalid date',
      genderRequired: 'Select a gender',
      phoneRequired: 'Enter your phone number',
      phoneInvalid: 'Invalid phone number',
    },
  },

  register: {
    brandTitle: 'Start your dev journey today.',
    brandLede: 'Create your free account and unlock a new challenge every day.',
    benefits: {
      daily: 'A new challenge every day',
      streak: 'Keep your streak and earn XP',
      ranking: 'Climb the global ranking',
      progress: 'Follow your progress by track',
    },
    socialProof: 'Join <b>12,482</b> devs<br/>learning right now.',
    title: 'Create your account',
    subtitle: 'It takes less than a minute.',
    name: 'Name',
    namePlaceholder: 'Your name',
    password: 'Password',
    passwordPlaceholder: 'at least {{min}} characters',
    passwordRules: {
      length: 'At least {{min}} characters',
      upper: 'An uppercase letter',
      lower: 'A lowercase letter',
      digit: 'A number',
      special: 'A special character',
    },
    errors: {
      name: 'The name needs at least 2 characters',
      email: 'Invalid email',
      password: 'The password does not meet every requirement',
      generic: 'Could not create the account. Try again.',
    },
    accountCreated: 'Account created. Check your email to activate access.',
    submit: 'Create a free account',
    submitting: 'Creating account...',
    terms:
      'By creating the account, you agree to the <terms>Terms</terms> and the <privacy>Privacy Policy</privacy>.',
    haveAccount: 'Already have an account?',
    signIn: 'Sign in',
  },

  forgotPassword: {
    kicker: '<soft>no </soft>stress',
    headline: 'Get your access back',
    lede: 'We send a 6-digit code by email or WhatsApp so you can create a new password in seconds.',
    title: 'Forgot your password?',
    chooseChannel: 'How do you want to receive the 6-digit code?',
    viaWhatsApp: 'Send it on WhatsApp',
    viaEmail: 'Send it by email',
    remembered: 'Remembered your password?',
    enterCodeWhatsApp: 'Enter the code we sent you on WhatsApp and your new password.',
    enterCodeEmail: 'Enter the code we sent you by email and your new password.',
    code: 'Code (6 digits)',
    resetting: 'Resetting...',
    submit: 'Reset password',
    otherChannel: 'Did not get it? Choose another channel',
    done: 'Password reset. You can sign in now.',
    errors: {
      sendCode: 'Could not send the code. Try again.',
      reset: 'Could not reset the password. Check the code and the password.',
    },
  },

  resetPassword: {
    kicker: '<soft>almost </soft>there',
    headline: 'Create a new password',
    lede: 'Choose a strong password and get back to studying. The link is valid for 1 hour.',
    invalidTitle: 'Invalid link',
    invalidText: 'The reset link is incomplete or has expired.',
    requestNew: 'Request a new link',
    doneTitle: 'Password reset!',
    doneText: 'You can now sign in with your new password.',
    goToLogin: 'Go to sign in',
    title: 'Create a new password',
    subtitle: 'Choose a strong password for your account.',
    hint: 'At least 12 characters, with uppercase, lowercase, a number and a symbol.',
    confirmPassword: 'Confirm password',
    submit: 'Reset password',
    errors: {
      mismatch: 'The passwords do not match.',
      generic: 'Could not reset the password. The link may have expired.',
    },
  },

  completeProfile: {
    brandTitle: 'Almost ready to start.',
    brandLede: 'Complete your sign-up to follow your progress and climb the ranking.',
    verified: 'Your account is already verified',
    title: 'Almost there',
    subtitle: 'Just a few details left to complete your profile.',
    submit: 'Finish',
    leaveQuestion: 'Not ready to continue?',
    leave: 'Sign out and go back home',
    errors: {
      generic: 'Could not save. Try again.',
    },
  },

  landing: {
    nav: {
      features: 'Features',
      tracks: 'Tracks',
      howItWorks: 'How it works',
    },
    signIn: 'Sign in',
    startFree: 'Start for free',
    hero: {
      badge: 'A new challenge every day',
      title: 'Learn to code by solving <highlight>one challenge</highlight> a day.',
      lede: 'Ensina Dev turns learning to code into a habit. Daily challenges, guided tracks, certification practice exams and a ranking to keep you going, from zero to your first job.',
      createAccount: 'Create a free account',
      seeHow: 'See how it works',
      proof: '<strong>{{students}} students</strong> already study at Ensina Dev',
      proofFallback: 'Start today, for free',
      screenshotAlt:
        'A challenge screen at Ensina Dev: the statement on the left, the code editor on the right and the tests passing',
    },
    technologies: {
      eyebrow: 'What you learn here',
      more: 'and {{tracks}} more tracks, from programming logic to machine learning',
      moreFallback: 'and many other tracks, from programming logic to machine learning',
    },
    stats: {
      students: 'students',
      lessons: 'published lessons',
      challenges: 'coding challenges',
      exams: 'certification practice exams',
    },
    lab: {
      eyebrow: 'A real lab',
      title: 'A whole Linux inside the lesson, and it is all yours.',
      lede: 'In the Linux lessons you do not read about commands: you type them. A real Debian starts on the spot, with <code>sudo</code> allowed, and vanishes when you are done. Breaking things there costs nothing, because the machine is yours and disposable.',
      noInstall: 'Nothing to install, no virtual machine, no dual boot',
      realPermissions: 'A real permission denied, and sudo really fixing it',
      lessons: 'Available in 20 lessons, from the command line to bash',
      caption:
        'A Linux terminal inside a lesson: the command fails with permission denied and then works with sudo',
    },
    features: {
      eyebrow: 'Why Ensina Dev',
      title: 'Built to make coding a habit',
      subtitle: 'Everything you need to leave theory behind and practice for real, every day.',
      dailyChallenge: {
        title: 'Challenge of the day',
        text: 'A new problem every day, solved in the platform editor. Your tests run on the spot and you earn XP the first time they pass.',
      },
      streak: {
        title: 'A streak that keeps the habit',
        text: 'Every day of study keeps your streak alive. It is the daily reminder that consistency beats marathons.',
      },
      ranking: {
        title: 'Ranking and leagues',
        text: 'Your XP places you among the other students and moves you up the leagues, from Bronze to Diamond.',
      },
      tracks: {
        title: 'Guided tracks',
        text: 'From programming logic to Kubernetes, with lessons, examples and quizzes. No skipped steps and no getting lost in the order.',
      },
      exams: {
        title: 'Certification practice exams',
        text: 'Timed exams in the official format, for AWS, Azure and more. When you miss one, you see the step-by-step solution.',
      },
      progress: {
        title: 'Progress you can see',
        text: 'Yearly activity map, XP per track, achievements and a weekly goal. Your growth in numbers, not in feelings.',
      },
    },
    progress: {
      eyebrow: 'Your growth',
      title: 'Consistency you can see, not just feel.',
      lede: 'Every day of study becomes a square on the yearly map. Earn XP, keep the streak and follow your mastery of each track. It is the dashboard that shows whether you are really moving forward or just feeling productive.',
      activityMap: 'Activity map for the whole year',
      xp: 'XP per track, achievements and a weekly goal',
      leagues: 'Ranking with leagues, from Bronze to Diamond',
      screenshotAlt:
        'Ensina Dev progress dashboard with total XP, weekly goal, yearly activity map, mastery per track and recent achievements',
    },
    steps: {
      eyebrow: 'How it works',
      title: 'Start in 3 steps',
      signUp: {
        title: 'Create your free account',
        text: 'It takes less than a minute. No credit card, no hassle.',
      },
      choose: {
        title: 'Choose where to start',
        text: 'Follow a career roadmap, a specific track or go straight to the challenge of the day.',
      },
      comeBack: {
        title: 'Come back tomorrow',
        text: 'Keep the streak, collect XP and watch yourself climb the ranking.',
      },
    },
    community: {
      eyebrow: 'Who is already here',
      sentence:
        'Ensina Dev students have already solved <strong>{{exercises}}</strong> exercises and completed <strong>{{lessons}}</strong> lessons.',
    },
    cta: {
      title: 'Your next challenge starts today.',
      text: 'Create your free account, solve the challenge of the day and start your streak right now.',
      button: 'Create a free account',
      note: 'No credit card. Start in seconds.',
    },
    footer: {
      tagline: '{{lessons}} lessons and {{questions}} questions to practice coding every day.',
      taglineFallback: 'Learn to code by solving one challenge a day.',
      platform: 'Platform',
      account: 'Account',
      signIn: 'Sign in',
      createAccount: 'Create account',
      recoverPassword: 'Recover password',
      legal: 'Legal',
      terms: 'Terms of Use',
      privacy: 'Privacy Policy',
      rights: '© {{year}} Ensina Dev. All rights reserved.',
    },
  },
};
