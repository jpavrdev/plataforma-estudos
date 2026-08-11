import type { CartasDaTrilha } from "../../seed-flashcards.ts";

/**
 * Cartões de Fundamentos de LLMs, primeira trilha do roadmap de Engenharia de IA.
 *
 * A trilha não tem trilhos de linguagem, então tudo vai em "neutra".
 *
 * O que estas cartas cobram é o que a aula ensina e o quiz NÃO pergunta: siglas,
 * números de referência, nomes próprios e as consequências práticas que o texto
 * explica de passagem. O quiz de cada aula já cobra as cinco ideias centrais, e
 * repetir aqui seria gastar a revisão do aluno duas vezes na mesma coisa.
 */
export const fundamentosDeLlms: CartasDaTrilha = {
    trilha: "Fundamentos de LLMs",
    modulos: {
        1: {
            1: {
                neutra: [
                    {
                        frente: "O que faz, em escala minúscula, a mesma coisa que um LLM?",
                        verso: "O autocomplete do teclado do celular, sugerindo a próxima palavra.",
                    },
                    {
                        frente: "O que significa a sigla LLM?",
                        verso: "Large language model, ou modelo de linguagem grande.",
                    },
                    {
                        frente: "Qual é o risco típico de um sistema de busca, diferente do de um LLM?",
                        verso: "Não achar nada relevante, em vez de gerar algo fluente e falso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Em que ano o transformer foi proposto?",
                        verso: "Em 2017.",
                    },
                    {
                        frente: "De qual empresa saiu o artigo que propôs o transformer?",
                        verso: "Do Google.",
                    },
                    {
                        frente: "O que a sigla GPT quer dizer?",
                        verso: "Generative pre-trained transformer.",
                    },
                    {
                        frente: "A LSTM é variante de qual arquitetura?",
                        verso: "Da rede neural recorrente, a RNN.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Como se chama a área que abre o modelo para estudar o que cada parte faz?",
                        verso: "Interpretabilidade.",
                    },
                    {
                        frente: "O que empilhar dezenas de camadas de cabeças de atenção constrói?",
                        verso: "Uma teia de relações do texto inteiro.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que técnicas alinham o modelo comparando respostas alternativas?",
                        verso: "RLHF e DPO.",
                    },
                    {
                        frente: "Como se chama o modelo que sai só do pré-treinamento?",
                        verso: "Modelo base.",
                    },
                    {
                        frente: "Quanto tempo costuma durar o pré-treinamento de um LLM?",
                        verso: "Meses, em milhares de GPUs.",
                    },
                    {
                        frente: "O que a sigla SFT quer dizer?",
                        verso: "Supervised fine-tuning, o ajuste supervisionado.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quais são as três alavancas que as leis de escala mandam crescer juntas?",
                        verso: "Parâmetros, dados e computação.",
                    },
                    {
                        frente: "De quantos parâmetros passam os maiores modelos?",
                        verso: "De um trilhão.",
                    },
                    {
                        frente: "O que virou gargalo da escala, já que a internet útil é finita?",
                        verso: "Dados de qualidade.",
                    },
                    {
                        frente: "Alucinação desaparece quando o modelo cresce?",
                        verso: "Não. Escalar não resolve alucinação.",
                    },
                ],
            },
        },
        2: {
            1: {
                neutra: [
                    {
                        frente: "De que tamanho costuma ser o vocabulário de tokens de um modelo?",
                        verso: "De 50 mil a 250 mil entradas.",
                    },
                    {
                        frente: "O que a sigla BPE quer dizer?",
                        verso: "Byte-pair encoding.",
                    },
                    {
                        frente: "Em inglês, um token equivale a mais ou menos quanto?",
                        verso: "Cerca de 4 caracteres, ou 3/4 de palavra.",
                    },
                    {
                        frente: "Por que não tokenizar letra por letra?",
                        verso: "O texto viraria uma sequência longuíssima e cara de processar.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quanto a mais o português costuma gastar em tokens que o inglês?",
                        verso: "De 20% a 50%.",
                    },
                    {
                        frente: "Em que três momentos o código deve contar tokens?",
                        verso: "Antes de enviar, ao receber a resposta e no planejamento de custo.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Quantas vezes a saída costuma custar mais que a entrada?",
                        verso: "De 3 a 5 vezes.",
                    },
                    {
                        frente: "Qual é a distância de preço entre o menor e o maior modelo do mercado?",
                        verso: "Duas a três ordens de grandeza.",
                    },
                    {
                        frente: "O que ataca o custo de um system prompt longo pago em toda chamada?",
                        verso: "O cache de prompt.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Por que formatos rígidos como JSON pedem validação depois da geração?",
                        verso: "Símbolos e espaços têm tokenização frágil.",
                    },
                    {
                        frente: "Como um número longo pode ser fatiado pelo tokenizador?",
                        verso: "De forma irregular, com 12345 virando 123 mais 45.",
                    },
                    {
                        frente: "Além de contar letras, que tarefa de linguagem sofre com o tokenizador?",
                        verso: "Rimas exatas e jogos de palavras.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Como o vídeo vira token?",
                        verso: "Como sequência de quadros tokenizados.",
                    },
                    {
                        frente: "Por que amostrar quadros em vez de enviar o vídeo inteiro?",
                        verso: "Vídeo inteiro sai caro demais em tokens.",
                    },
                    {
                        frente: "Como o áudio entra na conta de custo?",
                        verso: "Proporcional à duração, tokenizado em trechos sonoros.",
                    },
                ],
            },
        },
        3: {
            1: {
                neutra: [
                    {
                        frente: "De quantas dimensões costuma ser um vetor de embedding?",
                        verso: "De algumas centenas a poucos milhares.",
                    },
                    {
                        frente: "Como se chama o espaço onde textos parecidos ficam próximos?",
                        verso: "Espaço semântico.",
                    },
                    {
                        frente: "Que operação famosa mostra que direções do espaço capturam relações?",
                        verso: "Rei menos homem mais mulher se aproxima de rainha.",
                    },
                    {
                        frente: "Os vetores de embedding são desenhados à mão?",
                        verso: "Não. São aprendidos por modelos treinados para isso.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O que uma similaridade acima de 0,95 costuma indicar?",
                        verso: "Quase duplicata: dá para deduplicar ou agrupar.",
                    },
                    {
                        frente: "Para que servem os dois usos da similaridade?",
                        verso: "Ordenar candidatos e cortar os fracos.",
                    },
                    {
                        frente: "A distância euclidiana ordena os vizinhos diferente do cosseno?",
                        verso: "Não. Na prática as três medidas concordam no ranking.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que benchmark público serve de norte para escolher modelo de embedding?",
                        verso: "O MTEB.",
                    },
                    {
                        frente: "O que a troca do modelo de embedding obriga a fazer?",
                        verso: "Reindexar o corpus inteiro.",
                    },
                    {
                        frente: "Quanto custa um modelo de embedding, em ordem de grandeza?",
                        verso: "Frações de centavo por milhão de tokens.",
                    },
                    {
                        frente: "Qual é a interface de uma API de embedding?",
                        verso: "Envia texto ou lote de textos, recebe um vetor por texto.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde a busca semântica ganha da busca por palavra-chave?",
                        verso: "Em sinônimos, paráfrases e erros de digitação.",
                    },
                    {
                        frente: "Embedding gera texto?",
                        verso: "Não. Ele só organiza, encontra e compara.",
                    },
                    {
                        frente: "Que descoberta o agrupamento de tickets entrega sem categoria prévia?",
                        verso: "Os temas que dominam o período, como a fatura.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Qual é o risco típico do modelo de embedding?",
                        verso: "Devolver vizinhos ruins, se o modelo for fraco.",
                    },
                    {
                        frente: "Qual é o risco típico do modelo de geração?",
                        verso: "Alucinação fluente.",
                    },
                    {
                        frente: "Qual dos dois motores é mais barato, embedding ou geração?",
                        verso: "O de embedding, por ordens de grandeza.",
                    },
                ],
            },
        },
        4: {
            1: {
                neutra: [
                    {
                        frente: "De que tamanho são as janelas de contexto em 2026?",
                        verso: "De dezenas de milhares a centenas de milhares de tokens.",
                    },
                    {
                        frente: "Uma base de código inteira cabe numa janela de contexto?",
                        verso: "Não. Ela costuma ter milhões de tokens.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que poder o modelo sem estado dá à aplicação?",
                        verso: "Editar o passado: resumir, filtrar e reordenar antes de enviar.",
                    },
                    {
                        frente: "O que causa uma resposta cortada no meio?",
                        verso: "O orçamento de saída se esgotou.",
                    },
                    {
                        frente: "Qual é a regra de produto quando o contexto não coube?",
                        verso: "Nunca degradar em silêncio: declarar o que foi analisado.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "Que formato tem a curva de recuperação ao longo do contexto?",
                        verso: "Um U: pontas boas, meio fraco.",
                    },
                    {
                        frente: "Por que o meio do contexto perde força?",
                        verso: "Os pesos da atenção se diluem e o meio fica sem âncoras.",
                    },
                    {
                        frente: "Janela grande é convite para encher?",
                        verso: "Não. Contexto enxuto vence contexto gigante e diluído.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Que três camadas um chat de produção maduro envia?",
                        verso: "Fatos persistentes, resumo do passado e as últimas mensagens.",
                    },
                    {
                        frente: "Qual é o custo do resumo progressivo?",
                        verso: "Uma chamada extra de vez em quando.",
                    },
                    {
                        frente: "Como a memória seletiva escolhe que fatos injetar?",
                        verso: "Buscando os relevantes, muitas vezes por embedding.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Quanto o cache de prompt costuma cobrar nas repetições?",
                        verso: "Uma fração, tipicamente 10% ou menos.",
                    },
                    {
                        frente: "Até onde o cache de prompt funciona numa chamada?",
                        verso: "Do início até o primeiro ponto que muda.",
                    },
                    {
                        frente: "Que três razões pesam contra jogar tudo numa janela gigante?",
                        verso: "Custo, latência e a perda de recuperação no meio.",
                    },
                ],
            },
        },
        5: {
            1: {
                neutra: [
                    {
                        frente: "De onde vem o nome do parâmetro temperatura?",
                        verso: "Da física estatística, pela distribuição de Boltzmann.",
                    },
                    {
                        frente: "O que acontece com temperatura acima de 1?",
                        verso: "A saída fica errática; é terreno de experimento.",
                    },
                    {
                        frente: "Temperatura é botão de qualidade?",
                        verso: "Não. É botão de variância.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Que outro nome tem o top-p?",
                        verso: "Nucleus sampling.",
                    },
                    {
                        frente: "O que o top-k limita?",
                        verso: "O sorteio às k opções mais prováveis, em número fixo.",
                    },
                    {
                        frente: "Em que tipo de modelo o top-k é mais comum?",
                        verso: "Nos modelos abertos.",
                    },
                    {
                        frente: "Em que valor o top-p costuma ficar quando não se mexe nele?",
                        verso: "Entre 0,9 e 1,0.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "A sequência de parada aparece na resposta?",
                        verso: "Não. Ela encerra a geração e fica de fora.",
                    },
                    {
                        frente: "Por que a stop sequence é mais confiável que pedir no prompt?",
                        verso: "A parada é mecânica, executada pela infraestrutura.",
                    },
                    {
                        frente: "Que teto de saída uma classificação de uma palavra pede?",
                        verso: "Minúsculo, de dezenas de tokens.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Como se chama escolher sempre a opção mais provável?",
                        verso: "Decodificação gulosa.",
                    },
                    {
                        frente: "Por que a aritmética de GPU introduz variação?",
                        verso: "Somar em ordens diferentes dá resultados minimamente diferentes.",
                    },
                    {
                        frente: "Como avaliar uma saída de LLM que varia entre execuções?",
                        verso: "Rodando a mesma entrada várias vezes e medindo a taxa de acerto.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que faixa de temperatura serve para suporte e chat factual?",
                        verso: "De 0,2 a 0,5.",
                    },
                    {
                        frente: "Que configuração usar para testes e avaliação?",
                        verso: "Temperatura 0, seed se houver e versão datada fixa.",
                    },
                    {
                        frente: "Por que código pede um teto de saída generoso?",
                        verso: "Truncar código é pior que gastar tokens.",
                    },
                ],
            },
        },
        6: {
            1: {
                neutra: [
                    {
                        frente: "Que famílias representam os modelos de pesos abertos?",
                        verso: "Llama, Mistral, Qwen, DeepSeek e Gemma.",
                    },
                    {
                        frente: "Todo modelo de pesos abertos permite uso comercial?",
                        verso: "Não. Há licenças que restringem; ler a licença é parte do trabalho.",
                    },
                    {
                        frente: "O que convergiu entre as APIs dos dois campos?",
                        verso: "O formato de mensagens com papéis system, user e assistant.",
                    },
                    {
                        frente: "Que servidores expõem modelo aberto com API compatível com o padrão?",
                        verso: "vLLM e Ollama.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "Quantas vezes o flagship custa mais que o mini, por token?",
                        verso: "De 20 a 60 vezes.",
                    },
                    {
                        frente: "Onde a distância entre mini e flagship aparece de verdade?",
                        verso: "Em raciocínio longo, ambiguidade e tarefas de várias etapas.",
                    },
                    {
                        frente: "Como se controla quanto um raciocinador pensa antes de responder?",
                        verso: "Por níveis de esforço ou orçamento de tokens de pensamento.",
                    },
                    {
                        frente: "De que tamanho é o conjunto de teste para decidir o porte do modelo?",
                        verso: "De 30 a 100 exemplos reais com resposta esperada.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O que o MMLU mede?",
                        verso: "Conhecimento geral, em formato de prova multidisciplinar.",
                    },
                    {
                        frente: "O que é a saturação de um benchmark?",
                        verso: "Os modelos de ponta empatam perto do teto e a diferença some.",
                    },
                    {
                        frente: "O que o GPQA cobra?",
                        verso: "Ciência difícil, de nível pós-graduação.",
                    },
                    {
                        frente: "Quando reavaliar a escolha de modelo?",
                        verso: "Em lançamento relevante ou renegociação, com o teste automatizado.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Com quantos bits a quantização costuma guardar os pesos?",
                        verso: "Com 4 ou 8, no lugar dos 16 do treino.",
                    },
                    {
                        frente: "Quanto ocupa um modelo de 8 bilhões de parâmetros em 4 bits?",
                        verso: "Cerca de 5 GB, e roda em notebook comum.",
                    },
                    {
                        frente: "Que motor de execução está por trás do Ollama e do LM Studio?",
                        verso: "O llama.cpp.",
                    },
                    {
                        frente: "Qual é a contrapartida de rodar modelo local em notebook?",
                        verso: "A qualidade fica bem atrás dos flagships de API.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que modelos geram imagem a partir de texto?",
                        verso: "DALL-E, Imagen, Midjourney e Flux, entre outros.",
                    },
                    {
                        frente: "O gerador de imagem é o mesmo endpoint do chat?",
                        verso: "Não. Costuma ser modelo e endpoint separados.",
                    },
                    {
                        frente: "O que a visão dos modelos trouxe além do OCR antigo?",
                        verso: "Compreensão de layout, tabelas e manuscrito razoável.",
                    },
                    {
                        frente: "Que princípio orienta a escolha de modalidade?",
                        verso: "Usar a que a tarefa pede, não a mais impressionante.",
                    },
                ],
            },
        },
        7: {
            1: {
                neutra: [
                    {
                        frente: "Que caso ficou emblemático de alucinação no direito?",
                        verso: "Advogados sancionados por petição com jurisprudência inventada.",
                    },
                    {
                        frente: "Que tipo de pedido aumenta o risco de alucinação?",
                        verso: "Quanto mais específico o fato: números, nomes, datas e referências.",
                    },
                    {
                        frente: "Que instrução simples de prompt reduz alucinação?",
                        verso: "Permitir explicitamente que o modelo responda que não sabe.",
                    },
                    {
                        frente: "Qual é o perigo real, mais do que o modelo errar?",
                        verso: "O sistema tratar o texto gerado como fato, sem verificação.",
                    },
                ],
            },
            2: {
                neutra: [
                    {
                        frente: "O modelo sabe que horas são?",
                        verso: "Não. Ele não tem relógio nem calendário próprio.",
                    },
                    {
                        frente: "Que três caminhos trazem o presente até o modelo?",
                        verso: "Busca na web, RAG e injeção direta do volátil no prompt.",
                    },
                    {
                        frente: "Modelo com busca embutida está sempre atualizado?",
                        verso: "Não. A busca é ferramenta acionada, nem sempre na hora certa.",
                    },
                    {
                        frente: "O que pode ficar por conta da memória do modelo?",
                        verso: "O estável: linguagem, conceitos e raciocínio.",
                    },
                ],
            },
            3: {
                neutra: [
                    {
                        frente: "O pós-treino elimina o viés?",
                        verso: "Não. Reduz os casos gritantes, e o viés fino sobrevive.",
                    },
                    {
                        frente: "Que tipo de instrução no prompt reduz o espaço do viés?",
                        verso: "Critérios objetivos explícitos, proibindo inferir por atributo pessoal.",
                    },
                    {
                        frente: "Onde a qualidade em português cai mais rápido?",
                        verso: "Nos modelos menores, treinados com menos dados da língua.",
                    },
                ],
            },
            4: {
                neutra: [
                    {
                        frente: "Onde um prompt injection costuma se esconder?",
                        verso: "Texto branco no fundo branco, comentário de HTML, rodapé de email.",
                    },
                    {
                        frente: "Demarcar o conteúdo de terceiros blinda contra injection?",
                        verso: "Não. Ajuda, mas o modelo ainda pode obedecer ao injetado.",
                    },
                    {
                        frente: "Que prática protege dado sensível que precisa passar pelo prompt?",
                        verso: "Mascarar antes da chamada e reidratar depois, no seu código.",
                    },
                    {
                        frente: "Por que injection fica mais grave quando o modelo ganha ferramentas?",
                        verso: "O ataque deixa de constranger e vira ação no mundo real.",
                    },
                ],
            },
            5: {
                neutra: [
                    {
                        frente: "Que pergunta o módulo da janela de contexto responde?",
                        verso: "O que cabe, onde a informação se perde e como gerir.",
                    },
                    {
                        frente: "Que pergunta o módulo de embeddings responde?",
                        verso: "Como significado vira número comparável.",
                    },
                    {
                        frente: "O que envelhece rápido na área, segundo o fechamento?",
                        verso: "Nomes de modelo, preços e rankings.",
                    },
                ],
            },
        },
    },
};
