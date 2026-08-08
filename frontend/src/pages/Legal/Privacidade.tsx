import { useSeo } from '../../hooks/useSeo';
import { CONTATO_LEGAL } from '../../data/legal';
import { LegalShell } from './LegalShell';

export function Privacidade() {
  useSeo();

  return (
    <LegalShell
      titulo="Política de Privacidade"
      resumo="Que dados o Ensina Dev coleta, por que coleta cada um, com quem compartilha e como você pede para apagar."
      irmao={{ to: '/termos', label: 'Ler os Termos de Uso' }}
    >
      <h2>1. Quem é o responsável pelos seus dados</h2>
      <p>
        O Ensina Dev é uma plataforma gratuita de estudos de programação. Somos o controlador dos
        dados pessoais tratados aqui, nos termos da Lei 13.709/2018 (LGPD). Para qualquer assunto
        relacionado a esta política, incluindo o exercício dos seus direitos, o canal é{' '}
        <a className="link" href={`mailto:${CONTATO_LEGAL}`}>
          {CONTATO_LEGAL}
        </a>
        .
      </p>

      <h2>2. Que dados coletamos</h2>

      <h3>2.1. O que você informa</h3>
      <ul>
        <li>
          <strong>Para criar a conta:</strong> nome, email, nome de usuário, data de nascimento e
          senha. A senha nunca é guardada como você digitou: gravamos apenas um hash, e nem nós
          conseguimos ler a original.
        </li>
        <li>
          <strong>Se você entra pelo Google ou pelo GitHub:</strong> recebemos do provedor o seu
          nome, email e foto de perfil. Não recebemos e não temos acesso à sua senha desses
          serviços.
        </li>
        <li>
          <strong>No perfil, tudo opcional:</strong> foto, capa, biografia, telefone, gênero,
          localização, ocupação, idiomas e os links do seu GitHub, LinkedIn e X.
        </li>
        <li>
          <strong>Ao emitir um certificado:</strong> nome completo e CPF. Eles são impressos no
          documento e usados na página pública de validação, que existe para um terceiro conferir a
          autenticidade do certificado que você apresentar.
        </li>
        <li>
          <strong>Ao apoiar o projeto:</strong> os dados que o gateway de pagamento exige para gerar
          a cobrança Pix. Não vemos, não recebemos e não guardamos número de cartão, senha do banco
          ou credencial financeira.
        </li>
        <li>
          <strong>Ao analisar um currículo:</strong> o arquivo que você envia e a descrição da vaga.
          Veja a seção 5, que trata desse caso separadamente.
        </li>
      </ul>

      <h3>2.2. O que nasce do seu uso</h3>
      <ul>
        <li>
          Aulas concluídas, respostas dos quizzes, XP, ofensiva, conquistas e posição no ranking.
        </li>
        <li>Tentativas de simulado, com as respostas e o resultado de cada uma.</li>
        <li>O código que você envia nos desafios e nos projetos, junto do resultado dos testes.</li>
        <li>
          As revisões em cartões, incluindo quanto tempo você levou para responder cada carta. Esse
          tempo alimenta as estatísticas da sua tela de revisão e o cálculo de quando a carta volta.
        </li>
        <li>Seus posts, comentários, curtidas e quem você segue na comunidade.</li>
      </ul>

      <h3>2.3. Dados técnicos</h3>
      <p>
        Como qualquer site, nosso servidor registra em log informações da conexão, como endereço IP,
        data, hora e navegador. Isso serve para segurança e diagnóstico de falhas, e é a única
        finalidade desse registro.
      </p>

      <h2>3. Por que usamos cada dado</h2>
      <p>
        A LGPD exige que todo tratamento tenha uma base legal. As nossas são estas, e nada é usado
        para finalidade diferente da que está listada:
      </p>
      <ul>
        <li>
          <strong>Manter sua conta e entregar o que a plataforma promete</strong> (aulas, progresso,
          certificado, ranking, comunidade): execução de contrato, art. 7, V.
        </li>
        <li>
          <strong>Emitir e validar certificados</strong> com nome e CPF: execução de contrato, art.
          7, V. Sem essa identificação o certificado não teria valor de comprovação.
        </li>
        <li>
          <strong>Processar o apoio financeiro</strong> e guardar o registro da cobrança: execução
          de contrato e cumprimento de obrigação legal e fiscal, art. 7, II e V.
        </li>
        <li>
          <strong>Analisar seu currículo</strong>: consentimento, art. 7, I. Você escolhe enviar, e
          nada acontece sem esse envio.
        </li>
        <li>
          <strong>Enviar código de verificação por WhatsApp</strong>: consentimento, art. 7, I. Só
          usamos se você tiver cadastrado um telefone e escolhido esse canal.
        </li>
        <li>
          <strong>Enviar emails da plataforma</strong> (verificação de email, recuperação de senha):
          execução de contrato, art. 7, V.
        </li>
        <li>
          <strong>Proteger a plataforma</strong>, bloquear tentativas de invasão e investigar abuso:
          legítimo interesse, art. 7, IX.
        </li>
      </ul>
      <p>
        Não vendemos seus dados, não fazemos publicidade e não usamos seu comportamento na
        plataforma para montar perfis comerciais.
      </p>

      <h2>4. Com quem compartilhamos</h2>
      <p>
        Compartilhamos o mínimo necessário, e apenas com quem executa uma função concreta da
        plataforma:
      </p>
      <ul>
        <li>
          <strong>Google e GitHub:</strong> se você optar pelo login social, para autenticar você.
        </li>
        <li>
          <strong>Gateway de pagamento (AbacatePay):</strong> para gerar e confirmar a cobrança Pix
          do apoio.
        </li>
        <li>
          <strong>Provedor de IA (DeepSeek):</strong> recebe o texto do currículo e a vaga durante a
          análise. Detalhado na seção 5.
        </li>
        <li>
          <strong>Provedor de email:</strong> recebe seu endereço para entregar as mensagens da
          plataforma.
        </li>
        <li>
          <strong>Provedor de envio por WhatsApp:</strong> recebe seu número quando você pede o
          código por esse canal.
        </li>
        <li>
          <strong>Autoridades:</strong> quando houver ordem judicial ou obrigação legal, e apenas na
          extensão exigida.
        </li>
      </ul>
      <p>
        Parte desses serviços está fora do Brasil, o que caracteriza transferência internacional de
        dados (art. 33 da LGPD). É o caso do provedor de IA usado na análise de currículo. Ao usar
        essa funcionalidade específica, você concorda com essa transferência.
      </p>

      <h2>5. Análise de currículo e inteligência artificial</h2>
      <p>
        Essa funcionalidade merece uma seção própria porque currículo é o dado mais sensível que
        passa por aqui. O que acontece quando você usa:
      </p>
      <ul>
        <li>Você envia o arquivo e, se quiser, a descrição de uma vaga.</li>
        <li>
          Extraímos o texto e enviamos para o provedor de IA, que devolve a leitura qualitativa. A
          nota é calculada pelo nosso próprio código, não pela IA.
        </li>
        <li>
          <strong>Nem o arquivo nem o texto extraído são guardados.</strong> Do resultado, ficam
          salvos apenas a pontuação, as palavras-chave encontradas e as sugestões de melhoria, para
          você reabrir a análise depois.
        </li>
        <li>
          Se você prefere não enviar nada para fora, simplesmente não use essa funcionalidade. Todo
          o resto da plataforma funciona sem ela.
        </li>
      </ul>

      <h2>6. Cookies e armazenamento no navegador</h2>
      <p>
        Não usamos cookies de publicidade, de rastreamento ou de análise de audiência. Não há Google
        Analytics nem ferramenta equivalente na plataforma. O que usamos:
      </p>
      <ul>
        <li>
          <strong>Um cookie essencial</strong> chamado refreshToken, que mantém você conectado. Ele
          é httpOnly, ou seja, nem o JavaScript da própria página consegue ler.
        </li>
        <li>
          <strong>Armazenamento local do navegador</strong> para guardar seu token de sessão, suas
          preferências de tema e o andamento de uma revisão em curso, de modo que atualizar a página
          não recomece a sessão.
        </li>
      </ul>
      <p>Sair da conta limpa esse armazenamento.</p>

      <h2>7. O que fica público</h2>
      <p>
        Seu perfil é público no endereço ensinadev.com.br seguido do seu nome de usuário. Ficam
        visíveis para qualquer pessoa: seu nome, nome de usuário, foto, capa, biografia, links
        sociais, XP, conquistas, trilhas concluídas e sua posição no ranking. Seus posts e
        comentários na comunidade também são públicos.
      </p>
      <p>
        Não são públicos, em nenhuma hipótese: seu email, telefone, data de nascimento, CPF, o
        conteúdo do seu currículo e suas análises.
      </p>

      <h2>8. Por quanto tempo guardamos</h2>
      <ul>
        <li>Dados da conta e do seu progresso: enquanto a conta existir.</li>
        <li>
          Após o pedido de exclusão: apagamos os dados, exceto o que a lei manda reter, como os
          registros de acesso exigidos pelo Marco Civil da Internet e os registros fiscais de
          pagamentos recebidos.
        </li>
        <li>Currículos enviados: descartados logo após a análise, como explicado na seção 5.</li>
        <li>
          Certificados já emitidos: mantidos enquanto forem válidos, porque a página de validação
          precisa continuar respondendo a quem for conferir.
        </li>
      </ul>

      <h2>9. Segurança</h2>
      <p>
        Senhas são guardadas com algoritmo de hash próprio para senhas, e não em texto legível. Todo
        o tráfego entre o seu navegador e a plataforma é criptografado. A conta é bloqueada
        temporariamente após várias tentativas de login erradas. O código que você envia nos
        desafios roda em ambiente isolado, sem acesso à rede nem aos dados de outros usuários.
      </p>
      <p>
        Nenhum sistema é imune. Se acontecer um incidente que possa gerar risco relevante para você,
        vamos comunicar você e a Autoridade Nacional de Proteção de Dados, como manda o art. 48 da
        LGPD.
      </p>

      <h2>10. Seus direitos</h2>
      <p>O art. 18 da LGPD garante a você, sobre os seus dados, o direito de:</p>
      <ul>
        <li>confirmar que existe tratamento e acessar os dados;</li>
        <li>corrigir dados incompletos, inexatos ou desatualizados;</li>
        <li>pedir anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
        <li>pedir a portabilidade dos dados;</li>
        <li>pedir a eliminação dos dados tratados com base no seu consentimento;</li>
        <li>saber com quem compartilhamos seus dados;</li>
        <li>revogar o consentimento a qualquer momento.</li>
      </ul>
      <p>
        Boa parte disso você resolve sozinho na tela de configurações, editando ou apagando o que
        quiser do perfil. Para exclusão da conta inteira, exportação dos seus dados ou qualquer
        pedido que a tela não cubra, escreva para{' '}
        <a className="link" href={`mailto:${CONTATO_LEGAL}`}>
          {CONTATO_LEGAL}
        </a>
        . Respondemos em até 15 dias.
      </p>
      <p>
        Você também pode reclamar diretamente à Autoridade Nacional de Proteção de Dados, pelo site
        gov.br/anpd.
      </p>

      <h2>11. Menores de idade</h2>
      <p>
        A plataforma é aberta a adolescentes, e boa parte de quem estuda aqui está começando cedo.
        Quem tem menos de 16 anos precisa de autorização dos pais ou responsáveis para criar conta.
        Se identificarmos conta de criança menor de 12 anos sem consentimento de um responsável, ela
        será removida. Responsáveis podem pedir acesso ou exclusão dos dados pelo email de contato.
      </p>

      <h2>12. Mudanças nesta política</h2>
      <p>
        Se esta política mudar, a data no topo muda junto. Quando a alteração for relevante, como um
        novo tipo de dado coletado ou um novo terceiro envolvido, avisamos na própria plataforma
        antes de a mudança valer.
      </p>

      <h2>13. Contato</h2>
      <p>
        Dúvida, pedido ou reclamação sobre privacidade:{' '}
        <a className="link" href={`mailto:${CONTATO_LEGAL}`}>
          {CONTATO_LEGAL}
        </a>
        .
      </p>
    </LegalShell>
  );
}
