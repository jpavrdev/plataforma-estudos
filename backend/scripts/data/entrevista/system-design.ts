import type { TopicoDeEntrevista } from "../../seed-entrevista.ts";

/**
 * Perguntas de entrevista de System Design.
 *
 * O nível segue o que a pergunta cobra, e não o assunto. Cache aparece nos quatro
 * níveis: em estágio é o que ele é e onde fica, em sênior é decidir com o produto
 * quanto dado velho o negócio aceita e quem paga quando ele aparece.
 *
 * Complementa a trilha avulsa de System Design sem repetir o texto das aulas: lá o
 * conteúdo ensina o mecanismo, aqui a pergunta cobra o raciocínio em voz alta.
 */
export const systemDesign: TopicoDeEntrevista = {
    slug: "system-design",
    nome: "System Design",
    position: 10,
    perguntas: {
        estagio: [
            {
                frente: "O que é System Design, e o que ele não é?",
                verso: "É decidir como as peças de um sistema se organizam para atender requisitos de escala, disponibilidade e custo: onde o dado mora, como as partes conversam e o que acontece quando algo falha. Não é desenho de tela, e não é escolher framework.",
            },
            {
                frente: "Por que perguntar requisitos antes de começar a desenhar?",
                verso: "Porque o mesmo produto pede desenhos opostos conforme o volume, a tolerância a atraso e o que não pode falhar. Desenhar sem perguntar é resolver outro problema. Na entrevista, pular essa etapa é um dos motivos mais comuns de reprovação.",
            },
            {
                frente: "Qual a diferença entre requisito funcional e não funcional?",
                verso: "O funcional diz o que o sistema faz, como encurtar uma URL e redirecionar. O não funcional diz como ele precisa se comportar: quanto tráfego aguenta, em quanto tempo responde e quanto pode ficar fora do ar. É o segundo tipo que define a arquitetura.",
            },
            {
                frente: "O que significa escalar verticalmente e horizontalmente?",
                verso: "Vertical é pôr mais CPU e memória na mesma máquina, simples e com teto. Horizontal é acrescentar máquinas e dividir o trabalho entre elas, o que exige que a aplicação não guarde estado em cada uma. Quase todo sistema começa vertical e cresce horizontal.",
            },
            {
                frente: "Qual a diferença entre latência e vazão?",
                verso: "Latência é quanto tempo uma requisição leva. Vazão é quantas requisições o sistema atende por segundo. Uma não garante a outra: agrupar trabalho aumenta a vazão e piora a latência de cada item, e é por isso que as duas precisam de meta própria.",
            },
            {
                frente: "O que é disponibilidade, e como ela é medida?",
                verso: "É a fração do tempo em que o sistema atende corretamente, normalmente expressa em porcentagem. Ela se mede pelo que o usuário sente, como requisições bem-sucedidas, e não pelo processo estar de pé. Servidor ligado devolvendo erro não está disponível.",
            },
            {
                frente: "O que significa ter três noves de disponibilidade?",
                verso: "Estar disponível 99,9% do tempo, o que permite perto de 43 minutos de falha por mês. Cada nove a mais divide esse tempo por dez e multiplica o custo, porque exige redundância, automação de recuperação e gente sabendo operar tudo isso.",
            },
            {
                frente: "Qual a diferença entre SLA e SLO?",
                verso: "O SLO é a meta interna de confiabilidade que o time persegue. O SLA é o compromisso com o cliente, normalmente com multa. O SLA fica mais frouxo que o SLO de propósito, para existir margem de erro antes de o descumprimento virar custo.",
            },
            {
                frente: "O que é um ponto único de falha?",
                verso: "Um componente cuja queda derruba o sistema inteiro, como um banco sem réplica ou um balanceador sozinho. Achar esses pontos é uma das primeiras coisas a fazer num desenho. Nem todo precisa ser eliminado, mas todo precisa ser uma escolha consciente.",
            },
            {
                frente: "O que é redundância, e o que ela não resolve sozinha?",
                verso: "É ter mais de uma cópia de um componente para o sistema seguir quando uma falha. Ela não resolve se as cópias falham juntas, como duas instâncias na mesma zona, nem se o erro é de dado, porque réplica copia o dado errado com a mesma eficiência.",
            },
            {
                frente: "O que acontece, em linhas gerais, quando alguém acessa um site?",
                verso: "O navegador descobre o endereço pelo DNS, abre uma conexão, negocia a criptografia e envia a requisição HTTP. Ela costuma passar por CDN, balanceador e servidor de aplicação, que consulta cache e banco antes de responder. Cada salto soma latência e é um ponto de falha.",
            },
            {
                frente: "O que o DNS resolve?",
                verso: "Traduz um nome, como o domínio do site, no endereço de rede de um servidor. Como a resposta fica em cache por um tempo definido, trocar um endereço não é instantâneo. Também pode ser usado para distribuir tráfego entre regiões, com a limitação desse cache.",
            },
            {
                frente: "O que é uma CDN, e que problema ela resolve?",
                verso: "Uma rede de servidores espalhados que guarda cópia do conteúdo perto do usuário. Resolve a distância física, que nenhum código otimiza, e tira carga da origem. Serve muito bem para arquivo estático, e com cuidado para resposta dinâmica que pode ficar em cache.",
            },
            {
                frente: "O que um balanceador de carga faz?",
                verso: "Distribui as requisições entre várias instâncias e deixa de enviar para as que não respondem. É o que permite escalar horizontalmente e trocar máquina sem o usuário perceber. Ele próprio precisa ser redundante, senão vira o novo ponto único de falha.",
            },
            {
                frente: "O que é um proxy reverso?",
                verso: "Um servidor na frente da aplicação que recebe as requisições e repassa. Ele concentra criptografia, compressão, cache e limite de requisições num lugar só, e esconde a estrutura interna. Balanceador de carga costuma ser um proxy reverso com essa função a mais.",
            },
            {
                frente: "O que é um API gateway?",
                verso: "A porta de entrada única para vários serviços, que cuida de roteamento, autenticação, limite de requisições e versão. Tira essas preocupações de cada serviço. O risco é virar um lugar onde regra de negócio se acumula e todo time depende dele para publicar.",
            },
            {
                frente: "Por que um servidor sem estado facilita escalar?",
                verso: "Porque qualquer instância consegue atender qualquer requisição, então dá para acrescentar e remover máquinas à vontade. O estado não some: ele vai para banco, cache ou armazenamento compartilhado. Sessão guardada na memória do servidor é o que impede isso.",
            },
            {
                frente: "Onde pode ficar a sessão do usuário num sistema com vários servidores?",
                verso: "Num armazenamento compartilhado, como um cache distribuído, ou no próprio cliente, num token assinado. Na memória de um servidor só funciona enquanto existe um servidor. A escolha troca facilidade de revogar a sessão por dispensar a consulta a cada requisição.",
            },
            {
                frente: "O que é um cache, e onde ele pode ficar?",
                verso: "Uma cópia de dado guardada num lugar mais rápido para evitar refazer trabalho. Pode ficar no navegador, na CDN, na memória da aplicação, num cache distribuído ou no próprio banco. Cada camada acelera um trecho e acrescenta a chance de servir dado velho.",
            },
            {
                frente: "O que é o TTL de um cache?",
                verso: "O tempo de vida de uma entrada antes de ela ser descartada e buscada de novo. TTL curto mantém o dado mais fresco e alivia menos a origem; TTL longo alivia mais e aceita dado velho por mais tempo. A escolha depende de quanto atraso o negócio tolera.",
            },
            {
                frente: "Quando um banco relacional serve bem?",
                verso: "Quando o dado tem relações claras, a consistência importa e as consultas variam, como pedido, pagamento e estoque. Transação, restrição de integridade e SQL resolvem muita coisa que em outro modelo vira código. É o ponto de partida razoável para quase todo sistema.",
            },
            {
                frente: "Quando um banco não relacional faz sentido?",
                verso: "Quando o formato de acesso é simples e conhecido, o volume é enorme ou o dado não tem estrutura fixa, como sessão, evento e catálogo flexível. Ele troca consulta variada e transação ampla por escala e flexibilidade. Escolher por moda costuma sair caro depois.",
            },
            {
                frente: "O que é um índice num banco de dados?",
                verso: "Uma estrutura extra que permite achar linhas sem ler a tabela inteira, como o índice remissivo de um livro. Acelera muito a leitura e cobra em cada escrita, que precisa atualizá-lo, e em espaço. Índice certo é o que acompanha as consultas reais.",
            },
            {
                frente: "O que é replicação de banco de dados?",
                verso: "Manter cópias do banco em outras máquinas, normalmente com uma recebendo escrita e as outras seguindo. Serve para aguentar mais leitura e para ter para onde ir se a principal cair. A réplica costuma ficar um pouco atrasada, e isso aparece para o usuário.",
            },
            {
                frente: "Por que replicação não substitui backup?",
                verso: "Porque a réplica copia tudo, inclusive o erro: uma tabela apagada por engano some das réplicas em segundos. Backup é uma fotografia de um momento anterior, guardada à parte. Backup que nunca foi restaurado em teste é só uma esperança.",
            },
            {
                frente: "O que é armazenamento de objetos?",
                verso: "Um serviço para guardar arquivos inteiros acessados por chave, como imagem, vídeo e backup, com durabilidade alta e custo baixo. Não é sistema de arquivos nem banco: não se altera um pedaço do arquivo. É onde vão os arquivos enviados pelos usuários.",
            },
            {
                frente: "Onde você guardaria os arquivos enviados pelos usuários?",
                verso: "No armazenamento de objetos, com o banco guardando só a referência e os metadados. Guardar no disco do servidor impede escalar e perde tudo junto com a máquina; guardar dentro do banco incha backup e replicação sem ganho nenhum.",
            },
            {
                frente: "O que é uma fila de mensagens?",
                verso: "Um intermediário onde um produtor deixa trabalho e um consumidor pega quando puder. Ela desacopla o ritmo dos dois lados, absorve picos e permite reprocessar quando algo falha. O custo é o trabalho deixar de ser imediato e passar a exigir tratamento de repetição.",
            },
            {
                frente: "Qual a diferença entre comunicação síncrona e assíncrona entre serviços?",
                verso: "Na síncrona quem chama espera a resposta, então a falha e a lentidão do outro lado viram suas. Na assíncrona a mensagem é entregue e cada lado segue no seu ritmo. A síncrona é mais simples de entender; a assíncrona aguenta melhor pico e queda parcial.",
            },
            {
                frente: "O que é publicar e assinar?",
                verso: "Um modelo em que quem produz um evento publica num tópico sem saber quem vai consumir, e cada interessado assina e recebe a sua cópia. Permite acrescentar consumidores sem mexer no produtor. A conta chega em rastrear o que acontece depois de um evento.",
            },
            {
                frente: "O que é um webhook?",
                verso: "Uma chamada HTTP que um sistema faz para outro quando algo acontece, em vez de o outro ficar perguntando. É comum em pagamento e integração. Quem recebe precisa verificar a origem, responder rápido e tolerar a mesma notificação chegando mais de uma vez.",
            },
            {
                frente: "O que é polling, e qual o custo dele?",
                verso: "É o cliente perguntar de tempos em tempos se há novidade. É simples e funciona em qualquer lugar, mas gasta requisição quando nada mudou e ainda entrega com atraso de até um intervalo. Com muitos clientes, o custo de perguntar à toa domina.",
            },
            {
                frente: "Quando usar WebSocket em vez de requisições comuns?",
                verso: "Quando o servidor precisa enviar dados ao cliente com frequência e com pouco atraso, como chat e placar ao vivo. A conexão fica aberta nos dois sentidos. O custo é manter muitas conexões abertas e cuidar de reconexão e de escalar entre servidores.",
            },
            {
                frente: "O que um contrato de API define?",
                verso: "Os recursos, os formatos de entrada e saída, os códigos de erro e o que muda de versão para versão. É o que permite dois times trabalharem em paralelo. Contrato combinado por conversa diverge, e a diferença aparece na integração.",
            },
            {
                frente: "Por que os códigos de status HTTP importam para quem integra?",
                verso: "Porque é por eles que o cliente decide o que fazer: repetir, corrigir a requisição ou desistir. Devolver sucesso com uma mensagem de erro no corpo obriga cada consumidor a inventar a própria checagem, e o erro passa despercebido em monitoramento.",
            },
            {
                frente: "Por que uma API de listagem precisa de paginação?",
                verso: "Porque a tabela cresce e uma resposta com tudo pesa na memória do servidor, na rede e no cliente. A rota que devolve tudo funciona por meses e derruba o sistema no dia em que os dados crescem. Paginar desde o começo custa quase nada.",
            },
            {
                frente: "O que é limite de requisições, e por que ele existe?",
                verso: "É restringir quantas requisições um cliente faz num intervalo. Protege o sistema de abuso, de erro de integração em laço e de um cliente consumir a capacidade dos outros. A resposta precisa dizer quando tentar de novo, senão o cliente insiste e piora.",
            },
            {
                frente: "Por que toda chamada a outro serviço precisa de timeout?",
                verso: "Porque sem ele uma chamada presa segura thread e conexão indefinidamente, e poucas dessas esgotam o serviço inteiro. Com timeout, a lentidão do outro vira um erro controlado que você decide como tratar. É a proteção mais barata de todas.",
            },
            {
                frente: "Quando repetir uma chamada que falhou ajuda, e quando atrapalha?",
                verso: "Ajuda em falha passageira, como uma instância reiniciando. Atrapalha quando a operação não pode ser repetida sem efeito duplicado, e quando todos repetem ao mesmo tempo durante uma queda, o que multiplica a carga sobre quem está tentando se recuperar.",
            },
            {
                frente: "O que é idempotência, em uma frase?",
                verso: "É poder executar a mesma operação várias vezes com o mesmo resultado de executar uma vez só. Importa porque em rede a repetição acontece sozinha: cliente reenvia, proxy repete, usuário clica duas vezes. Sem ela, uma cobrança pode sair em dobro.",
            },
            {
                frente: "Qual a diferença entre consistência forte e consistência eventual?",
                verso: "Na forte, toda leitura enxerga a última escrita confirmada. Na eventual, as cópias convergem com o tempo, e por um intervalo uma leitura pode trazer valor antigo. A forte custa latência e disponibilidade; a eventual exige que o produto aceite esse atraso.",
            },
            {
                frente: "O que o teorema CAP diz, em linhas gerais?",
                verso: "Que durante uma partição de rede um sistema distribuído precisa escolher entre responder com dado possivelmente desatualizado ou recusar para manter consistência. Não é escolher dois de três no dia a dia: a escolha só é forçada quando a rede se parte.",
            },
            {
                frente: "O que é particionar dados, na ideia?",
                verso: "Dividir um conjunto grande em pedaços guardados em máquinas diferentes, com uma chave decidindo onde cada registro fica. Resolve o limite de uma máquina só. O custo é consulta que atravessa partições, rebalanceamento e a escolha da chave, que é difícil de desfazer.",
            },
            {
                frente: "Onde o hashing aparece num sistema distribuído?",
                verso: "Para decidir em qual partição ou servidor um dado fica, para detectar arquivo repetido, para verificar integridade e para gerar identificador curto. A propriedade que interessa é espalhar bem e ser determinístico: a mesma entrada cai sempre no mesmo lugar.",
            },
            {
                frente: "Por que um identificador sequencial do banco pode virar problema?",
                verso: "Porque ele depende de um ponto central que gera o próximo número, o que atrapalha com vários bancos ou partições. Também expõe volume e permite adivinhar identificadores vizinhos. Em sistema distribuído se usa identificador gerado sem coordenação.",
            },
            {
                frente: "Qual a diferença entre autenticação e autorização?",
                verso: "Autenticação é provar quem você é. Autorização é decidir o que você pode fazer. Confundir as duas produz o erro clássico de verificar que o usuário está logado e esquecer de verificar se aquele recurso é dele.",
            },
            {
                frente: "Por que todo tráfego deveria usar HTTPS?",
                verso: "Porque sem criptografia qualquer ponto no caminho lê e altera o que passa, inclusive senha e token. Também garante que o cliente fala com o servidor certo. O custo de desempenho hoje é pequeno, e rede interna também não é confiável por padrão.",
            },
            {
                frente: "O que é um monólito?",
                verso: "Uma aplicação implantada como uma unidade só, com todas as funcionalidades no mesmo processo. É simples de desenvolver, testar e operar, e escala bem por muito tempo. O problema aparece quando muitos times precisam publicar ao mesmo tempo sem se atrapalhar.",
            },
            {
                frente: "O que é um microsserviço?",
                verso: "Um serviço pequeno, com responsabilidade própria, dados próprios e publicação independente. Resolve principalmente o problema de muitos times trabalhando em paralelo. Cobra em rede, falha parcial, observabilidade e coordenação de contrato.",
            },
            {
                frente: "O que é uma arquitetura em camadas?",
                verso: "Separar o sistema em níveis com responsabilidades distintas, como apresentação, regra de negócio e acesso a dados, com a dependência seguindo um sentido só. Facilita trocar e testar cada parte. Camada demais vira código que só repassa chamada.",
            },
            {
                frente: "O que é uma verificação de saúde?",
                verso: "Um ponto que o orquestrador ou o balanceador consulta para saber se a instância pode receber tráfego. A de vivacidade diz se o processo travou; a de prontidão diz se ele consegue atender. Checagem que só devolve OK sem olhar nada não prova coisa alguma.",
            },
            {
                frente: "O que é escalonamento automático?",
                verso: "Acrescentar ou remover instâncias conforme uma métrica, como uso de CPU ou tamanho de fila. Economiza fora do pico e absorve crescimento. Ele não é instantâneo, porque subir instância leva tempo, então pico repentino ainda precisa de folga ou de fila.",
            },
            {
                frente: "O que são região e zona de disponibilidade na nuvem?",
                verso: "Região é uma localização geográfica com vários centros de dados. Zona é um desses centros, isolado dos outros em energia e rede. Espalhar instâncias por zonas protege de falha de um prédio; sobreviver à queda de uma região inteira exige muito mais.",
            },
            {
                frente: "Por que a distância física importa para a latência?",
                verso: "Porque a luz na fibra tem velocidade finita, e ir de um continente a outro custa dezenas de milissegundos em cada sentido, sem contar os saltos. Nenhuma otimização de código resolve isso. É por isso que existem CDN e réplicas perto do usuário.",
            },
            {
                frente: "O que é uma estimativa de capacidade numa entrevista?",
                verso: "Uma conta aproximada de volume, armazenamento, banda e memória a partir de poucas premissas ditas em voz alta. O objetivo não é acertar o número, e sim descobrir a ordem de grandeza que decide o desenho, como caber numa máquina ou não.",
            },
            {
                frente: "Como você estima requisições por segundo a partir de usuários diários?",
                verso: "Multiplicando usuários ativos por ações por usuário e dividindo pelos segundos do dia, perto de cem mil. Depois aplicando um fator de pico, porque o tráfego não é uniforme. Arredondar sem medo é parte do método: o que importa é a ordem de grandeza.",
            },
            {
                frente: "Por que dimensionar pela média do tráfego falha?",
                verso: "Porque o sistema cai no pico, e não na média. Tráfego se concentra em horários, dias e eventos, e o pico costuma ser várias vezes a média. Dimensionar pela média garante que o sistema funciona justamente nos momentos em que ninguém está usando.",
            },
            {
                frente: "Por que se trabalha com ordem de grandeza nas estimativas?",
                verso: "Porque a decisão de desenho muda por fator de dez, e não por vinte por cento. Saber se são cem ou cem mil requisições por segundo decide se um banco basta ou se é preciso particionar. Precisão maior que isso gasta tempo sem mudar a resposta.",
            },
            {
                frente: "O que é um sistema de leitura intensiva, e por que isso muda o desenho?",
                verso: "Um sistema em que se lê muito mais do que se escreve, como um catálogo ou uma rede social. Isso favorece cache, réplicas de leitura e dado pré-calculado. Num sistema de escrita intensiva, como coleta de métricas, a prioridade vira gravar rápido e em lote.",
            },
            {
                frente: "O que é degradação graciosa?",
                verso: "O sistema continuar oferecendo o essencial quando uma parte falha, em vez de cair inteiro. Uma loja que perde as recomendações ainda vende; uma que trava a página por causa delas não. Exige decidir antes o que é essencial e o que pode sumir.",
            },
            {
                frente: "O que são logs, e para que eles servem numa investigação?",
                verso: "Registros de eventos com horário e contexto, gravados pelo sistema enquanto roda. Servem para reconstruir o que aconteceu com uma requisição específica. Sem um identificador que ligue as linhas de uma mesma requisição, a investigação vira adivinhação.",
            },
            {
                frente: "O que você monitoraria primeiro num sistema novo?",
                verso: "O que o usuário sente: taxa de erro, latência e volume de requisições, mais a saturação dos recursos principais. Isso responde se está funcionando e se está perto do limite. Métrica interna detalhada vem depois, quando se sabe o que investigar.",
            },
            {
                frente: "O que é uma tarefa agendada, e que cuidado ela exige?",
                verso: "Um trabalho que roda num horário, como gerar relatório ou limpar dados antigos. Com várias instâncias, ele roda em todas se ninguém coordenar. E precisa poder rodar de novo sem estrago, porque algum dia vai falhar no meio ou executar duas vezes.",
            },
            {
                frente: "O que é versionar uma API?",
                verso: "Manter versões diferentes do contrato para mudar sem quebrar quem já usa. O melhor versionamento é o que quase nunca é preciso: acrescentar campo sem mudar significado dispensa versão nova. Versão nova exige prazo para desligar a antiga.",
            },
            {
                frente: "Por que um contador de visualizações é mais difícil do que parece?",
                verso: "Porque somar um no banco a cada acesso gera escrita demais e disputa pela mesma linha em página popular. As saídas são acumular em memória e gravar em lote, ou aceitar contagem aproximada. A pergunta real é quanto atraso e quanta imprecisão o produto aceita.",
            },
            {
                frente: "O que é compressão na rede, e quando ela ajuda?",
                verso: "Reduzir o tamanho do que trafega, trocando CPU por banda. Ajuda muito em texto, como HTML e JSON, e quase nada em imagem e vídeo, que já vêm comprimidos. Em conexão lenta, a economia de banda costuma valer bem mais que o custo de processar.",
            },
            {
                frente: "Por que banda é um custo que precisa entrar na estimativa?",
                verso: "Porque tráfego de saída da nuvem é cobrado e cresce com cada usuário, principalmente com vídeo e imagem. Um sistema pode caber tranquilo em servidores e ficar caro em transferência. É um dos motivos de CDN e de servir arquivos em tamanhos adequados.",
            },
            {
                frente: "O que é um deploy, e por que ele é um momento de risco?",
                verso: "É colocar uma versão nova em produção. É quando a maior parte dos incidentes começa, porque código e configuração mudam de uma vez. Por isso se publica em partes pequenas, aos poucos e com forma rápida de voltar para a versão anterior.",
            },
            {
                frente: "O que é um token de acesso?",
                verso: "Uma credencial que o cliente apresenta a cada requisição depois de autenticado, em vez de mandar a senha. Pode ser opaco, consultado no servidor, ou autocontido e assinado. Precisa expirar, e o autocontido é difícil de revogar antes do prazo.",
            },
            {
                frente: "O que é consistência eventual do ponto de vista do usuário?",
                verso: "É postar um comentário e, por alguns segundos, uma outra tela ainda não mostrar. Na maioria dos produtos isso é aceitável se a pessoa enxerga a própria ação na hora. O desenho precisa decidir onde esse atraso é tolerável e onde ele vira reclamação.",
            },
        ],
        junior: [
            {
                frente: "Como você conduziria os primeiros minutos de uma entrevista de design?",
                verso: "Perguntando o que o sistema precisa fazer, para quantos usuários, com que tolerância a atraso e o que não pode falhar, e escrevendo as respostas. Depois uma estimativa rápida e um desenho de alto nível. Só então aprofundar a parte que o entrevistador achar mais interessante.",
            },
            {
                frente: "Como você transformaria um requisito vago em números?",
                verso: "Assumindo valores razoáveis em voz alta e pedindo confirmação: usuários ativos por dia, ações por usuário, tamanho de cada registro, proporção entre leitura e escrita. Um número combinado, mesmo aproximado, vale mais que um adjetivo como grande ou rápido.",
            },
            {
                frente: "Como você estimaria o armazenamento de um serviço de fotos?",
                verso: "Fotos enviadas por dia vezes o tamanho médio, somando as versões redimensionadas, vezes os dias de retenção e o fator de réplica. Os metadados entram à parte, e costumam ser pequenos perto das imagens. A conta mostra logo que as fotos vão para armazenamento de objetos.",
            },
            {
                frente: "Como você estimaria a memória necessária para um cache?",
                verso: "Pela regra de que uma pequena fração dos itens recebe a maior parte dos acessos: estimar quantos itens são quentes, multiplicar pelo tamanho de cada um e somar a sobrecarga da estrutura. Cachear tudo raramente é necessário e quase nunca cabe.",
            },
            {
                frente: "Como funciona o padrão em que a aplicação consulta o cache antes do banco?",
                verso: "A aplicação procura no cache; se não encontra, lê do banco e grava no cache para as próximas. É o padrão mais comum e simples. O custo é a primeira leitura depois de expirar ser lenta, e a janela em que o banco já mudou e o cache ainda não.",
            },
            {
                frente: "Qual a diferença entre atualizar o cache junto com o banco e depois dele?",
                verso: "Atualizando junto, o cache fica coerente e cada escrita paga duas gravações. Gravando só no cache e persistindo depois em lote, a escrita fica rapidíssima e um problema no cache perde dado ainda não gravado. A segunda só serve onde perder um pouco é aceitável.",
            },
            {
                frente: "Por que invalidar cache é difícil?",
                verso: "Porque o mesmo dado aparece em várias chaves, a escrita e a invalidação não acontecem no mesmo instante, e duas requisições concorrentes podem regravar o valor antigo depois da limpeza. É por isso que TTL costuma ser a rede de segurança mesmo com invalidação explícita.",
            },
            {
                frente: "Como você invalidaria o cache depois de uma escrita?",
                verso: "Apagando a chave depois de gravar no banco, em vez de tentar atualizar o valor, e mantendo um TTL como garantia. Apagar força a próxima leitura a buscar o dado certo. Atualizar o cache com o valor novo é onde a corrida entre escritas deixa o antigo vencer.",
            },
            {
                frente: "O que é uma política de despejo como LRU?",
                verso: "A regra que decide o que sai quando o cache enche. LRU remove o item usado há mais tempo, apostando que o recente volta a ser pedido. Funciona bem para acesso com popularidade que muda; para popularidade estável, contar frequência pode acertar mais.",
            },
            {
                frente: "Quando ler de uma réplica causa problema para o usuário?",
                verso: "Quando a réplica está atrasada e a pessoa não encontra o que acabou de salvar, ou vê um valor voltar ao anterior ao recarregar. Para tela de listagem geral isso quase nunca incomoda. Para o próprio perfil logo depois de editar, incomoda sempre.",
            },
            {
                frente: "Como você garantiria que o usuário veja o que acabou de escrever?",
                verso: "Lendo da principal por um curto período depois de uma escrita daquele usuário, ou lendo da principal tudo que é dele. Outra saída é o cliente guardar a versão escrita e exigir uma réplica pelo menos tão atualizada. O resto das leituras continua nas réplicas.",
            },
            {
                frente: "Qual a diferença entre replicação síncrona e assíncrona?",
                verso: "Na síncrona a escrita só confirma depois de a réplica gravar, então nada se perde se a principal cair, e cada escrita fica mais lenta. Na assíncrona a confirmação é imediata e a réplica segue depois, o que é rápido e pode perder as últimas escritas numa falha.",
            },
            {
                frente: "O que pode dar errado quando o banco principal cai e uma réplica assume?",
                verso: "Perder escritas que ainda não tinham chegado à réplica, a antiga principal voltar achando que ainda manda e as duas aceitarem escrita, e clientes continuarem apontando para o endereço velho. Troca automática precisa de proteção contra duas principais ao mesmo tempo.",
            },
            {
                frente: "Como você escolheria entre banco relacional e não relacional num caso concreto?",
                verso: "Olhando as consultas que o sistema precisa fazer e as garantias exigidas. Consulta variada, relação entre entidades e transação apontam para relacional. Acesso sempre pela mesma chave, volume enorme e formato flexível apontam para não relacional. Na dúvida, relacional.",
            },
            {
                frente: "Quando desnormalizar dados compensa?",
                verso: "Quando uma leitura muito frequente paga junção cara e o dado repetido muda pouco, como o nome do autor guardado junto do post. O custo é manter as cópias coerentes a cada mudança. Desnormalizar sem medir a leitura só troca um problema por outro.",
            },
            {
                frente: "Como a ordem das colunas importa num índice composto?",
                verso: "O índice é ordenado pela primeira coluna, depois pela segunda dentro dela, e assim por diante. Ele serve para filtros que começam pela primeira coluna, e não para quem filtra só pela segunda. Colocar primeiro a coluna de igualdade e depois a de intervalo costuma render mais.",
            },
            {
                frente: "Por que índice demais atrapalha a escrita?",
                verso: "Porque cada inserção e cada alteração precisa atualizar todos os índices da tabela, o que multiplica o trabalho e o espaço. Índice que nenhuma consulta usa é custo puro. Vale revisar periodicamente quais índices são de fato lidos.",
            },
            {
                frente: "Por que paginação por cursor escala melhor que por deslocamento?",
                verso: "Porque com deslocamento o banco percorre e descarta todas as linhas anteriores, e a página cem fica muito mais lenta que a primeira. Com cursor ele parte do último item visto pelo índice. Também evita pular ou repetir item quando algo é inserido no meio.",
            },
            {
                frente: "Como você implementaria um limitador de requisições simples?",
                verso: "Com um contador por cliente num armazenamento compartilhado, somado a cada requisição e expirando no fim da janela, recusando quando passar do limite. Com várias instâncias, o contador precisa ser compartilhado, senão o limite real vira o limite vezes o número de servidores.",
            },
            {
                frente: "Qual a diferença entre balde de fichas e janela fixa num limitador?",
                verso: "A janela fixa conta requisições por intervalo e permite o dobro do limite na virada entre duas janelas. O balde de fichas repõe fichas num ritmo constante e permite rajada até a capacidade do balde. O balde controla melhor o ritmo e ainda tolera pico curto.",
            },
            {
                frente: "Onde você colocaria o limitador de requisições?",
                verso: "Na borda, no gateway ou no proxy, para barrar abuso antes de gastar recurso, e com limite por identidade autenticada quando possível. Limite só por endereço de rede pune quem compartilha rede e é contornado trocando de endereço.",
            },
            {
                frente: "Como você geraria identificadores únicos em vários servidores?",
                verso: "Sem coordenação central: identificador aleatório de tamanho suficiente para colisão ser desprezível, ou um formato que combina tempo, identificador da máquina e sequência local. Pedir o próximo número a um serviço central funciona e cria um ponto único de falha.",
            },
            {
                frente: "Qual o custo de usar identificador aleatório como chave primária?",
                verso: "Ocupa mais espaço que um número e, por ser aleatório, cada inserção cai num ponto diferente do índice, fragmentando e piorando o cache do banco. Em tabela pequena isso não aparece. Em tabela enorme, identificador ordenado no tempo evita o problema.",
            },
            {
                frente: "Como funciona um identificador ordenável no tempo?",
                verso: "Os bits mais altos guardam o instante da criação, depois vem um identificador da máquina e uma sequência local. Assim ele é único sem coordenação e fica em ordem de criação, o que ajuda o índice. O cuidado é o relógio de uma máquina voltar no tempo.",
            },
            {
                frente: "Quando você usaria uma fila em vez de uma chamada síncrona?",
                verso: "Quando quem pediu não precisa do resultado na hora, quando o trabalho é demorado ou quando o destino pode ficar indisponível. A fila absorve pico e permite reprocessar. Se o usuário precisa da resposta para seguir, a chamada síncrona continua sendo o certo.",
            },
            {
                frente: "O que a entrega ao menos uma vez exige do consumidor?",
                verso: "Que ele tolere receber a mesma mensagem mais de uma vez sem repetir o efeito. Isso se resolve com operação idempotente ou com registro das mensagens já processadas. É o padrão da maioria das filas, então duplicata é comportamento esperado, e não exceção.",
            },
            {
                frente: "Para que serve uma fila de mensagens mortas?",
                verso: "Para onde vai a mensagem que falhou depois de um número de tentativas, guardada com o motivo para análise e reprocessamento. Sem ela, uma mensagem que sempre quebra trava o consumo ou some sem ninguém saber. Ela também precisa de alerta, senão vira um cemitério.",
            },
            {
                frente: "Qual a diferença entre fila e tópico?",
                verso: "Na fila, cada mensagem é processada por um consumidor só, e vários consumidores dividem o trabalho. No tópico, cada assinante recebe a sua cópia. Fila distribui tarefa; tópico espalha evento para vários interessados.",
            },
            {
                frente: "O que é contrapressão num sistema?",
                verso: "É o componente sobrecarregado conseguir sinalizar para quem envia que desacelere, em vez de acumular trabalho até cair. Pode ser recusar com erro de sobrecarga, limitar a fila ou pausar o produtor. Sem isso, a lentidão vira falta de memória e queda.",
            },
            {
                frente: "Como você faria novas tentativas sem piorar uma queda?",
                verso: "Com poucas tentativas, espera crescente entre elas e um sorteio no tempo para os clientes não repetirem juntos. Só para erro passageiro, nunca para erro de validação, e com um orçamento de repetições por serviço. Repetição sem controle multiplica a carga do dependente.",
            },
            {
                frente: "O que é um disjuntor numa chamada entre serviços?",
                verso: "Um mecanismo que para de chamar um dependente depois de muitas falhas seguidas, devolvendo erro ou resposta de reserva na hora. De tempos em tempos deixa passar uma tentativa para ver se ele voltou. Protege quem chama e dá fôlego para o dependente se recuperar.",
            },
            {
                frente: "O que é um orçamento de latência numa cadeia de chamadas?",
                verso: "É dividir o tempo total que a requisição pode levar entre os passos que ela percorre, e passar o prazo restante adiante. Assim um serviço no fim da cadeia não continua trabalhando numa resposta que o cliente já desistiu de esperar.",
            },
            {
                frente: "Como você escolheria entre polling, long polling, eventos do servidor e WebSocket?",
                verso: "Polling para atualização rara e simples. Long polling quando não dá para manter conexão especial. Eventos do servidor para fluxo só do servidor ao cliente, como notificações. WebSocket quando os dois lados enviam com frequência, como chat e jogo.",
            },
            {
                frente: "Como você desenharia um encurtador de URL?",
                verso: "Uma rota que recebe a URL longa, gera um código e grava a relação, e outra que busca o código e redireciona. A leitura domina de longe, então o redirecionamento passa por cache. A parte interessante é gerar código curto sem colisão e contar cliques sem atrasar.",
            },
            {
                frente: "Como você geraria o código curto de um encurtador?",
                verso: "Convertendo um identificador único numérico para uma base com letras e números, o que dá códigos curtos e sem colisão. Hash da URL truncado é mais simples e colide, exigindo checagem. Identificador sequencial exposto permite enumerar todos os links.",
            },
            {
                frente: "Redirecionamento permanente ou temporário num encurtador, e por quê?",
                verso: "O permanente fica em cache no navegador, alivia o servidor e faz os cliques seguintes não passarem por você, então somem das estatísticas. O temporário passa sempre pelo servidor, o que custa mais e permite contar cada clique e mudar o destino.",
            },
            {
                frente: "Como você contaria cliques sem atrasar o redirecionamento?",
                verso: "Redirecionando imediatamente e publicando o evento de clique numa fila, que um processo separado agrega e grava. O usuário não espera pela escrita da estatística. A contagem fica alguns segundos atrasada, o que é aceitável para esse tipo de número.",
            },
            {
                frente: "Token assinado ou sessão guardada no servidor: qual o trade-off?",
                verso: "O token assinado dispensa consulta a cada requisição e escala fácil, e é difícil de revogar antes de expirar. A sessão no servidor exige consulta a um armazenamento e pode ser encerrada na hora. É comum combinar token de acesso curto com renovação controlada no servidor.",
            },
            {
                frente: "Como você faria upload de arquivos grandes?",
                verso: "Com o cliente enviando direto para o armazenamento de objetos por uma URL assinada, em partes que podem ser retomadas, e a API só registrando o resultado. Passar o arquivo pela aplicação ocupa banda e memória do servidor sem entregar nada ao usuário.",
            },
            {
                frente: "Como você serviria imagens em vários tamanhos?",
                verso: "Gerando as variações depois do upload, de forma assíncrona, ou sob demanda na primeira requisição com o resultado guardado na CDN. O cliente pede o tamanho que precisa. Mandar a imagem original para um celular desperdiça banda e deixa a página lenta.",
            },
            {
                frente: "Como você invalidaria conteúdo numa CDN?",
                verso: "Preferindo nunca precisar: nome de arquivo com a versão ou o hash do conteúdo, e cache longo. Assim publicar é mudar o nome, e o antigo expira sozinho. Pedir limpeza de cache funciona e demora a propagar, então fica para emergência.",
            },
            {
                frente: "Qual a diferença entre balanceamento na camada de transporte e na de aplicação?",
                verso: "Na camada de transporte o balanceador repassa conexões sem olhar o conteúdo, o que é rápido e simples. Na de aplicação ele lê a requisição HTTP e pode rotear por caminho, cabeçalho ou cookie, e terminar a criptografia. A segunda é mais flexível e custa mais processamento.",
            },
            {
                frente: "Por que afinidade de sessão no balanceador costuma ser evitada?",
                verso: "Porque ela prende o usuário a uma instância, então a carga fica desigual, escalar não redistribui quem já está conectado e a queda daquela instância derruba as sessões dela. Na maioria dos casos ela esconde estado que deveria estar num armazenamento compartilhado.",
            },
            {
                frente: "Que estratégias de distribuição um balanceador usa?",
                verso: "Revezamento simples, menor número de conexões ativas, peso por capacidade e hash de um atributo, como o cliente. Revezamento serve quando as requisições são parecidas. Menos conexões ativas serve quando elas variam muito de duração.",
            },
            {
                frente: "Qual a diferença entre verificação de vivacidade e de prontidão?",
                verso: "A de vivacidade responde se o processo travou e deve ser reiniciado. A de prontidão responde se ele consegue atender agora e deve receber tráfego. Misturar as duas faz o orquestrador reiniciar uma instância só porque uma dependência oscilou.",
            },
            {
                frente: "Como você publicaria uma versão nova sem derrubar o sistema?",
                verso: "Trocando instâncias aos poucos, cada nova só recebendo tráfego depois de pronta e cada antiga terminando as requisições em andamento antes de sair. Com canário, uma fatia pequena recebe a versão nova primeiro. E banco compatível com as duas versões durante a troca.",
            },
            {
                frente: "Como uma chave de funcionalidade ajuda no deploy?",
                verso: "Separa publicar o código de ligar o comportamento. O código vai para produção desligado, é ativado para uma fatia de usuários e desligado na hora se der problema, sem novo deploy. O custo é o caminho duplo no código e chaves que precisam ser removidas depois.",
            },
            {
                frente: "Como você evoluiria uma API sem quebrar os clientes?",
                verso: "Só acrescentando: campo novo opcional, nunca removendo nem mudando o significado de um existente. Os clientes precisam ignorar o que não conhecem. Quando a quebra é inevitável, uma versão nova convive com a antiga por um prazo anunciado.",
            },
            {
                frente: "Como você enviaria uma notificação para milhões de usuários?",
                verso: "Separando a decisão do envio: um processo gera as tarefas em lotes numa fila, e trabalhadores enviam respeitando o limite de cada provedor. Com registro do que já foi enviado, para uma falha no meio não reenviar para todo mundo.",
            },
            {
                frente: "Por que busca por texto com curinga no banco não serve para busca de verdade?",
                verso: "Porque curinga no começo impede o uso do índice e obriga a ler a tabela inteira, e ainda não entende plural, acento, sinônimo nem relevância. Funciona em tabela pequena. Busca de verdade usa um índice invertido, no próprio banco ou num motor de busca.",
            },
            {
                frente: "O que é um índice invertido?",
                verso: "Uma estrutura que, para cada termo, guarda a lista de documentos em que ele aparece, como o índice remissivo de um livro. Buscar vira cruzar essas listas em vez de ler cada documento. É a base dos motores de busca, junto com a normalização dos termos.",
            },
            {
                frente: "Como você implementaria o autocompletar de uma busca?",
                verso: "Com uma estrutura de prefixos guardando as consultas mais populares por prefixo já calculadas, servida de memória e atualizada periodicamente. Cada tecla precisa responder em poucas dezenas de milissegundos, então calcular popularidade na hora não serve.",
            },
            {
                frente: "Como você contaria usuários únicos em volume muito alto?",
                verso: "Com uma estrutura probabilística que estima a quantidade de elementos distintos usando pouca memória fixa, aceitando erro pequeno. Guardar o identificador de cada usuário para contar exatamente custa memória proporcional ao total, e o produto raramente precisa dessa exatidão.",
            },
            {
                frente: "O que é um filtro de Bloom, e onde ele ajuda?",
                verso: "Uma estrutura compacta que responde se um elemento talvez esteja no conjunto ou certamente não está. Nunca dá falso negativo, pode dar falso positivo. Serve para evitar consulta cara quando a resposta mais comum é não, como checar se uma URL já foi visitada.",
            },
            {
                frente: "Qual a diferença entre métricas, logs e rastros?",
                verso: "Métricas são números agregados no tempo, baratos e bons para alerta. Logs são eventos individuais com detalhe, bons para investigar um caso. Rastros seguem uma requisição por vários serviços e mostram onde o tempo foi gasto. Cada um responde uma pergunta diferente.",
            },
            {
                frente: "Que métricas você colocaria em qualquer serviço?",
                verso: "Taxa de requisições, taxa de erros e duração por percentil, que dizem o que o usuário sente, mais a saturação dos recursos principais, como CPU, memória, conexões e fila. Com essas quatro dá para responder se está funcionando e o quanto falta para o limite.",
            },
            {
                frente: "Por que olhar percentil de latência e não a média?",
                verso: "Porque a média esconde a cauda: com a maioria rápida e uma parcela muito lenta, a média parece boa enquanto um em cada cem usuários espera segundos. E uma página que faz várias chamadas quase sempre esbarra na cauda de alguma delas.",
            },
            {
                frente: "O que é o orçamento de erro, e como ele muda decisões?",
                verso: "É a falha permitida pelo SLO num período, como os minutos de indisponibilidade aceitos por mês. Enquanto sobra orçamento, o time arrisca publicar mais. Quando acaba, a prioridade vira estabilidade. Transforma a briga entre velocidade e estabilidade numa regra combinada.",
            },
            {
                frente: "Como você evitaria que uma tarefa agendada rode duas vezes?",
                verso: "Com uma trava compartilhada com dono e validade, adquirida antes de rodar, ou com um agendador que já coordena entre instâncias. E desenhando a tarefa para ser idempotente, porque a trava pode expirar no meio de uma execução lenta.",
            },
            {
                frente: "Como você lidaria com fuso horário num sistema usado em vários países?",
                verso: "Guardando instantes em UTC, convertendo para o fuso do usuário só na apresentação e guardando o fuso quando a regra depende dele, como um lembrete às nove da manhã local. Horário de verão e mudança de fuso por lei são o que quebra conversão feita na mão.",
            },
            {
                frente: "Onde você guardaria contadores atualizados o tempo todo?",
                verso: "Num armazenamento em memória com incremento atômico, gravando no banco em lote de tempos em tempos. Incrementar direto no banco a cada evento gera disputa pela mesma linha. O risco é perder o intervalo não gravado numa falha, o que precisa ser aceitável.",
            },
            {
                frente: "Como você processaria um arquivo logo depois do upload?",
                verso: "Com o armazenamento avisando que o arquivo chegou, uma mensagem numa fila e trabalhadores processando e registrando o resultado. O usuário vê o estado em processamento. Processar dentro da requisição de upload prende a conexão e perde tudo se o servidor reiniciar.",
            },
            {
                frente: "Quando um intermediário de conexões com o banco ajuda?",
                verso: "Quando há muitas instâncias ou funções abrindo conexão e o banco não aguenta tantas, porque cada conexão custa memória nele. O intermediário mantém um conjunto pequeno e reaproveita entre clientes. É comum com funções sem servidor e com escalonamento agressivo.",
            },
            {
                frente: "Como você aliviaria uma consulta cara feita por muitos usuários?",
                verso: "Primeiro otimizando a consulta com índice e plano. Se continuar cara e o resultado puder ficar um pouco velho, guardando o resultado pronto num cache ou numa tabela pré-calculada atualizada de tempos em tempos. Calcular a mesma coisa mil vezes por minuto é desperdício.",
            },
            {
                frente: "O que é uma visão materializada, e quando ela ajuda?",
                verso: "O resultado de uma consulta guardado como tabela e atualizado periodicamente ou por evento. Ajuda em relatório e painel com agregação pesada lida muitas vezes. O custo é o dado ficar tão atrasado quanto o intervalo de atualização, e a atualização em si pesar.",
            },
            {
                frente: "Como você guardaria o histórico de alterações de um registro?",
                verso: "Numa tabela de histórico com a versão anterior, quem alterou e quando, gravada na mesma transação da alteração. Assim não existe alteração sem registro. Guardar só o estado atual e tentar reconstruir o passado por log de aplicação não funciona na hora de uma auditoria.",
            },
            {
                frente: "Como você desenharia a exclusão dos dados de um usuário?",
                verso: "Mapeando todos os lugares onde o dado vive, inclusive cache, busca, backup e sistemas parceiros, e executando a exclusão por um processo assíncrono rastreável. Apagar a linha principal e esquecer as cópias é o erro mais comum, e é o que aparece numa auditoria.",
            },
            {
                frente: "Como você desenharia um sistema simples de comentários?",
                verso: "Tabela de comentários ligada ao conteúdo, ordenada por data com paginação por cursor, cache das primeiras páginas do conteúdo popular e contagem mantida à parte. Moderação e resposta aninhada mudam o desenho, então vale perguntar se existem antes de desenhar.",
            },
            {
                frente: "Como você tornaria idempotente a criação de um pedido?",
                verso: "Com uma chave única enviada pelo cliente em cada tentativa e uma restrição de unicidade no banco. Se a mesma chave chegar de novo, devolve-se o pedido já criado em vez de criar outro. A chave precisa ser gerada antes do primeiro envio, e não a cada nova tentativa.",
            },
            {
                frente: "Como você decidiria o que colocar em cache numa página de produto?",
                verso: "Separando o que muda pouco, como descrição e imagens, do que muda muito, como preço e estoque. O primeiro vai para cache longo e CDN; o segundo tem cache curto ou é consultado na hora, porque mostrar estoque errado vira pedido que não pode ser atendido.",
            },
        ],
        pleno: [
            {
                frente: "Como você escolheria a chave de particionamento?",
                verso: "Pela consulta mais frequente, para ela cair numa partição só, e por uma distribuição que não concentre carga. Identificador do cliente costuma servir bem; data costuma ser péssima, porque todo tráfego novo cai na mesma partição. E ela é cara de trocar depois.",
            },
            {
                frente: "O que é uma chave quente, e como você a trataria?",
                verso: "Uma chave que recebe uma fração desproporcional do tráfego, como a conta de uma celebridade, e sobrecarrega a partição onde mora. As saídas são espalhar a chave com um sufixo e juntar na leitura, cachear na frente e tratar esses casos à parte.",
            },
            {
                frente: "Que problema o hashing consistente resolve?",
                verso: "Com a divisão simples pelo número de servidores, acrescentar um servidor muda o destino de quase todas as chaves e esvazia o cache inteiro. No hashing consistente, servidores e chaves ficam num anel, e mudar um servidor move só as chaves vizinhas dele.",
            },
            {
                frente: "Por que o hashing consistente usa nós virtuais?",
                verso: "Porque com poucos pontos no anel a distribuição fica desigual e, quando um servidor sai, toda a carga dele cai num único vizinho. Cada servidor ocupando muitos pontos espalha melhor as chaves e divide a carga de quem saiu entre vários. Também permite dar peso por capacidade.",
            },
            {
                frente: "Como você rebalancearia partições sem parar o sistema?",
                verso: "Copiando os dados da partição de origem para a nova em segundo plano, acompanhando as escritas que chegam durante a cópia, e virando o roteamento só quando as duas estiverem iguais. Com limite de ritmo, para a migração não disputar recurso com o tráfego normal.",
            },
            {
                frente: "O que o PACELC acrescenta ao CAP?",
                verso: "Diz que, mesmo sem partição de rede, existe uma escolha entre latência e consistência, porque esperar a confirmação das réplicas custa tempo. É uma descrição mais útil do dia a dia, já que partição é rara e a troca entre rapidez e consistência acontece em toda escrita.",
            },
            {
                frente: "Como funciona leitura e escrita por quórum?",
                verso: "Com N cópias, a escrita confirma depois de W delas e a leitura consulta R. Se R mais W passar de N, toda leitura encontra ao menos uma cópia com a escrita mais recente. Ajustar os números troca latência de escrita por latência de leitura, e disponibilidade por consistência.",
            },
            {
                frente: "O que é a divisão de cérebro num cluster, e como evitar?",
                verso: "É uma partição de rede fazer dois lados acreditarem que são o líder e aceitarem escritas conflitantes. Evita-se exigindo maioria para eleger líder, por isso clusters usam número ímpar de nós, e com um número de mandato que faz o líder antigo ter as escritas recusadas.",
            },
            {
                frente: "Onde a eleição de líder aparece, e o que ela exige?",
                verso: "Em banco com réplica principal, em fila e em qualquer tarefa que só uma instância deve executar. Exige consenso da maioria, tempo de mandato e garantia de que o líder deposto não continue agindo. Implementar na mão é arriscado; usa-se um serviço de coordenação.",
            },
            {
                frente: "Por que o relógio da máquina não serve para ordenar eventos distribuídos?",
                verso: "Porque relógios de máquinas diferentes divergem e podem até voltar no tempo ao sincronizar. Dois eventos com poucos milissegundos de diferença podem aparecer invertidos. Para ordem causal se usam relógios lógicos ou uma sequência atribuída por um único ponto.",
            },
            {
                frente: "Como você resolveria conflito de escrita entre réplicas?",
                verso: "A última escrita vence é o mais simples, e perde dado sem avisar. Guardar as versões conflitantes e resolver na aplicação preserva tudo e dá trabalho. Estruturas que se fundem sozinhas resolvem casos como contador e lista colaborativa. A escolha depende do custo de perder uma escrita.",
            },
            {
                frente: "O que é o padrão de caixa de saída, e que problema resolve?",
                verso: "Gravar o evento numa tabela na mesma transação do dado, e um processo separado publicar essa tabela na fila. Resolve a janela em que o banco confirmou e a publicação falhou, ou o contrário. O evento pode sair duas vezes, então o consumidor continua precisando ser idempotente.",
            },
            {
                frente: "O que é uma saga, e quando ela substitui transação distribuída?",
                verso: "Uma sequência de transações locais em serviços diferentes, cada uma com uma ação que desfaz o efeito se um passo posterior falhar. Serve quando a operação atravessa serviços e bancos distintos. O custo é conviver com estados intermediários visíveis e desenhar bem as compensações.",
            },
            {
                frente: "Por que o commit em duas fases costuma ser evitado?",
                verso: "Porque ele trava recursos em todos os participantes enquanto espera o coordenador, e se o coordenador cai no meio os participantes ficam presos sem saber se confirmam. Isso acopla a disponibilidade de todos. Em sistemas com serviços independentes, saga e idempotência escalam melhor.",
            },
            {
                frente: "Por que exatamente uma vez, na prática, é efeito idempotente?",
                verso: "Porque a entrega da rede não garante isso: uma confirmação perdida sempre obriga a reenviar. O que dá para garantir é que processar a mesma mensagem de novo não repita o efeito, com chave de deduplicação ou operação idempotente. O resultado visível é o de uma vez só.",
            },
            {
                frente: "Como você implementaria chave de idempotência numa API de pagamento?",
                verso: "O cliente gera uma chave por intenção de pagamento e envia em cada tentativa. O servidor grava a chave com a resposta, com restrição de unicidade, e devolve a mesma resposta nas repetições. Precisa tratar a chamada ainda em andamento e expirar a chave depois de um prazo.",
            },
            {
                frente: "Quando vale separar o modelo de leitura do modelo de escrita?",
                verso: "Quando leitura e escrita têm exigências muito diferentes, como escrita normalizada e consistente e leitura em formatos variados e muito volumosos. A escrita publica eventos que alimentam visões de leitura. O custo é atraso entre os dois e mais peças para operar.",
            },
            {
                frente: "Qual o custo de guardar eventos como fonte da verdade?",
                verso: "O estado atual precisa ser reconstruído a partir da sequência, o que exige fotografias periódicas. Mudar o formato de um evento antigo é difícil, porque ele não pode ser reescrito. Em troca, há histórico completo e a possibilidade de reprocessar. Vale em domínio que já pensa em eventos.",
            },
            {
                frente: "Num feed social, você montaria na escrita ou na leitura?",
                verso: "Na escrita, cada post é copiado para o feed de cada seguidor, e a leitura fica rapidíssima com escrita cara. Na leitura, o feed é montado na hora juntando quem a pessoa segue, com leitura cara. Como se lê muito mais que se escreve, montar na escrita costuma ser a base.",
            },
            {
                frente: "Como você trataria contas com milhões de seguidores num feed?",
                verso: "Sem copiar o post delas para milhões de feeds, o que atrasaria tudo. O feed pré-montado cobre as contas comuns, e os posts das contas gigantes são buscados na hora da leitura e misturados. É o modelo híbrido, e a fronteira entre os dois grupos é um número a calibrar.",
            },
            {
                frente: "Como você desenharia um chat em tempo real?",
                verso: "Clientes conectados por WebSocket a servidores de conexão, um serviço que grava cada mensagem e um barramento que entrega para o servidor onde o destinatário está conectado. A mensagem é persistida antes de ser confirmada. Presença e entrega a quem está offline são peças à parte.",
            },
            {
                frente: "Como você garantiria a ordem das mensagens num chat?",
                verso: "Com uma sequência por conversa atribuída no servidor, e não pelo relógio do cliente, e o cliente ordenando e detectando lacunas por ela. Ordem global entre conversas não é necessária e seria um gargalo. Particionar por conversa mantém a ordem onde ela importa.",
            },
            {
                frente: "Como você mostraria quem está online em escala?",
                verso: "Com batidas periódicas do cliente atualizando um registro com validade em memória, e a pessoa aparecendo offline quando a validade vence. Espalhar cada mudança para todos os contatos é caro, então se envia só para quem está com a conversa aberta, e com algum atraso aceitável.",
            },
            {
                frente: "Como você entregaria mensagens para quem está offline?",
                verso: "Gravando a mensagem e deixando pendente de entrega, disparando uma notificação pelo provedor do celular e sincronizando as pendentes quando o cliente reconectar, a partir da última sequência que ele tem. A notificação é só um aviso: o conteúdo vem da sincronização.",
            },
            {
                frente: "Como você desenharia upload e reprodução de vídeo?",
                verso: "Upload direto para o armazenamento, uma fila disparando a conversão para várias resoluções em pedaços curtos, e distribuição pela CDN. O reprodutor escolhe a qualidade conforme a conexão. A conversão é a parte cara e lenta, então roda assíncrona e em paralelo por pedaço.",
            },
            {
                frente: "O que é streaming com qualidade adaptativa?",
                verso: "O vídeo é dividido em pedaços de poucos segundos em várias qualidades, e um arquivo de índice lista as opções. O reprodutor mede a própria conexão e escolhe a qualidade de cada pedaço. Assim a reprodução não trava quando a rede piora; ela só perde definição.",
            },
            {
                frente: "Como você desenharia o rastreamento de localização em tempo real?",
                verso: "O aplicativo envia a posição a cada poucos segundos, o servidor guarda só a mais recente de cada um em memória, indexada por região, e o histórico vai para armazenamento barato em lote. Quem acompanha recebe atualização por conexão aberta, e não perguntando o tempo todo.",
            },
            {
                frente: "Como você encontraria os motoristas mais próximos de um passageiro?",
                verso: "Dividindo o mapa em células por um código geográfico em que prefixo comum indica proximidade, buscando na célula do passageiro e nas vizinhas, e ordenando os candidatos pela distância real. Buscar calculando distância para todos os motoristas não escala.",
            },
            {
                frente: "Como você desenharia um limitador de requisições distribuído?",
                verso: "Com contadores num armazenamento em memória compartilhado, atualizados por operação atômica para duas instâncias não lerem o mesmo valor. Para evitar uma ida à rede por requisição, cada instância pode reservar uma cota local e sincronizar, aceitando pequena imprecisão.",
            },
            {
                frente: "Como você desenharia notificações por vários canais?",
                verso: "Um serviço recebe o pedido, consulta as preferências do usuário, e publica uma tarefa por canal em filas separadas, cada uma com trabalhadores e limites do provedor. Assim a lentidão do SMS não atrasa o email. Com deduplicação e registro de entrega por notificação.",
            },
            {
                frente: "Como você desenharia um contador de curtidas com alta concorrência?",
                verso: "Registrando cada curtida como linha única por usuário e conteúdo, o que impede duplicar, e mantendo o total num contador em memória atualizado de forma atômica e gravado em lote. A tela mostra o contador aproximado; o total exato vem da contagem quando precisar.",
            },
            {
                frente: "Como você desenharia um ranking em tempo real?",
                verso: "Com um conjunto ordenado em memória, que atualiza a pontuação e responde posição e vizinhos em tempo logarítmico, com o banco como registro permanente. Para milhões de jogadores, particionar por região ou temporada e aceitar posição aproximada fora do topo.",
            },
            {
                frente: "Como você manteria o índice de busca sincronizado com o banco?",
                verso: "Capturando as mudanças do banco e aplicando no índice por uma fila, em vez de a aplicação escrever nos dois lugares. Escrita dupla na aplicação perde atualização quando uma das duas falha. E ter um jeito de reconstruir o índice inteiro, porque um dia ele vai divergir.",
            },
            {
                frente: "Para que serve capturar mudanças direto do log do banco?",
                verso: "Para transformar cada alteração confirmada em evento, lendo o registro de transações do banco, sem mudar o código da aplicação. Alimenta busca, cache, análise e integração com a garantia de que só vira evento o que foi de fato gravado.",
            },
            {
                frente: "Como você desenharia um coletor de páginas da web?",
                verso: "Uma fronteira de URLs a visitar, priorizada e dividida por domínio para respeitar o limite de cada site, trabalhadores que baixam e extraem links, e deduplicação de URL e de conteúdo. As regras de acesso de cada site são obedecidas, e armadilhas de links infinitos precisam de limite.",
            },
            {
                frente: "Como você desenharia um agendador de tarefas distribuído?",
                verso: "Tarefas gravadas com o horário de execução num armazenamento indexado por tempo, um processo que periodicamente move as vencidas para uma fila e trabalhadores que executam. Com trava por tarefa e reentrega se o trabalhador sumir, e tarefas desenhadas para rodar mais de uma vez sem estrago.",
            },
            {
                frente: "Como você evitaria que muitas requisições recalculem o mesmo item quando o cache expira?",
                verso: "Deixando só uma requisição recalcular, com uma trava pela chave, enquanto as outras esperam ou recebem o valor antigo. Também renovando antes de expirar e espalhando o vencimento com aleatoriedade. Sem isso, um item popular expirado derruba o banco no mesmo segundo.",
            },
            {
                frente: "Como você aqueceria um cache antes de receber tráfego?",
                verso: "Carregando os itens mais acessados a partir do histórico recente, ou espelhando uma fração do tráfego real para a instância nova antes de ela entrar em rotação. Cache frio depois de um deploy ou de uma queda despeja toda a carga no banco no pior momento.",
            },
            {
                frente: "Como você lidaria com várias camadas de cache mostrando dados diferentes?",
                verso: "Definindo o TTL de cada camada de fora para dentro, com as externas mais curtas ou versionadas, e invalidando a partir da origem. Sem uma regra, o navegador, a CDN e o cache da aplicação guardam versões diferentes e o dado velho volta depois de corrigido.",
            },
            {
                frente: "Como você desenharia um armazenamento chave-valor distribuído?",
                verso: "Particionamento por hashing consistente, réplicas em nós diferentes, escrita e leitura por quórum configurável, detecção de falha entre os nós e reparo das réplicas que divergirem. Cada escolha troca consistência por disponibilidade, e o desenho precisa dizer qual lado preferiu.",
            },
            {
                frente: "Como você responderia uma consulta que junta dados de vários serviços?",
                verso: "Se é tela, uma camada de composição chama os serviços em paralelo e junta, com timeout e resposta parcial. Se é relatório ou filtro combinado, uma visão de leitura alimentada pelos eventos de cada serviço. Consulta cruzada direto nos bancos dos outros cria acoplamento.",
            },
            {
                frente: "Como você migraria dados entre bancos com o sistema no ar?",
                verso: "Escrevendo nos dois, copiando o histórico em lotes, comparando os dois lados até baterem, passando a ler do novo aos poucos e só então desligando o antigo. Cada etapa tem volta. A comparação é a parte que se pula e é a que garante que nada se perdeu.",
            },
            {
                frente: "Como você decidiria promover um deploy canário?",
                verso: "Comparando a fatia nova com a antiga no mesmo período, por taxa de erro, latência e métrica de negócio, com critério definido antes. Olhar o painel e achar que está bom não é critério. Tráfego pequeno demais também engana, porque não expõe o caso raro.",
            },
            {
                frente: "Como você desenharia um sistema multirregião ativo-passivo?",
                verso: "Uma região atende e replica os dados para a outra, que fica pronta com a infraestrutura de pé ou recriável. Na falha, o tráfego é desviado e a réplica promovida. Perde-se o que não tinha replicado, e a troca precisa ser ensaiada, senão falha no dia real.",
            },
            {
                frente: "O que muda num sistema ativo-ativo em várias regiões?",
                verso: "As duas regiões aceitam escrita, então aparecem conflitos de escrita concorrente, e é preciso decidir quem vence ou particionar os usuários por região. A latência e a disponibilidade melhoram. O custo é complexidade de dados muito maior, e nem todo domínio tolera.",
            },
            {
                frente: "Como você definiria RPO e RTO?",
                verso: "O RPO é quanto dado o negócio aceita perder, medido em tempo; o RTO é quanto tempo aceita ficar fora. Os dois vêm do negócio, e não da tecnologia, e cada minuto a menos custa caro. Eles decidem entre backup diário, replicação contínua e região pronta para assumir.",
            },
            {
                frente: "Como você planejaria a recuperação de um desastre?",
                verso: "Começando pelo RPO e RTO de cada sistema, definindo onde estão as cópias e como restaurar, escrevendo o passo a passo e ensaiando de verdade com periodicidade. Plano nunca ensaiado falha em detalhe esquecido, como a credencial que só existia na região que caiu.",
            },
            {
                frente: "Como você limitaria o raio de explosão de uma falha?",
                verso: "Isolando recursos por dependência e por cliente, com pools separados, limites por inquilino e publicação por partes. Uma consulta ruim de um cliente não pode esgotar as conexões de todos. A pergunta de desenho é quantos usuários uma única falha consegue atingir.",
            },
            {
                frente: "O que é uma arquitetura baseada em células?",
                verso: "Replicar a pilha inteira em células independentes, cada uma atendendo um grupo de clientes, com uma camada fina de roteamento na frente. Uma falha ou deploy ruim atinge só uma célula. O custo é operar muitas cópias e mover clientes entre células quando elas enchem.",
            },
            {
                frente: "Como você manteria uma loja vendendo num pico que o sistema não aguenta?",
                verso: "Protegendo o caminho da compra e desligando o que é secundário, como recomendação e avaliações. Uma fila de entrada controla quantos entram no checkout por vez, e o catálogo vem de cache mesmo que um pouco atrasado. Recusar parte com clareza é melhor que cair para todos.",
            },
            {
                frente: "Como você faria um teste de carga que represente produção?",
                verso: "Com a mesma mistura de operações, dados em volume realista e cache em estado parecido, subindo a carga aos poucos até achar onde a latência dispara. Testar uma rota só, com dado vazio e cache quente, mede um sistema que não existe.",
            },
            {
                frente: "Como você encontraria o gargalo de um sistema lento?",
                verso: "Seguindo o tempo de uma requisição pelos rastros até o trecho que domina, e olhando a saturação de cada recurso: CPU, conexões, fila e travas. Gargalo costuma ser um recurso compartilhado cheio, e acrescentar servidores na frente dele só aumenta a disputa.",
            },
            {
                frente: "Como você lidaria com uma fila que cresce sem parar?",
                verso: "Descobrindo antes se a produção aumentou ou o consumo travou. Consumidor ocioso com fila crescendo indica mensagem que falha sempre ou dependência lenta. Se é volume real, escalar consumidores até o limite do destino. E alertar pela idade da mensagem mais antiga.",
            },
            {
                frente: "Como você dimensionaria os consumidores de uma fila?",
                verso: "Pela taxa de chegada no pico dividida pelo que cada consumidor processa, com folga, e limitado pelo que o destino aguenta. Consumidor a mais sobre um banco saturado só piora. Escalar pela idade da mensagem mais antiga reflete melhor o atraso sentido que pelo tamanho.",
            },
            {
                frente: "Como você garantiria ordem por chave num sistema de mensagens particionado?",
                verso: "Publicando com a chave de negócio, como o identificador da conta, para todas as mensagens dela caírem na mesma partição, que é consumida em ordem. A ordem vale só dentro da chave. Mudar o número de partições embaralha as chaves, então isso precisa ser planejado.",
            },
            {
                frente: "Como você desenharia um sistema de pagamentos confiável?",
                verso: "Com chave de idempotência em toda operação, estado explícito de cada pagamento, registro contábil imutável de débito e crédito, webhook do provedor tratado como possivelmente repetido e reconciliação periódica. Nada é apagado ou sobrescrito: correção vira novo lançamento.",
            },
            {
                frente: "Como você reconciliaria seus dados com um sistema externo?",
                verso: "Comparando periodicamente o que você registrou com o relatório do outro lado, por identificador e valor, e tratando cada divergência como caso a investigar. Webhook perdido e resposta que nunca chegou acontecem, e a reconciliação é a rede que pega o que escapou.",
            },
            {
                frente: "Como você desenharia a API de inferência de um modelo de IA?",
                verso: "Com fila na frente dos servidores de GPU, limite por cliente, resposta em fluxo para o texto aparecer aos poucos, timeout e cancelamento quando o cliente desiste. GPU é o recurso caro e escasso, então o desenho gira em aproveitá-la ao máximo sem estourar a latência.",
            },
            {
                frente: "Como você lidaria com fila de GPU e agrupamento dinâmico de requisições?",
                verso: "Juntando as requisições que chegam num intervalo curto num mesmo lote, porque a GPU processa lote quase pelo custo de uma. O intervalo troca latência por vazão. Separar filas por tamanho de entrada e prioridade evita que uma requisição enorme segure as pequenas.",
            },
            {
                frente: "Como você desenharia recuperação de contexto para um modelo em escala?",
                verso: "Documentos divididos em trechos, transformados em vetores e indexados, com busca aproximada por similaridade combinada com filtro por permissão e busca por palavra. A etapa de ingestão é assíncrona. O controle de acesso precisa estar na busca, senão o modelo vaza documento alheio.",
            },
            {
                frente: "Como você avaliaria e monitoraria um sistema com modelo de linguagem?",
                verso: "Com um conjunto de casos com resposta esperada, rodado a cada mudança de prompt ou modelo, e em produção com amostragem de conversas, retorno do usuário, taxa de recusa, custo e latência. Resposta de modelo varia, então sem avaliação automática toda mudança é aposta.",
            },
            {
                frente: "Como você controlaria o custo por token num produto com IA?",
                verso: "Medindo custo por funcionalidade e por cliente, cortando contexto desnecessário, usando modelo menor onde ele basta, cacheando respostas e prefixos repetidos e impondo limite de uso por plano. Sem medida por funcionalidade, o custo cresce sem ninguém saber de onde.",
            },
            {
                frente: "Como você armazenaria logs em volume muito alto?",
                verso: "Coletando de forma assíncrona, com um buffer que aguenta pico, indexando só os campos consultados e movendo o antigo para armazenamento barato com retenção definida. Amostrando o que é repetitivo e mantendo todos os erros. Indexar tudo para sempre é a conta que cresce mais rápido.",
            },
            {
                frente: "Como você rastrearia uma requisição que passa por uma fila?",
                verso: "Levando o contexto do rastro dentro da mensagem, como metadado, e retomando no consumidor como continuação ligada à requisição original. Sem isso, o rastro termina na publicação e o processamento aparece solto, sem como saber qual pedido o originou.",
            },
            {
                frente: "Como você desenharia a análise de cliques de um encurtador em escala?",
                verso: "Eventos de clique publicados num fluxo particionado, agregados por janela de tempo e gravados num banco colunar ou em contadores pré-calculados por link e período. As consultas leem os agregados, e os eventos brutos vão para armazenamento barato para reprocessar.",
            },
            {
                frente: "Como você desenharia reservas sem vender o mesmo lugar duas vezes?",
                verso: "Com uma reserva temporária do lugar com validade, feita por escrita condicional ou trava no registro, e confirmação só depois do pagamento. Se o pagamento não vier a tempo, a reserva expira e o lugar volta. A garantia fica no banco, e não numa checagem antes de gravar.",
            },
            {
                frente: "Como você lidaria com estoque numa venda relâmpago?",
                verso: "Tirando a disputa do banco principal: estoque decrementado de forma atômica em memória, fila de entrada limitando quem chega ao checkout e gravação assíncrona dos pedidos. Checar se há estoque e depois baixar em dois passos vende mais do que existe.",
            },
            {
                frente: "Como você armazenaria métricas em séries temporais?",
                verso: "Num banco feito para série temporal, que agrupa pontos por tempo e comprime bem, com retenção em camadas: resolução alta por poucos dias e agregada por meses. O cuidado principal é a cardinalidade dos rótulos, que multiplica séries e derruba o armazenamento.",
            },
            {
                frente: "Como você desenharia a sincronização de arquivos entre dispositivos?",
                verso: "Arquivos divididos em blocos identificados por hash, enviando só os blocos que mudaram, metadados com versão por arquivo e um serviço que avisa os outros dispositivos. Conflito de edição simultânea vira cópia com os dois conteúdos, porque escolher um lado perde trabalho.",
            },
            {
                frente: "Como você garantiria que um sistema de mensagens não perca dados quando um nó cai?",
                verso: "Confirmando a publicação só depois de a mensagem estar gravada em mais de uma réplica, e o consumidor confirmando só depois de processar. Com isso a queda de um nó não apaga nada. O preço é latência maior na publicação e reprocessamento de algumas mensagens.",
            },
        ],
        senior: [
            {
                frente: "Como você conduziria uma sessão de design com requisitos ambíguos?",
                verso: "Transformando a ambiguidade em premissas explícitas, escritas e confirmadas, e mostrando onde cada uma muda o desenho. Quando ninguém sabe a resposta, desenhar para o cenário provável e apontar o que teria de mudar se ele não se confirmar. Ambiguidade escondida vira retrabalho.",
            },
            {
                frente: "Como você decidiria o que deixar fora do escopo de um desenho?",
                verso: "Pelo que não muda a arquitetura agora e pode entrar depois sem refazer a base, dizendo isso em voz alta. O que não pode ficar fora é o que é caro de acrescentar depois, como particionamento, isolamento entre clientes e trilha de auditoria.",
            },
            {
                frente: "Como você explicaria um trade-off técnico para alguém de produto?",
                verso: "Pelo efeito que o usuário e o negócio sentem, e não pelo mecanismo: o que ganha, o que perde, quanto custa e em que situação o risco aparece. Com duas ou três opções e uma recomendação. Explicar replicação assíncrona não ajuda; dizer que um comentário pode sumir por segundos ajuda.",
            },
            {
                frente: "Como você decidiria entre monólito e microsserviços para um time novo?",
                verso: "Monólito bem dividido por módulos, na grande maioria dos casos. Microsserviço resolve problema de muitos times publicando em paralelo e de partes com escala muito diferente, e cobra rede, falha parcial e operação. Um time pequeno paga todo o custo sem ter o problema que ele resolve.",
            },
            {
                frente: "Como você definiria as fronteiras entre serviços?",
                verso: "Por capacidade de negócio e por dono do dado, de forma que um serviço consiga mudar sem coordenar com outros na maior parte das entregas. Serviço que precisa de outro para quase toda operação está com a fronteira errada. Fronteira por camada técnica é quase sempre errada.",
            },
            {
                frente: "Como você lidaria com um sistema que tem microsserviços demais?",
                verso: "Mapeando quais sempre mudam e publicam juntos, quais só repassam chamada e quais têm o mesmo dono, e juntando esses de volta. Consolidar não é retroceder: é corrigir fronteira que custa latência e coordenação sem trazer independência nenhuma.",
            },
            {
                frente: "Como você decidiria o alvo de disponibilidade de um sistema?",
                verso: "Pelo que o negócio perde quando ele fica fora, pelo que os dependentes realmente oferecem e pelo que o time consegue operar. Prometer mais disponibilidade que a do banco ou do provedor de nuvem que você usa é prometer o impossível. Cada nove precisa pagar a própria conta.",
            },
            {
                frente: "Como você usaria o orçamento de erro para negociar entrega e estabilidade?",
                verso: "Combinando antes a regra: com orçamento sobrando, o time publica no ritmo normal; esgotado, as entregas param e o esforço vai para confiabilidade até recuperar. Assim a decisão deixa de ser opinião na hora do incidente e vira um acordo que produto e engenharia assinaram.",
            },
            {
                frente: "Como você avaliaria o custo total de um desenho?",
                verso: "Somando infraestrutura, tráfego, licenças, e principalmente o tempo de gente para construir, operar e manter de plantão. Um desenho mais barato em servidor e que exige três pessoas a mais para operar é o mais caro. Custo por usuário ou por transação ajuda a comparar.",
            },
            {
                frente: "Como você reduziria o custo de infraestrutura sem piorar a confiabilidade?",
                verso: "Começando pelo desperdício medido: recurso ocioso, instância superdimensionada, dado quente que podia estar em armazenamento frio, log demais e tráfego entre regiões. Esses cortes não mexem em redundância. Cortar réplica e margem de pico economiza até o próximo incidente.",
            },
            {
                frente: "Como você decidiria entre construir e contratar um componente de infraestrutura?",
                verso: "Contratando o que é igual para todo mundo, como fila, banco gerenciado e busca, e construindo o que diferencia o produto. A conta de construir inclui operar, atualizar e ficar de plantão por anos. A de contratar inclui preço em escala e o custo de sair.",
            },
            {
                frente: "Como você escolheria o banco de dados de um sistema novo?",
                verso: "Pelos formatos de acesso e pelas garantias exigidas, e pelo que o time sabe operar numa madrugada. Relacional gerenciado atende a maioria dos casos por muito tempo. Escolher um banco especializado no início troca um problema hipotético de escala por um problema real de operação.",
            },
            {
                frente: "Como você avaliaria adotar um banco especializado ao lado do principal?",
                verso: "Perguntando qual consulta ou volume o principal comprovadamente não aguenta, como busca textual, grafo ou série temporal, e como os dados serão mantidos em sincronia. Todo banco a mais é mais uma fonte de divergência, backup, monitoramento e conhecimento que o time precisa ter.",
            },
            {
                frente: "Como você decidiria com o negócio entre consistência forte e eventual?",
                verso: "Operação por operação, perguntando o que acontece se o usuário vir um valor atrasado ou se duas ações concorrentes forem aceitas. Saldo e estoque costumam exigir consistência forte; curtidas e visualizações não. Aplicar uma regra só para tudo desperdiça ou arrisca.",
            },
            {
                frente: "Como você lidaria com um requisito de tempo real mal definido?",
                verso: "Perguntando qual atraso o usuário percebe e qual o negócio aceita, e escrevendo o número. Tempo real para um painel costuma ser alguns segundos; para uma cotação, milissegundos. A diferença entre os dois muda da escolha de polling a uma infraestrutura inteira de fluxo.",
            },
            {
                frente: "Como você documentaria uma decisão de arquitetura?",
                verso: "Num registro curto: contexto, opções consideradas, decisão, consequências e o que faria revisitá-la, datado e junto do código. O valor está em registrar por que o outro caminho foi descartado. Sem isso, a decisão é desfeita por quem não conhece o problema que ela evitou.",
            },
            {
                frente: "O que você procura primeiro ao revisar o documento de design de outra pessoa?",
                verso: "Se o problema e os requisitos estão claros e com números, quais outros desenhos foram descartados e por quê, e o que acontece quando cada dependência falha. Depois migração, operação e custo. Documento que só descreve a solução escolhida esconde a decisão.",
            },
            {
                frente: "Como você trataria decisões reversíveis e irreversíveis de forma diferente?",
                verso: "Decisão fácil de desfazer se toma rápido e se corrige com dado. Decisão cara de desfazer, como formato de dado público, chave de particionamento e contrato com cliente, pede mais análise, protótipo e revisão. Tratar tudo com o mesmo peso ou trava o time ou gera dívida permanente.",
            },
            {
                frente: "Como você conduziria uma migração de arquitetura grande?",
                verso: "Por etapas que entregam valor e têm volta, com os dois mundos convivendo, métrica comparando comportamento e critério de conclusão de cada etapa. E com prazo para desligar o antigo, porque migração sem fim deixa o time mantendo dois sistemas indefinidamente.",
            },
            {
                frente: "Como você evitaria uma reescrita completa de um sistema?",
                verso: "Mostrando o custo do período sem entrega e a regra de negócio que só existe no código antigo, e oferecendo substituir por partes atrás de uma fachada. Reescrita completa costuma entregar depois do prazo um sistema que ainda não faz tudo que o antigo fazia.",
            },
            {
                frente: "Como você substituiria um sistema legado aos poucos?",
                verso: "Colocando uma fachada na frente, desviando uma funcionalidade por vez para o sistema novo e mantendo o resto no antigo, até ele não receber mais nada e poder ser desligado. Cada desvio é pequeno e reversível. A parte difícil é o dado, que costuma precisar de sincronização temporária.",
            },
            {
                frente: "Como você lidaria com dados compartilhados entre times?",
                verso: "Dando um dono a cada conjunto de dados e expondo por contrato, API ou eventos, em vez de vários serviços lendo e escrevendo a mesma tabela. Tabela compartilhada transforma toda mudança de schema numa negociação entre times e cria dependência que ninguém enxerga.",
            },
            {
                frente: "Como você definiria quem é dono de cada dado?",
                verso: "Pelo time responsável pela regra que cria e altera aquele dado. Os demais consomem cópias ou consultam o dono, e não gravam. Dado com mais de um escritor acumula regras conflitantes, e ninguém consegue responder qual versão é a certa.",
            },
            {
                frente: "Como você desenharia para falhas de dependências externas?",
                verso: "Assumindo que cada uma vai ficar lenta e cair: timeout, limite de concorrência, disjuntor, resposta de reserva e fila para o que pode esperar. E listando o que acontece com o produto quando cada uma some. Dependência sem plano de falha define a sua disponibilidade no lugar de você.",
            },
            {
                frente: "Como você definiria SLOs para um serviço interno?",
                verso: "Pelo que os serviços consumidores precisam para cumprir os deles, medido do ponto de vista de quem chama. Serviço interno sem SLO vira dependência sem expectativa, e o consumidor descobre o limite no incidente. Também dá argumento para priorizar confiabilidade.",
            },
            {
                frente: "Como você lidaria com uma falha em cascata?",
                verso: "Parando a propagação primeiro: cortando tráfego não essencial, abrindo disjuntores e reduzindo repetição. Depois recuperando de dentro para fora, trazendo as dependências antes dos consumidores. No desenho, isolamento, limite de concorrência e repetição com espera evitam que se repita.",
            },
            {
                frente: "Como você transformaria incidentes recorrentes em mudança de desenho?",
                verso: "Agrupando os incidentes pela causa estrutural e não pelo sintoma, e perguntando qual mudança elimina a classe inteira, como isolar um recurso compartilhado. Corrigir cada ocorrência isoladamente mantém o time apagando o mesmo incêndio com nomes diferentes.",
            },
            {
                frente: "Como você planejaria a capacidade para o próximo ano?",
                verso: "Partindo do crescimento esperado pelo negócio e da relação medida entre tráfego e uso de cada recurso, projetando o pico com folga e identificando o que atinge o limite primeiro. O plano precisa dizer o que exige mudança de desenho, porque isso leva meses, e não só dinheiro.",
            },
            {
                frente: "O que costuma quebrar primeiro quando o tráfego cresce dez vezes?",
                verso: "O banco de dados, principalmente escrita e conexões, depois recursos compartilhados como cache e fila, e os limites dos provedores externos. Servidores de aplicação sem estado costumam escalar bem. O que tem estado e o que você não controla são onde o crescimento dói.",
            },
            {
                frente: "Como você decidiria entre otimizar e escalar?",
                verso: "Medindo onde está a saturação e quanto custa cada caminho. Escalar compra tempo rápido e custa dinheiro contínuo; otimizar custa tempo do time uma vez. Se o gargalo é um recurso compartilhado, escalar não resolve. Se o time é o recurso escasso, escalar costuma ser o certo.",
            },
            {
                frente: "Como você justificaria o custo de rodar em várias regiões?",
                verso: "Pelo prejuízo de ficar fora quando uma região inteira cai, pela latência de usuários distantes e por exigência regulatória, comparado ao custo de infraestrutura duplicada e complexidade de dados. Para muitos produtos, várias zonas numa região e backup em outra bastam.",
            },
            {
                frente: "Como você lidaria com a exigência de manter dados dentro de um país?",
                verso: "Particionando por localização do cliente, com os dados pessoais armazenados e processados na região exigida, e mapeando tudo que pode levar dado para fora: backup, log, análise e fornecedor. A regra costuma ser violada por uma cópia secundária que ninguém lembrou.",
            },
            {
                frente: "Como você colocaria privacidade como requisito desde o início?",
                verso: "Coletando o mínimo, separando dado pessoal do resto, definindo retenção e caminho de exclusão e controlando acesso por finalidade. Tudo isso é barato no desenho e muito caro de acrescentar quando o dado pessoal já está espalhado por tabelas, logs e cópias.",
            },
            {
                frente: "Como você trataria segurança como requisito de design?",
                verso: "Modelando as ameaças antes de construir: o que proteger, de quem e por onde podem entrar. Depois autenticação entre serviços, menor privilégio, criptografia e trilha de acesso já no desenho. Segurança acrescentada no final vira remendo em volta de uma arquitetura que não foi pensada para ela.",
            },
            {
                frente: "Como você reduziria a superfície de ataque de uma arquitetura?",
                verso: "Expondo o mínimo à internet, com uma entrada única, removendo serviços e portas sem uso, dando a cada componente só as permissões necessárias e isolando o que guarda dado sensível. Cada dependência e cada endpoint esquecido é uma porta a mais para vigiar.",
            },
            {
                frente: "Como você lidaria com dívida arquitetural?",
                verso: "Tornando visível com custo concreto: incidentes, lentidão de entrega e áreas que ninguém consegue mudar. Priorizando a que bloqueia o plano do negócio e pagando junto com as entregas que tocam aquela área. Dívida discutida em abstrato nunca ganha prioridade.",
            },
            {
                frente: "Como você mediria se uma arquitetura está saudável?",
                verso: "Pela facilidade de mudar e operar: tempo para entregar uma mudança comum, quantos times precisam coordenar, frequência e duração de incidentes e custo por unidade crescendo menos que o volume. Diagrama bonito não é métrica; atrito para mudar é.",
            },
            {
                frente: "Como você decidiria adotar uma arquitetura orientada a eventos?",
                verso: "Quando há vários consumidores interessados nos mesmos fatos, picos a absorver e processos que não precisam de resposta imediata. Custa rastreamento distribuído, consistência eventual e reprocessamento. Para fluxo simples de pergunta e resposta, só acrescenta peças.",
            },
            {
                frente: "Como você evitaria que eventos virem acoplamento escondido?",
                verso: "Tratando o formato do evento como contrato público, com dono, versão e registro de quem consome. Evento com dado demais transforma consumidores em dependentes do schema interno do produtor. Publicar fatos do negócio, e não o registro inteiro do banco, reduz esse vínculo.",
            },
            {
                frente: "Como você versionaria eventos consumidos por vários times?",
                verso: "Evoluindo de forma compatível, com campos novos opcionais e consumidores ignorando o desconhecido, e validação de compatibilidade antes de publicar. Mudança incompatível vira novo tipo de evento publicado em paralelo por um prazo. Mensagem antiga já na fila precisa continuar legível.",
            },
            {
                frente: "Como você lidaria com um sistema legado que ninguém entende?",
                verso: "Observando antes de mexer: instrumentar para ver o que é chamado, de onde vêm e para onde vão os dados, e escrever testes que capturam o comportamento atual. Com isso vira possível mudar com segurança. Mexer por intuição num sistema desconhecido é como se criam incidentes.",
            },
            {
                frente: "Como você garantiria observabilidade já no desenho?",
                verso: "Definindo o que precisa ser respondido em produção, como onde a requisição demorou e quantos clientes foram afetados, e desenhando identificador de correlação, métricas por dependência e SLOs junto com os componentes. Observabilidade acrescentada depois do incidente chega tarde.",
            },
            {
                frente: "Como você decidiria o nível de abstração de uma plataforma interna?",
                verso: "Pelo que os times repetem e erram, oferecendo caminhos prontos para o caso comum sem impedir sair dele. Abstração demais esconde o que o time precisa entender num incidente; de menos, cada time reinventa a mesma infraestrutura. A plataforma deve ser adotada por ser mais fácil, e não por obrigação.",
            },
            {
                frente: "Como você avaliaria adotar um orquestrador de contêineres para o time?",
                verso: "Pelo número de serviços, pela necessidade de escala e pela capacidade de operar a plataforma em si. Para poucos serviços, um serviço gerenciado de contêineres entrega o necessário sem o custo. Adotar cedo transforma o time de produto num time de infraestrutura.",
            },
            {
                frente: "Como você decidiria entre funções sem servidor e contêineres em escala?",
                verso: "Pelo padrão de tráfego e pela previsibilidade de custo. Tráfego irregular e processamento por evento ganham com funções; carga constante e alta costuma sair mais barata em contêiner. Limites de tempo de execução, partida a frio e conexões com banco pesam na decisão.",
            },
            {
                frente: "Como você lidaria com a dependência de um provedor de nuvem?",
                verso: "Aceitando a dependência onde ela traz ganho real, como bancos gerenciados, e evitando onde ela prende sem trazer nada. Isolar o acesso a serviços proprietários atrás de interfaces reduz o custo de trocar. Ser totalmente portável costuma custar mais do que a troca que nunca acontece.",
            },
            {
                frente: "Como você trataria a pressão para adotar a tecnologia da moda?",
                verso: "Pedindo o problema que ela resolve melhor que o atual, com evidência, e o custo de aprender e operar. Uma prova de conceito limitada responde melhor que discussão. Tecnologia nova tem lugar, mas cada uma gasta parte de uma capacidade limitada do time de lidar com novidade.",
            },
            {
                frente: "Como você comunicaria risco técnico para a liderança?",
                verso: "Em termos de impacto e probabilidade: o que pode acontecer com clientes e receita, com que chance, o que custa prevenir e o que acontece se não fizer nada. Com uma recomendação clara. Risco apresentado só em jargão técnico é ignorado até virar incidente.",
            },
            {
                frente: "Como você desenharia pensando no time que vai operar o sistema?",
                verso: "Escolhendo tecnologias que o time conhece, reduzindo o número de peças, automatizando a operação comum e escrevendo como diagnosticar as falhas prováveis. O melhor desenho no papel falha se ninguém consegue entender o que acontece nele às três da manhã.",
            },
            {
                frente: "Como a estrutura dos times afeta a arquitetura?",
                verso: "Os sistemas tendem a copiar a forma como os times se comunicam, então fronteiras entre times viram fronteiras entre sistemas. Por isso vale desenhar os times junto com a arquitetura desejada. Serviço dividido entre dois times sem dono claro vira gargalo de coordenação.",
            },
            {
                frente: "Como você evitaria que o desenho de um sistema dependa de uma pessoa só?",
                verso: "Registrando decisões e seus motivos, revisando designs em grupo, rodando quem opera e quem evolui cada parte e documentando como o sistema funciona e falha. O teste é simples: se essa pessoa sair de férias, o time consegue mudar e operar o sistema sem ela?",
            },
            {
                frente: "O que diferencia uma resposta sênior numa entrevista de System Design?",
                verso: "Conduzir a conversa, fazer as perguntas que mudam o desenho, justificar cada escolha com o trade-off e antecipar falha, operação e evolução. Uma resposta júnior lista componentes corretos; uma sênior explica por que aqueles, o que se perde com eles e quando mudaria de ideia.",
            },
            {
                frente: "Como você lidaria com o entrevistador mudando o requisito no meio?",
                verso: "Tratando como parte do exercício: identificando quais decisões anteriores dependiam da premissa antiga, dizendo o que muda e o que se mantém e ajustando o desenho. Recomeçar do zero ou defender o desenho antigo mostra rigidez; adaptar mostra que as escolhas tinham motivo.",
            },
            {
                frente: "Como você decidiria quando parar de aprofundar um componente na entrevista?",
                verso: "Quando o nível de detalhe já não muda decisões e outras partes do sistema ainda não foram cobertas, verificando com o entrevistador onde ele quer profundidade. Gastar metade do tempo num detalhe interessante e deixar o fluxo principal incompleto é um erro comum.",
            },
            {
                frente: "Sendo o entrevistador, como você avaliaria um candidato numa entrevista de design?",
                verso: "Pela forma de raciocinar, e não pelo desenho final: se levanta requisitos, estima, justifica escolhas, reconhece trade-offs, lida com falhas e se adapta a novas informações. Candidato que acerta o desenho decorado e não explica o porquê revela menos do que parece.",
            },
            {
                frente: "Como você trataria um produto com IA cujo custo está explodindo?",
                verso: "Medindo custo por funcionalidade, cliente e tipo de pedido para achar a concentração, e então aplicando cache, modelo menor para tarefa simples, contexto mais curto e limite por plano. Ajustar preço e cota faz parte da solução, porque o custo cresce com o uso de cada cliente.",
            },
            {
                frente: "Como você decidiria entre hospedar um modelo próprio e usar a API de um provedor?",
                verso: "Pelo volume, pela qualidade necessária, pela exigência sobre os dados e pela capacidade de operar GPUs. API de provedor começa rápido e custa por uso; modelo próprio exige escala e equipe para compensar. Uma camada que permita trocar reduz o custo de errar nessa escolha.",
            },
            {
                frente: "Como você desenharia a continuidade quando o provedor do modelo cai?",
                verso: "Com uma camada de acesso que permita desviar para outro provedor ou modelo, testada periodicamente, e degradação definida para quando nenhum estiver disponível, como fila ou funcionalidade temporariamente limitada. Trocar de modelo muda o comportamento, então a avaliação precisa cobrir os dois.",
            },
            {
                frente: "Como você desenharia limites de uso por cliente num SaaS com vários clientes?",
                verso: "Com cotas e limites de taxa por cliente aplicados na entrada e medidos continuamente, planos que definem esses valores e aviso antes de o cliente atingir o teto. O limite protege os outros clientes e o custo. Sem ele, um cliente grande define a experiência de todos.",
            },
            {
                frente: "Como você isolaria clientes para um não prejudicar os outros?",
                verso: "Separando recursos na medida do risco: limites e filas por cliente para todos, e banco, pool ou célula dedicados para os maiores. O identificador do cliente precisa estar em toda consulta e métrica. Isolamento total para todos é caro; nenhum isolamento é ruim para todos.",
            },
            {
                frente: "Como você definiria o que é pronto para produção num sistema novo?",
                verso: "SLO definido e medido, alerta ligado a sintoma do usuário, painel e logs úteis, teste de carga no volume esperado, plano de reversão, backup testado, segurança revisada e alguém de plantão sabendo operar. Funcionar no ambiente de teste é só o começo.",
            },
            {
                frente: "Como você atenderia um requisito de auditoria de quem fez o quê?",
                verso: "Gravando cada ação relevante com autor, momento, alvo e valores antes e depois, na mesma transação da mudança, num registro que não pode ser alterado nem apagado pela aplicação. Log comum não serve para auditoria, porque é incompleto, alterável e tem retenção curta.",
            },
            {
                frente: "Como você planejaria desligar um sistema?",
                verso: "Descobrindo todos os consumidores pelo tráfego real, e não por documentação, comunicando um prazo, migrando cada um e acompanhando o uso até zerar. Depois bloqueando o acesso por um período antes de apagar, e guardando os dados pelo tempo exigido. Consumidor esquecido aparece no dia do desligamento.",
            },
            {
                frente: "Como você decidiria o nível de consistência de cada operação num mesmo sistema?",
                verso: "Classificando as operações pelo custo de um erro de concorrência ou de dado atrasado, e usando garantias fortes só onde esse custo é alto, como dinheiro e estoque. O resto usa caminhos mais rápidos e baratos. Um sistema real mistura níveis, e isso precisa estar documentado.",
            },
            {
                frente: "Como você equilibraria simplicidade e preparação para escala?",
                verso: "Desenhando simples para o volume dos próximos meses, com as decisões caras de mudar já pensadas para a escala planejada, como formato de dado e chave de partição. Otimizar para uma escala que não chegou atrasa o produto; ignorar o que é irreversível cobra uma migração dolorosa.",
            },
            {
                frente: "Como você lidaria com um desenho que funciona hoje e não aguenta o plano do negócio?",
                verso: "Mostrando com números em que ponto do crescimento ele falha e quanto tempo leva a mudança necessária, e planejando essa mudança antes de chegar lá. Mudança de arquitetura feita às pressas, durante o crescimento, custa mais e arrisca justamente o momento de maior receita.",
            },
            {
                frente: "Como você conduziria um ensaio de falha em produção?",
                verso: "Com uma hipótese clara sobre o comportamento esperado, raio de impacto limitado, monitoramento atento, forma de interromper na hora e as pessoas avisadas. Começando em horário controlado e ampliando depois. O objetivo é descobrir fraquezas antes que um incidente real as mostre.",
            },
            {
                frente: "Como você decidiria o que é síncrono e o que é assíncrono num fluxo crítico?",
                verso: "Mantendo síncrono só o que o usuário precisa confirmar para seguir, como a validação e a reserva do pagamento, e tornando assíncrono o que pode acontecer depois, como email, nota fiscal e análise. Cada passo síncrono a mais soma latência e mais uma dependência que pode derrubar o fluxo.",
            },
            {
                frente: "Como você lidaria com um contrato entre sistemas que não pode quebrar?",
                verso: "Com testes de contrato automáticos entre os dois lados, mudanças apenas compatíveis, versões paralelas quando inevitável e registro de todos os consumidores. Contrato crítico precisa de dono, processo de mudança e monitoramento de uso das versões antigas.",
            },
            {
                frente: "Como você revisaria um desenho para descobrir onde ele vai falhar?",
                verso: "Seguindo o caminho de uma requisição e perguntando em cada passo: e se isso ficar lento, cair, responder errado ou receber dez vezes o tráfego? Depois olhando estado compartilhado, dependências externas e operações não repetíveis. Os pontos de falha costumam aparecer nessas perguntas.",
            },
        ],
    },
};
