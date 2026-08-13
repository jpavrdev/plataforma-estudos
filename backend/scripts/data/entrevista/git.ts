import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de Git.
 *
 * A pergunta sobre acrescentar algo esquecido a um commit que já está num PR veio de
 * uma entrevista real, com a redação preservada. O verso não para no amend: ele
 * cobre o caso em que o commit esquecido não é o último, e o force com lease, que é
 * a parte que costuma faltar na resposta.
 */
export const git: TopicoDeEntrevista = {
    slug: "git",
    nome: "Git",
    position: 5,
    perguntas: {
        estagio: [
            {
                frente: "O que é um commit?",
                verso: "Uma foto do projeto inteiro num instante, com autor, data, mensagem e o ponteiro para o commit anterior. É essa corrente de pais que forma o histórico. O identificador é um hash do conteúdo, então mudar qualquer coisa produz um commit diferente.",
            },
            {
                frente: "Qual a diferença entre a área de preparo e o diretório de trabalho?",
                verso: "O diretório de trabalho tem os arquivos como estão agora. A área de preparo guarda o que vai entrar no próximo commit. É ela que permite comitar parte das mudanças e deixar o resto para depois, em vez de mandar tudo de uma vez.",
            },
            {
                frente: "O que é um branch?",
                verso: "Um ponteiro móvel para um commit, que anda sozinho a cada commit novo. Criar um custa quase nada, porque não copia arquivo nenhum. É por isso que a prática comum é abrir um branch por tarefa, e não trabalhar direto no principal.",
            },
            {
                frente: "Qual a diferença entre fetch e pull?",
                verso: "O fetch traz o que existe no remoto e atualiza as referências, sem mexer no seu trabalho. O pull faz o fetch e ainda integra no branch atual, com merge ou rebase. Quando você quer só olhar o que chegou antes de decidir, fetch é o comando.",
            },
            {
                frente: "O que o .gitignore faz, e o que ele não faz?",
                verso: "Impede que arquivos ainda não rastreados apareçam como novidade e sejam comitados por acidente. Ele não remove o que já foi comitado: para isso é preciso tirar do rastreamento explicitamente. Segredo já comitado continua no histórico mesmo depois de apagado.",
            },
            {
                frente: "O que é um repositório remoto?",
                verso: "Uma cópia do repositório em outro lugar, tipicamente num serviço como o GitHub, referenciada por um apelido, normalmente origin. Cada pessoa tem o histórico completo local, e o remoto serve como ponto comum de encontro entre elas.",
            },
            {
                frente: "Para que serve o git status?",
                verso: "Mostrar em que branch você está, o que mudou e ainda não foi preparado, o que já está preparado, e se o branch está à frente ou atrás do remoto. É o comando que responde a pergunta mais importante antes de qualquer outra: em que estado eu estou?",
            },
            {
                frente: "O que acontece quando você faz um merge?",
                verso: "Git cria um commit novo com dois pais, juntando as duas linhas de trabalho e preservando o histórico das duas. Quando não há divergência, ele pode simplesmente avançar o ponteiro, sem criar commit, no que se chama avanço rápido.",
            },
            {
                frente: "O que é um conflito de merge e por que ele acontece?",
                verso: "Acontece quando os dois lados alteraram a mesma região do mesmo arquivo e o Git não tem como decidir qual vale. Ele marca o trecho no arquivo e para, esperando você escolher. Resolver é editar o arquivo, preparar e concluir o merge.",
            },
            {
                frente: "O que uma boa mensagem de commit precisa ter?",
                verso: "Uma primeira linha curta dizendo o que mudou, no imperativo, e um corpo explicando o porquê quando ele não é óbvio. O que mudou o diff já conta; o motivo, não. É isso que faz alguém entender a decisão meses depois.",
            },
            {
                frente: "Para que serve o git log?",
                verso: "Percorrer o histórico do branch atual, do mais recente para o mais antigo. Com formato reduzido cabe uma linha por commit, e com filtro por arquivo mostra só o que tocou aquele caminho. É a ferramenta para descobrir quando algo entrou e por quê.",
            },
            {
                frente: "O que o git diff mostra por padrão?",
                verso: "As mudanças do diretório de trabalho que ainda não foram preparadas. Com a opção de preparado, mostra o que já está pronto para o commit. Comparar dois commits ou dois branches também é o mesmo comando, passando as referências.",
            },
            {
                frente: "O que é o HEAD?",
                verso: "O ponteiro para onde você está agora, normalmente apontando para um branch, que por sua vez aponta para um commit. Quando você posiciona o HEAD direto num commit, sem branch, ele fica destacado, e commits feitos ali podem se perder.",
            },
            {
                frente: "Qual a diferença entre clone e init?",
                verso: "O clone copia um repositório existente, com histórico e configuração do remoto. O init cria um repositório vazio no diretório atual, sem remoto configurado. Depois do init, é preciso acrescentar o remoto manualmente para publicar.",
            },
            {
                frente: "Como você desfaria uma alteração que ainda não foi comitada?",
                verso: "Descartando o arquivo para o estado do último commit, com o comando de restauração. Se a alteração já estava preparada, primeiro se tira do preparo e depois se descarta. Vale lembrar que isso apaga trabalho sem rede de segurança.",
            },
            {
                frente: "O que é uma tag e como ela difere de um branch?",
                verso: "A tag é um nome fixo para um commit específico, que não anda. O branch é um ponteiro móvel. Por isso tag é o que marca versão publicada, e branch é o que marca linha de trabalho em andamento.",
            },
            {
                frente: "O que é um pull request?",
                verso: "Um pedido para integrar o seu branch em outro, aberto na plataforma e não no Git em si. Serve como lugar de revisão, de discussão e de execução automática de testes antes que a mudança entre no branch principal.",
            },
            {
                frente: "Por que não trabalhar direto no branch principal?",
                verso: "Porque toda mudança passaria a afetar quem depende dele imediatamente, sem revisão nem testes. Branch por tarefa isola o trabalho em andamento, permite revisar antes de integrar e deixa o principal sempre num estado que pode ir ao ar.",
            },
            {
                frente: "O que o comando de blame responde?",
                verso: "Qual commit introduziu cada linha de um arquivo, com autor e data. Serve para entender o contexto de um trecho estranho, indo do commit até a mensagem e o pull request dele. O nome sugere culpa, e o uso saudável é procurar motivo.",
            },
            {
                frente: "O que acontece se dois desenvolvedores alteram arquivos diferentes ao mesmo tempo?",
                verso: "Nada de especial: o Git junta as duas mudanças sem conflito, porque elas não tocam a mesma região. Conflito só aparece quando as edições disputam as mesmas linhas, e por isso trabalhar em partes distintas raramente dá trabalho na integração.",
            },
        ],
        junior: [
            {
                frente: "Qual a melhor forma de acrescentar uma alteração esquecida a um commit que já está num PR?",
                verso: "Se for o último commit, prepare a alteração e use commit com amend, que reescreve aquele commit em vez de criar outro. Como o hash muda, o envio precisa ser forçado, e o correto é com lease, que recusa se alguém tiver publicado algo no meio. Se o esquecido não for o último, use um commit de correção e junte com rebase interativo.",
            },
            {
                frente: "Por que o amend exige envio forçado?",
                verso: "Porque ele não altera o commit: cria um novo com outro hash e move o branch para ele. O histórico local passa a divergir do publicado, e o envio normal é recusado justamente para você perceber. Forçar com lease é o que faz isso sem atropelar trabalho alheio.",
            },
            {
                frente: "Qual a diferença entre forçar o envio e forçar com lease?",
                verso: "O force sobrescreve o remoto sem perguntar, e apaga o que outra pessoa publicou no meio. O force com lease só sobrescreve se o remoto ainda estiver onde você viu pela última vez, e falha se alguém mexeu. É o padrão para branch de trabalho.",
            },
            {
                frente: "Qual a diferença entre merge e rebase?",
                verso: "O merge cria um commit de junção e preserva as duas linhas como aconteceram. O rebase reaplica os seus commits em cima da base nova, produzindo histórico linear com hashes novos. Merge preserva a história; rebase a reescreve para ficar mais legível.",
            },
            {
                frente: "Quando você não deveria fazer rebase?",
                verso: "Em branch compartilhado que outras pessoas já usam, porque reescrever muda os hashes e quebra o histórico de quem baixou. A regra prática é rebase só no seu próprio branch de trabalho, e merge no que já é público.",
            },
            {
                frente: "Para que serve o rebase interativo?",
                verso: "Reorganizar seus commits antes de abrir ou atualizar um PR: juntar correções ao commit certo, reescrever mensagem, reordenar e remover. É como se transforma uma sequência de tentativas numa história que faz sentido para quem vai revisar.",
            },
            {
                frente: "Como você junta um commit de correção ao commit certo automaticamente?",
                verso: "Criando o commit com a opção de fixup apontando para o commit alvo, e depois rodando rebase com autosquash. O Git posiciona e junta sozinho, sem você mexer na lista. É o caminho quando o esquecido não é o último commit do branch.",
            },
            {
                frente: "Qual a diferença entre revert e reset?",
                verso: "O revert cria um commit novo que desfaz o efeito de outro, preservando o histórico, e é o certo para o que já é público. O reset move o ponteiro do branch para trás, reescrevendo, e serve para o que ainda é seu e não foi publicado.",
            },
            {
                frente: "Qual a diferença entre reset com soft, mixed e hard?",
                verso: "Soft move o branch e mantém tudo preparado. Mixed, que é o padrão, move e desfaz o preparo, mantendo os arquivos. Hard move e descarta as alterações do diretório de trabalho, que é o único dos três que perde trabalho de verdade.",
            },
            {
                frente: "Para que serve o stash?",
                verso: "Guardar temporariamente as mudanças não comitadas e voltar ao estado limpo, para trocar de branch ou puxar uma atualização. Depois você aplica de volta. É útil, e virar depósito de coisas esquecidas é o mau uso clássico dele.",
            },
            {
                frente: "Como você traria um commit específico de outro branch?",
                verso: "Com cherry-pick, que reaplica aquele commit no branch atual, criando um commit novo com o mesmo conteúdo e hash diferente. Serve para correção urgente que precisa ir para uma versão publicada sem levar o resto do branch junto.",
            },
            {
                frente: "O que é um merge com avanço rápido, e quando ele não acontece?",
                verso: "Acontece quando o destino não recebeu nada desde que o branch saiu, então basta mover o ponteiro adiante, sem commit de junção. Não acontece quando as duas linhas divergiram, e aí o Git precisa criar o commit de merge para juntar.",
            },
            {
                frente: "Qual a diferença entre squash, merge commit e rebase ao integrar um PR?",
                verso: "Squash reduz o branch a um commit só no destino. Merge commit preserva todos os commits e registra a junção. Rebase reaplica os commits sem commit de junção. A escolha define como o histórico do principal vai parecer daqui a um ano.",
            },
            {
                frente: "Como você resolveria um conflito durante um rebase?",
                verso: "Editando os arquivos marcados, preparando o resultado e continuando o rebase, e não comitando por fora. Como o rebase reaplica commit a commit, o mesmo conflito pode aparecer mais de uma vez. Abortar volta tudo ao estado anterior sem estrago.",
            },
            {
                frente: "O que o reflog permite recuperar?",
                verso: "Quase tudo que parecia perdido: commit de branch apagado, estado antes de um reset agressivo, resultado de rebase que deu errado. Ele registra por onde o HEAD passou localmente, então basta achar o ponto e voltar para ele.",
            },
            {
                frente: "Como você desfaria um commit que já foi publicado?",
                verso: "Com revert, que cria um commit desfazendo o efeito. Reescrever o histórico publicado obrigaria todo mundo a corrigir a cópia local, e em branch principal isso é inaceitável. Reescrita fica para branch de trabalho que só você usa.",
            },
            {
                frente: "Para que serve o bisect?",
                verso: "Achar o commit que introduziu um defeito por busca binária: você marca um bom e um ruim, e o Git te posiciona no meio para testar, repetindo até isolar. Em histórico grande, encontra em poucos passos o que a leitura levaria horas para achar.",
            },
            {
                frente: "Como você mantém um branch de trabalho atualizado com o principal?",
                verso: "Trazendo o principal e integrando, por rebase enquanto o branch é só seu, ou por merge quando outras pessoas já o usam. Fazer isso com frequência evita o conflito gigante no fim, que é o custo de deixar o branch envelhecer.",
            },
            {
                frente: "O que significa um branch estar à frente e atrás ao mesmo tempo?",
                verso: "Que as duas linhas divergiram: você tem commits que o remoto não tem, e ele tem commits que você não tem. Envio simples é recusado, e a saída é integrar antes, por merge ou rebase, e só então publicar.",
            },
            {
                frente: "Como você removeria do rastreamento um arquivo que não deveria ter sido comitado?",
                verso: "Tirando do índice sem apagar do disco e acrescentando ao .gitignore, num commit próprio. Isso resolve daqui para frente, mas o arquivo continua no histórico, então segredo exposto precisa ser rotacionado, e não só removido.",
            },
        ],
        pleno: [
            {
                frente: "Como você organizaria os commits de um PR antes de pedir revisão?",
                verso: "Cada commit com uma ideia completa e que compila, na ordem em que ajuda a ler, com correções já juntadas ao commit que corrigem. Rebase interativo com autosquash faz isso. Revisor que consegue ler commit a commit revisa melhor do que quem encara um diff único.",
            },
            {
                frente: "Como você decidiria entre squash e merge commit ao integrar um PR?",
                verso: "Squash quando os commits do branch são rascunho e só o resultado importa. Merge commit quando eles contam uma história útil e você quer poder usar bisect com granularidade. O que não funciona é misturar sem critério e ter um histórico ilegível dos dois jeitos.",
            },
            {
                frente: "Por que squash quebra uma cadeia de PRs empilhados?",
                verso: "Porque ele cria um commit novo no destino, com hash diferente dos originais. O PR filho continua apontando para os commits antigos, então o diff dele passa a mostrar tudo de novo. Em cadeia empilhada, merge commit preserva a base do filho.",
            },
            {
                frente: "Como você reescreveria a mensagem de um commit antigo de um branch?",
                verso: "Com rebase interativo a partir do pai daquele commit, marcando-o para reescrever. Como isso muda o hash dele e de todos os seguintes, o envio precisa ser forçado com lease, e só vale se o branch for seu. Em commit já público, não se mexe.",
            },
            {
                frente: "Como você lidaria com um branch que ficou meses parado?",
                verso: "Medindo primeiro o quanto ele divergiu. Rebase de dezenas de commits contra uma base muito diferente vira uma sequência de conflitos repetidos. Muitas vezes sai mais barato reaplicar a intenção num branch novo do que insistir na integração.",
            },
            {
                frente: "Como você investigaria quando e por que uma linha específica mudou?",
                verso: "Blame para achar o commit, e dali para a mensagem e o pull request, que costumam ter o motivo. Se a linha foi movida entre arquivos, o log seguindo o caminho e a opção que detecta movimentação evitam parar no commit de refatoração.",
            },
            {
                frente: "Como você acharia o commit que introduziu uma regressão numa base grande?",
                verso: "Com bisect, de preferência automatizado por um script que devolve sucesso ou falha, o que deixa o Git percorrer sozinho. O custo é ter um teste confiável que reproduza o problema, e é ele que transforma horas de leitura em minutos.",
            },
            {
                frente: "O que você faria se um segredo foi comitado e publicado?",
                verso: "Rotacionar o segredo primeiro, porque ele já vazou e reescrever o histórico não desfaz isso. Depois, remover do histórico com a ferramenta apropriada e coordenar com o time, já que todos precisarão recriar as cópias locais.",
            },
            {
                frente: "Como você definiria a estratégia de branches de um time?",
                verso: "Pela frequência de entrega: quem entrega várias vezes ao dia se dá bem com branch curto vindo do principal, e quem tem versões suportadas precisa de branch de release. O erro comum é adotar um modelo elaborado sem ter o problema que ele resolve.",
            },
            {
                frente: "Como você reduziria conflitos recorrentes num arquivo que todo mundo edita?",
                verso: "Tratando a causa: arquivo que concentra registro de tudo, como uma lista central, é sintoma de desenho. Quebrar em arquivos por módulo remove a disputa. Enquanto isso não acontece, branches curtos e integração frequente diminuem a dor.",
            },
            {
                frente: "O que um hook de repositório resolve, e qual o limite dele?",
                verso: "Roda verificação automática em momentos como antes do commit ou do envio, pegando erro antes da esteira. O limite é que hook local é opcional e cada pessoa pode pular, então ele serve para conveniência, e a garantia real fica na integração contínua.",
            },
            {
                frente: "Como você lidaria com um repositório que ficou grande demais?",
                verso: "Achando o que pesa, que costuma ser binário comitado ao longo dos anos. Arquivo grande vai para armazenamento apropriado e não para o histórico. Limpar o passado exige reescrever tudo e coordenar com o time, então prevenir é bem mais barato.",
            },
            {
                frente: "Como você usaria worktree e para quê?",
                verso: "Para ter mais de um branch aberto em diretórios diferentes, compartilhando o mesmo repositório. Serve quando você precisa revisar ou corrigir algo urgente sem guardar o trabalho atual, e é mais barato do que clonar de novo.",
            },
            {
                frente: "Como você reverteria um merge já integrado ao principal?",
                verso: "Com revert indicando qual dos pais é a linha principal, senão o Git não sabe o que desfazer. E registrando isso: reintegrar aquele branch depois exige cuidado, porque o Git considera que ele já foi mesclado e o revert precisará ser desfeito.",
            },
            {
                frente: "Como você garantiria que o principal está sempre íntegro?",
                verso: "Proteção de branch com revisão obrigatória, testes verdes como condição de integração e proibição de envio forçado. E branch de trabalho curto, porque a integridade se perde quando dois branches longos convivem e a integração vira evento.",
            },
            {
                frente: "O que muda ao usar submódulos, e quando eles valem a pena?",
                verso: "O repositório passa a apontar para um commit específico de outro, e todo clone precisa inicializar. Valem quando o código é realmente compartilhado e versionado à parte. O custo aparece no dia a dia, com gente esquecendo de atualizar o ponteiro.",
            },
            {
                frente: "Como você trataria a mistura de formatação com mudança real num diff?",
                verso: "Separando em commits diferentes, com a formatação isolada num commit próprio. Assim a revisão enxerga a mudança de comportamento. Formatador automático que reescreve o repositório inteiro precisa ser um commit sozinho, marcado para ser ignorado no blame.",
            },
            {
                frente: "Como você resolveria um conflito num arquivo gerado, como trava de dependências?",
                verso: "Não resolvendo à mão: regenerar o arquivo a partir do manifesto já resolvido, com a ferramenta que o produz. Editar linha a linha de arquivo gerado costuma produzir estado inválido que só aparece na instalação seguinte.",
            },
            {
                frente: "Como você recuperaria trabalho depois de um reset agressivo por engano?",
                verso: "Pelo reflog, que guarda por onde o HEAD passou localmente, achando o hash anterior ao reset e criando um branch nele. Funciona enquanto a coleta de objetos não tiver removido o que ficou solto, o que dá algumas semanas de folga.",
            },
            {
                frente: "Como você atualizaria uma cadeia de PRs empilhados depois de mexer na base?",
                verso: "Reescrevendo da base para o topo, rebaseando cada filho sobre o pai já corrigido, e enviando com lease na mesma ordem. Se o filtro aplicado for determinístico, o pai do filho bate sozinho com a nova cabeça do pai e não é preciso rebase manual.",
            },
        ],
        senior: [
            {
                frente: "Como você definiria a política de histórico de um repositório grande?",
                verso: "Pelo que o time precisa fazer com ele: se usa bisect e revert com frequência, commits pequenos e íntegros importam mais que estética. Se ninguém lê o histórico, squash simplifica. Política sem uso real vira ritual, e ritual sem propósito é abandonado.",
            },
            {
                frente: "Como você avaliaria adotar um fluxo de branches mais elaborado?",
                verso: "Perguntando qual problema ele resolve hoje. Modelo com vários branches de longa duração existe para quem mantém versões em paralelo. Quem entrega continuamente ganha o oposto: branch curto e integração frequente. Adotar por costume custa e não entrega.",
            },
            {
                frente: "Como você lidaria com um time que evita rebase por medo?",
                verso: "Mostrando a rede de segurança, que é o reflog, e praticando num branch descartável até o medo virar procedimento. E deixando a regra clara: rebase só no que é seu. O medo costuma vir de uma vez em que alguém reescreveu branch compartilhado.",
            },
            {
                frente: "Como você trataria pull requests gigantes que ninguém revisa direito?",
                verso: "Atacando a causa, que é trabalho acumulado antes de integrar. Empilhar PRs pequenos com dependência declarada, ou usar chave de funcionalidade para integrar cedo o que ainda não está pronto. Pedir revisão melhor num diff de mil linhas não funciona.",
            },
            {
                frente: "Como você conduziria a migração de outro sistema de controle de versão?",
                verso: "Preservando histórico onde ele tem valor real e aceitando um corte quando não tem, porque conversão fiel de anos costuma custar mais do que rende. E treinando o modelo mental, que é a parte difícil: quem vem de sistema centralizado estranha o histórico local.",
            },
            {
                frente: "Como você equilibraria proteção do principal e velocidade do time?",
                verso: "Automatizando o que bloqueia, para a barreira ser rápida: testes essenciais no caminho crítico e o resto assíncrono. Revisão obrigatória com um aprovador costuma bastar. Regras que fazem esperar meio dia por mudança de uma linha empurram o time a burlar.",
            },
            {
                frente: "Como você trataria a proliferação de branches abandonados?",
                verso: "Com limpeza automática do que já foi integrado e prazo para o resto, junto com a conversa sobre por que eles existem. Dezenas de branches parados quase sempre indicam trabalho começado e não terminado, que é um problema de priorização e não de Git.",
            },
            {
                frente: "Como você usaria o histórico para entender uma base que acabou de herdar?",
                verso: "Olhando frequência de mudança por arquivo, para achar os pontos quentes, e quem são os autores recorrentes de cada área. Arquivo que muda toda semana e ninguém entende é onde o risco mora, e costuma ser melhor alvo que a leitura linear do código.",
            },
            {
                frente: "Como você trataria um repositório único compartilhado por muitos times?",
                verso: "Com donos por diretório, revisão obrigatória de quem mantém a área, e esteira que só roda o que foi afetado. Sem isso, o tempo de verificação cresce com o repositório e todo mundo espera por mudança que não tem nada a ver com a sua.",
            },
            {
                frente: "Como você lidaria com conflitos frequentes entre dois times no mesmo código?",
                verso: "Tratando como sinal de fronteira errada, e não como problema de ferramenta. Duas equipes editando o mesmo arquivo toda semana indicam responsabilidade mal dividida. A conversa é sobre desenho e sobre quem é dono do quê, e não sobre estratégia de merge.",
            },
            {
                frente: "Como você garantiria rastreabilidade entre commit e a decisão que o motivou?",
                verso: "Mensagem que explica o porquê, referência ao item de trabalho, e o pull request como lugar da discussão. O que não pode é a razão viver só numa conversa efêmera, porque em um ano ninguém encontra, e a mudança vira mistério.",
            },
            {
                frente: "Como você trataria segredo que entra no repositório de forma recorrente?",
                verso: "Com verificação automática que bloqueia antes do envio e na esteira, somada a um jeito fácil de fazer certo, como cofre integrado ao ambiente local. Repetição não é descuido individual: é sinal de que o caminho correto está mais difícil que o errado.",
            },
            {
                frente: "Como você ensinaria Git para quem só usa o básico?",
                verso: "Pelo modelo, e não pela lista de comandos: commit é foto, branch é ponteiro, e quase tudo é mover ponteiro. Com esse modelo a pessoa deduz o resto e para de ter medo. Decorar comando sem o modelo é o que produz o hábito de clonar de novo quando dá errado.",
            },
            {
                frente: "Como você mediria se o fluxo de trabalho do time está saudável?",
                verso: "Tempo entre abrir e integrar um pull request, tamanho médio do diff, idade dos branches abertos e frequência de integração no principal. Números crescendo aí antecipam conflito grande e revisão superficial, antes de virarem reclamação.",
            },
            {
                frente: "Como você decidiria entre repositório único e vários repositórios?",
                verso: "Pelo acoplamento real: código que muda junto se beneficia de estar junto, com mudança atômica e refatoração ampla. Repositórios separados fazem sentido com ciclos de vida independentes. O custo do único é ferramenta; o dos vários é coordenação.",
            },
            {
                frente: "Como você trataria uma reescrita de histórico que já foi publicada por engano?",
                verso: "Comunicando na hora e dando o procedimento exato de recuperação, porque cada pessoa com cópia local vai divergir. Se possível, restaurar a referência anterior no remoto antes que todo mundo baixe. Depois, proibir envio forçado no branch protegido.",
            },
            {
                frente: "Como você lidaria com uma esteira que ficou lenta por causa do tamanho do histórico?",
                verso: "Clonando com profundidade limitada e buscando só o necessário nas verificações, que costuma resolver sem mexer no passado. Reescrever histórico para reduzir tamanho é caro e coordenado, então fica para quando a economia justificar o transtorno.",
            },
            {
                frente: "Que sinais no histórico indicam problema de processo, e não de código?",
                verso: "Commits gigantes de fim de semana, mensagens genéricas repetidas, reverts seguidos de reaplicação, e branches longos integrados de uma vez. O histórico é um registro do processo, e essas marcas aparecem antes de o problema virar incidente.",
            },
            {
                frente: "Como você trataria a resistência a revisão de código num time?",
                verso: "Separando revisão de julgamento pessoal: acordar o que a revisão cobra, dar prazo curto para responder e limitar o tamanho do que se pede para revisar. Revisão que demora dias e volta com trinta comentários de estilo ensina o time a evitá-la.",
            },
            {
                frente: "Que convenção de mensagem de commit você adotaria, e por quê?",
                verso: "A que o time consegue sustentar e que alimenta algo concreto, como gerar registro de mudanças ou definir a próxima versão. Prefixo convencional serve bem. Convenção que não alimenta nada vira burocracia, e a primeira semana corrida é quando ela morre.",
            },
        ],
    },
};
