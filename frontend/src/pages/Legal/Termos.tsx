import { Link } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';
import { CONTATO_LEGAL } from '../../data/legal';
import { LegalShell } from './LegalShell';

export function Termos() {
  useSeo();

  return (
    <LegalShell
      titulo="Termos de Uso"
      resumo="As regras de uso do Ensina Dev: o que você pode esperar da plataforma e o que esperamos de você."
      irmao={{ to: '/privacidade', label: 'Ler a Política de Privacidade' }}
    >
      <h2>1. Aceite</h2>
      <p>
        Ao criar uma conta ou usar o Ensina Dev, você concorda com estes Termos e com a{' '}
        <Link className="link" to="/privacidade">
          Política de Privacidade
        </Link>
        . Se não concordar com algum ponto, não use a plataforma.
      </p>

      <h2>2. O que é o Ensina Dev</h2>
      <p>
        Uma plataforma de estudos de programação com trilhas de aulas, quizzes, desafios de código,
        simulados de certificação, projetos guiados e revisão em cartões. O acesso ao conteúdo é
        gratuito e não existe parte da plataforma trancada atrás de pagamento.
      </p>
      <p>
        O material é educacional. Fazemos o possível para mantê-lo correto e atualizado, mas ele não
        substitui documentação oficial, orientação profissional nem curso regulamentado.
      </p>

      <h2>3. Sua conta</h2>
      <ul>
        <li>Informe dados verdadeiros. Conta com identidade falsa pode ser removida.</li>
        <li>
          Você é responsável por manter sua senha em segredo e por tudo que acontecer na sua conta.
          Se desconfiar de acesso indevido, troque a senha e avise a gente.
        </li>
        <li>
          Uma pessoa, uma conta. Contas criadas para inflar ranking ou ofensiva são removidas.
        </li>
        <li>
          Menores de 16 anos precisam de autorização dos pais ou responsáveis para usar a
          plataforma.
        </li>
      </ul>

      <h2>4. Uso aceitável</h2>
      <p>Não é permitido:</p>
      <ul>
        <li>
          tentar burlar o progresso, o XP, a ofensiva, o ranking ou a emissão de certificados por
          qualquer meio automatizado;
        </li>
        <li>
          usar robôs, scripts ou raspagem para extrair conteúdo em massa, nem sobrecarregar a
          infraestrutura de propósito;
        </li>
        <li>
          tentar acessar contas, dados ou áreas administrativas que não são suas, ou explorar falhas
          de segurança em vez de reportá-las;
        </li>
        <li>
          publicar conteúdo ilegal, ofensivo, discriminatório, de assédio, spam ou propaganda;
        </li>
        <li>publicar dados pessoais de terceiros sem autorização.</li>
      </ul>
      <p>
        Encontrou uma falha de segurança? Escreva para{' '}
        <a className="link" href={`mailto:${CONTATO_LEGAL}`}>
          {CONTATO_LEGAL}
        </a>{' '}
        antes de divulgar. Reporte de boa-fé é bem-vindo e nunca vai gerar retaliação.
      </p>

      <h2>5. O que você publica</h2>
      <p>
        Posts, comentários, imagens e código enviados à comunidade continuam sendo seus. Você apenas
        nos autoriza a exibir, armazenar e distribuir esse conteúdo dentro da plataforma, para que
        ele apareça para os outros usuários. Você garante que tem o direito de publicar o que
        publica.
      </p>
      <p>
        Podemos remover conteúdo que viole estes Termos ou a lei. Conteúdo apagado por você sai da
        plataforma, ressalvadas cópias em backup, que expiram no ciclo normal de retenção.
      </p>

      <h2>6. Execução de código</h2>
      <p>
        Desafios e projetos executam o código que você envia em ambiente isolado, com tempo e
        recursos limitados. É proibido usar essa execução para minerar criptomoedas, atacar
        terceiros, varrer redes, hospedar serviços ou qualquer finalidade que não seja resolver o
        exercício. Tentativas nesse sentido levam à suspensão imediata da conta.
      </p>

      <h2>7. Certificados</h2>
      <p>
        Ao concluir uma trilha você pode emitir um certificado de conclusão, com seu nome, seu CPF,
        a carga horária e um código público de validação. Ele comprova que você concluiu aquela
        trilha aqui dentro, e nada além disso.
      </p>
      <p>
        <strong>
          O certificado não é diploma, não é curso técnico ou superior e não tem reconhecimento do
          MEC.
        </strong>{' '}
        É um comprovante de estudo livre, útil para portfólio e para o currículo.
      </p>
      <p>
        Certificado emitido com dados falsos, ou obtido burlando o progresso, é cancelado, e a
        página de validação passa a informar isso.
      </p>

      <h2>8. Apoio ao projeto</h2>
      <p>
        O apoio é voluntário e serve para custear a infraestrutura. Ele não desbloqueia conteúdo,
        porque não existe conteúdo bloqueado: o que ele dá são benefícios visuais na sua conta, como
        cor de destaque e imagem de fundo personalizadas, além do selo de apoiador.
      </p>
      <ul>
        <li>
          As cobranças são feitas por Pix, através de um gateway de pagamento. O valor e a duração
          de cada plano aparecem na tela de apoio antes da confirmação.
        </li>
        <li>
          O apoio pontual não renova sozinho. Se você escolher a modalidade recorrente, pode
          cancelar quando quiser, e o período já pago continua valendo até o fim.
        </li>
        <li>
          Você tem 7 dias corridos, contados do pagamento, para desistir e pedir o valor de volta,
          conforme o art. 49 do Código de Defesa do Consumidor. Basta escrever para o email de
          contato.
        </li>
        <li>
          Se a plataforma for descontinuada, apoios com período em aberto são devolvidos
          proporcionalmente.
        </li>
      </ul>

      <h2>9. Conteúdo da plataforma</h2>
      <p>
        As aulas, questões, desafios, a marca e o design do Ensina Dev pertencem ao projeto e aos
        seus autores. Você pode estudar, imprimir e compartilhar links à vontade. Republicar o
        material como se fosse seu, vender o conteúdo ou usá-lo para treinar modelos comerciais sem
        autorização não é permitido.
      </p>

      <h2>10. Disponibilidade</h2>
      <p>
        A plataforma é oferecida como está. Não prometemos funcionamento ininterrupto: pode haver
        manutenção, instabilidade e falha. Funcionalidades podem mudar ou ser descontinuadas, e
        quando isso afetar algo que você já usa, avisamos com antecedência razoável.
      </p>

      <h2>11. Suspensão e encerramento</h2>
      <p>
        Podemos suspender ou encerrar contas que violem estes Termos, e nesses casos explicamos o
        motivo por email. Você pode encerrar sua conta quando quiser, pelo email de contato, o que
        também apaga seus dados nos limites descritos na Política de Privacidade.
      </p>

      <h2>12. Limitação de responsabilidade</h2>
      <p>
        O Ensina Dev não responde por decisões de carreira, contratações, reprovações em provas de
        certificação ou prejuízos decorrentes do uso do conteúdo. Nada aqui afasta os direitos que a
        legislação brasileira, em especial o Código de Defesa do Consumidor, garante a você.
      </p>

      <h2>13. Mudanças nestes Termos</h2>
      <p>
        Quando estes Termos mudarem, a data no topo muda junto, e alterações relevantes são avisadas
        na plataforma. Continuar usando depois disso significa que você aceitou a nova versão.
      </p>

      <h2>14. Lei aplicável</h2>
      <p>
        Estes Termos são regidos pela lei brasileira. Fica eleito o foro do domicílio do usuário
        para resolver qualquer controvérsia.
      </p>

      <h2>15. Contato</h2>
      <p>
        Qualquer dúvida sobre estes Termos:{' '}
        <a className="link" href={`mailto:${CONTATO_LEGAL}`}>
          {CONTATO_LEGAL}
        </a>
        .
      </p>
    </LegalShell>
  );
}
