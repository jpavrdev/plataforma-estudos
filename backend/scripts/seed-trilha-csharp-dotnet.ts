// Seed da trilha C# e .NET. Conteúdo autoral, quiz-only, com exemplos de código em
// C#. As resoluções comentadas ficam em scripts/solucoes/csharp-dotnet.json e entram
// por mesclarSolucoes. Idempotente: se a trilha já tiver aulas, só atualiza as
// explicações.
//
// As alternativas já saem embaralhadas do gerador, com semente no enunciado. Sem
// isso a correta ficaria em position 1 em toda questão e o gabarito do e-book, que
// não passa pelo backend, sairia todo em A.
//
// Rodar em prod: docker compose -f docker-compose.prod.yml exec -T backend node scripts/seed-trilha-csharp-dotnet.ts
import { db } from "../db.ts";
import { trails, modules, lessons, questions, questionOptions } from "../schema.ts";
import { eq } from "drizzle-orm";
import { backfillExplicacoes, mesclarSolucoes } from "./backfill-explicacoes.ts";

const NOME = "C# e .NET";
const LEVEL: "iniciante" | "intermediario" | "avancado" = "iniciante";
const HORAS = 20;
const DESCRICAO =
    "C# e .NET do começo ao backend: a plataforma e a linha de comando, tipos, orientação a objetos com records e o C# 14, coleções, genéricos e LINQ, exceções, async/await e concorrência, uma API em ASP.NET Core com Minimal APIs, validação e configuração, dados com EF Core e PostgreSQL, e testes com xUnit, WebApplicationFactory e Testcontainers. Tudo em .NET 10, com código que compila e resolução comentada em toda questão.";

type Bloco = { type: "text" | "code" | "quote" | "table"; value: string };
type Questao = {
    statement: string;
    explanation?: string;
    difficulty: "facil" | "medio" | "dificil";
    options: { text: string; isCorrect: boolean }[];
};
type Aula = { titulo: string; blocks: Bloco[]; questions: Questao[] };
type Modulo = { titulo: string; aulas: Aula[] };

const MODULOS = [
    {
        titulo: "Módulo 1 - A plataforma .NET e a linguagem",
        aulas: [
            {
                titulo: "O que é o .NET",
                blocks: [
                    {
                        type: "text",
                        value: "# O que é o .NET\n\nPrimeira semana num time de backend, e o pedido parece simples: \"instala o .NET 10 na sua máquina e no servidor de homologação\". Na página de download aparecem SDK, .NET Runtime e ASP.NET Core Runtime, e a vaga que você viu na semana passada pedia \".NET Framework 4.8\". Saber o que é cada peça evita dois erros caros: instalar ferramenta de desenvolvimento num servidor que só executa, e levar para produção uma versão que já perdeu o suporte.\n\nO **.NET** é uma plataforma de desenvolvimento gratuita e de código aberto, que roda em Windows, Linux e macOS. Ela junta:\n\n- **as linguagens**: C# (a mais usada, e a que você vai aprender aqui), F# e Visual Basic;\n- **o compilador** do C#, chamado Roslyn;\n- **o runtime**, que executa o programa: o **CLR** (Common Language Runtime) carrega o código, gerencia a memória com o garbage collector (o coletor que libera os objetos que ninguém usa mais) e trata as exceções;\n- **a biblioteca base**: coleções, arquivos, rede, datas e texto, prontos para usar;\n- **o SDK**, o kit de quem desenvolve, com a ferramenta de linha de comando `dotnet`.\n\nCuidado com o nome. O **.NET Framework** é a linha antiga, só para Windows, que parou na versão 4.8.1: continua em muito sistema legado e recebe correções junto com o Windows, mas as novidades vão para o .NET moderno (que até a versão 3.1 se chamava .NET Core). Projeto novo usa o .NET moderno, e é dele que este módulo trata.",
                    },
                    {
                        type: "table",
                        value: "[[\"Pacote\",\"O que traz\",\"Onde instalar\"],[\"SDK\",\"o compilador, a CLI `dotnet` (`new`, `build`, `run`, `test`...), os templates e os runtimes\",\"máquina de quem desenvolve e etapa de build da CI\"],[\".NET Runtime\",\"o CLR e a biblioteca base, para executar aplicativos de console e serviços\",\"servidor ou contêiner que só executa\"],[\"ASP.NET Core Runtime\",\"o .NET Runtime mais as bibliotecas web do ASP.NET Core\",\"servidor ou contêiner que executa uma API ou um site\"]]",
                    },
                    {
                        type: "text",
                        value: "## Do C# ao código de máquina: IL e JIT\n\nO `dotnet build` **não** gera código de máquina. O compilador transforma o C# em **IL** (Intermediate Language, a linguagem intermediária), um conjunto de instruções que não pertence a nenhum processador, e grava junto os **metadados**, a descrição de cada tipo e método. É por isso que o mesmo arquivo compilado roda num notebook x64 com Windows e num servidor ARM com Linux.\n\nQuem transforma IL em código de máquina é o **JIT** (just-in-time compiler), que faz parte do CLR. Ele compila cada método **na primeira vez que o método é chamado**, para o processador onde o programa está rodando, e guarda o resultado na memória do processo; as chamadas seguintes usam o código pronto. O JIT ainda trabalha em camadas (tiered compilation): primeiro compila rápido e com pouca otimização, depois recompila com otimização pesada os métodos que o programa chama muito.\n\nO custo desse modelo aparece na inicialização, porque as primeiras chamadas pagam a compilação. Quem precisa iniciar rápido tem duas opções na hora de publicar. **ReadyToRun** grava código de máquina pronto dentro do assembly, e o JIT continua por perto para otimizar depois. **Native AOT** compila tudo antes (ahead of time) para um executável nativo, sem JIT nenhum; em troca, o binário serve a um único sistema e processador, e recursos dinâmicos ficam limitados, como carregar assembly em tempo de execução, gerar código na hora e parte da reflexão (inspecionar e chamar tipos descobertos durante a execução).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: o que você escreve\nConsole.WriteLine(Dobro(21)); // 42\n\nstatic int Dobro(int x) => x * 2;\n\n// O IL que o compilador gerou para Dobro (build em Release, visto no ILSpy):\n//   IL_0000: ldarg.0    empilha o argumento x\n//   IL_0001: ldc.i4.2   empilha a constante 2\n//   IL_0002: mul        multiplica os dois valores do topo da pilha\n//   IL_0003: ret        devolve o resultado\n// Na primeira chamada de Dobro, o JIT traduz essas instruções para\n// código de máquina do processador onde o programa está rodando.",
                    },
                    {
                        type: "text",
                        value: "## Assembly: o que o build entrega\n\nO resultado do build é um **assembly**: um arquivo `.dll` com o IL, os metadados e um manifesto com nome, versão e a lista dos assemblies de que ele depende. Cada projeto gera um assembly. O seu código usa assemblies da biblioteca base e de pacotes, e é pelos metadados deles que o compilador sabe quais tipos e métodos existem, sem arquivo de cabeçalho.\n\nMuita gente acha que o executável que aparece ao lado do `.dll` é o programa compilado. Não é: ele é só um lançador (o apphost), que encontra o runtime instalado e carrega o `.dll`. Quem copia só o executável para o servidor descobre isso em produção, com o programa sem subir. O programa de verdade está no `.dll`, tanto que `dotnet Ola.dll` roda o mesmo programa sem o lançador.",
                    },
                    {
                        type: "code",
                        value: "# terminal\ndotnet build\nls bin/Debug/net10.0/\n# Ola                      lançador nativo (no Windows, Ola.exe)\n# Ola.deps.json            dependências que o runtime precisa resolver\n# Ola.dll                  o assembly: IL, metadados e manifesto\n# Ola.pdb                  símbolos de depuração (ligam o IL às linhas do código)\n# Ola.runtimeconfig.json   qual runtime usar: Microsoft.NETCore.App 10.0\n\ndotnet bin/Debug/net10.0/Ola.dll\n# Hello, World!",
                    },
                    {
                        type: "text",
                        value: "## Versões: LTS e STS\n\nSai uma versão nova do .NET todo mês de novembro, e cada uma tem um prazo de suporte:\n\n- **LTS** (Long Term Support): três anos de correções. São as versões de número par, como o .NET 8 e o .NET 10.\n- **STS** (Standard Term Support): dois anos de correções. São as de número ímpar. Até 2025 eram 18 meses; em setembro de 2025 a Microsoft ampliou para 24, a partir do .NET 9.\n\nDentro de cada versão saem atualizações de correção (10.0.1, 10.0.2...) na Patch Tuesday, a segunda terça-feira do mês, muitas vezes com correção de segurança. Versão fora do suporte não recebe mais nenhuma, e é aí que mora o risco: uma falha descoberta amanhã fica aberta para sempre.\n\nO critério: sistema que vai passar anos em produção vai de LTS. STS serve para quem quer as novidades antes e topa atualizar todo ano. Em 2026, projeto novo começa no **.NET 10**, LTS lançado em novembro de 2025 e com suporte até novembro de 2028. Quem ainda está no .NET 8 tem até 10 de novembro de 2026 para migrar.",
                    },
                    {
                        type: "table",
                        value: "[[\"Versão\",\"Tipo\",\"Lançamento\",\"Fim do suporte\"],[\".NET 8\",\"LTS\",\"novembro de 2023\",\"10 de novembro de 2026\"],[\".NET 9\",\"STS\",\"novembro de 2024\",\"10 de novembro de 2026\"],[\".NET 10\",\"LTS\",\"novembro de 2025\",\"14 de novembro de 2028\"]]",
                    },
                    {
                        type: "code",
                        value: "# terminal: o que está instalado nesta máquina\ndotnet --list-sdks\n# 10.0.112 [/usr/lib/dotnet/sdk]\n\ndotnet --list-runtimes\n# Microsoft.AspNetCore.App 8.0.31 [/usr/lib/dotnet/shared/Microsoft.AspNetCore.App]\n# Microsoft.AspNetCore.App 10.0.12 [/usr/lib/dotnet/shared/Microsoft.AspNetCore.App]\n# Microsoft.NETCore.App 8.0.31 [/usr/lib/dotnet/shared/Microsoft.NETCore.App]\n# Microsoft.NETCore.App 10.0.12 [/usr/lib/dotnet/shared/Microsoft.NETCore.App]\n\n# Versões diferentes convivem lado a lado: cada aplicativo roda na versão\n# principal que o runtimeconfig.json dele pede. O SDK tem numeração própria:\n# o 10.0.112 é da faixa 10.0.1xx e acompanha o runtime 10.0.12.",
                    },
                    {
                        type: "quote",
                        value: "O SDK compila C# para IL dentro de um assembly, o CLR executa e o JIT traduz para código de máquina na primeira chamada de cada método. No servidor vai só o runtime, e projeto novo vai de LTS com suporte pela frente, que em 2026 é o .NET 10.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o compilador C# gera quando você roda `dotnet build` num projeto de console?",
                        difficulty: "facil",
                        options: [
                            { text: "Um executável com código de máquina do processador da máquina de build, que roda sem precisar de runtime", isCorrect: false },
                            { text: "Um arquivo com o código C# pré-processado, que o runtime compila por inteiro na instalação do programa", isCorrect: false },
                            { text: "Um assembly `.dll` com IL e metadados, que o JIT traduz para código de máquina durante a execução do programa", isCorrect: true },
                            { text: "Um assembly `.dll` com IL e metadados, que o CLR interpreta instrução por instrução, sem gerar código de máquina", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma API ASP.NET Core foi publicada no modo padrão, que depende do runtime instalado na máquina. O que instalar no servidor Linux que só vai executar essa API?",
                        difficulty: "facil",
                        options: [
                            { text: "O .NET Framework 4.8.1, porque ele é a edição do runtime própria para servidor", isCorrect: false },
                            { text: "Só o .NET Runtime, porque as bibliotecas do ASP.NET Core já vêm incluídas dentro dele", isCorrect: false },
                            { text: "O ASP.NET Core Runtime, que traz o runtime base e as bibliotecas web que a API usa", isCorrect: true },
                            { text: "O SDK do .NET, porque o servidor precisa do compilador para traduzir o IL da API", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em outubro de 2026, um time vai começar um sistema que deve passar anos em produção, trocando a versão do .NET o mínimo possível. Qual escolha segue o critério de suporte?",
                        difficulty: "medio",
                        options: [
                            { text: "O .NET 8, versão LTS mais antiga e testada, com três anos de suporte pela frente", isCorrect: false },
                            { text: "O .NET 10, versão LTS com correções de segurança garantidas até novembro de 2028", isCorrect: true },
                            { text: "Qualquer versão recente, porque todas recebem três anos de correções", isCorrect: false },
                            { text: "Uma versão STS, porque o suporte das STS dura mais que o das LTS", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois do build de um console app chamado Ola no Linux, a pasta `bin/Debug/net10.0/` tem o executável `Ola` e o arquivo `Ola.dll`. Onde está o código do programa?",
                        difficulty: "medio",
                        options: [
                            { text: "No executável `Ola`, já em código nativo; o `Ola.dll` guarda só os metadados do projeto", isCorrect: false },
                            { text: "No `Ola.dll`, em IL; o executável `Ola` só encontra o runtime e carrega esse assembly", isCorrect: true },
                            { text: "Nos dois, em cópias: o executável roda no Linux e o `Ola.dll` fica para o Windows", isCorrect: false },
                            { text: "No `Ola.pdb`, em IL; o `Ola.dll` e o executável só apontam para o conteúdo dele", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma ferramenta de linha de comando em .NET 10 precisa iniciar o mais rápido possível, sem nenhuma compilação JIT durante a execução. Qual recurso faz isso, e com que custo?",
                        difficulty: "dificil",
                        options: [
                            { text: "Native AOT: o publish gera código nativo, o binário serve a um só sistema e processador, e o código dinâmico fica limitado", isCorrect: true },
                            { text: "ReadyToRun: o publish grava código nativo no assembly e desliga o JIT de vez, sem nenhuma limitação para o código da ferramenta", isCorrect: false },
                            { text: "Tiered compilation desligada: o runtime compila todos os métodos ao iniciar, e com isso a reflexão deixa de funcionar", isCorrect: false },
                            { text: "Build em Release: o compilador gera código de máquina otimizado no lugar do IL, e o custo é só um `.dll` bem maior", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "O dotnet na linha de comando",
                blocks: [
                    {
                        type: "text",
                        value: "# O `dotnet` na linha de comando\n\nEm empresa, quem gera o pacote que vai para produção não é o botão do editor: é o pipeline de CI (integração contínua), rodando os mesmos comandos que você digita no terminal. Quem domina o `dotnet` na linha de comando reproduz na própria máquina exatamente o que a CI faz, e para de ouvir \"na minha máquina funciona\".\n\nTodo comando segue o formato `dotnet <verbo>`. Tudo começa com o `new`, que cria projetos a partir de templates: `console` (aplicativo de linha de comando), `classlib` (biblioteca, um `.dll` para outros projetos usarem), `web` e `webapi` (aplicações ASP.NET Core) e `sln` (arquivo de solução). A lista completa sai com `dotnet new list`.",
                    },
                    {
                        type: "code",
                        value: "# terminal\ndotnet new console -o Ola      # cria a pasta Ola com Ola.csproj e Program.cs\ncd Ola\ndotnet run                     # restaura, compila e executa\n# Hello, World!\n\ndotnet build                   # só compila, em bin/Debug/net10.0/\ndotnet build -c Release        # compila com otimizações, em bin/Release/net10.0/\ndotnet add package Humanizer   # adiciona uma dependência do NuGet",
                    },
                    {
                        type: "table",
                        value: "[[\"Comando\",\"O que faz\",\"Quando usar\"],[\"`dotnet new`\",\"cria projeto, solução ou arquivo a partir de um template\",\"no começo de cada projeto\"],[\"`dotnet restore`\",\"baixa os pacotes NuGet que o projeto referencia\",\"quase nunca à mão: `build`, `run` e `test` já chamam\"],[\"`dotnet build`\",\"compila para `bin/Debug/net10.0/` (ou Release, com `-c Release`)\",\"para conferir que compila, e na CI\"],[\"`dotnet run`\",\"compila e executa o projeto\",\"no dia a dia do desenvolvimento\"],[\"`dotnet test`\",\"compila e roda os projetos de teste\",\"antes de cada commit, e na CI\"],[\"`dotnet add package`\",\"grava a dependência no `.csproj` e restaura\",\"ao adotar uma biblioteca\"],[\"`dotnet publish`\",\"gera a saída pronta para implantar, em Release por padrão\",\"na entrega\"]]",
                    },
                    {
                        type: "text",
                        value: "## O .csproj e o NuGet\n\nO `.csproj` diz ao SDK como compilar o projeto. Ele é curto porque quase tudo vem por convenção: todo arquivo `.cs` da pasta e das subpastas entra no build sem ser listado.\n\nPacotes de terceiros vêm do **NuGet**, o gerenciador de pacotes do .NET, com o repositório público em nuget.org. O `dotnet add package Humanizer` grava um `PackageReference` no `.csproj`, com a versão estável mais recente se você não pedir outra, e baixa o pacote para um cache da sua máquina (`~/.nuget/packages`). Desde o .NET 10, o mesmo comando também se escreve `dotnet package add Humanizer`, forma que a documentação passou a preferir.\n\nO código do pacote não é copiado para o projeto: o `.csproj` guarda só nome e versão, e qualquer máquina reconstrói o resto com `dotnet restore`. Pelo mesmo motivo, `bin/` e `obj/` (saída do build e arquivos intermediários) ficam fora do Git. Muita gente versiona essas pastas no começo e passa a ter binário mudando a cada build e conflito de merge em arquivo gerado; o `dotnet new gitignore` cria o `.gitignore` certo.",
                    },
                    {
                        type: "code",
                        value: "<!-- Ola.csproj, depois de rodar dotnet add package Humanizer -->\n<Project Sdk=\"Microsoft.NET.Sdk\">\n\n  <PropertyGroup>\n    <OutputType>Exe</OutputType>                 <!-- executável; sem isso, vira biblioteca -->\n    <TargetFramework>net10.0</TargetFramework>   <!-- versão do .NET para a qual compila -->\n    <ImplicitUsings>enable</ImplicitUsings>      <!-- usings mais comuns já importados -->\n    <Nullable>enable</Nullable>                  <!-- análise de nulo ligada -->\n  </PropertyGroup>\n\n  <ItemGroup>\n    <PackageReference Include=\"Humanizer\" Version=\"3.0.10\" />\n  </ItemGroup>\n\n</Project>",
                    },
                    {
                        type: "text",
                        value: "## Top-level statements: o programa sem Main\n\nO `Program.cs` do template não tem classe nem método `Main`: as instruções ficam soltas no arquivo. Isso é **top-level statements** (instruções de nível superior). O compilador gera por você uma classe `Program` com o método de entrada, e as instruções do arquivo viram o corpo dele. A variável `args`, com os argumentos da linha de comando, já está disponível, e um `return` com número vira o código de saída do processo, que o terminal e a CI leem para saber se deu certo.\n\nDuas regras: só **um** arquivo do projeto pode ter instruções soltas (com dois, o build falha com o erro CS8802), e tipos declarados nesse arquivo vêm depois das instruções. O `Console` funciona sem `using System;` por causa do `ImplicitUsings`: o SDK gera em `obj/` um arquivo com `global using` para `System`, `System.IO`, `System.Linq`, `System.Collections.Generic`, `System.Net.Http`, `System.Threading` e `System.Threading.Tasks`. E no .NET 10 nem o projeto é obrigatório para um teste rápido: `dotnet run hoje.cs` roda um arquivo `.cs` sozinho.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: o programa inteiro, sem classe nem Main\nif (args.Length == 0)\n{\n    Console.WriteLine(\"Uso: dotnet run -- <nome>\");\n    return 1;   // código de saída diferente de zero: algo deu errado\n}\n\nConsole.WriteLine($\"Olá, {args[0]}!\");\nreturn 0;\n\n// No terminal, o -- separa as opções do dotnet run dos argumentos do programa:\n// dotnet run -- Ana   ->  Olá, Ana!                   (código de saída 0)\n// dotnet run          ->  Uso: dotnet run -- <nome>   (código de saída 1)",
                    },
                    {
                        type: "text",
                        value: "## Solução, referências e testes\n\nUm sistema de verdade tem vários projetos: a API, uma biblioteca com as regras de negócio, os testes. O **arquivo de solução** agrupa esses projetos, e um `dotnet build` ou `dotnet test` na pasta dele atinge todos. Desde o .NET 10, `dotnet new sln` cria o formato **.slnx**, um XML curto e legível; o `.sln` antigo, cheio de identificadores GUID, continua funcionando (e sai com `--format sln`), e você vai encontrá-lo em muito repositório.\n\nO `dotnet test` compila e roda os projetos de teste da solução e termina com código de saída diferente de zero se algum teste falhar: é isso que faz a CI barrar o merge. Os testes em si ganham um módulo próprio mais adiante.",
                    },
                    {
                        type: "code",
                        value: "# terminal\ndotnet new sln -n Loja                      # cria Loja.slnx\ndotnet new classlib -o Loja.Regras          # biblioteca com as regras de negócio\ndotnet new console -o Loja.App              # aplicativo que usa a biblioteca\ndotnet sln add Loja.Regras Loja.App         # registra os dois projetos na solução\ndotnet add Loja.App reference Loja.Regras   # Loja.App passa a enxergar Loja.Regras\ndotnet build                                # compila os dois, na ordem certa\ndotnet test                                 # roda os projetos de teste que houver\n\ncat Loja.slnx\n# <Solution>\n#   <Project Path=\"Loja.App/Loja.App.csproj\" />\n#   <Project Path=\"Loja.Regras/Loja.Regras.csproj\" />\n# </Solution>",
                    },
                    {
                        type: "quote",
                        value: "O `dotnet` faz na sua máquina o mesmo que a CI faz no servidor: `new` cria, `build` compila, `run` executa, `test` testa e `add package` traz dependências do NuGet para o `.csproj`. O `Program.cs` com top-level statements vira o corpo do método de entrada que o compilador gera, e a solução amarra os projetos.",
                    },
                ],
                questions: [
                    {
                        statement: "Em que arquivo ficam a versão do .NET para a qual o projeto compila (`net10.0`) e os pacotes NuGet de que ele depende?",
                        difficulty: "facil",
                        options: [
                            { text: "No `.csproj` do projeto, em `TargetFramework` e nos itens `PackageReference`", isCorrect: true },
                            { text: "No arquivo `.slnx`, que guarda a versão e os pacotes de cada projeto da solução", isCorrect: false },
                            { text: "No `Program.cs`, nas diretivas `using` que ficam no começo do arquivo", isCorrect: false },
                            { text: "Em `obj/project.assets.json`, que se edita à mão para trocar as versões", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o comando `dotnet add package Humanizer` faz no projeto?",
                        difficulty: "facil",
                        options: [
                            { text: "Grava um `PackageReference` no `.csproj` e baixa o pacote para o cache local do NuGet", isCorrect: true },
                            { text: "Instala o pacote de forma global, e todos os projetos da máquina passam a usá-lo", isCorrect: false },
                            { text: "Registra o pacote no arquivo de solução, e cada projeto decide se vai usá-lo", isCorrect: false },
                            { text: "Copia o código-fonte do pacote para uma pasta do projeto, que passa a ir junto para o Git", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um projeto de console já tem um `Program.cs` com top-level statements. Alguém cria o arquivo `Relatorio.cs` e também escreve instruções soltas no topo dele. O que acontece no `dotnet build`?",
                        difficulty: "medio",
                        options: [
                            { text: "O build passa, e os dois arquivos executam em sequência, na ordem alfabética do nome", isCorrect: false },
                            { text: "O build falha, porque só um arquivo do projeto pode ter instruções de nível superior", isCorrect: true },
                            { text: "O build passa, e o compilador usa o `Program.cs` como entrada e ignora o outro arquivo", isCorrect: false },
                            { text: "O build passa com aviso, e o `Relatorio.cs` vira um segundo ponto de entrada do programa", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que `Console.WriteLine` compila num `Program.cs` novo que não tem nenhuma linha `using System;`?",
                        difficulty: "medio",
                        options: [
                            { text: "Os top-level statements importam sozinhos todos os namespaces da biblioteca base do .NET", isCorrect: false },
                            { text: "O `ImplicitUsings` do `.csproj` faz o SDK gerar `global using System;` dentro de `obj/`", isCorrect: true },
                            { text: "O `Console` é um tipo embutido no compilador, e por isso não pertence a nenhum namespace", isCorrect: false },
                            { text: "Desde o C# 14, o namespace `System` passou a ser importado pela própria linguagem", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O `Program.cs` abaixo é executado com `dotnet run -c Release -- Maria Silva`. O que aparece no terminal?\n\n```csharp\nConsole.WriteLine($\"{args.Length} argumentos, o primeiro é {args[0]}\");\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "1 argumentos, o primeiro é Maria Silva", isCorrect: false },
                            { text: "4 argumentos, o primeiro é -c", isCorrect: false },
                            { text: "3 argumentos, o primeiro é Release", isCorrect: false },
                            { text: "2 argumentos, o primeiro é Maria", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Tipos e variáveis",
                blocks: [
                    {
                        type: "text",
                        value: "# Tipos e variáveis\n\nDois bugs aparecem cedo na vida de quem programa em C#. No primeiro, você altera o que achava ser uma cópia de um array e o original muda junto. No segundo, o sistema cai em produção com `NullReferenceException`, porque uma variável que \"nunca seria nula\" chegou nula. Os dois vêm de não saber como o C# guarda valores, e no segundo o compilador moderno ajuda bastante, se você deixar.\n\nC# tem **tipagem estática**: toda variável tem um tipo definido na compilação, e o compilador recusa o que não faz sentido para aquele tipo.\n\n## Tipos de valor e tipos de referência\n\n- **Tipo de valor** (`int`, `double`, `decimal`, `bool`, `char`, `DateTime`, structs e enums): a variável guarda o próprio valor. Atribuir a outra variável copia o valor.\n- **Tipo de referência** (`string`, arrays, classes): a variável guarda uma referência para um objeto que fica no heap, a área de memória que o garbage collector administra. Atribuir a outra variável copia a referência, e as duas passam a apontar para o mesmo objeto.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nint a = 10;\nint b = a;              // copia o valor 10\nb = 20;\nConsole.WriteLine($\"a = {a}, b = {b}\");         // a = 10, b = 20\n\nint[] notas = { 7, 8, 9 };\nint[] outras = notas;   // copia a referência: dois nomes, um array só\noutras[0] = 0;\nConsole.WriteLine($\"notas[0] = {notas[0]}\");    // notas[0] = 0",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo\",\"Categoria\",\"Literal\",\"Para quê\"],[\"`int`\",\"valor\",\"`42`\",\"inteiro de 32 bits, o padrão para contagens\"],[\"`long`\",\"valor\",\"`42L`\",\"inteiro de 64 bits, para números grandes\"],[\"`double`\",\"valor\",\"`0.1`\",\"ponto flutuante binário: rápido, mas com erro de arredondamento\"],[\"`decimal`\",\"valor\",\"`0.1m`\",\"número em base 10, o tipo certo para dinheiro\"],[\"`bool`\",\"valor\",\"`true`\",\"verdadeiro ou falso\"],[\"`char`\",\"valor\",\"`'A'`\",\"um caractere\"],[\"`string`\",\"referência\",\"`\\\"texto\\\"`\",\"texto imutável\"],[\"`int[]`\",\"referência\",\"`new int[3]`\",\"array de tamanho fixo\"]]",
                    },
                    {
                        type: "text",
                        value: "## var: o tipo é inferido, não dinâmico\n\nCom `var`, o compilador deduz o tipo pelo valor da direita: `var total = 10;` declara um `int`, exatamente como `int total = 10;`. O tipo fica fixo na compilação. Quem vem de JavaScript costuma achar que `var` deixa a variável mudar de tipo, mas atribuir uma string a `total` depois não compila. Use `var` quando o tipo é óbvio pela direita (`var hoje = DateTime.Today;`) e escreva o tipo quando ele ajudar quem lê.\n\n## Conversões\n\nConversão que não perde informação é **implícita**, como de `int` para `long`. A que pode perder exige **cast** explícito, e o risco passa a ser seu: `(int)3.99` vale 3, porque o cast trunca. Texto vira número com `int.Parse`, que lança exceção se o texto não for número, ou com `int.TryParse`, que devolve `false` em vez de lançar (o `out` dele aparece na aula de métodos).\n\nDois erros de produção moram aqui. A aritmética de `int` estoura em silêncio: somar 1 a uma variável que vale `int.MaxValue` dá um número negativo, e só um contexto `checked` transforma isso em exceção. E o `Parse` usa a cultura da máquina: num servidor configurado em português, o ponto é separador de milhar, e `double.Parse(\"3.14\")` devolve 314. Número que vem de arquivo, JSON ou API se lê com `CultureInfo.InvariantCulture`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing System.Globalization;\n\nvar total = 10;                  // total é int, decidido na compilação\n// total = \"dez\";                // erro CS0029: não converte string em int\n\nlong grande = total;             // int para long: implícita, sem perda\nint truncado = (int)3.99;        // double para int: cast explícito, trunca\nConsole.WriteLine(grande + truncado);          // 13\n\nint limite = int.MaxValue;\nint estourou = limite + 1;       // estoura em silêncio\nConsole.WriteLine(estourou);                   // -2147483648\n// checked(limite + 1) lançaria OverflowException\n\nConsole.WriteLine(0.1 + 0.2 == 0.3);           // False: double acumula erro\nConsole.WriteLine(0.1m + 0.2m == 0.3m);        // True: decimal é exato em base 10\n\nConsole.WriteLine(int.TryParse(\"12a\", out int lido));   // False, e lido fica 0\n\ndouble errado = double.Parse(\"3.14\", new CultureInfo(\"pt-BR\"));\ndouble certo = double.Parse(\"3.14\", CultureInfo.InvariantCulture);\nConsole.WriteLine(errado == 314);              // True: em pt-BR o ponto separa milhar\nConsole.WriteLine(certo == 3.14);              // True",
                    },
                    {
                        type: "text",
                        value: "## string é imutável\n\n`string` é tipo de referência, com duas particularidades. Ela é **imutável**: nenhum método altera o texto existente, e `ToUpper`, `Trim` e `Replace` devolvem uma string nova. Muita gente escreve `nome.Trim();` sozinho numa linha e não entende por que os espaços continuam: o resultado foi jogado fora. E o `==` de string compara o **conteúdo**, não a referência.\n\nA imutabilidade cobra seu preço em laço. Concatenar com `+=` milhares de vezes cria milhares de strings intermediárias para o garbage collector limpar. Para montar texto grande em laço, use `StringBuilder`, que vai preenchendo um buffer interno e gera a string uma vez só, no fim.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing System.Text;\n\nstring nome = \"  Ana  \";\nnome.Trim();                         // devolve \"Ana\", mas ninguém guardou\nConsole.WriteLine($\"[{nome}]\");      // [  Ana  ]\n\nnome = nome.Trim().ToUpper();        // agora a variável recebe a string nova\nConsole.WriteLine($\"[{nome}]\");      // [ANA]\n\nstring a = \"dev\";\nstring b = string.Concat(\"d\", \"ev\"); // outro objeto, mesmo conteúdo\nConsole.WriteLine(a == b);           // True: == de string compara o texto\n\nvar sb = new StringBuilder();        // para montar texto em laço\nfor (int i = 1; i <= 3; i++)\n{\n    sb.Append(i).Append(';');\n}\nConsole.WriteLine(sb.ToString());    // 1;2;3;",
                    },
                    {
                        type: "text",
                        value: "## Nullable reference types e o aviso de nulo\n\nEm projeto novo, o `.csproj` traz `<Nullable>enable</Nullable>`, e isso muda o significado de `string`: passa a querer dizer \"nunca nula\". Quando a variável pode ficar sem valor, você declara `string?`. Com essa informação, o compilador acompanha o fluxo do código e **avisa** quando você usa uma variável possivelmente nula sem conferir antes (CS8602) ou quando põe nulo onde não deveria (CS8600, CS8625).\n\nTrês detalhes que caem em entrevista e em code review:\n\n- É análise de compilação. Na execução nada muda: ignore o aviso e a `NullReferenceException` acontece do mesmo jeito.\n- São **avisos**, não erros. Muitos times põem `<WarningsAsErrors>nullable</WarningsAsErrors>` no `.csproj` para o build falhar.\n- O operador `!` (como em `apelido!.Length`) manda o compilador se calar. Usado para esconder aviso, ele só adia o crash.\n\nEm tipo de valor, `int?` é outra coisa: um tipo de verdade, `Nullable<int>`, com `HasValue` e `Value`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (com <Nullable>enable</Nullable>, o padrão)\nstring? apelido = args.Length > 0 ? args[0] : null;\n\n// Console.WriteLine(apelido.Length);\n// aviso CS8602: Desreferência de uma referência possivelmente nula.\n// Rodando sem argumentos, essa linha lançaria NullReferenceException.\n\nConsole.WriteLine(apelido?.Length);            // ?. devolve null em vez de lançar: linha vazia\nConsole.WriteLine(apelido ?? \"sem apelido\");   // ?? troca null por um padrão: sem apelido\n\nif (apelido is not null)\n{\n    Console.WriteLine(apelido.Length);         // sem aviso: aqui o compilador sabe que não é null\n}\n\nint? idade = null;                             // int? é Nullable<int>, um tipo de verdade\nConsole.WriteLine(idade.HasValue);             // False",
                    },
                    {
                        type: "quote",
                        value: "Tipo de valor copia o valor e tipo de referência copia a referência; `var` só poupa digitação, conversão com perda pede cast, número de fora se lê com `InvariantCulture`, `string` nunca muda no lugar, e `string?` com o aviso de nulo ligado deixa o compilador achar o `NullReferenceException` antes da produção.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nint x = 5;\nint y = x;\ny++;\nConsole.WriteLine($\"{x} {y}\");\n```",
                        difficulty: "facil",
                        options: [
                            { text: "5 6", isCorrect: true },
                            { text: "5 5", isCorrect: false },
                            { text: "6 5", isCorrect: false },
                            { text: "6 6", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o efeito de declarar `var total = 10;` e, na linha seguinte, escrever `total = \"dez\";`?",
                        difficulty: "facil",
                        options: [
                            { text: "Compila, e o C# converte o texto `\"dez\"` para o número 10 sozinho", isCorrect: false },
                            { text: "Erro de compilação: o `var` fixou `total` como `int` na declaração", isCorrect: true },
                            { text: "Compila com aviso, e a conversão para `int` só falha durante a execução", isCorrect: false },
                            { text: "Compila, e `total` passa a ser uma `string` a partir dessa linha", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nstring nome = \" Ana \";\nnome.Trim();\nstring grito = nome.ToUpper();\nConsole.WriteLine($\"[{nome}] [{grito}]\");\n```",
                        difficulty: "medio",
                        options: [
                            { text: "`[ Ana ] [ ANA ]`", isCorrect: true },
                            { text: "`[ANA] [ANA]`", isCorrect: false },
                            { text: "`[Ana] [ANA]`", isCorrect: false },
                            { text: "`[ ANA ] [ ANA ]`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num projeto com `<Nullable>enable</Nullable>`, o que muda ao declarar `string? nome` em vez de `string nome`?",
                        difficulty: "medio",
                        options: [
                            { text: "O compilador passa a recusar, com erro, qualquer atribuição de nulo a `nome`", isCorrect: false },
                            { text: "O tipo passa a ser `Nullable<string>`, com as propriedades `HasValue` e `Value`", isCorrect: false },
                            { text: "Só a análise de nulo do compilador; na execução, os dois são `System.String`", isCorrect: true },
                            { text: "O runtime passa a checar a variável e lança uma exceção quando ela recebe nulo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um serviço roda num servidor com cultura pt-BR e lê de um JSON o texto `\"3.14\"` com `double.Parse(texto)`, sem informar cultura. O que acontece?",
                        difficulty: "dificil",
                        options: [
                            { text: "Devolve 3,14, porque o ponto é aceito como decimal em qualquer cultura", isCorrect: false },
                            { text: "Devolve 314, porque em pt-BR o ponto é lido como o separador de milhar", isCorrect: true },
                            { text: "Lança `FormatException`, porque em pt-BR o separador decimal é a vírgula", isCorrect: false },
                            { text: "Devolve 3, porque o `Parse` descarta o que vem depois do ponto", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Controle de fluxo e pattern matching",
                blocks: [
                    {
                        type: "text",
                        value: "# Controle de fluxo e pattern matching\n\nRegra de negócio quase sempre vira uma cadeia de condições: o frete depende da região e do peso, o desconto depende do tipo de cliente e do valor da compra. Escrita como uma escada de `if` e `else if`, a regra fica difícil de ler e fácil de quebrar na mudança seguinte. O C# moderno tem o **pattern matching**: você descreve a forma dos dados que espera, e a regra fica parecida com uma tabela.\n\n## if, laços e switch clássico\n\nO `if` do C# só aceita `bool`. Não existe valor que \"conta como verdadeiro\": `if (quantidade)` com um `int` não compila, e com isso o bug clássico de escrever `if (x = 5)` no lugar de `if (x == 5)` vira erro de compilação. Os laços são os que você conhece de lógica de programação: `for`, `while`, `do`/`while` e o `foreach`, que percorre os itens de um array ou de uma coleção. No `switch` clássico, cada `case` com instruções termina em `break` (ou `return`), e o compilador recusa o código que \"cai\" para o caso de baixo sem querer (erro CS0163).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nint[] pedidos = { 120, 80, 300 };\n\nint total = 0;\nforeach (int valor in pedidos)\n{\n    total += valor;\n}\n\nif (total > 400)\n{\n    Console.WriteLine($\"total {total}: frete grátis\");\n}\nelse if (total > 200)\n{\n    Console.WriteLine($\"total {total}: frete com desconto\");\n}\nelse\n{\n    Console.WriteLine($\"total {total}: frete normal\");\n}\n// total 500: frete grátis\n\nfor (int i = 0; i < pedidos.Length; i++)\n{\n    Console.WriteLine($\"pedido {i + 1}: {pedidos[i]}\");\n}\n// pedido 1: 120\n// pedido 2: 80\n// pedido 3: 300\n\n// if (total) { }   // erro CS0029: int não vira bool",
                    },
                    {
                        type: "text",
                        value: "## switch expression\n\nA `switch` expression devolve um valor. Cada braço tem um padrão, a seta `=>` e o resultado, e o compilador testa os braços **de cima para baixo**, parando no primeiro que casa. O `_` (descarte) casa com qualquer coisa e faz o papel de \"senão\".\n\nO compilador vigia duas coisas. Se algum valor possível ficar sem braço, ele avisa (CS8509, citando um exemplo de valor esquecido), e se esse valor aparecer na execução, o programa lança `SwitchExpressionException`. E se um braço nunca puder ser alcançado, porque um anterior já cobre tudo o que ele cobriria, o código não compila (CS8510). É o caso de quem põe a regra genérica antes da específica: em vez de deixar o bug passar, o compilador recusa.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nConsole.WriteLine(Conceito(95));    // excelente\nConsole.WriteLine(Conceito(70));    // bom\nConsole.WriteLine(Conceito(12));    // insuficiente\nConsole.WriteLine(Conceito(130));   // nota inválida\n\n// Função local (a sintaxe completa fica para a aula de métodos)\nstatic string Conceito(int nota) => nota switch\n{\n    < 0 or > 100 => \"nota inválida\",\n    >= 90 => \"excelente\",\n    >= 70 => \"bom\",\n    >= 50 => \"regular\",\n    _ => \"insuficiente\"\n};",
                    },
                    {
                        type: "text",
                        value: "## Os padrões\n\n- **De tipo**: `valor is int n` testa o tipo e, se casar, já entrega a variável `n` convertida, no lugar do par \"testa com `is`, converte com cast\".\n- **Relacional e lógico**: `< 0`, `>= 90`, combinados com `and`, `or` e `not`. O `is not null` é o jeito idiomático de testar nulo.\n- **De propriedade**: `{ Month: 12, Day: 25 }` casa quando as propriedades têm esses valores, e aceita padrões aninhados, como `{ Length: > 10 }`.\n- **De lista**: `[]` casa com array vazio, `[\"ajuda\"]` com um array de exatamente um item igual a \"ajuda\", e o `..` casa com qualquer quantidade de itens, zero inclusive (`[\"log\", ..]`).\n\nUm braço também aceita uma condição extra com `when`, para o que o padrão sozinho não expressa.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nobject?[] valores = { 42, -7, \"\", \"pedido\", 3.5, null };\nforeach (object? v in valores)\n{\n    Console.WriteLine(Descrever(v));\n}\n// inteiro 42\n// inteiro negativo\n// texto vazio\n// texto com 6 letras\n// outro tipo: Double\n// nulo\n\nvar data = new DateTime(2026, 12, 25);\nstring tipo = data switch\n{\n    { Month: 12, Day: 25 } => \"Natal\",\n    { DayOfWeek: DayOfWeek.Saturday or DayOfWeek.Sunday } => \"fim de semana\",\n    _ => \"dia útil\"\n};\nConsole.WriteLine(tipo);    // Natal\n\nstatic string Descrever(object? valor) => valor switch\n{\n    null => \"nulo\",\n    int n when n < 0 => \"inteiro negativo\",     // padrão de tipo com condição extra\n    int n => $\"inteiro {n}\",\n    string { Length: 0 } => \"texto vazio\",      // tipo mais propriedade\n    string s => $\"texto com {s.Length} letras\",\n    _ => $\"outro tipo: {valor.GetType().Name}\"\n};",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nConsole.WriteLine(Comando(args));\n\nstatic string Comando(string[] partes) => partes switch\n{\n    [] => \"nenhum comando\",\n    [\"ajuda\"] => \"mostra a ajuda\",\n    [\"somar\", var a, var b] => $\"soma {a} com {b}\",\n    [\"log\", .. var resto] => $\"log com {resto.Length} opções\",\n    _ => \"comando desconhecido\"\n};\n\n// dotnet run                           ->  nenhum comando\n// dotnet run -- ajuda                  ->  mostra a ajuda\n// dotnet run -- somar 2 3              ->  soma 2 com 3\n// dotnet run -- log --verbose --cor    ->  log com 2 opções\n// dotnet run -- somar 2                ->  comando desconhecido",
                    },
                    {
                        type: "table",
                        value: "[[\"Padrão\",\"Exemplo\",\"Casa quando\"],[\"constante\",\"`0`, `\\\"SP\\\"`, `null`\",\"o valor é igual à constante\"],[\"tipo\",\"`int n`\",\"o valor é desse tipo, e `n` recebe o valor convertido\"],[\"relacional\",\"`>= 90`\",\"a comparação é verdadeira\"],[\"lógico\",\"`< 0 or > 100`, `not null`\",\"a combinação é verdadeira\"],[\"propriedade\",\"`{ Month: 12 }`\",\"cada propriedade casa com o seu subpadrão\"],[\"lista\",\"`[\\\"log\\\", ..]`\",\"os itens casam na ordem, e o `..` cobre o resto\"],[\"descarte\",\"`_`\",\"sempre\"]]",
                    },
                    {
                        type: "quote",
                        value: "O `if` só aceita `bool`, a `switch` expression devolve o resultado do primeiro braço que casa, e os padrões de tipo, relacional, de propriedade e de lista deixam a regra com cara de tabela, com o compilador avisando quando falta caso e recusando braço que nunca seria alcançado.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nint pontos = 85;\nstring medalha = pontos switch\n{\n    >= 90 => \"ouro\",\n    >= 80 => \"prata\",\n    >= 70 => \"bronze\",\n    _ => \"nenhuma\"\n};\nConsole.WriteLine(medalha);\n```",
                        difficulty: "facil",
                        options: [
                            { text: "nenhuma", isCorrect: false },
                            { text: "prata", isCorrect: true },
                            { text: "ouro", isCorrect: false },
                            { text: "bronze", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `int quantidade` e `bool ativo` já declarados, qual destas linhas **não** compila em C#?",
                        difficulty: "facil",
                        options: [
                            { text: "`if (quantidade > 0) { }`", isCorrect: false },
                            { text: "`if (quantidade) { }`", isCorrect: true },
                            { text: "`if (ativo) { }`", isCorrect: false },
                            { text: "`if (!ativo && quantidade != 0) { }`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o programa abaixo imprime? O dia 25/12/2027 cai num sábado.\n\n```csharp\nvar data = new DateTime(2027, 12, 25);\nstring tipo = data switch\n{\n    { DayOfWeek: DayOfWeek.Saturday or DayOfWeek.Sunday } => \"fim de semana\",\n    { Month: 12, Day: 25 } => \"feriado de Natal\",\n    { Month: 12 } => \"mês de dezembro\",\n    _ => \"dia útil comum\"\n};\nConsole.WriteLine(tipo);\n```",
                        difficulty: "medio",
                        options: [
                            { text: "feriado de Natal", isCorrect: false },
                            { text: "mês de dezembro", isCorrect: false },
                            { text: "fim de semana", isCorrect: true },
                            { text: "dia útil comum", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nstring[] partes = { \"somar\", \"2\", \"3\", \"4\" };\nstring resultado = partes switch\n{\n    [\"somar\", var a, var b] => $\"soma de {a} e {b}\",\n    [\"somar\", .. var resto] => $\"soma de {resto.Length} números\",\n    _ => \"comando desconhecido\"\n};\nConsole.WriteLine(resultado);\n```",
                        difficulty: "medio",
                        options: [
                            { text: "comando desconhecido", isCorrect: false },
                            { text: "soma de 2 e 3", isCorrect: false },
                            { text: "soma de 3 números", isCorrect: true },
                            { text: "soma de 4 números", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que acontece com o programa abaixo, do build à execução?\n\n```csharp\nstring Sinal(int n) => n switch\n{\n    > 0 => \"positivo\",\n    < 0 => \"negativo\"\n};\nConsole.WriteLine(Sinal(0));\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Compila sem aviso, porque `> 0` e `< 0` juntos cobrem todos os valores possíveis de `int`", isCorrect: false },
                            { text: "Compila com aviso de `switch` incompleto, e lança `SwitchExpressionException` ao rodar", isCorrect: true },
                            { text: "Não compila, porque toda `switch` expression precisa terminar com um braço `_`", isCorrect: false },
                            { text: "Compila com o mesmo aviso, e imprime uma linha vazia, o valor padrão de `string`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Métodos",
                blocks: [
                    {
                        type: "text",
                        value: "# Métodos\n\nVeja esta chamada: `Calcular(100, 3, true, false)`. Sem abrir a declaração, ninguém sabe o que são o 3, o `true` e o `false`. E quando uma função precisa devolver duas coisas, como \"deu certo?\" e \"qual o valor?\", aparece a gambiarra de devolver -1 para indicar erro. O C# resolve os dois problemas com argumentos nomeados, valores padrão, `out` e tuplas.\n\nNeste módulo, as funções ficam no próprio `Program.cs`; tecnicamente, são **funções locais** do método de entrada que o compilador gera. Métodos dentro de classes usam a mesma sintaxe e aparecem no estudo de orientação a objetos.\n\n## Parâmetros, valores padrão e argumentos nomeados\n\nA declaração diz o tipo de retorno (`void` quando não devolve nada), o nome e os parâmetros com seus tipos; corpo de uma expressão só pode usar `=>`. Parâmetro com **valor padrão** pode ser omitido na chamada, e todos os opcionais vêm depois dos obrigatórios. Na chamada, **argumentos nomeados** (`gritar: true`) deixam claro o que é cada valor e permitem pular opcionais do meio.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nConsole.WriteLine(Saudar(\"Ana\"));                       // Olá, Ana!\nConsole.WriteLine(Saudar(\"Ana\", \"Bom dia\"));            // Bom dia, Ana!\nConsole.WriteLine(Saudar(\"Ana\", gritar: true));         // OLÁ, ANA!\nConsole.WriteLine(Saudar(gritar: true, nome: \"Rui\"));   // OLÁ, RUI!\n\nstatic string Saudar(string nome, string saudacao = \"Olá\", bool gritar = false)\n{\n    string texto = $\"{saudacao}, {nome}!\";\n    return gritar ? texto.ToUpper() : texto;\n}",
                    },
                    {
                        type: "text",
                        value: "## Devolvendo mais de um valor: out e tuplas\n\nUm parâmetro `out` é uma saída: o método é obrigado a atribuir valor a ele antes de retornar, e quem chama pode declarar a variável na própria chamada (`out int quociente`). É o padrão `TryParse` da biblioteca base: o retorno `bool` diz se deu certo, e o `out` entrega o resultado.\n\nUma **tupla** devolve vários valores de uma vez, com nome: `(int Menor, int Maior)`. Quem chama lê pelos nomes ou **desconstrói** em variáveis com `var (menor, maior) = ...`. A desconstrução é **por posição**: os nomes das variáveis não precisam bater com os da tupla, e trocar a ordem troca os valores sem aviso nenhum. Tupla é ótima para dois ou três valores num método interno; quando o resultado circula pelo sistema, um tipo com nome próprio, como um record, comunica melhor.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nif (TentarDividir(17, 5, out int quociente))\n{\n    Console.WriteLine(quociente);                    // 3\n}\nConsole.WriteLine(TentarDividir(1, 0, out _));       // False  (_ descarta o out)\n\nvar (menor, maior) = Extremos(new[] { 4, 9, 1, 7 });\nConsole.WriteLine($\"{menor} e {maior}\");             // 1 e 9\n\nvar faixa = Extremos(new[] { 5, 2 });\nConsole.WriteLine(faixa.Maior);                      // 5\n\nstatic bool TentarDividir(int dividendo, int divisor, out int quociente)\n{\n    if (divisor == 0)\n    {\n        quociente = 0;      // o out precisa de valor até no caminho de erro\n        return false;\n    }\n    quociente = dividendo / divisor;\n    return true;\n}\n\nstatic (int Menor, int Maior) Extremos(int[] numeros)\n{\n    int menor = numeros[0], maior = numeros[0];\n    foreach (int n in numeros)\n    {\n        if (n < menor) menor = n;\n        if (n > maior) maior = n;\n    }\n    return (menor, maior);\n}",
                    },
                    {
                        type: "text",
                        value: "## Funções locais\n\nUma função pode ser declarada **dentro** de outra. Ela só existe ali, o que deixa claro que é detalhe de implementação, e enxerga as variáveis da função de fora (isso se chama captura). Quando você não quer captura, marque a função local como `static`: o compilador passa a recusar o acesso a variáveis de fora (erro CS8421), e toda dependência tem que chegar por parâmetro.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nConsole.WriteLine(Resumo(new[] { 3, 8, 5, 9 }, limite: 5));   // 2 de 4 acima de 5\n\nstatic string Resumo(int[] valores, int limite)\n{\n    int acima = 0;\n    foreach (int v in valores)\n    {\n        if (PassouDoLimite(v)) acima++;\n    }\n    return $\"{acima} de {valores.Length} acima de {limite}\";\n\n    // Função local: só existe dentro de Resumo e enxerga limite (captura)\n    bool PassouDoLimite(int v) => v > limite;\n\n    // Com static, a captura vira erro de compilação:\n    // static bool PassouDoLimite(int v) => v > limite;   // erro CS8421\n}",
                    },
                    {
                        type: "text",
                        value: "## Passagem por valor e por referência\n\nPor padrão, o C# passa argumentos **por valor**: o método recebe uma cópia do conteúdo da variável. Com `int`, a cópia é do número, e mexer no parâmetro não afeta quem chamou. Com array (ou qualquer tipo de referência), a cópia é da **referência**: o método enxerga o mesmo objeto e consegue alterar o conteúdo dele, mas atribuir um objeto novo ao parâmetro só troca a cópia local.\n\nMuita gente resume isso como \"objeto é passado por referência\", e a frase engana: o que se passa é a referência, por valor. Passagem por referência de verdade é com `ref`, que entrega a própria variável de quem chamou e aparece na declaração e na chamada. O `out` é um `ref` de saída, e o `in` é um `ref` só de leitura.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nint x = 5;\nDobrar(x);\nConsole.WriteLine(x);           // 5: o método mexeu numa cópia\nDobrarNoLugar(ref x);\nConsole.WriteLine(x);           // 10: ref entrega a própria variável\n\nint[] notas = { 7, 8, 9 };\nZerar(notas);\nConsole.WriteLine(notas[0]);    // 0: mesma referência, o array foi alterado\nTrocar(notas);\nConsole.WriteLine(notas[0]);    // 0: o array novo ficou só dentro de Trocar\n\nstatic void Dobrar(int n) => n *= 2;\nstatic void DobrarNoLugar(ref int n) => n *= 2;\nstatic void Zerar(int[] v) => v[0] = 0;\nstatic void Trocar(int[] v) => v = new[] { 1, 1, 1 };",
                    },
                    {
                        type: "table",
                        value: "[[\"Forma\",\"Na chamada\",\"O que o método pode fazer\",\"Uso típico\"],[\"por valor (padrão)\",\"`Dobrar(x)`\",\"mexer na própria cópia; se for referência, alterar o objeto apontado\",\"quase sempre\"],[\"`ref`\",\"`DobrarNoLugar(ref x)`\",\"ler e trocar a variável de quem chamou\",\"raro, como trocar dois valores de lugar\"],[\"`out`\",\"`TentarDividir(17, 5, out int q)`\",\"precisa atribuir antes de retornar\",\"o padrão `TryParse`\"],[\"`in`\",\"`Calcular(in valor)`\",\"só ler, sem cópia\",\"struct grande em código sensível a desempenho\"]]",
                    },
                    {
                        type: "quote",
                        value: "Valores padrão e argumentos nomeados deixam a chamada legível, `out` e tuplas devolvem mais de um valor, funções locais escondem detalhe de implementação, e todo argumento é passado por valor, a menos que `ref`, `out` ou `in` digam o contrário.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nConsole.WriteLine(Etiqueta(\"café\", unidade: \"kg\"));\n\nstatic string Etiqueta(string produto, int quantidade = 1, string unidade = \"un\")\n    => $\"{quantidade} {unidade} de {produto}\";\n```",
                        difficulty: "facil",
                        options: [
                            { text: "Erro de compilação", isCorrect: false },
                            { text: "1 un de café", isCorrect: false },
                            { text: "1 kg de café", isCorrect: true },
                            { text: "0 kg de café", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o compilador exige de um método que declara um parâmetro `out`?",
                        difficulty: "facil",
                        options: [
                            { text: "Que o parâmetro `out` seja o último da lista e que o retorno do método seja `bool`", isCorrect: false },
                            { text: "Que quem chama inicialize a variável antes de passá-la como argumento ao método", isCorrect: false },
                            { text: "Que o método leia o valor recebido no parâmetro antes de atribuir um valor novo a ele", isCorrect: false },
                            { text: "Que o método atribua um valor ao parâmetro antes de retornar, em todos os caminhos", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nint a = 1, b = 1;\nIncrementar(a);\nIncrementarRef(ref b);\nConsole.WriteLine($\"{a} {b}\");\n\nstatic void Incrementar(int n) => n++;\nstatic void IncrementarRef(ref int n) => n++;\n```",
                        difficulty: "medio",
                        options: [
                            { text: "1 1", isCorrect: false },
                            { text: "2 2", isCorrect: false },
                            { text: "2 1", isCorrect: false },
                            { text: "1 2", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nvar (maior, menor) = Extremos(8, 3);\nConsole.WriteLine($\"menor={menor} maior={maior}\");\n\nstatic (int Menor, int Maior) Extremos(int a, int b)\n    => a < b ? (a, b) : (b, a);\n```",
                        difficulty: "medio",
                        options: [
                            { text: "menor=3 maior=8", isCorrect: false },
                            { text: "Erro: tupla com nomes não se desconstrói", isCorrect: false },
                            { text: "Erro: os nomes não batem com os da tupla", isCorrect: false },
                            { text: "menor=8 maior=3", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nint[] dados = { 1, 2, 3 };\nReiniciar(dados);\nConsole.WriteLine($\"{dados[0]} {dados[1]}\");\n\nstatic void Reiniciar(int[] valores)\n{\n    valores[0] = 100;\n    valores = new int[] { 0, 0, 0 };\n    valores[1] = 200;\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "100 2", isCorrect: true },
                            { text: "1 2", isCorrect: false },
                            { text: "100 200", isCorrect: false },
                            { text: "0 200", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 2 - Orientação a objetos em C#",
        aulas: [
            {
                titulo: "Classes, objetos e construtores",
                blocks: [
                    {
                        type: "text",
                        value: "# Classes, objetos e construtores\n\nPense no carrinho de uma loja virtual escrito só com o que você viu até agora: uma `string` com o nome do cliente, um `int` com a quantidade de itens, um `decimal` com o total. Cada método recebe três ou quatro parâmetros soltos, e nada impede que alguém some um item e esqueça de atualizar o total. O dado mora num lugar, a regra que protege o dado mora em outro, e o bug mora no meio dos dois.\n\nA **classe** junta estado e comportamento num tipo só. Ela é o molde: declara quais dados um pedido carrega e quais operações fazem sentido sobre ele. O **objeto** é uma instância concreta desse molde, criada com `new` e guardada no heap, a área de memória que o coletor de lixo administra. Você escreve `Pedido` uma vez e cria quantos pedidos quiser, cada um com o próprio estado.\n\nUma classe costuma ter três tipos de peça:\n\n- **campos**, as variáveis internas que guardam o estado;\n- **métodos**, as operações que leem e alteram esse estado seguindo as regras;\n- **construtores**, o código que roda no nascimento do objeto e garante que ele já comece válido.\n\nComo classe é tipo de referência, a variável não guarda o objeto, guarda uma referência para ele. Copiar a variável copia a referência: as duas passam a apontar para o mesmo pedido.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar pedido = new Pedido(\"Ana\");\npedido.AdicionarItem(30m);\npedido.AdicionarItem(12m);\n\nvar outroPedido = new Pedido(\"Bruno\");\noutroPedido.AdicionarItem(100m);\n\nConsole.WriteLine(pedido.Resumo());       // Ana | itens: 2 | total: 42\nConsole.WriteLine(outroPedido.Resumo());  // Bruno | itens: 1 | total: 100\n\nvar mesmoPedido = pedido;                 // copia a referência, não o objeto\nmesmoPedido.AdicionarItem(8m);\nConsole.WriteLine(pedido.Resumo());       // Ana | itens: 3 | total: 50\n\nclass Pedido\n{\n    private readonly string _cliente;\n    private int _quantidadeItens;\n    private decimal _total;\n\n    public Pedido(string cliente)\n    {\n        ArgumentException.ThrowIfNullOrWhiteSpace(cliente);\n        _cliente = cliente;\n    }\n\n    public void AdicionarItem(decimal preco)\n    {\n        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(preco);\n        _quantidadeItens++;\n        _total += preco;\n    }\n\n    public string Resumo() => $\"{_cliente} | itens: {_quantidadeItens} | total: {_total}\";\n}",
                    },
                    {
                        type: "text",
                        value: "## Construtores: o objeto já nasce válido\n\nO construtor tem o nome da classe e nenhum tipo de retorno. No `Pedido` acima ele recusa cliente vazio: `ArgumentException.ThrowIfNullOrWhiteSpace(cliente)` lança uma exceção e o objeto nem chega a existir. Exceções têm estudo próprio mais adiante; por enquanto basta saber que elas interrompem a criação.\n\nTrês regras que confundem quem está começando:\n\n- **Sem nenhum construtor declarado, o compilador gera um público e sem parâmetros.** Declarou qualquer construtor, esse brinde some, e `new Assinatura()` deixa de compilar (CS1729, nenhum construtor aceita zero argumentos). Isso é bom: quem cria o objeto é obrigado a entregar o que ele precisa.\n- **Sobrecarga com encadeamento.** Vários construtores podem conviver, e o mais simples chama o mais completo com `: this(...)`. A validação fica escrita num lugar só.\n- **Membro `static` é da classe, não do objeto.** O contador `TotalCriadas` abaixo é um só para todas as assinaturas.\n\nNo exemplo, `Email { get; }` é uma propriedade que só o construtor preenche; a próxima aula destrincha propriedades.\n\nMuita gente cria a classe com construtor vazio e deixa quem chama preencher os campos depois, um por um. Entre o `new` e a última atribuição o objeto existe pela metade, e basta um caminho do código esquecer um campo para um pedido sem cliente chegar ao banco de dados. O construtor existe para fechar essa janela.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar mensal = new Assinatura(\"ana@exemplo.com\");\nvar anual = new Assinatura(\"bia@exemplo.com\", meses: 12);\n\nConsole.WriteLine($\"{mensal.Email}: {mensal.Meses} mês(es)\");   // ana@exemplo.com: 1 mês(es)\nConsole.WriteLine($\"{anual.Email}: {anual.Meses} mês(es)\");     // bia@exemplo.com: 12 mês(es)\nConsole.WriteLine(Assinatura.TotalCriadas);                     // 2\n\n// var vazia = new Assinatura();   // não compila: CS1729, não existe construtor sem parâmetros\n\nclass Assinatura\n{\n    public static int TotalCriadas { get; private set; }\n\n    public string Email { get; }\n    public int Meses { get; }\n\n    public Assinatura(string email) : this(email, 1) { }\n\n    public Assinatura(string email, int meses)\n    {\n        ArgumentException.ThrowIfNullOrWhiteSpace(email);\n        ArgumentOutOfRangeException.ThrowIfLessThan(meses, 1);\n        Email = email;\n        Meses = meses;\n        TotalCriadas++;\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Primary constructors (C# 12)\n\nDesde o C# 12 a classe pode declarar os parâmetros do construtor no próprio cabeçalho: `class Conta(string titular, decimal saldoInicial)`. É o **primary constructor**. Os parâmetros ficam visíveis nos inicializadores e nos métodos da classe, e somem aqueles construtores de quatro linhas que só copiavam argumento para campo.\n\nO engano mais comum vem dos records, assunto de daqui a duas aulas. Em `record Conta(string Titular)` o compilador gera uma propriedade pública `Titular`. **Em classe, não gera nada público.** O parâmetro continua sendo parâmetro:\n\n- de fora, `conta.titular` não compila (CS1061), e escrever o nome do parâmetro com maiúscula não muda isso;\n- `this.titular` também não compila, porque o parâmetro não é membro da classe;\n- quando um método usa o parâmetro, o compilador guarda o valor num campo privado oculto, e esse campo **não é `readonly`**: qualquer método da classe pode reatribuir o parâmetro;\n- todo outro construtor da classe precisa chamar o primário com `: this(...)`, senão dá CS8862.\n\nQuer expor o valor? Declare a propriedade e inicialize com o parâmetro, como `Titular` abaixo. Quer imutabilidade de verdade? Copie para uma propriedade só de leitura (ou um campo `readonly`) e use só ela no resto da classe.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar conta = new Conta(\"Ana\", 100m);\nconta.Depositar(50m);\nConsole.WriteLine(conta.Titular);   // Ana\nConsole.WriteLine(conta.Saldo);     // 150\n\nvar nova = new Conta(\"Bruno\");\nConsole.WriteLine(nova.Saldo);      // 0\n\n// Console.WriteLine(conta.titular);   // não compila: CS1061, parâmetro não vira membro\n\nclass Conta(string titular, decimal saldoInicial)\n{\n    public string Titular { get; } = titular;\n    public decimal Saldo { get; private set; } = saldoInicial;\n\n    public Conta(string titular) : this(titular, 0m) { }\n\n    public void Depositar(decimal valor)\n    {\n        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(valor);\n        Saldo += valor;\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O aviso CS9124: duas cópias do mesmo dado\n\nO primary constructor tem uma armadilha que o compilador avisa, mas que muita gente ignora porque o código compila. Se o parâmetro inicializa uma propriedade **e** também é usado direto num método, passam a existir duas cópias do valor: o campo de apoio da propriedade e o campo oculto do parâmetro capturado. Alterou a propriedade, o método continua lendo a cópia antiga. É o tipo de bug que passa no teste rápido e aparece em produção no dia em que alguém edita o cadastro.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar cliente = new Cliente(\"Ana\");\ncliente.Nome = \"Ana Souza\";\n\nConsole.WriteLine(cliente.Nome);         // Ana Souza\nConsole.WriteLine(cliente.Saudacao());   // Olá, Ana   <- leu a cópia capturada\n\nclass Cliente(string nome)\n{\n    public string Nome { get; set; } = nome;      // aviso CS9124 nesta linha\n\n    public string Saudacao() => $\"Olá, {nome}\";   // o certo é usar Nome\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Forma\",\"O que o compilador gera\",\"Acesso de fora\",\"Quando usar\"],[\"Construtor clássico\",\"Só o que você escreveu\",\"O que você expôs\",\"Várias sobrecargas ou validação longa\"],[\"Primary constructor em classe (C# 12)\",\"Parâmetros visíveis nos inicializadores e métodos; campo oculto se um método usar\",\"Nenhum: `obj.parametro` dá CS1061\",\"Valores que a classe usa por dentro\"],[\"Primary constructor em record (C# 9)\",\"Propriedade pública `init` para cada parâmetro, igualdade e `ToString`\",\"`obj.Propriedade` funciona\",\"Dados imutáveis comparados pelo conteúdo\"]]",
                    },
                    {
                        type: "quote",
                        value: "Classe junta o dado com a regra que o protege, e o construtor garante que nenhum objeto nasça inválido. No primary constructor, lembre que em classe o parâmetro continua parâmetro: exponha com propriedade, encadeie com `this(...)` e leve a sério o aviso CS9124.",
                    },
                ],
                questions: [
                    {
                        statement: "A classe `Cliente` declara só o construtor `public Cliente(string nome)`. O que acontece com a linha `var c = new Cliente();`?",
                        difficulty: "facil",
                        options: [
                            { text: "Compila e cria o cliente com `nome` nulo, porque o construtor sem parâmetros sempre existe na classe", isCorrect: false },
                            { text: "Não compila, porque declarar um construtor faz o compilador deixar de gerar o sem parâmetros", isCorrect: true },
                            { text: "Compila e preenche `nome` com texto vazio, que é o valor padrão de `string` no C#", isCorrect: false },
                            { text: "Compila, mas lança exceção ao rodar, porque o parâmetro obrigatório `nome` não foi informado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o programa abaixo imprime?\n\n```csharp\nvar a = new Contador();\nvar b = a;\nb.Incrementar();\nb.Incrementar();\nConsole.WriteLine(a.Valor);\n\nclass Contador\n{\n    public int Valor { get; private set; }\n    public void Incrementar() => Valor++;\n}\n```",
                        difficulty: "facil",
                        options: [
                            { text: "`0`", isCorrect: false },
                            { text: "`1`", isCorrect: false },
                            { text: "Não compila", isCorrect: false },
                            { text: "`2`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual declaração permite que outro código leia `conta.Titular`?",
                        difficulty: "medio",
                        options: [
                            { text: "`class Conta(string Titular) { public override string ToString() => Titular; }`", isCorrect: false },
                            { text: "`class Conta(string titular) { public string Titular { get; } = titular; }`", isCorrect: true },
                            { text: "`class Conta(public string Titular) { }`", isCorrect: false },
                            { text: "`class Conta(string titular) { public string Titular { get => this.titular; } }`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A classe `class Conta(string titular, decimal saldo)` precisa de um segundo construtor que receba só o titular. Qual versão compila?",
                        difficulty: "medio",
                        options: [
                            { text: "`public Conta(string titular) => this(titular, 0m);`", isCorrect: false },
                            { text: "`public Conta(string titular) : base(titular, 0m) { }`", isCorrect: false },
                            { text: "`public Conta(string titular) : this(titular, 0m) { }`", isCorrect: true },
                            { text: "`public Conta(string titular) { saldo = 0m; }`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o programa imprime?\n\n```csharp\nvar cliente = new Cliente(\"Ana\");\ncliente.Nome = \"Bia\";\nConsole.WriteLine(cliente.Saudacao());\n\nclass Cliente(string nome)\n{\n    public string Nome { get; set; } = nome;\n    public string Saudacao() => \"Olá, \" + nome;\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "`Olá, Ana`, porque o método lê a cópia capturada do parâmetro `nome`", isCorrect: true },
                            { text: "`Olá, Bia`, porque o parâmetro e a propriedade dividem o mesmo campo", isCorrect: false },
                            { text: "Nada, porque o código não compila: CS9124 é um erro de compilação", isCorrect: false },
                            { text: "`Olá, `, porque o parâmetro capturado é zerado no fim do construtor", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Propriedades e encapsulamento",
                blocks: [
                    {
                        type: "text",
                        value: "# Propriedades e encapsulamento\n\nUma conta bancária com `public decimal Saldo;` aceita `conta.Saldo = -500;` vindo de qualquer linha do sistema. Quando o saldo negativo aparecer no relatório, não há onde procurar: todo o código tem permissão de escrever ali. **Encapsulamento** é o objeto controlar o próprio estado. Quem está de fora pede (deposita, saca) e o objeto decide se aceita.\n\nEm C# a ferramenta para isso é a **propriedade**. De fora ela parece um campo (`conta.Saldo`), mas por dentro é um par de métodos: o `get`, que roda na leitura, e o `set`, que roda na escrita e recebe o valor novo na palavra `value`. A forma mais curta é a **propriedade automática**, `{ get; set; }`, em que o compilador cria o campo escondido que guarda o valor (o campo de apoio, ou backing field). Como o acesso de fora é igual ao de um campo, dá para começar com a automática e acrescentar regra depois sem mudar uma linha de quem usa a classe.\n\nA regra prática: campo é `private`, sempre. O que sai da classe sai por propriedade ou método, cada um com o nível de acesso que faz sentido.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar conta = new ContaCorrente(\"Ana\");\nconta.Depositar(200m);\nconta.Sacar(50m);\nConsole.WriteLine($\"{conta.Titular}: {conta.Saldo}\");   // Ana: 150\nConsole.WriteLine(conta.Zerada);                         // False\n\n// conta.Saldo = 1_000_000m;   // não compila: CS0272, o set é privado\n// conta.Titular = \"Bruno\";    // não compila: CS0200, propriedade só de leitura\n\nclass ContaCorrente(string titular)\n{\n    public string Titular { get; } = titular;    // só leitura: definida na criação\n    public decimal Saldo { get; private set; }   // todos leem, só a classe escreve\n    public bool Zerada => Saldo == 0;            // calculada a cada leitura\n\n    public void Depositar(decimal valor)\n    {\n        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(valor);\n        Saldo += valor;\n    }\n\n    public void Sacar(decimal valor)\n    {\n        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(valor);\n        if (valor > Saldo)\n            throw new InvalidOperationException(\"Saldo insuficiente.\");\n        Saldo -= valor;\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## init e required: preencher na criação, e só na criação\n\nHá dados que se definem uma vez e não mudam mais, como o SKU de um produto. Para eles existe o acessor **`init`** (C# 9): a propriedade aceita valor no inicializador de objeto (`new Produto { Sku = \"...\" }`) e no construtor, e depois disso qualquer atribuição é o erro CS8852.\n\nO outro problema é o esquecimento. Com dez propriedades, ninguém quer um construtor de dez parâmetros, mas sem ele nada obriga quem cria o objeto a preencher o SKU. O modificador **`required`** (C# 11) resolve na compilação: se o inicializador de objeto não atribui a propriedade, o erro CS9035 aparece no `new`.\n\nDois cuidados com `required`:\n\n- Ele garante que alguém **atribuiu**, não que o valor presta. `Sku = \"\"` passa sem reclamar. Validar é trabalho do `set` ou do `init`, e é aí que entra a palavra `field`, logo abaixo.\n- Um construtor que atribui a propriedade não basta: o compilador não analisa o corpo do construtor e continua exigindo o inicializador. Marque esse construtor com `[SetsRequiredMembers]` (de `System.Diagnostics.CodeAnalysis`), e aí a responsabilidade é sua, porque o compilador confia no atributo sem conferir.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing System.Diagnostics.CodeAnalysis;\n\nvar mouse = new Produto { Sku = \"MOU-01\", Nome = \"Mouse sem fio\" };\nvar teclado = new Produto(\"TEC-02\") { Nome = \"Teclado\" };\nmouse.Nome = \"Mouse sem fio preto\";      // set comum: muda quando quiser\n\nConsole.WriteLine($\"{mouse.Sku} {mouse.Nome}\");       // MOU-01 Mouse sem fio preto\nConsole.WriteLine($\"{teclado.Sku} {teclado.Nome}\");   // TEC-02 Teclado\n\n// mouse.Sku = \"OUTRO\";                         // não compila: CS8852, init só vale na criação\n// var cabo = new Produto { Nome = \"Cabo\" };    // não compila: CS9035, falta o Sku\n\nclass Produto\n{\n    public required string Sku { get; init; }\n    public string Nome { get; set; } = \"\";\n\n    public Produto() { }\n\n    [SetsRequiredMembers]\n    public Produto(string sku) => Sku = sku;\n}",
                    },
                    {
                        type: "text",
                        value: "## A palavra-chave field (C# 14)\n\nAté o C# 13, bastava uma regra no `set` para a propriedade automática virar três peças: o campo privado escrito à mão, o `get` que devolve o campo e o `set` com a validação. No C# 14, que veio com o .NET 10, a palavra **`field`** dentro de um acessor aponta para o campo de apoio que o compilador gera. Você escreve só o acessor que tem regra e deixa o outro automático (`get;`).\n\nO que vale saber antes de usar:\n\n- `field` só tem esse significado dentro dos acessores de uma propriedade.\n- **O valor inicial não passa pelo `set`.** Em `{ get; set { ... } } = -10;` o inicializador grava direto no campo de apoio, sem validação, como já acontecia com propriedade automática. Valor inicial inválido nasce inválido.\n- Se a classe já tem um membro chamado `field`, no C# 14 a palavra dentro do acessor passa a significar o campo de apoio, e o compilador avisa com CS9258. Para falar do membro antigo, use `this.field` ou `@field`. Vale procurar esse aviso ao atualizar código antigo.\n- Propriedade `string` não anulável com `field` e sem valor inicial gera o aviso CS9264: dê um valor inicial ou marque como `required`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar cliente = new Cliente { Email = \"  Ana@Exemplo.COM \" };\nConsole.WriteLine(cliente.Email);   // ana@exemplo.com\ncliente.Idade = 34;\n// cliente.Idade = -1;              // compila, mas lança ArgumentOutOfRangeException\n\nvar plano = new Plano();\nConsole.WriteLine(plano.Limite);    // -10: o inicializador não passou pelo set\n\n// Antes do C# 14: campo de apoio escrito à mão\nclass ClienteAntigo\n{\n    private string _email = \"\";\n\n    public string Email\n    {\n        get => _email;\n        set\n        {\n            ArgumentException.ThrowIfNullOrWhiteSpace(value);\n            _email = value.Trim().ToLowerInvariant();\n        }\n    }\n}\n\n// C# 14: o compilador cria o campo, e field aponta para ele\nclass Cliente\n{\n    public required string Email\n    {\n        get;\n        set\n        {\n            ArgumentException.ThrowIfNullOrWhiteSpace(value);\n            field = value.Trim().ToLowerInvariant();\n        }\n    }\n\n    public int Idade\n    {\n        get;\n        set => field = value is >= 0 and <= 130\n            ? value\n            : throw new ArgumentOutOfRangeException(nameof(value), \"Idade fora da faixa.\");\n    }\n}\n\nclass Plano\n{\n    public int Limite\n    {\n        get;\n        set\n        {\n            ArgumentOutOfRangeException.ThrowIfNegative(value);\n            field = value;\n        }\n    } = -10;\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Forma\",\"Quem escreve\",\"Quando usar\"],[\"`{ get; set; }`\",\"Qualquer código, a qualquer momento\",\"Dado sem regra nenhuma (raro em classe de domínio)\"],[\"`{ get; private set; }`\",\"Só a própria classe\",\"Estado que muda por método com regra, como `Saldo`\"],[\"`{ get; }`\",\"Só o construtor ou o inicializador\",\"Valor fixo desde o nascimento\"],[\"`{ get; init; }`\",\"Quem cria o objeto, só na criação\",\"Objeto montado no inicializador e imutável depois\"],[\"`required ... { get; init; }`\",\"Quem cria, e é obrigado a preencher\",\"Dado obrigatório sem construtor gigante\"],[\"`{ get; set => field = ...; }`\",\"Qualquer código, passando pela regra\",\"Validar ou normalizar sem campo manual (C# 14)\"]]",
                    },
                    {
                        type: "text",
                        value: "## Encapsular é expor comportamento, não só esconder campo\n\nTrocar `public decimal Saldo;` por `public decimal Saldo { get; set; }` não encapsula nada: o `set` público continua aceitando qualquer valor. O ganho vem de expor **operações com nome de negócio** (`Depositar`, `Sacar`, `Adicionar`) e deixar o `set` privado.\n\nColeções pedem o mesmo cuidado. Uma propriedade `public List<string> Itens { get; }` parece só de leitura, mas o `get` devolve a própria lista, e qualquer um faz `carrinho.Itens.Add(...)` sem passar pela regra do carrinho. O caminho é guardar a lista num campo privado e expor `IReadOnlyList<string>`, uma visão que permite ler e percorrer, mas não tem `Add` nem `Remove`. Quem fizer cast de volta para `List<string>` ainda consegue alterar; se esse risco for real, devolva `_itens.AsReadOnly()`, um invólucro que o cast não abre.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar carrinho = new Carrinho();\ncarrinho.Adicionar(\"Caderno\", 25m);\ncarrinho.Adicionar(\"Caneta\", 5m);\nConsole.WriteLine($\"{carrinho.Itens.Count} itens, total {carrinho.Total}\");   // 2 itens, total 30\n\n// carrinho.Itens.Add(\"Brinde\");   // não compila: CS1061, a visão só de leitura não tem Add\n\nclass Carrinho\n{\n    private readonly List<string> _itens = new();\n\n    public IReadOnlyList<string> Itens => _itens;\n    public decimal Total { get; private set; }\n\n    public void Adicionar(string produto, decimal preco)\n    {\n        ArgumentException.ThrowIfNullOrWhiteSpace(produto);\n        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(preco);\n        _itens.Add(produto);\n        Total += preco;\n    }\n}",
                    },
                    {
                        type: "quote",
                        value: "Propriedade é o portão do estado do objeto: `private set`, `init` e `required` dizem quem pode escrever e quando, e o `field` do C# 14 permite validar sem campo manual. Encapsular de verdade é expor operações com regra, nunca um `set` público que aceita qualquer coisa.",
                    },
                ],
                questions: [
                    {
                        statement: "O que a declaração `public decimal Saldo { get; private set; }` permite?",
                        difficulty: "facil",
                        options: [
                            { text: "Qualquer código lê o saldo, mas só a própria classe consegue alterá-lo", isCorrect: true },
                            { text: "Ninguém altera o saldo depois do construtor, nem a própria classe", isCorrect: false },
                            { text: "Só a própria classe lê o saldo, mas qualquer código consegue alterá-lo", isCorrect: false },
                            { text: "Qualquer código lê e altera o saldo, desde que esteja no mesmo arquivo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o modificador `required` garante numa propriedade?",
                        difficulty: "facil",
                        options: [
                            { text: "Que o construtor padrão valide a propriedade antes de entregar o objeto pronto", isCorrect: false },
                            { text: "Que quem cria o objeto atribua um valor a ela, sob pena de erro de compilação", isCorrect: true },
                            { text: "Que o valor atribuído não seja nulo nem vazio, verificando isso ao rodar o programa", isCorrect: false },
                            { text: "Que a propriedade só possa ser lida depois de atribuída, senão lança uma exceção", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com a classe abaixo, qual linha **não** compila?\n\n```csharp\nclass Produto\n{\n    public string Sku { get; init; } = \"\";\n    public string Nome { get; set; } = \"\";\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "`p.Nome = \"Teclado\";` executada depois de `var p = new Produto { Sku = \"A1\" };`", isCorrect: false },
                            { text: "`var p = new Produto();`, sem atribuir o `Sku` em nenhum inicializador", isCorrect: false },
                            { text: "`p.Sku = \"B2\";` executada depois de `var p = new Produto { Sku = \"A1\" };`", isCorrect: true },
                            { text: "`var p = new Produto { Sku = \"A1\", Nome = \"Mouse\" };`, com as duas juntas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No C# 14, o que a palavra `field` representa em `set => field = value.Trim();`?",
                        difficulty: "medio",
                        options: [
                            { text: "Uma variável local do acessor, descartada assim que a atribuição termina", isCorrect: false },
                            { text: "O campo de apoio que o compilador gera para guardar o valor da propriedade", isCorrect: true },
                            { text: "Um campo público com o mesmo nome da propriedade, visível para outras classes", isCorrect: false },
                            { text: "O valor novo que chegou ao `set`, que nas versões antigas se chamava `value`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No C# 14, o que acontece ao executar o programa abaixo?\n\n```csharp\nvar plano = new Plano();\nConsole.WriteLine(plano.Limite);\n\nclass Plano\n{\n    public int Limite\n    {\n        get;\n        set\n        {\n            ArgumentOutOfRangeException.ThrowIfNegative(value);\n            field = value;\n        }\n    } = -10;\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Não compila, porque propriedade com `field` no `set` não aceita valor inicial", isCorrect: false },
                            { text: "Lança `ArgumentOutOfRangeException` no `new`, pois o inicializador passa pelo `set`", isCorrect: false },
                            { text: "Imprime `0`, porque o `set` rejeita o valor inicial e mantém o padrão do `int`", isCorrect: false },
                            { text: "Imprime `-10`, porque o inicializador grava direto no campo, sem chamar o `set`", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Records e imutabilidade",
                blocks: [
                    {
                        type: "text",
                        value: "# Records e imutabilidade\n\nDuas situações comuns em backend. Na primeira, o código compara o endereço que chegou na requisição com o endereço salvo para decidir se recalcula o frete. Com classe, `novo == salvo` compara **referências**: são dois objetos diferentes na memória, e o resultado é `false` mesmo com todos os campos iguais. Na segunda, um objeto de configuração é passado para dois serviços, um deles altera uma propriedade \"só para si\", e o outro passa a enxergar a alteração. Estado mutável compartilhado está entre as fontes de bug mais difíceis de rastrear.\n\nO **record** (C# 9) ataca as duas. Ele foi pensado para dados: igualdade **pelo conteúdo**, `ToString` que mostra os valores e, na forma posicional, propriedades que não mudam depois da criação. Para \"alterar\" um record você cria outro, com a expressão `with`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar c1 = new EnderecoClasse(\"Rua das Flores, 10\", \"Recife\");\nvar c2 = new EnderecoClasse(\"Rua das Flores, 10\", \"Recife\");\nConsole.WriteLine(c1 == c2);   // False: dois objetos, duas referências\nConsole.WriteLine(c1);         // EnderecoClasse\n\nvar r1 = new Endereco(\"Rua das Flores, 10\", \"Recife\");\nvar r2 = new Endereco(\"Rua das Flores, 10\", \"Recife\");\nConsole.WriteLine(r1 == r2);                         // True: compara o conteúdo\nConsole.WriteLine(object.ReferenceEquals(r1, r2));   // False: continuam sendo dois objetos\nConsole.WriteLine(r1);   // Endereco { Rua = Rua das Flores, 10, Cidade = Recife }\n\nvar (rua, cidade) = r1;                // desconstrução gerada pelo compilador\nConsole.WriteLine($\"{rua} / {cidade}\");   // Rua das Flores, 10 / Recife\n\n// r1.Cidade = \"Olinda\";   // não compila: CS8852, propriedade posicional é init\n\nclass EnderecoClasse(string rua, string cidade)\n{\n    public string Rua { get; } = rua;\n    public string Cidade { get; } = cidade;\n}\n\nrecord Endereco(string Rua, string Cidade);",
                    },
                    {
                        type: "text",
                        value: "## O que a linha `record Endereco(string Rua, string Cidade);` gera\n\nEssa declaração posicional faz o compilador escrever por você:\n\n- uma propriedade pública `{ get; init; }` para cada parâmetro, com o mesmo nome;\n- o construtor com esses parâmetros e o método `Deconstruct`, que permite `var (rua, cidade) = endereco;`;\n- `Equals`, `GetHashCode`, `==` e `!=` comparando propriedade por propriedade;\n- um `ToString` no formato `Endereco { Rua = ..., Cidade = ... }`, que poupa tempo de depuração em log;\n- o suporte à expressão `with`.\n\n`record` é abreviação de `record class`: continua sendo **tipo de referência**, alocado no heap, que pode ser `null`. O que muda é a igualdade, e ela inclui o tipo: um `record Cliente(string Nome) : Pessoa(Nome)` com o nome Ana não é igual a uma `Pessoa` com o nome Ana, mesmo guardado numa variável do tipo `Pessoa`. Record só herda de record (classe herdando de record dá CS8865, record herdando de classe dá CS8864) e aceita métodos e propriedades extras no corpo, como qualquer classe.\n\nExiste também a forma nominal, sem parâmetros no cabeçalho, útil quando há muitas propriedades: `record Usuario { public required string Email { get; init; } }`. A igualdade e o `with` continuam valendo.",
                    },
                    {
                        type: "text",
                        value: "## with: mudar sem mudar\n\n`with` cria uma **cópia** do record com algumas propriedades trocadas e deixa o original intacto. É a mutação não destrutiva: o pedido pendente continua pendente na variável antiga, e o pago é um objeto novo.\n\nA armadilha está na palavra cópia. O `with` copia **as propriedades**, não o que elas apontam. Se o record tem uma `List<string>`, original e cópia passam a dividir a mesma lista, e um `Add` feito pela cópia aparece no original. E tem mais: a igualdade do record compara cada propriedade com o `Equals` dela, e `List<T>` compara por referência. Dois pedidos com listas de conteúdo idêntico são diferentes; o pedido e a cópia feita com `with` são iguais, porque dividem a lista.\n\nEm record, trate coleção como valor: tipe a propriedade como `IReadOnlyList<string>` e crie uma lista nova a cada mudança. Se a igualdade precisar considerar o conteúdo da coleção, aí é preciso escrever o `Equals` do record à mão.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar pedido = new Pedido(1, \"Ana\", new List<string> { \"caneta\" });\nvar copia = pedido with { Cliente = \"Bruno\" };\n\nConsole.WriteLine(pedido.Cliente);   // Ana: o original não muda\nConsole.WriteLine(copia.Cliente);    // Bruno\n\ncopia.Itens.Add(\"lápis\");            // a lista é a mesma nos dois\nConsole.WriteLine(pedido.Itens.Count);   // 2\n\nvar gemeo = new Pedido(1, \"Ana\", new List<string> { \"caneta\", \"lápis\" });\nConsole.WriteLine(pedido == gemeo);              // False: listas diferentes, mesmo conteúdo\nConsole.WriteLine(pedido == (pedido with { }));   // True: a cópia divide a lista\n\nrecord Pedido(int Numero, string Cliente, List<string> Itens);",
                    },
                    {
                        type: "text",
                        value: "## record struct e readonly record struct\n\nO C# 10 trouxe o **`record struct`**: tipo de valor com os mesmos recursos (igualdade gerada, `==`, `ToString`, `with`). Uma diferença pega muita gente: no `record struct` posicional as propriedades são **`{ get; set; }`, mutáveis**. A versão imutável se escreve **`readonly record struct`**, e aí as propriedades voltam a ser `init`.\n\nNa prática, prefira `readonly record struct`. Valor pequeno e imutável é o caso em que struct brilha, e struct mutável é fonte de bugs de cópia, como a aula de structs mostra.\n\nUm detalhe útil: desde o C# 10, `with` funciona com qualquer struct, não só com record. Com classe comum não funciona (CS8858).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar p = new Ponto(1, 2);\np.X = 10;                       // compila: record struct posicional tem set\nConsole.WriteLine(p);           // Ponto { X = 10, Y = 2 }\n\nvar vermelho = new Rgb(255, 0, 0);\n// vermelho.G = 128;            // não compila: CS8852, readonly record struct é init\nvar laranja = vermelho with { G = 128 };\nConsole.WriteLine(laranja);               // Rgb { R = 255, G = 128, B = 0 }\nConsole.WriteLine(laranja == vermelho);   // False\n\nrecord struct Ponto(int X, int Y);\nreadonly record struct Rgb(byte R, byte G, byte B);",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo\",\"Categoria\",\"`==` compara\",\"Propriedade posicional\",\"`with`\"],[\"`class`\",\"Referência\",\"Referência (salvo operador próprio)\",\"Não existe: primary constructor não gera\",\"Não compila (CS8858)\"],[\"`record` ou `record class`\",\"Referência\",\"Conteúdo e tipo\",\"`{ get; init; }`\",\"Sim\"],[\"`record struct`\",\"Valor\",\"Conteúdo\",\"`{ get; set; }`\",\"Sim\"],[\"`readonly record struct`\",\"Valor\",\"Conteúdo\",\"`{ get; init; }`\",\"Sim\"]]",
                    },
                    {
                        type: "text",
                        value: "## Quando usar record\n\nRecord combina com **dado que vale pelo conteúdo**: o corpo de uma requisição ou resposta de API (o DTO), um evento (\"pedido pago às 10h\"), um valor do domínio como `Endereco` ou `Dinheiro`, a chave composta de um dicionário. Imutável, ele pode ser compartilhado entre métodos e threads sem cópia defensiva, porque ninguém consegue alterá-lo.\n\nNão combina com **entidade**, o objeto que tem identidade e muda ao longo do tempo. Dois clientes chamados Ana não são a mesma pessoa, e o cliente 42 continua sendo o 42 depois de trocar de e-mail. Para entidade, o desenho comum é classe, identificada pelo `Id`. E cuidado com record de `set` público usado como chave de `Dictionary` ou item de `HashSet`: alterou a propriedade, mudou o `GetHashCode`, e a coleção não encontra mais o item.",
                    },
                    {
                        type: "quote",
                        value: "Record é a ferramenta para dado que vale pelo conteúdo: igualdade por valor, `ToString` legível e `with` para criar versões novas sem tocar na original. Lembre que o `with` copia referências, que `record struct` posicional é mutável e que entidade com identidade continua sendo classe.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é a saída deste programa?\n\n```csharp\nvar a = new Cor(\"azul\");\nvar b = new Cor(\"azul\");\nvar c = new Tinta(\"azul\");\nvar d = new Tinta(\"azul\");\nConsole.WriteLine(a == b);\nConsole.WriteLine(c == d);\n\nrecord Cor(string Nome);\nclass Tinta(string nome) { public string Nome { get; } = nome; }\n```",
                        difficulty: "facil",
                        options: [
                            { text: "`False` e depois `True`", isCorrect: false },
                            { text: "`True` e depois `True`", isCorrect: false },
                            { text: "`True` e depois `False`", isCorrect: true },
                            { text: "`False` e depois `False`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que a expressão `pedido with { Status = \"Pago\" }` faz quando `pedido` é um record?",
                        difficulty: "facil",
                        options: [
                            { text: "Altera o `Status` só se ele tiver `set`; se for `init`, a expressão não compila", isCorrect: false },
                            { text: "Altera o `Status` do próprio `pedido` e devolve a mesma instância para encadear", isCorrect: false },
                            { text: "Cria um record novo com `Status` trocado e deixa o `pedido` original como estava", isCorrect: true },
                            { text: "Cria um record novo com cópia profunda, duplicando também listas e objetos internos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dada a declaração `record struct Ponto(int X, int Y);`, o que acontece com `var p = new Ponto(1, 2); p.X = 10;`?",
                        difficulty: "medio",
                        options: [
                            { text: "Não compila, porque struct não pode ter propriedade com acessor `set` público", isCorrect: false },
                            { text: "Compila só se o tipo for declarado `readonly record struct`, que libera o `set`", isCorrect: false },
                            { text: "Compila, porque em `record struct` posicional as propriedades geradas têm `set`", isCorrect: true },
                            { text: "Não compila, porque as propriedades posicionais de qualquer record são só `init`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que este programa escreve no console?\n\n```csharp\nPessoa a = new Pessoa(\"Ana\");\nPessoa b = new Cliente(\"Ana\");\nConsole.WriteLine(a == b);\n\nrecord Pessoa(string Nome);\nrecord Cliente(string Nome) : Pessoa(Nome);\n```",
                        difficulty: "medio",
                        options: [
                            { text: "`False`, porque o tipo do objeto em tempo de execução também entra na igualdade", isCorrect: true },
                            { text: "Nada, porque não compila: um record não pode herdar de outro record", isCorrect: false },
                            { text: "`True`, porque a variável `b` foi declarada como `Pessoa` e o `==` usa esse tipo", isCorrect: false },
                            { text: "`True`, porque as duas instâncias têm a propriedade `Nome` com o mesmo valor, Ana", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a saída do programa?\n\n```csharp\nvar pedido = new Pedido(1, new List<string> { \"caneta\" });\nvar copia = pedido with { };\ncopia.Itens.Add(\"lápis\");\nConsole.WriteLine(pedido.Itens.Count);\nConsole.WriteLine(pedido == copia);\n\nrecord Pedido(int Numero, List<string> Itens);\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "`2` e depois `True`", isCorrect: true },
                            { text: "`1` e depois `True`", isCorrect: false },
                            { text: "`2` e depois `False`", isCorrect: false },
                            { text: "`1` e depois `False`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Herança, interfaces e polimorfismo",
                blocks: [
                    {
                        type: "text",
                        value: "# Herança, interfaces e polimorfismo\n\nUm checkout calcula frete pelos Correios, por transportadora e por retirada na loja. A primeira versão tem um `if (tipo == \"correios\") ... else if ...` no cálculo, outro na tela de resumo, outro na nota fiscal. Quando entra a entrega por motoboy, alguém precisa achar todos os `if`, e sempre esquece um. **Polimorfismo** troca essa cadeia por uma chamada só, `frete.Calcular(peso)`, em que cada tipo responde do seu jeito. O código que chama não sabe, nem precisa saber, qual tipo concreto recebeu.\n\nO C# oferece duas ferramentas para isso. **Herança**: uma classe deriva de outra (`class Gerente : Efetivo`), herda os membros dela e pode especializar comportamento; é a relação \"é um\". **Interface**: um contrato que diz o que um tipo sabe fazer, sem dizer como; é a relação \"sabe fazer\".\n\nNa herança, um detalhe separa o C# do Java: **método não é virtual por padrão**. A classe base precisa marcar o método com `virtual` (ou `abstract`) e a derivada precisa usar `override`; sem isso, não existe polimorfismo. Outras regras: uma classe herda de **uma** classe só (CS1721 se tentar duas), chama o construtor da base com `: base(...)` (ou com os argumentos logo após o nome da base, quando usa primary constructor) e enxerga os membros `protected` da base.",
                    },
                    {
                        type: "table",
                        value: "[[\"Palavra\",\"Onde vai\",\"O que faz\"],[\"`virtual`\",\"Método ou propriedade da base\",\"Permite que a derivada substitua a implementação\"],[\"`override`\",\"Membro da derivada\",\"Substitui o membro `virtual` ou `abstract` da base; quem decide a versão é o objeto, em tempo de execução\"],[\"`abstract`\",\"Classe ou membro\",\"Classe que não pode ser instanciada (CS0144); membro sem corpo que toda derivada concreta implementa (CS0534)\"],[\"`sealed`\",\"Classe ou `override`\",\"Classe da qual ninguém herda (CS0509); override que as derivadas seguintes não substituem (CS0239)\"],[\"`new`\",\"Membro da derivada\",\"Esconde o membro da base sem substituí-lo; não é polimorfismo\"],[\"`base`\",\"Dentro da derivada\",\"Chama o construtor ou a implementação da classe base\"]]",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar equipe = new List<Funcionario>\n{\n    new Efetivo(\"Ana\", 5000m),\n    new Gerente(\"Bruno\", 8000m, bonus: 2000m),\n    new Estagiario(\"Carla\", 1500m),\n};\n\nforeach (var pessoa in equipe)\n    Console.WriteLine(pessoa.Descrever());\n// Ana recebe 5000\n// Bruno recebe 10000 (gerente)\n// Carla recebe 1500\n\n// var generico = new Funcionario(\"Davi\");   // não compila: CS0144, classe abstrata\n\nabstract class Funcionario(string nome)\n{\n    public string Nome { get; } = nome;\n\n    public abstract decimal CalcularPagamento();\n\n    public virtual string Descrever() => $\"{Nome} recebe {CalcularPagamento()}\";\n}\n\nclass Efetivo(string nome, decimal salario) : Funcionario(nome)\n{\n    public override decimal CalcularPagamento() => salario;\n}\n\nclass Gerente(string nome, decimal salario, decimal bonus) : Efetivo(nome, salario)\n{\n    public override decimal CalcularPagamento() => base.CalcularPagamento() + bonus;\n    public override string Descrever() => base.Descrever() + \" (gerente)\";\n}\n\nsealed class Estagiario(string nome, decimal bolsa) : Funcionario(nome)\n{\n    public override decimal CalcularPagamento() => bolsa;\n}",
                    },
                    {
                        type: "text",
                        value: "## override x new: o polimorfismo que não aconteceu\n\nQuem vem do Java costuma escrever na derivada um método com o mesmo nome do da base, sem `virtual` na base. Compila, com o aviso CS0108, e o método da derivada **esconde** o da base em vez de substituí-lo: chamado por uma variável do tipo da base, roda a versão da base. Pôr o modificador `new` na derivada só cala o aviso; o comportamento continua o mesmo.\n\nA diferença prática: com `override`, quem decide qual versão roda é o **objeto** (o tipo criado com `new`). Com o modificador `new`, quem decide é o **tipo da variável**. Num sistema em que quase tudo circula pelo tipo base (listas de `Funcionario`, parâmetros do tipo `ICalculadoraFrete`), esconder método é bug esperando para acontecer.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nAnimal animal = new Cachorro();\nConsole.WriteLine(animal.Som());     // au: override, decide o objeto\nConsole.WriteLine(animal.Nome());    // animal: new só esconde, decide a variável\n\nCachorro cachorro = new Cachorro();\nConsole.WriteLine(cachorro.Nome());  // cachorro\n\nclass Animal\n{\n    public virtual string Som() => \"...\";\n    public string Nome() => \"animal\";\n}\n\nclass Cachorro : Animal\n{\n    public override string Som() => \"au\";\n    public new string Nome() => \"cachorro\";\n}",
                    },
                    {
                        type: "text",
                        value: "## Interfaces: o contrato\n\nInterface declara **o que** um tipo sabe fazer: métodos e propriedades, sem campos de instância. Uma classe herda de uma classe só, mas implementa quantas interfaces quiser (`class NotaFiscal : Documento, IExportavel, IImprimivel`). Quem usa a interface como tipo de variável ou de parâmetro depende da capacidade, não da classe concreta, e uma implementação nova entra sem mexer nesse código.\n\nDesde o C# 8 a interface pode trazer **implementação padrão** para um membro. O uso principal é evoluir um contrato já publicado: você acrescenta um método com corpo, e as classes que já implementavam a interface continuam compilando. A pegadinha: o membro padrão **só aparece pela interface**. Com uma variável do tipo da classe, `correios.Descrever(1)` dá CS1061, porque a classe não declarou esse método. Com uma variável do tipo da interface, funciona. E se a classe escrever a própria versão, é a dela que roda.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar opcoes = new ICalculadoraFrete[] { new FreteCorreios(), new FreteRetirada() };\nforeach (var frete in opcoes)\n    Console.WriteLine(frete.Descrever(pesoKg: 3));\n// Correios: 35\n// Retirada na loja: 0\n\nvar correios = new FreteCorreios();\n// Console.WriteLine(correios.Descrever(1));   // não compila: CS1061\nICalculadoraFrete contrato = correios;\nConsole.WriteLine(contrato.Descrever(1));      // Correios: 15\n\ninterface ICalculadoraFrete\n{\n    string Nome { get; }\n    decimal Calcular(int pesoKg);\n\n    // implementação padrão: quem implementa a interface recebe pronta\n    string Descrever(int pesoKg) => $\"{Nome}: {Calcular(pesoKg)}\";\n}\n\nclass FreteCorreios : ICalculadoraFrete\n{\n    public string Nome => \"Correios\";\n    public decimal Calcular(int pesoKg) => 5m + 10m * pesoKg;\n}\n\nclass FreteRetirada : ICalculadoraFrete\n{\n    public string Nome => \"Retirada na loja\";\n    public decimal Calcular(int pesoKg) => 0m;\n}",
                    },
                    {
                        type: "text",
                        value: "## Composição antes de herança\n\nHerança acopla a derivada à **implementação** da base, não só ao contrato. Mudou um detalhe da base, todas as derivadas mudam junto, inclusive as que dependiam do comportamento antigo (é o problema da classe base frágil). E a hierarquia explode quando os comportamentos se combinam: `NotificadorEmail`, `NotificadorSms`, `NotificadorEmailComLog`, `NotificadorSmsComLog`, `NotificadorEmailComLogERetentativa`... cada combinação vira uma classe.\n\n**Composição** é o objeto **ter** colaboradores em vez de **ser** uma especialização. O notificador recebe um canal (uma interface) e delega a entrega a ele. Trocar e-mail por SMS é trocar a peça, sem subclasse nova, e as variações se combinam livremente. O critério para herdar: a relação \"é um\" precisa ser verdadeira **e** a derivada precisa funcionar em qualquer lugar que espera a base, sem surpresa. `Gerente` é um `Funcionario` e pode ser pago como um. Já um `Quadrado` que herda de `Retangulo` e muda a largura junto sempre que alguém altera a altura quebra quem esperava um retângulo comum.\n\nClasse que não foi pensada para ser herdada merece `sealed`. Tirar o `sealed` depois não quebra ninguém; pôr depois quebra quem já herdou.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar alerta = new Notificador(new CanalSms(), prefixo: \"[URGENTE]\");\nalerta.Enviar(\"Servidor fora do ar\");    // SMS: [URGENTE] Servidor fora do ar\n\nvar boasVindas = new Notificador(new CanalEmail(), prefixo: \"\");\nboasVindas.Enviar(\"Bem-vinda, Ana\");     // E-mail: Bem-vinda, Ana\n\ninterface ICanal\n{\n    void Entregar(string texto);\n}\n\nsealed class CanalEmail : ICanal\n{\n    public void Entregar(string texto) => Console.WriteLine($\"E-mail: {texto}\");\n}\n\nsealed class CanalSms : ICanal\n{\n    public void Entregar(string texto) => Console.WriteLine($\"SMS: {texto}\");\n}\n\n// o Notificador TEM um canal: trocar a peça troca o comportamento\nsealed class Notificador(ICanal canal, string prefixo)\n{\n    public void Enviar(string mensagem) =>\n        canal.Entregar(prefixo.Length == 0 ? mensagem : $\"{prefixo} {mensagem}\");\n}",
                    },
                    {
                        type: "quote",
                        value: "Polimorfismo troca cadeias de `if` por uma chamada que cada tipo responde do seu jeito: `virtual` e `override` na herança, contrato na interface. Herde só quando \"é um\" for verdade de ponta a ponta; no resto, componha objetos e sele o que não foi feito para herança.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que, em C#, o método da classe base precisa ser marcado com `virtual` para a derivada usar `override`?",
                        difficulty: "facil",
                        options: [
                            { text: "Porque métodos não são virtuais por padrão, e sem `virtual` não há o que substituir", isCorrect: true },
                            { text: "Porque `virtual` torna o método abstrato e obriga cada derivada a implementá-lo", isCorrect: false },
                            { text: "Porque `virtual` permite chamar o método direto pela classe, sem criar um objeto", isCorrect: false },
                            { text: "Porque sem `virtual` o método da base não pode ser chamado pelas suas classes derivadas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que significa preferir composição a herança?",
                        difficulty: "facil",
                        options: [
                            { text: "Herdar de várias classes base ao mesmo tempo, somando o comportamento de todas elas", isCorrect: false },
                            { text: "Montar o comportamento com objetos colaboradores, e não com uma subclasse por variação", isCorrect: true },
                            { text: "Usar herança só a partir de classes abstratas e deixar todas as concretas sem classe base", isCorrect: false },
                            { text: "Trocar as classes por structs, que não têm herança e por isso não criam acoplamento", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Sobre uma classe marcada como `abstract`, qual afirmação é verdadeira?",
                        difficulty: "medio",
                        options: [
                            { text: "Não pode ter métodos com corpo, só assinaturas, porque funciona como uma interface", isCorrect: false },
                            { text: "Pode ser instanciada com `new` se não declarar nenhum membro abstrato no corpo", isCorrect: false },
                            { text: "Não pode declarar construtor, porque ela nunca chega a ser instanciada sozinha", isCorrect: false },
                            { text: "Não pode ser instanciada com `new`, mas pode ter construtor e métodos com corpo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que acontece com a linha `log.Erro(\"falhou\");` neste código?\n\n```csharp\nvar log = new LogConsole();\nlog.Erro(\"falhou\");\n\ninterface ILog\n{\n    void Escrever(string mensagem);\n    void Erro(string mensagem) => Escrever(\"ERRO: \" + mensagem);\n}\n\nclass LogConsole : ILog\n{\n    public void Escrever(string mensagem) => Console.WriteLine(mensagem);\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Compila, mas lança exceção ao rodar, porque `Erro` não tem corpo na classe", isCorrect: false },
                            { text: "Não compila: o membro padrão só é acessível por uma variável do tipo `ILog`", isCorrect: true },
                            { text: "Imprime `ERRO: falhou`, porque a classe herda o corpo do método da interface", isCorrect: false },
                            { text: "Não compila: `LogConsole` precisa implementar `Erro`, que a interface declara", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que o programa imprime?\n\n```csharp\nConsole.WriteLine(new Derivada().Descrever());\n\nclass Base\n{\n    public string Descrever() => Nome() + \" / \" + Codigo();\n    public virtual string Nome() => \"base\";\n    public string Codigo() => \"B\";\n}\n\nclass Derivada : Base\n{\n    public override string Nome() => \"derivada\";\n    public new string Codigo() => \"D\";\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "`derivada / B`", isCorrect: true },
                            { text: "`base / B`", isCorrect: false },
                            { text: "`derivada / D`", isCorrect: false },
                            { text: "`base / D`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Structs, enums e a escolha certa",
                blocks: [
                    {
                        type: "text",
                        value: "# Structs, enums e a escolha certa\n\nUm sistema de mapas ou um jogo que cria milhões de valores pequenos por segundo (um ponto, uma cor, uma coordenada) paga, com classe, uma alocação no heap a cada `new` e trabalho extra para o coletor de lixo. **Struct** é a alternativa: tipo de valor, guardado onde a variável está (na pilha, dentro do array, dentro do objeto que o contém), sem alocação própria. Um array de um milhão de structs é um bloco contínuo de memória; um array de um milhão de objetos é um milhão de referências para objetos espalhados.\n\nO preço é a semântica de cópia. Atribuir um struct a outra variável, passar como argumento ou ler de uma lista **copia o valor inteiro**. Mexer na cópia não mexe no original, e é aí que moram os bugs:\n\n- `lista[0].X = 5` não compila (CS1612): o indexador da `List` devolve uma cópia, e alterar a cópia seria trabalho perdido. Com array funciona, porque o elemento do array é a própria variável.\n- a variável do `foreach` também é uma cópia, e alterar um campo dela não compila (CS1654).\n- struct comum **não tem `==`** (CS0019). O `Equals` herdado de `ValueType` funciona, mas é genérico, recebe `object` e compara campo a campo; a documentação recomenda escrever o seu quando há campo de tipo referência, por desempenho. `record struct` gera essa comparação já tipada.\n\nPor isso a recomendação é struct **imutável**: `readonly struct`, que obriga todo campo a ser `readonly` (CS8340), ou `readonly record struct`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar origem = new PontoMutavel { X = 1, Y = 2 };\nvar copia = origem;               // copia o valor inteiro\ncopia.X = 99;\nConsole.WriteLine(origem.X);      // 1: o original não foi tocado\n\nvar pontos = new List<PontoMutavel> { origem };\n// pontos[0].X = 5;               // não compila: CS1612, o indexador devolve uma cópia\nvar item = pontos[0];\nitem.X = 5;\npontos[0] = item;                 // altera a cópia e devolve para a lista\nConsole.WriteLine(pontos[0].X);   // 5\n\nvar p = new Ponto(3, 4);\n// Console.WriteLine(p == new Ponto(3, 4));    // não compila: CS0019, struct comum não tem ==\nConsole.WriteLine(p.Equals(new Ponto(3, 4)));  // True\n\nvar real = new Moeda();\nvar vetor = new Moeda[2];\nConsole.WriteLine($\"[{real.Codigo}] [{vetor[0].Codigo}]\");   // [BRL] []: o array não chamou o construtor\n\nstruct PontoMutavel\n{\n    public int X;\n    public int Y;\n}\n\nreadonly struct Ponto(int x, int y)\n{\n    public int X { get; } = x;\n    public int Y { get; } = y;\n}\n\nreadonly struct Moeda\n{\n    public string Codigo { get; }\n    public Moeda() => Codigo = \"BRL\";\n}",
                    },
                    {
                        type: "text",
                        value: "## Regras de struct que surpreendem\n\n- **Sem herança.** Struct não herda de outro struct nem de classe (CS0527), mas implementa interfaces.\n- **`default` é tudo zerado.** `default(Ponto)` tem `X = 0` e `Y = 0`, e campos de tipo referência valem `null`.\n- **O construtor sem parâmetros (C# 10) nem sempre roda.** `new Moeda()` executa o construtor que você escreveu, mas `default(Moeda)` e os elementos de `new Moeda[2]` não executam: nascem zerados, como o exemplo mostrou. Não confie nesse construtor para garantir regra.\n\n## Boxing: quando o valor vai para uma caixa\n\nConverter um tipo de valor para `object` ou para uma interface que ele implementa faz **boxing**: o runtime aloca uma caixa no heap e **copia** o valor para dentro dela. O caminho de volta, o **unboxing**, copia de novo e exige o **tipo exato**: uma caixa com `int` dentro não vira `long` direto (lança `InvalidCastException`); é preciso desembrulhar como `int` e só depois converter.\n\nDuas consequências práticas. Desempenho: boxing dentro de laço quente gera uma alocação a cada volta; as coleções antigas não genéricas, como `ArrayList`, faziam isso com cada número guardado, e as genéricas existem em boa parte para evitar isso. Correção: a caixa é uma cópia, então um struct mutável manipulado pela interface altera a caixa, não a variável original.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nint quantidade = 42;\nobject caixa = quantidade;            // boxing: cópia no heap\nquantidade = 7;\nConsole.WriteLine(caixa);             // 42: a caixa guardou o valor daquele momento\n\nint deVolta = (int)caixa;             // unboxing para o tipo exato\nlong convertido = (long)(int)caixa;   // desembrulha como int e depois converte\nConsole.WriteLine(deVolta + convertido);   // 84\n// long errado = (long)caixa;         // compila, mas lança InvalidCastException\n\nvar contador = new Contador();\nIContador viaInterface = contador;    // boxing de novo: outra cópia\nviaInterface.Incrementar();\nConsole.WriteLine(contador.Valor);       // 0\nConsole.WriteLine(viaInterface.Valor);   // 1\n\ninterface IContador\n{\n    int Valor { get; }\n    void Incrementar();\n}\n\nstruct Contador : IContador\n{\n    public int Valor { get; private set; }\n    public void Incrementar() => Valor++;\n}",
                    },
                    {
                        type: "text",
                        value: "## Enums: nomes no lugar de números mágicos\n\n`enum StatusPedido { Pendente, Pago, Enviado, Entregue }` dá nome a constantes inteiras: `Pendente` vale 0, `Pago` vale 1, e assim por diante. Três armadilhas reais:\n\n- **O padrão é 0.** Um `StatusPedido` não inicializado vale `Pendente`, sem ninguém ter decidido isso. Quando o 0 não deve significar nada de negócio, declare um primeiro valor explícito como `Desconhecido = 0`.\n- **Qualquer inteiro cabe.** `(StatusPedido)42` compila e roda, e o `ToString` imprime 42. Dado vindo de fora (banco, JSON, formulário) precisa passar por `Enum.IsDefined`. Cuidado também com `Enum.TryParse`: ele aceita texto numérico, e `\"99\"` devolve `true` com um valor que não existe no enum.\n- **O `switch` precisa do caso que sobra.** Mesmo listando todos os nomes numa `switch` expression, o compilador avisa (CS8524) que valores sem nome, como o 42, não estão cobertos. Trate com `_` e falhe alto.\n\nPara opções que se **combinam**, como permissões, use **`[Flags]`** com valores em potência de dois (1, 2, 4, 8), um bit por opção, e `Nenhuma = 0`. Combine com `|`, teste com `HasFlag` ou `&`, remova com `& ~`. O erro clássico é numerar 1, 2, 3: o 3 é `1 | 2`, e Exclusão passa a ser igual a Leitura mais Escrita.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nStatusPedido status = default;\nConsole.WriteLine(status);                     // Pendente: o zero do enum\n\nvar estranho = (StatusPedido)42;               // compila e roda sem reclamar\nConsole.WriteLine(estranho);                   // 42\nConsole.WriteLine(Enum.IsDefined(estranho));   // False\n\nConsole.WriteLine(Enum.TryParse(\"99\", out StatusPedido lido));   // True: aceita número\nConsole.WriteLine(Enum.IsDefined(lido));                         // False\n\nvar acesso = Permissao.Leitura | Permissao.Escrita;\nConsole.WriteLine(acesso);                               // Leitura, Escrita\nConsole.WriteLine(acesso.HasFlag(Permissao.Exclusao));   // False\nacesso |= Permissao.Exclusao;                            // concede\nacesso &= ~Permissao.Escrita;                            // revoga\nConsole.WriteLine(acesso);                               // Leitura, Exclusao\n\nenum StatusPedido { Pendente, Pago, Enviado, Entregue }\n\n[Flags]\nenum Permissao\n{\n    Nenhuma = 0,\n    Leitura = 1,\n    Escrita = 2,\n    Exclusao = 4,\n    Administracao = 8,\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\",\"Escolha\",\"Por quê\"],[\"Entidade com identidade que muda com o tempo (cliente, pedido)\",\"`class`\",\"É a mesma pelo `Id`, não pelo conteúdo, e circula por referência\"],[\"Dado imutável comparado pelo conteúdo (DTO, evento, endereço)\",\"`record`\",\"Igualdade por valor, `with` e `ToString` prontos\"],[\"Valor pequeno, imutável e muito numeroso (ponto, cor RGB)\",\"`readonly record struct`\",\"Sem alocação própria no heap e com igualdade gerada\"],[\"Conjunto fechado de opções exclusivas (status, dia da semana)\",\"`enum`\",\"Nome no lugar de número mágico\"],[\"Opções que se combinam (permissões, dias de funcionamento)\",\"`[Flags] enum`\",\"Um bit por opção, combinadas com `|`\"]]",
                    },
                    {
                        type: "text",
                        value: "## Como escolher, na prática\n\nComece por **classe**: é o padrão do C#, e a maior parte dos tipos de um sistema é classe. Mude para **record** quando o tipo for dado que vale pelo conteúdo e não deve mudar depois de criado. Considere **struct** só quando valerem as quatro condições da diretriz clássica da Microsoft para o desenho de bibliotecas .NET: representa um valor único, como os tipos primitivos; é pequeno (a regra de bolso é ficar abaixo de 16 bytes); é imutável; e raramente vai sofrer boxing. Na dúvida, meça antes de trocar.\n\nO erro comum é o contrário: transformar um tipo grande e mutável em struct \"para ganhar desempenho\". Cada atribuição e cada chamada copiam o valor inteiro, as alterações se perdem em cópias (os erros CS1612 e CS1654 são o compilador tentando avisar), e o boxing por interface aloca do mesmo jeito. O resultado costuma ser mais lento e com bugs que a classe não teria.",
                    },
                    {
                        type: "quote",
                        value: "Struct é valor: copia em toda atribuição, não tem `==` de graça e vira caixa no heap quando passa por `object` ou por interface, então mantenha-o pequeno e imutável. Enum dá nome a números, mas aceita qualquer inteiro: valide o que vem de fora e use `[Flags]` com potências de dois para opções combináveis.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual valor o programa imprime?\n\n```csharp\nvar a = new Ponto { X = 1 };\nvar b = a;\nb.X = 99;\nConsole.WriteLine(a.X);\n\nstruct Ponto { public int X; }\n```",
                        difficulty: "facil",
                        options: [
                            { text: "`1`", isCorrect: true },
                            { text: "`99`", isCorrect: false },
                            { text: "Não compila", isCorrect: false },
                            { text: "`0`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que os valores de um enum marcado com `[Flags]` costumam ser potências de dois (1, 2, 4, 8)?",
                        difficulty: "facil",
                        options: [
                            { text: "Para que o `ToString` do enum liste as opções combinadas em ordem alfabética", isCorrect: false },
                            { text: "Para que cada opção ocupe um bit próprio e as combinações feitas com `|` não colidam", isCorrect: true },
                            { text: "Para que o enum ocupe menos memória do que um enum comum declarado com valores seguidos", isCorrect: false },
                            { text: "Porque o atributo `[Flags]` recusa na compilação qualquer valor que não seja potência de dois", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um sistema de mapas processa milhões de pontos por segundo. Cada ponto tem dois `int` (X e Y), nunca muda depois de criado e é comparado pelo valor. Qual tipo combina melhor?",
                        difficulty: "medio",
                        options: [
                            { text: "`record`, porque ele é tipo de valor e evita alocar cada ponto separado no heap", isCorrect: false },
                            { text: "`record struct`, porque as propriedades posicionais dele já nascem com `init`", isCorrect: false },
                            { text: "`class`, porque objeto pequeno no heap sai mais barato do que copiar dois inteiros", isCorrect: false },
                            { text: "`readonly record struct`, por ser pequeno, imutável e ganhar igualdade por valor", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com `enum StatusPedido { Pendente, Pago, Enviado, Entregue }`, o que acontece em `var s = (StatusPedido)42;`?",
                        difficulty: "medio",
                        options: [
                            { text: "Compila e roda: `s` passa a valer `Entregue`, o último valor declarado", isCorrect: false },
                            { text: "Não compila, porque 42 está fora dos valores declarados em `StatusPedido`", isCorrect: false },
                            { text: "Compila e roda: `s` guarda 42, e `Enum.IsDefined(s)` devolve `false`", isCorrect: true },
                            { text: "Compila, mas lança `InvalidCastException` ao converter o número 42", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que aparece no console?\n\n```csharp\nvar c = new Contador();\nIContador i = c;\ni.Incrementar();\nConsole.WriteLine(c.Valor + \" e \" + i.Valor);\n\ninterface IContador\n{\n    int Valor { get; }\n    void Incrementar();\n}\n\nstruct Contador : IContador\n{\n    public int Valor { get; private set; }\n    public void Incrementar() => Valor++;\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "`1 e 0`", isCorrect: false },
                            { text: "`0 e 0`", isCorrect: false },
                            { text: "`0 e 1`", isCorrect: true },
                            { text: "`1 e 1`", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 3 - Coleções, genéricos e LINQ",
        aulas: [
            {
                titulo: "Coleções e o custo de cada operação",
                blocks: [
                    {
                        type: "text",
                        value: "# Coleções e o custo de cada operação\n\nUm serviço de conciliação recebe 200 mil pagamentos por dia e precisa conferir, para cada um, se o pedido correspondente existe. A primeira versão guardou os IDs dos pedidos numa `List<int>` e chamou `Contains` dentro do laço. No teste, com cem pedidos, voou. Em produção, a rotina passou a levar horas: `Contains` numa lista olha item por item, então cada pagamento pode custar 200 mil comparações, e o lote inteiro chega a dezenas de bilhões. Trocar a lista por um `HashSet<int>` derruba o tempo para segundos, sem mudar mais nada.\n\nEscolher coleção é saber quanto custa a operação que o seu código repete. Para falar desse custo, usa-se a notação O(...), que diz como o trabalho cresce com o número de itens (n):\n\n- **O(1)**: custo constante. Mil ou um milhão de itens, dá na mesma.\n- **O(n)**: cresce na proporção dos itens. Dobrou a coleção, dobrou o tempo.\n- **O(log n)**: cresce bem devagar. Dobrar a coleção acrescenta um passo.\n\nEsta aula passa pelas quatro coleções que aparecem em todo backend .NET (array, `List<T>`, `Dictionary<TKey,TValue>` e `HashSet<T>`), pelas collection expressions e pela tabela de custos que vale ter na cabeça.",
                    },
                    {
                        type: "text",
                        value: "## Array e List<T>\n\nO **array** tem tamanho fixo, definido na criação. Os itens ficam lado a lado na memória, então ler ou gravar pela posição (`notas[2]`) é O(1). `new int[3]` já nasce com três zeros, e não existe \"adicionar\": para crescer, é preciso criar outro array e copiar.\n\nA **`List<T>`** é a coleção do dia a dia, e por dentro ela é um array que cresce sozinho. Quando o array interno enche, a lista aloca outro com o dobro do tamanho e copia tudo. Essa cópia é O(n), mas acontece cada vez mais raramente, por isso `Add` no fim custa O(1) **amortizado**: na média, constante. `Count` é quantos itens existem; `Capacity` é o tamanho do array interno. Se você já sabe que vai guardar 50 mil itens, `new List<Pedido>(50_000)` evita as realocações no caminho.\n\nO que custa caro na lista:\n\n- **inserir ou remover no começo ou no meio** (`Insert(0, x)`, `RemoveAt(0)`): todos os itens seguintes são deslocados uma posição, O(n);\n- **procurar um valor** (`Contains`, `IndexOf`, `Remove(item)`): a lista percorre item por item, O(n).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nint[] notas = new int[3];               // tamanho fixo, começa com 0, 0, 0\nnotas[0] = 8;\nConsole.WriteLine(notas.Length);        // 3\n\nvar pedidos = new List<int>();\nConsole.WriteLine(pedidos.Capacity);    // 0: nenhum espaço reservado ainda\nfor (int i = 1; i <= 5; i++)\n{\n    pedidos.Add(i);\n    Console.WriteLine($\"Count={pedidos.Count} Capacity={pedidos.Capacity}\");\n}\n// Count=1 Capacity=4\n// Count=2 Capacity=4\n// Count=3 Capacity=4\n// Count=4 Capacity=4\n// Count=5 Capacity=8   (o array interno dobrou e os 4 itens foram copiados)\n\npedidos.Insert(0, 99);                  // desloca os 5 itens: O(n)\npedidos.Add(100);                       // no fim: O(1) amortizado\nConsole.WriteLine(pedidos.Contains(3)); // True, depois de olhar item por item",
                    },
                    {
                        type: "text",
                        value: "## Dictionary e HashSet: busca por chave\n\nO **`Dictionary<TKey,TValue>`** guarda pares de chave e valor numa tabela hash: o `GetHashCode` da chave aponta direto para o lugar onde o par mora. Por isso buscar, incluir e remover pela chave custam O(1) na média, seja com mil ou com um milhão de itens. O **`HashSet<T>`** é a mesma ideia sem o valor: um conjunto que não aceita repetidos, responde `Contains` em O(1) na média e faz operações de conjunto (`UnionWith`, `IntersectWith`, `ExceptWith`).\n\nOs detalhes que mais derrubam gente em produção:\n\n- **`precos[\"cha\"]` com chave que não existe lança `KeyNotFoundException`.** Não devolve `null`, não devolve zero e não cria a chave. Quando a ausência é um caso normal, use `TryGetValue`, que faz uma busca só e entrega o valor pelo parâmetro `out`.\n- **Incluir:** `Add` com chave repetida lança `ArgumentException`; o indexador (`precos[\"cafe\"] = 8m`) inclui ou sobrescreve; `TryAdd` devolve `false` e não mexe no valor. E `ContainsKey` seguido do indexador faz duas buscas onde `TryGetValue` faz uma.\n- **A chave não pode mudar depois de entrar.** O par foi guardado no lugar indicado pelo hash daquele momento; se um campo que entra no `GetHashCode` mudar, a chave se perde lá dentro. `string`, `int`, `Guid` e records imutáveis são boas chaves. Uma classe comum compara por referência: duas instâncias com os mesmos dados são chaves diferentes.\n- **Para `string`, a comparação padrão diferencia maiúsculas**: `\"Ana\"` e `\"ana\"` são chaves distintas. Para ignorar, passe `StringComparer.OrdinalIgnoreCase` no construtor.\n- **A ordem do `foreach` não é garantida** pela documentação, nem no dicionário nem no conjunto. Se a ordem importa, ordene na leitura ou use `SortedDictionary<TKey,TValue>` (ordenado pela chave, O(log n) por operação).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar precos = new Dictionary<string, decimal>\n{\n    [\"cafe\"] = 7.50m,\n    [\"pao\"] = 1.20m,\n};\n\nprecos[\"cafe\"] = 8.00m;                        // a chave existe: sobrescreve\nprecos[\"suco\"] = 9.90m;                        // a chave é nova: inclui\nConsole.WriteLine(precos.TryAdd(\"pao\", 2m));   // False: já existia, nada muda\n\nif (precos.TryGetValue(\"cha\", out var preco))  // uma busca só\n    Console.WriteLine($\"Chá custa {preco}\");\nelse\n    Console.WriteLine(\"Chá fora do cardápio\");\n\n// decimal x = precos[\"cha\"];   // KeyNotFoundException: a chave não existe\n\nHashSet<string> processados = [];\nstring[] eventos = [\"pag-1\", \"pag-2\", \"pag-1\", \"pag-3\"];\nforeach (var id in eventos)\n{\n    if (!processados.Add(id))                  // Add devolve false se já estava lá\n        Console.WriteLine($\"Duplicado ignorado: {id}\");\n}\nConsole.WriteLine(processados.Count);          // 3",
                    },
                    {
                        type: "table",
                        value: "[[\"Operação\",\"Array\",\"List<T>\",\"Dictionary e HashSet\"],[\"Ler pela posição\",\"O(1)\",\"O(1)\",\"não tem posição\"],[\"Achar um item (Contains, busca por chave)\",\"O(n)\",\"O(n)\",\"O(1) na média\"],[\"Incluir no fim\",\"tamanho fixo\",\"O(1) amortizado\",\"O(1) na média\"],[\"Inserir ou remover no começo\",\"tamanho fixo\",\"O(n)\",\"não tem começo\"],[\"Remover um item específico\",\"tamanho fixo\",\"O(n)\",\"O(1) na média\"],[\"Ordem do foreach\",\"a das posições\",\"a das posições\",\"não garantida\"],[\"Aceita repetidos\",\"sim\",\"sim\",\"não, a chave é única\"]]",
                    },
                    {
                        type: "text",
                        value: "## Collection expressions e o erro de remover no laço\n\nDesde o C# 12, colchetes criam coleções: `[1, 2, 3]` vira array, `List<T>`, `HashSet<T>` ou `Span<T>`, conforme o tipo do lado esquerdo. Com interface no destino (`IEnumerable<T>`, `IReadOnlyList<T>`), o compilador escolhe uma implementação. `[]` é a coleção vazia, e o spread `..` despeja os itens de outra coleção no meio da nova. Como o tipo vem do destino, `var x = [1, 2];` não compila: não há destino. E dicionário não tem essa sintaxe com pares no C# 14 (só o vazio, `[]`); para preencher, use o inicializador com indexador, como no exemplo anterior.\n\nAgora o erro clássico: **remover itens de uma `List<T>` dentro do `foreach` que a percorre lança `InvalidOperationException`** (\"Collection was modified\") na volta seguinte. A \"correção\" com `for` indo para a frente é pior, porque não lança nada: quando você remove o item da posição `i`, o seguinte escorrega para `i`, o laço avança para `i + 1` e esse item nunca é testado. Use `RemoveAll` com a condição (uma passada só, O(n)) ou percorra de trás para a frente. A condição vai como lambda, `q => q == 0`, que se lê \"os `q` iguais a zero\"; lambdas ganham explicação completa mais adiante neste módulo.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nint[] primos = [2, 3, 5];\nHashSet<int> codigos = [10, 20, 10];             // o repetido some: Count é 2\nIReadOnlyList<int> todos = [.. primos, 7, 11];   // spread: 2, 3, 5, 7, 11\nList<string> vazia = [];\n// var x = [1, 2];                               // não compila: falta o tipo de destino\nConsole.WriteLine($\"{codigos.Count} {todos.Count} {vazia.Count}\");   // 2 5 0\n\nList<int> estoque = [0, 5, 0, 0, 8];\n// foreach (var q in estoque) if (q == 0) estoque.Remove(q);   // InvalidOperationException\nint removidos = estoque.RemoveAll(q => q == 0);                // uma passada, O(n)\nConsole.WriteLine($\"{removidos} removidos, sobrou {string.Join(\",\", estoque)}\");\n// 3 removidos, sobrou 5,8\n\nList<int> numeros = [1, 2, 2, 3];\nfor (int i = 0; i < numeros.Count; i++)\n    if (numeros[i] == 2) numeros.RemoveAt(i);    // o segundo 2 escorrega para i e é pulado\nConsole.WriteLine(string.Join(\",\", numeros));    // 1,2,3",
                    },
                    {
                        type: "text",
                        value: "## Que tipo pedir e devolver\n\nNa assinatura de um método, peça a interface mais simples que resolve. Quem só percorre uma vez recebe `IEnumerable<T>`; quem precisa de `Count` e de índice recebe `IReadOnlyList<T>`; quem busca por chave recebe `IReadOnlyDictionary<TKey,TValue>`. Isso aceita mais tipos de quem chama (array, lista, resultado de consulta) e deixa claro que o método não altera nada. Na volta, devolver `IReadOnlyList<T>` em vez da `List<T>` interna impede que quem chamou inclua ou remova itens da sua lista por fora.\n\nUm aviso antes de fechar: `List<T>`, `Dictionary` e `HashSet` não são seguros para várias threads gravando ao mesmo tempo. Concorrência tem coleções próprias, que aparecem quando o assunto for paralelismo.",
                    },
                    {
                        type: "quote",
                        value: "Coleção se escolhe pela operação que o código repete: posição pede array ou lista, busca por chave pede `Dictionary`, pergunta de pertença pede `HashSet`. Antes de chamar `Contains` numa lista dentro de um laço, pense no tamanho que ela vai ter em produção.",
                    },
                ],
                questions: [
                    {
                        statement: "Um job confere, para cada um de 200 mil pagamentos, se o ID do pedido está entre os 200 mil pedidos carregados em memória. Qual coleção deixa essa conferência rápida?",
                        difficulty: "facil",
                        options: [
                            { text: "Um `int[]` com os IDs, porque ler um array pela posição custa O(1)", isCorrect: false },
                            { text: "Uma `List<int>` criada com capacidade de 200 mil, evitando realocação", isCorrect: false },
                            { text: "Uma `List<int>` com os IDs, porque `Contains` na lista custa O(1) na média", isCorrect: false },
                            { text: "Um `HashSet<int>` com os IDs, porque `Contains` nele custa O(1) na média", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que acontece ao ler `clientes[\"123\"]` num `Dictionary<string, Cliente>` que não tem a chave `\"123\"`?",
                        difficulty: "facil",
                        options: [
                            { text: "Inclui a chave com `null` e devolve esse mesmo `null`", isCorrect: false },
                            { text: "Lança `KeyNotFoundException`, porque a chave não existe", isCorrect: true },
                            { text: "Devolve `null`, o valor padrão de um tipo de referência", isCorrect: false },
                            { text: "Lança `IndexOutOfRangeException`, como faria um array", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a saída deste programa?\n\n```csharp\nHashSet<string> vistos = [];\nstring[] emails = [\"ana@x.com\", \"bia@x.com\", \"ana@x.com\", \"Ana@x.com\"];\nint repetidos = 0;\nforeach (var e in emails)\n{\n    if (!vistos.Add(e))\n        repetidos++;\n}\nConsole.WriteLine($\"{vistos.Count} {repetidos}\");\n```",
                        difficulty: "medio",
                        options: [
                            { text: "`2 2`: o conjunto ignora as maiúsculas ao comparar os e-mails", isCorrect: false },
                            { text: "`4 0`: o `HashSet` guarda tudo e só filtra no `Contains`", isCorrect: false },
                            { text: "`3 1`: a comparação padrão de `string` diferencia maiúsculas", isCorrect: true },
                            { text: "Nada: o `Add` lança exceção no `ana@x.com` repetido", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma `List<Evento>` com 1 milhão de itens recebe cada evento novo com `eventos.Insert(0, novo)`, para o mais recente ficar na frente. Quanto custa cada inserção?",
                        difficulty: "medio",
                        options: [
                            { text: "O(1), porque a lista só ajusta a referência do primeiro nó", isCorrect: false },
                            { text: "O(n), porque cada item existente precisa andar uma posição", isCorrect: true },
                            { text: "O(log n), porque a lista acha a posição por busca binária", isCorrect: false },
                            { text: "O(1) amortizado, igual ao `Add` que inclui no fim da lista", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a saída deste programa?\n\n```csharp\nList<int> numeros = [2, 4, 5, 6, 8];\nfor (int i = 0; i < numeros.Count; i++)\n{\n    if (numeros[i] % 2 == 0)\n        numeros.RemoveAt(i);\n}\nConsole.WriteLine(string.Join(\",\", numeros));\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Lança `ArgumentOutOfRangeException` quando `i` passa do fim", isCorrect: false },
                            { text: "`5`, porque o laço remove da lista todos os números pares", isCorrect: false },
                            { text: "Lança `InvalidOperationException` por alterar a lista no laço", isCorrect: false },
                            { text: "`4,5,8`, porque cada remoção faz o laço pular o item seguinte", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Genéricos e restrições",
                blocks: [
                    {
                        type: "text",
                        value: "# Genéricos e restrições\n\nAntes dos genéricos, que chegaram no C# 2.0 em 2005, a lista de uso geral do .NET era o `ArrayList`, que guarda tudo como `object`. Funcionava, mas cobrava três preços. Cada `int` incluído virava um objeto no heap (o boxing, que apareceu na comparação entre struct e class). Cada leitura exigia um cast, a conversão explícita como `(int)item`. E o erro de tipo só aparecia com o programa rodando: coloque uma `string` numa lista de números e o compilador aceita calado; o `InvalidCastException` estoura na hora de somar, às vezes em produção, longe de quem incluiu o item errado.\n\nGenéricos resolvem os três de uma vez. Você escreve o código uma vez, com um **parâmetro de tipo** (`T`); o compilador confere cada uso com o tipo real; e o runtime monta a versão especializada, de modo que uma `List<int>` guarda `int` de verdade num `int[]` interno. `List<T>`, `Dictionary<TKey,TValue>` e o LINQ inteiro são código genérico.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: o jeito atual e o antigo (ArrayList, anterior aos genéricos)\nusing System.Collections;\n\nList<int> atual = [10, 20];\n// atual.Add(\"trinta\");      // erro de compilação: string não é int\nint total = 0;\nforeach (int n in atual)\n    total += n;               // sem cast e sem boxing\nConsole.WriteLine(total);     // 30\n\nvar antiga = new ArrayList();\nantiga.Add(10);               // boxing: o int vira um objeto no heap\nantiga.Add(20);\nantiga.Add(\"trinta\");         // compila: ArrayList aceita qualquer object\nint soma = 0;\nforeach (object item in antiga)\n    soma += (int)item;        // InvalidCastException ao chegar em \"trinta\"",
                    },
                    {
                        type: "text",
                        value: "## Método genérico e classe genérica\n\nO parâmetro de tipo vem entre `<>` depois do nome. Num **método genérico**, o compilador quase sempre deduz o `T` pelos argumentos: em `PrimeiroOu(nomes, \"ninguém\")`, `T` é `string`, sem você escrever. Numa **classe genérica** (ou record), você escolhe o tipo ao usar: `Pagina<Pedido>`, `Pagina<Cliente>`, a mesma definição servindo para qualquer item.\n\nQuando o código genérico precisa de \"um valor vazio\" de `T`, use `default`: vale `null` para tipos de referência, `0` para números e `false` para `bool`. Cuidado com `T?` num `T` sem restrição: ele só avisa que o valor pode ser `null` quando `T` for tipo de referência. Com `T = int`, o tipo continua `int` (não vira `int?`), e o `default` é `0`, não `null`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nList<string> nomes = [\"Ana\", \"Bia\", \"Caio\"];\nConsole.WriteLine(PrimeiroOu(nomes, \"ninguém\"));      // Ana   (T deduzido: string)\nConsole.WriteLine(PrimeiroOu(new List<int>(), -1));   // -1    (T deduzido: int)\nConsole.WriteLine(UltimoOuPadrao(new List<int>()));   // 0, e não null\n\nvar pagina = new Pagina<string>(nomes, Numero: 1, TotalDeItens: 30);\nConsole.WriteLine($\"Página {pagina.Numero}: {pagina.Itens.Count} de {pagina.TotalDeItens}\");\n// Página 1: 3 de 30\n\nstatic T PrimeiroOu<T>(IReadOnlyList<T> itens, T padrao) =>\n    itens.Count > 0 ? itens[0] : padrao;\n\nstatic T? UltimoOuPadrao<T>(IReadOnlyList<T> itens) =>\n    itens.Count > 0 ? itens[itens.Count - 1] : default;\n\n// A mesma definição serve para Pagina<Pedido>, Pagina<Cliente>...\nrecord Pagina<T>(IReadOnlyList<T> Itens, int Numero, int TotalDeItens);",
                    },
                    {
                        type: "text",
                        value: "## Restrições com where\n\nNum método genérico sem restrição, o compilador só sabe que `T` é \"alguma coisa\". Ele libera apenas o que todo `object` tem (`ToString`, `Equals`, `GetHashCode`) e recusa o resto: `a > b` não compila, `item.Id` não compila, `a.CompareTo(b)` não compila. A **restrição** `where` é um contrato. Você declara que `T` tem certa capacidade; o compilador libera o uso dela dentro do código genérico e recusa, na chamada, qualquer tipo que não cumpra.\n\nRestrições se combinam numa ordem fixa: primeiro `class` ou `struct` (ou `notnull`), depois a classe base e as interfaces, e `new()` por último, como em `where T : class, IEntidade, new()`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nConsole.WriteLine(Maior(3, 7));              // 7\nConsole.WriteLine(Maior(\"pera\", \"uva\"));     // uva\n\nvar repo = new Repositorio<Cliente>();\nrepo.Salvar(new Cliente(1, \"Ana\"));\nConsole.WriteLine(repo.Buscar(1)?.Nome ?? \"não achou\");   // Ana\nConsole.WriteLine(repo.Buscar(2)?.Nome ?? \"não achou\");   // não achou\n// new Repositorio<string>();   // não compila: string não implementa IEntidade\n\n// Sem o where, a.CompareTo(b) não compilaria: T poderia ser qualquer tipo.\nstatic T Maior<T>(T a, T b) where T : IComparable<T> =>\n    a.CompareTo(b) >= 0 ? a : b;\n\ninterface IEntidade { int Id { get; } }\nrecord Cliente(int Id, string Nome) : IEntidade;\n\nclass Repositorio<T> where T : class, IEntidade\n{\n    private readonly Dictionary<int, T> _itens = [];\n\n    public void Salvar(T item) => _itens[item.Id] = item;   // item.Id garantido pelo where\n\n    public T? Buscar(int id) => _itens.TryGetValue(id, out var item) ? item : null;\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Restrição\",\"O que garante\",\"Para que serve\"],[\"where T : class\",\"T é tipo de referência\",\"poder devolver null\"],[\"where T : struct\",\"T é tipo de valor não anulável\",\"trabalhar com int, DateTime e structs próprios\"],[\"where T : notnull\",\"T não é anulável\",\"chave de dicionário (o próprio Dictionary exige)\"],[\"where T : new()\",\"T tem construtor público sem parâmetros\",\"criar com new T()\"],[\"where T : IComparable<T>\",\"T implementa a interface\",\"chamar CompareTo\"],[\"where T : EntidadeBase\",\"T é a classe base ou deriva dela\",\"usar os membros da base\"],[\"where T : INumber<T>\",\"T é numérico (generic math)\",\"somar com + e começar de T.Zero\"]]",
                    },
                    {
                        type: "text",
                        value: "## Por que genérico evita boxing e cast\n\nMedimos no .NET 10: um milhão de `int` num `ArrayList` alocou cerca de 32 MB, contra 4 MB numa `List<int>`, as duas criadas já com a capacidade certa. A diferença é o boxing. Num processo de 64 bits, cada `int` encaixotado é um objeto de 24 bytes no heap, e o array interno ainda guarda uma referência de 8 bytes para cada um; tudo isso vira trabalho para o coletor de lixo. Na `List<int>`, os números ficam lado a lado num `int[]`, 4 bytes cada.\n\nO cast some porque o tipo é conhecido: `clientes[0]` numa `List<Cliente>` já é `Cliente`. E o erro de tipo muda de lugar, do `InvalidCastException` em produção para o erro de compilação na sua máquina.\n\nUma pegadinha que todo mundo encontra: **`List<Cachorro>` não é `List<Animal>`**, mesmo com `Cachorro` herdando de `Animal`. Se fosse, um método poderia fazer `animais.Add(new Gato())` dentro de uma lista de cachorros. Por isso um parâmetro `List<Animal>` recusa uma `List<Cachorro>`. Já `IEnumerable<T>` e `IReadOnlyList<T>` são **covariantes** (declaradas com `out T`): só entregam itens, nunca recebem, então um parâmetro `IEnumerable<Animal>` aceita a `List<Cachorro>` sem problema. Mais um motivo para pedir a interface de leitura quando o método só lê.",
                    },
                    {
                        type: "quote",
                        value: "Genérico é escrever uma vez e deixar o compilador conferir cada uso: sem caixa para tipo de valor, sem cast na leitura e com o erro de tipo aparecendo na compilação. A restrição `where` é o contrato que libera, dentro do código genérico, o que `T` sabe fazer.",
                    },
                ],
                questions: [
                    {
                        statement: "Um sistema legado guarda milhões de inteiros num `ArrayList`. O que se ganha trocando por `List<int>`?",
                        difficulty: "facil",
                        options: [
                            { text: "A `List<int>` aceita escrita de várias threads, enquanto o `ArrayList` exige `lock`", isCorrect: false },
                            { text: "Os inteiros ficam no array interno sem boxing, e o tipo é conferido já ao compilar", isCorrect: true },
                            { text: "O `ArrayList` converte os inteiros para texto, e a `List<int>` evita a conversão", isCorrect: false },
                            { text: "A `List<int>` mantém os itens ordenados na inclusão, o que acelera as buscas por valor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Dada a classe `Repositorio<T> where T : class, IEntidade`, qual uso o compilador recusa?",
                        difficulty: "facil",
                        options: [
                            { text: "`new Repositorio<Admin>()`, com `Admin` herdando de uma classe que implementa `IEntidade`", isCorrect: false },
                            { text: "`new Repositorio<Produto>()`, com `Produto` sendo uma classe que implementa `IEntidade`", isCorrect: false },
                            { text: "`new Repositorio<Cliente>()`, com `Cliente` sendo um record que implementa `IEntidade`", isCorrect: false },
                            { text: "`new Repositorio<Leitura>()`, com `Leitura` sendo um struct que implementa `IEntidade`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O método `static T Maior<T>(T a, T b) => a > b ? a : b;` não compila. Qual ajuste faz ele compilar mantendo a ideia?",
                        difficulty: "medio",
                        options: [
                            { text: "Adicionar `where T : IComparable<T>` e deixar o `a > b` exatamente como já está", isCorrect: false },
                            { text: "Adicionar `where T : IComparable<T>` e trocar `a > b` por `a.CompareTo(b) > 0`", isCorrect: true },
                            { text: "Adicionar `where T : struct`, porque todo tipo de valor já tem o operador `>`", isCorrect: false },
                            { text: "Trocar `T` por `object` nos parâmetros e no retorno, mantendo o `a > b`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "`Cachorro` herda de `Animal`, e o método `void Vacinar(List<Animal> animais)` é chamado com uma `List<Cachorro>`. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "Compila, porque `List<Cachorro>` é um subtipo automático de `List<Animal>`", isCorrect: false },
                            { text: "Compila, mas um `Add(new Gato())` dentro do método lança exceção", isCorrect: false },
                            { text: "Não compila; com `IEnumerable<Animal>` no parâmetro, a chamada passaria", isCorrect: true },
                            { text: "Compila, e dentro do método só os membros de `Animal` ficam visíveis", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a saída deste programa?\n\n```csharp\nConsole.WriteLine(PrimeiroOuPadrao(new List<int>()));\nConsole.WriteLine(PrimeiroOuPadrao(new List<string>()) is null);\n\nstatic T? PrimeiroOuPadrao<T>(List<T> itens) =>\n    itens.Count > 0 ? itens[0] : default;\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "`0` e `False`: o default de `string` é a string vazia, e não `null`", isCorrect: false },
                            { text: "`0` e `True`: com `T = int`, `T?` continua `int`, e o default é zero", isCorrect: true },
                            { text: "Uma linha vazia e `True`: `T?` vira `int?`, e o default dele é `null`", isCorrect: false },
                            { text: "Não compila: `T?` com `T` sem restrição exige `class` ou `struct`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "LINQ: filtrar, projetar e a avaliação adiada",
                blocks: [
                    {
                        type: "text",
                        value: "# LINQ: filtrar, projetar e a avaliação adiada\n\nO financeiro pede a lista dos clientes com pedido pago acima de 500, sem repetir nome, em ordem alfabética. Com laços, isso vira uma lista temporária, um `if` com duas condições, um `HashSet` para os repetidos e um `Sort` no fim, e a regra de negócio se perde no meio do encanamento. Com **LINQ** (Language Integrated Query), a mesma coisa vira uma cadeia de chamadas que se lê como a frase do pedido, como no exemplo abaixo.\n\nLINQ é um conjunto de métodos que funciona sobre qualquer `IEnumerable<T>`: array, lista, dicionário, conjunto, resultado de outra consulta. Esta aula trata do **LINQ to Objects**, que roda em memória. A mesma sintaxe aplicada a um banco de dados, com EF Core, vira SQL, e isso fica para quando o assunto for persistência.\n\nSobre a seta: `p => p.Pago && p.Valor > 500m` é uma **lambda**, uma função curta e sem nome que recebe `p` e devolve o valor da expressão. O `Where` chama essa função para cada item e fica com os que deram `true`. Por enquanto, leia `p =>` como \"para cada `p`\"; a última aula do módulo mostra o que existe por trás.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nList<Pedido> pedidos =\n[\n    new(1, \"Bia\", 800m, Pago: true),\n    new(2, \"Ana\", 120m, Pago: true),\n    new(3, \"Caio\", 950m, Pago: false),\n    new(4, \"Ana\", 600m, Pago: true),\n    new(5, \"Davi\", 510m, Pago: true),\n];\n\nvar nomes = pedidos\n    .Where(p => p.Pago && p.Valor > 500m)   // filtra\n    .Select(p => p.Cliente)                 // projeta: de Pedido para string\n    .Distinct()                             // tira os repetidos\n    .Order()                                // ordena pelo próprio valor\n    .ToList();                              // executa e guarda numa lista\nConsole.WriteLine(string.Join(\", \", nomes));                 // Ana, Bia, Davi\n\nvar maiores = pedidos\n    .OrderByDescending(p => p.Valor)        // do maior para o menor\n    .ThenBy(p => p.Cliente)                 // desempate\n    .Select(p => $\"#{p.Id} {p.Valor}\");\nConsole.WriteLine(string.Join(\", \", maiores));\n// #3 950, #1 800, #4 600, #5 510, #2 120\n\nConsole.WriteLine(pedidos.Any(p => !p.Pago));                // True\nConsole.WriteLine(pedidos.Count(p => p.Cliente == \"Ana\"));   // 2\nConsole.WriteLine(pedidos.All(p => p.Valor > 100m));         // True\n\nrecord Pedido(int Id, string Cliente, decimal Valor, bool Pago);",
                    },
                    {
                        type: "text",
                        value: "## Os operadores do dia a dia\n\n- **`Where`** filtra: fica com os itens para os quais a lambda devolve `true`.\n- **`Select`** projeta: transforma cada item em outra coisa (um campo, um record, um texto). Sai exatamente um resultado por item de entrada.\n- **`OrderBy`** e **`OrderByDescending`** ordenam por uma chave, e **`ThenBy`** desempata. `Order()` ordena pelo próprio valor, útil em sequência de números ou de textos.\n- **`Any`** responde se existe pelo menos um item (que passe no teste) e para no primeiro que encontrar. **`All`** responde se todos passam.\n- **`Count`** conta os itens, ou os que passam no teste.\n\nDois erros comuns aqui. O primeiro é usar `Count(...) > 0` para saber se existe algum: `Count` com teste percorre a sequência inteira, enquanto `Any` para no primeiro. O segundo é encadear `OrderBy(...).OrderBy(...)` para ordenar por duas chaves: o segundo `OrderBy` reordena tudo e vira o critério principal. O desempate certo é `ThenBy`.\n\nExiste também a **sintaxe de consulta**, parecida com SQL (`from p in pedidos where p.Pago select p.Cliente`), que o compilador traduz para as mesmas chamadas. No dia a dia de backend, a sintaxe de método, com os pontos encadeados, é a mais comum.",
                    },
                    {
                        type: "table",
                        value: "[[\"Operador\",\"O que faz\",\"Quando executa\"],[\"Where\",\"fica com os itens que passam no teste\",\"adiado, um item por vez\"],[\"Select\",\"transforma cada item em outro valor\",\"adiado, um item por vez\"],[\"OrderBy e ThenBy\",\"ordena por uma chave e desempata\",\"adiado, mas lê a fonte toda antes de entregar o primeiro item\"],[\"Any e All\",\"responde sim ou não\",\"na hora, e para assim que sabe a resposta\"],[\"Count\",\"conta os itens ou os que passam no teste\",\"na hora\"],[\"ToList e ToArray\",\"copia o resultado para uma coleção nova\",\"na hora: materializa\"]]",
                    },
                    {
                        type: "text",
                        value: "## Avaliação adiada\n\nEste é o conceito que mais confunde quem começa: **guardar uma consulta numa variável não executa nada**. `var grandes = pedidos.Where(...)` guarda uma receita, com a fonte e os passos. A receita só roda quando alguém pede os itens: um `foreach`, um `ToList()`, um `Count()`, um `First()`. E roda de novo cada vez que for pedida, lendo a fonte do jeito que ela estiver naquele momento.\n\nDois efeitos práticos aparecem no exemplo abaixo, em que a lambda do `Where` tem corpo entre chaves e `return`, para poder imprimir. Primeiro, alterar a lista depois de montar a consulta muda o resultado, porque a consulta ainda não leu nada. Segundo, `Where` e `Select` trabalham em fluxo: cada item atravessa a cadeia inteira de etapas (o pipeline) antes de o próximo entrar, sem lista intermediária. `OrderBy` não tem como fazer isso; para saber quem vem primeiro, precisa ler a fonte toda antes de entregar o primeiro item.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nList<int> numeros = [1, 2, 3, 4];\n\nvar consulta = numeros\n    .Where(n =>\n    {\n        Console.WriteLine($\"  testando {n}\");\n        return n % 2 == 0;\n    })\n    .Select(n => n * 10);\n\nConsole.WriteLine(\"consulta montada, nada rodou ainda\");\nnumeros.Add(6);                     // a consulta ainda não leu a lista\n\nforeach (var x in consulta)         // agora executa, um item por vez\n    Console.WriteLine($\"recebi {x}\");\n\n// Saída:\n// consulta montada, nada rodou ainda\n//   testando 1\n//   testando 2\n// recebi 20\n//   testando 3\n//   testando 4\n// recebi 40\n//   testando 6\n// recebi 60",
                    },
                    {
                        type: "text",
                        value: "## O que materializa, e quando usar ToList\n\n**Materializar** é executar a consulta e guardar o resultado numa coleção: `ToList()`, `ToArray()`, `ToDictionary()`, `ToHashSet()`. A partir daí você tem uma foto: mudar a fonte não muda mais o resultado, e percorrer de novo não refaz o filtro. Métodos que devolvem um valor só (`Count`, `Any`, `First`, `Sum`) também executam na hora, mas não guardam a sequência.\n\nMaterialize quando o resultado vai ser percorrido mais de uma vez, quando você quer o estado da fonte naquele instante ou quando vai devolver o resultado de um método e não quer entregar uma consulta viva, que roda de novo nas mãos de quem chamou. Não materialize no meio de uma cadeia: `pedidos.ToList().Where(...)` só cria uma lista à toa antes de filtrar.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nList<string> fila = [\"Ana\", \"Bia\"];\nvar foto = fila.Where(n => n.StartsWith('A')).ToList();   // executa agora\nvar viva = fila.Where(n => n.StartsWith('A'));            // guarda só a receita\nfila.Add(\"Alice\");\nConsole.WriteLine($\"{foto.Count} {viva.Count()}\");        // 1 2\n\nList<Pessoa> pessoas = [new(\"Caio\", \"Recife\"), new(\"Ana\", \"Recife\"), new(\"Bia\", \"Belém\")];\nvar errado = pessoas.OrderBy(p => p.Cidade).OrderBy(p => p.Nome);  // Nome virou o critério principal\nvar certo = pessoas.OrderBy(p => p.Cidade).ThenBy(p => p.Nome);    // Cidade, depois Nome\nConsole.WriteLine(string.Join(\", \", errado.Select(p => p.Nome)));  // Ana, Bia, Caio\nConsole.WriteLine(string.Join(\", \", certo.Select(p => p.Nome)));   // Bia, Ana, Caio\n\nrecord Pessoa(string Nome, string Cidade);",
                    },
                    {
                        type: "quote",
                        value: "Consulta LINQ guardada em variável é receita, não resultado: roda quando alguém pede os itens, um por vez, e roda de novo a cada pedido. Materialize com `ToList` quando precisar de uma foto ou for percorrer mais de uma vez, e pergunte com `Any` quando só quer saber se existe.",
                    },
                ],
                questions: [
                    {
                        statement: "Em `pedidos.Select(p => p.NomeCliente)`, o que o `Select` faz?",
                        difficulty: "facil",
                        options: [
                            { text: "Ordena os pedidos pelo nome do cliente e devolve os pedidos inteiros", isCorrect: false },
                            { text: "Filtra os pedidos com cliente preenchido e descarta os que não têm", isCorrect: false },
                            { text: "Agrupa os pedidos por cliente, com um resultado por cliente distinto", isCorrect: false },
                            { text: "Transforma cada pedido no nome do cliente, um resultado por pedido", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Para saber se existe pelo menos um pedido atrasado numa sequência grande, por que `pedidos.Any(p => p.Atrasado)` é melhor que `pedidos.Count(p => p.Atrasado) > 0`?",
                        difficulty: "facil",
                        options: [
                            { text: "`Count` copia a lista inteira antes; `Any` lê direto da fonte original", isCorrect: false },
                            { text: "`Any` para no primeiro atrasado; `Count` percorre a sequência inteira", isCorrect: true },
                            { text: "`Any` divide o trabalho entre os núcleos; `Count` roda numa thread só", isCorrect: false },
                            { text: "`Any` usa um índice interno da lista; `Count` ordena antes de contar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a saída deste programa?\n\n```csharp\nList<int> numeros = [1, 2, 3];\nvar pares = numeros.Where(n => n % 2 == 0);\nnumeros.Add(4);\nConsole.WriteLine(pares.Count());\n```",
                        difficulty: "medio",
                        options: [
                            { text: "`2`, porque o filtro só roda no `Count`, com o 4 já na lista", isCorrect: true },
                            { text: "Lança `InvalidOperationException` por alterar a lista da consulta", isCorrect: false },
                            { text: "`0`, porque `Where` sem `ToList` não guarda item nenhum na variável", isCorrect: false },
                            { text: "`1`, porque `pares` guardou o resultado na linha do `Where`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A intenção era ordenar por cidade e, dentro de cada cidade, por nome. O que `pessoas.OrderBy(p => p.Cidade).OrderBy(p => p.Nome)` entrega?",
                        difficulty: "medio",
                        options: [
                            { text: "As pessoas ordenadas só por cidade, porque o segundo `OrderBy` é ignorado", isCorrect: false },
                            { text: "As pessoas por cidade e, dentro de cada cidade, por nome, como pretendido", isCorrect: false },
                            { text: "As pessoas ordenadas por nome; a cidade deixa de ser o critério principal", isCorrect: true },
                            { text: "Erro de compilação, porque não se aplica `OrderBy` sobre outro `OrderBy`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a saída deste programa?\n\n```csharp\nint[] numeros = [1, 2, 3];\nvar q = numeros\n    .Where(n => { Console.Write($\"W{n} \"); return n != 2; })\n    .Select(n => { Console.Write($\"S{n} \"); return n * 10; });\nConsole.Write(\"início \");\nforeach (var x in q)\n    Console.Write($\"[{x}] \");\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "`início W1 W2 W3 S1 S3 [10] [30]`", isCorrect: false },
                            { text: "`início W1 S1 [10] W2 S2 W3 S3 [30]`", isCorrect: false },
                            { text: "`início W1 S1 [10] W2 W3 S3 [30]`", isCorrect: true },
                            { text: "`W1 W2 W3 S1 S3 início [10] [30]`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "LINQ: agrupar, juntar e escolher um elemento",
                blocks: [
                    {
                        type: "text",
                        value: "# LINQ: agrupar, juntar e escolher um elemento\n\nO painel de vendas precisa do faturamento por categoria, do nome do cliente ao lado de cada pedido e dos dados de um pedido específico. São as perguntas que todo relatório faz: agrupar, cruzar duas listas e achar um item. O LINQ tem um operador para cada uma, e cada operador tem uma pegadinha que vale conhecer antes de ela aparecer em produção.\n\n## GroupBy e as agregações\n\n`GroupBy` separa a sequência em grupos pela chave que você escolhe. Cada grupo é um `IGrouping<TKey, T>`: tem a propriedade `Key` e é, ele mesmo, uma sequência com os itens daquele grupo, então aceita `Count`, `Sum`, `Average` e `Max` lá dentro. O padrão é agrupar e projetar o resumo com `Select`. O `new { ... }` do exemplo cria um **tipo anônimo**, bom para resultado intermediário dentro do método; para devolver de um método, prefira um record. Quando só precisa contar por chave, o `CountBy` (disponível no .NET 10) faz isso direto, sem montar os grupos.\n\nAs agregações têm duas pegadinhas. **`Max(v => v.Valor)` devolve o maior valor; `MaxBy(v => v.Valor)` devolve o item que tem o maior valor.** E em sequência vazia, `Sum` devolve `0`, mas `Average`, `Min` e `Max` de números lançam `InvalidOperationException` (\"Sequence contains no elements\"). Dia sem venda é exatamente o caso que derruba o painel. Proteja com `Any()` antes, ou use a forma anulável, que devolve `null` em vez de lançar.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nList<Venda> vendas =\n[\n    new(\"Livros\", 50m), new(\"Jogos\", 200m), new(\"Livros\", 30m),\n    new(\"Jogos\", 120m), new(\"Música\", 40m),\n];\n\nvar porCategoria = vendas\n    .GroupBy(v => v.Categoria)\n    .Select(g => new { Categoria = g.Key, Qtd = g.Count(), Total = g.Sum(v => v.Valor) })\n    .OrderByDescending(r => r.Total);\n\nforeach (var r in porCategoria)\n    Console.WriteLine($\"{r.Categoria}: {r.Qtd} venda(s), total {r.Total}\");\n// Jogos: 2 venda(s), total 320\n// Livros: 2 venda(s), total 80\n// Música: 1 venda(s), total 40\n\nvar contagem = vendas.CountBy(v => v.Categoria).OrderBy(par => par.Key);\nConsole.WriteLine(string.Join(\" \", contagem.Select(par => $\"{par.Key}={par.Value}\")));\n// Jogos=2 Livros=2 Música=1\n\nConsole.WriteLine(vendas.Max(v => v.Valor));                    // 200: o maior valor\nConsole.WriteLine(vendas.MaxBy(v => v.Valor)?.Categoria);       // Jogos: a venda com o maior valor\n\nList<Venda> hoje = [];\nConsole.WriteLine(hoje.Sum(v => v.Valor));                      // 0\nConsole.WriteLine(hoje.Average(v => (decimal?)v.Valor) ?? 0m);  // 0: a forma anulável devolve null\n// hoje.Average(v => v.Valor);   // InvalidOperationException: Sequence contains no elements\n\nrecord Venda(string Categoria, decimal Valor);",
                    },
                    {
                        type: "text",
                        value: "## Join: cruzando duas sequências\n\n`Join` casa duas sequências por uma chave, como o `INNER JOIN` do SQL: para cada pedido, o cliente com o mesmo ID. Por dentro, ele monta uma tabela hash com a segunda sequência e percorre a primeira uma vez só, então custa O(n + m), contra O(n × m) de dois `foreach` aninhados procurando o par.\n\nO detalhe que pega: **pedido sem cliente correspondente some do resultado**, sem erro e sem aviso. Quando o lado sem par também precisa aparecer, o caso é de junção externa à esquerda. Antes do .NET 10 isso exigia combinar `GroupJoin`, `SelectMany` e `DefaultIfEmpty`; o .NET 10 trouxe os operadores `LeftJoin` e `RightJoin`, em que o item do outro lado chega como `null` quando não há par.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nList<Cliente> clientes = [new(1, \"Ana\"), new(2, \"Bia\"), new(3, \"Caio\")];\nList<Pedido> pedidos = [new(10, 1, 50m), new(11, 2, 80m), new(12, 1, 30m), new(13, 9, 15m)];\n\nvar comNome = pedidos.Join(\n    clientes,\n    p => p.ClienteId,            // chave do lado dos pedidos\n    c => c.Id,                   // chave do lado dos clientes\n    (p, c) => $\"#{p.Id} {c.Nome}\");\nConsole.WriteLine(string.Join(\", \", comNome));\n// #10 Ana, #11 Bia, #12 Ana   (o #13, do cliente 9, sumiu)\n\nvar todosOsClientes = clientes.LeftJoin(\n    pedidos,\n    c => c.Id,\n    p => p.ClienteId,\n    (c, p) => p is null ? $\"{c.Nome}: sem pedido\" : $\"{c.Nome}: #{p.Id}\");\nConsole.WriteLine(string.Join(\", \", todosOsClientes));\n// Ana: #10, Ana: #12, Bia: #11, Caio: sem pedido\n\nrecord Cliente(int Id, string Nome);\nrecord Pedido(int Id, int ClienteId, decimal Valor);",
                    },
                    {
                        type: "text",
                        value: "## First, Single e os OrDefault\n\nPara tirar **um** item de uma sequência há quatro métodos, e a escolha documenta a regra de negócio (veja a tabela). Muita gente usa `FirstOrDefault` em tudo, por medo de exceção. O resultado é um `null` que viaja pelo sistema e estoura como `NullReferenceException` três camadas depois, longe da causa; com nullable reference types ligado, o compilador ao menos avisa, porque o retorno é `T?`. Em tipo de valor, o \"default\" engana de outro jeito: `idades.FirstOrDefault(i => i > 60)` devolve `0` quando ninguém passa, e `0` parece um resultado. Use a sobrecarga com valor padrão explícito, `FirstOrDefault(i => i > 60, -1)`, ou pergunte com `Any` antes.\n\n`Single` custa mais que `First`: para garantir que existe só um, continua procurando depois de achar o primeiro, até o fim da sequência se não houver um segundo. Quando um segundo aparece, lança `InvalidOperationException` (\"Sequence contains more than one matching element\"). Isso é bom: duplicado onde a regra diz único é bug, e é melhor descobrir na hora.",
                    },
                    {
                        type: "table",
                        value: "[[\"Método\",\"Nenhum item\",\"Mais de um item\",\"Quando usar\"],[\"First\",\"lança exceção\",\"devolve o primeiro\",\"tem que existir, e qualquer um serve (por exemplo, depois de ordenar)\"],[\"FirstOrDefault\",\"devolve o default (null ou 0)\",\"devolve o primeiro\",\"a ausência é normal e você trata o default\"],[\"Single\",\"lança exceção\",\"lança exceção\",\"tem que existir exatamente um\"],[\"SingleOrDefault\",\"devolve o default\",\"lança exceção\",\"pode não existir, mas duplicado é bug\"]]",
                    },
                    {
                        type: "text",
                        value: "## A armadilha de enumerar duas vezes\n\nComo a consulta é receita, cada `foreach`, `Count()`, `Any()` ou `ToList()` sobre o mesmo `IEnumerable<T>` executa tudo de novo. Com filtro barato numa lista pequena, só desperdiça. Os casos que doem:\n\n- **o `Select` cria objetos**: cada enumeração cria objetos novos, e o que você alterou na primeira passada não existe na segunda;\n- **a fonte é cara ou de mão única**: `File.ReadLines` lê o arquivo de novo a cada passada, e uma sequência vinda da rede pode nem aceitar uma segunda leitura;\n- **o resultado muda entre as passadas**, porque a fonte mudou ou porque o filtro depende de `DateTime.Now` ou de `Random`.\n\nA regra: se vai percorrer mais de uma vez, materialize uma vez (`ToList()`) e reuse. Em método que precisa de várias passadas, peça `IReadOnlyList<T>` ou `IReadOnlyCollection<T>` no parâmetro, em vez de `IEnumerable<T>`. O analisador CA1851 aponta esse padrão, mas no SDK do .NET 10 ele vem desligado; para ligar, ponha `dotnet_diagnostic.CA1851.severity = warning` no `.editorconfig`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nstring[] nomes = [\"Ana\", \"Bia\"];\nvar tarefas = nomes.Select(n => new Tarefa(n));   // receita: cria Tarefa a cada enumeração\n\nforeach (var t in tarefas)\n    t.Concluida = true;                            // marca as tarefas DESTA passada\n\nConsole.WriteLine(tarefas.All(t => t.Concluida));  // False: o All criou tarefas novas\n\nvar lista = nomes.Select(n => new Tarefa(n)).ToList();  // materializa uma vez\nforeach (var t in lista)\n    t.Concluida = true;\nConsole.WriteLine(lista.All(t => t.Concluida));    // True\n\nclass Tarefa(string nome)\n{\n    public string Nome { get; } = nome;\n    public bool Concluida { get; set; }\n}",
                    },
                    {
                        type: "quote",
                        value: "Agrupe com `GroupBy` e projete o resumo, cruze com `Join` (ou `LeftJoin`, quando o lado sem par também importa) e escolha entre `First` e `Single` pela regra de negócio, não pelo medo de exceção. Sequência que vai ser lida duas vezes se materializa uma vez.",
                    },
                ],
                questions: [
                    {
                        statement: "`clientes` é uma `List<Cliente>`, e `Cliente` é uma classe. Se nenhum cliente tem o e-mail procurado, o que `clientes.FirstOrDefault(c => c.Email == email)` devolve?",
                        difficulty: "facil",
                        options: [
                            { text: "`null`, que é o valor padrão de qualquer tipo de referência", isCorrect: true },
                            { text: "Um `Cliente` novo, com as propriedades nos valores padrão", isCorrect: false },
                            { text: "O primeiro cliente da lista, já que ninguém passou no teste", isCorrect: false },
                            { text: "Lança `InvalidOperationException`, por não achar nenhum", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que cada elemento de `vendas.GroupBy(v => v.Categoria)` representa?",
                        difficulty: "facil",
                        options: [
                            { text: "Uma categoria distinta, mas sem acesso às vendas que caíram nela", isCorrect: false },
                            { text: "Uma categoria, com a chave em `Key` e as suas vendas em sequência", isCorrect: true },
                            { text: "O valor total de uma categoria, já somado pelo próprio `GroupBy`", isCorrect: false },
                            { text: "Uma venda, com o nome da categoria copiado para a propriedade `Key`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na busca de cliente por CPF, o cliente pode não existir (cadastro novo), mas dois cadastros com o mesmo CPF são um bug que precisa aparecer. Qual método usar?",
                        difficulty: "medio",
                        options: [
                            { text: "`Single`: lança exceção se não achar e também lança se achar dois", isCorrect: false },
                            { text: "`First`: lança exceção se não achar e devolve o primeiro se achar dois", isCorrect: false },
                            { text: "`SingleOrDefault`: devolve `null` se não achar e lança se achar dois", isCorrect: true },
                            { text: "`FirstOrDefault`: devolve `null` se não achar e o primeiro se achar dois", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num dia sem vendas, `vendas` é uma `List<Venda>` vazia e `Valor` é `decimal`. O que acontece com `vendas.Sum(v => v.Valor)` e `vendas.Average(v => v.Valor)`?",
                        difficulty: "medio",
                        options: [
                            { text: "`Sum` devolve 0, e `Average` lança `InvalidOperationException`", isCorrect: true },
                            { text: "Os dois lançam `InvalidOperationException` por falta de itens", isCorrect: false },
                            { text: "`Sum` devolve 0, e `Average` devolve `null` por falta de média", isCorrect: false },
                            { text: "Os dois devolvem 0, que é o valor padrão do tipo `decimal`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual valor de `chamadas` o programa imprime na última linha?\n\n```csharp\nint chamadas = 0;\ndecimal[] precos = [50m, 120m, 300m, 80m, 150m];\nvar caros = precos.Where(p => { chamadas++; return p > 100m; });\n\nif (caros.Any())\n{\n    Console.WriteLine(caros.Count());\n    var lista = caros.ToList();\n}\nConsole.WriteLine(chamadas);\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "`12`, porque `Any` para no 120, e `Count` e `ToList` percorrem tudo", isCorrect: true },
                            { text: "`10`, porque só `Count` e `ToList` executam e o `if` não conta", isCorrect: false },
                            { text: "`15`, porque cada um dos três usos percorre os cinco preços", isCorrect: false },
                            { text: "`5`, porque a consulta roda uma vez só e os outros usos reaproveitam", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Delegates, lambdas e extensões",
                blocks: [
                    {
                        type: "text",
                        value: "# Delegates, lambdas e extensões\n\nDesde o começo do módulo você escreve `p => p.Valor > 100m` para o `Where`. Isso não é sintaxe mágica do LINQ: é um valor que representa uma função, e o `Where` recebe esse valor como receberia um número. Esse mecanismo, o **delegate**, é o que permite passar comportamento como parâmetro: a regra de desconto que muda por campanha, o critério de ordenação que o usuário escolheu, o que fazer quando algo acontece. E o próprio `Where` só aparece depois do ponto em qualquer lista porque é um **extension method**, o outro assunto desta aula.\n\n## Func, Action e companhia\n\nUm delegate é um tipo que descreve uma assinatura de método. No dia a dia você usa os genéricos prontos:\n\n- **`Func<..., TResult>`** recebe de zero a 16 parâmetros e **devolve** um valor; o último tipo é sempre o retorno. `Func<Pedido, bool>` recebe um pedido e devolve `bool`.\n- **`Action<...>`** recebe parâmetros e **não devolve** nada. `Action<string>` recebe uma string.\n- **`Predicate<T>`** equivale a `Func<T, bool>` e aparece em APIs mais antigas, como `List<T>.RemoveAll` e `List<T>.Find`.\n\nQualquer coisa com assinatura compatível vira o delegate: uma lambda ou um método com nome, passado sem parênteses (o method group), como em `numeros.Where(EhPar)`. Desde o C# 10, a lambda tem tipo natural: `var dobro = (int x) => x * 2;` já é um `Func<int, int>`. Declarar um delegate próprio ainda faz sentido quando a assinatura tem `out` ou `ref`, que `Func` e `Action` não expressam; e no C# 14 a lambda pode usar esses modificadores sem repetir os tipos dos parâmetros.",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo\",\"Recebe\",\"Devolve\",\"Exemplo de lambda\"],[\"Func<int, string>\",\"um int\",\"string\",\"n => n.ToString(\\\"D4\\\")\"],[\"Func<int, int, int>\",\"dois int\",\"int\",\"(a, b) => a + b\"],[\"Func<bool>\",\"nada\",\"bool\",\"() => DateTime.Now.Hour < 12\"],[\"Action<string>\",\"uma string\",\"nada\",\"msg => Console.WriteLine(msg)\"],[\"Predicate<Pedido>\",\"um Pedido\",\"bool\",\"p => p.Cancelado\"]]",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nFunc<decimal, decimal> comDesconto = valor => valor * 0.9m;          // recebe decimal, devolve decimal\nFunc<int, int, int> somar = (a, b) => a + b;                           // o último tipo é o retorno\nAction<string> registrar = msg => Console.WriteLine($\"[log] {msg}\");   // não devolve nada\nFunc<string, string> normalizar = s =>\n{\n    var limpo = s.Trim();                                              // lambda com corpo\n    return limpo.ToUpperInvariant();\n};\n\nregistrar($\"soma: {somar(2, 3)}\");                    // [log] soma: 5\nConsole.WriteLine(comDesconto(200m) == 180m);         // True\nConsole.WriteLine(normalizar(\"  ana \"));              // ANA\n\nint[] numeros = [1, 2, 3, 4, 5, 6];\nConsole.WriteLine(string.Join(\",\", numeros.Where(EhPar)));   // 2,4,6 (method group)\n\nvar dobro = (int x) => x * 2;                         // tipo natural: Func<int, int>\nConsole.WriteLine(dobro(21));                         // 42\n\nConversor ler = (texto, out valor) => int.TryParse(texto, out valor);   // C# 14: out sem repetir o tipo\nConsole.WriteLine(ler(\"42\", out var lido) ? lido : -1);                 // 42\n\nstatic bool EhPar(int n) => n % 2 == 0;\n\ndelegate bool Conversor(string texto, out int valor);   // delegate próprio: Func não tem out",
                    },
                    {
                        type: "text",
                        value: "## Closures: a lambda leva a variável junto\n\nUma lambda pode usar variáveis declaradas fora dela. O compilador mantém essas variáveis vivas enquanto a lambda existir, e o conjunto \"função mais variáveis capturadas\" se chama **closure**. O ponto que pega: **a lambda captura a variável, não o valor do momento**. Se a variável mudar depois, a lambda enxerga o valor novo.\n\nO exemplo clássico é o laço `for`. Ele tem **uma** variável `i` para todas as voltas, e cada lambda criada lá dentro captura a mesma; quando as lambdas rodam, depois do laço, todas leem o valor final. O `foreach` é diferente: desde o C# 5, cada volta tem a sua própria variável. No `for`, a correção é copiar o valor para uma variável declarada dentro do laço.\n\nCaptura também custa: o compilador cria um objeto no heap para guardar as variáveis capturadas. Quando a lambda não deveria capturar nada, marque com `static` (desde o C# 9); se ela capturar sem querer, vira erro de compilação.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nint limite = 100;\nFunc<decimal, bool> caro = v => v > limite;   // captura a variável limite\nlimite = 500;\nConsole.WriteLine(caro(300m));                // False: a lambda leu 500\n\nvar acoes = new List<Action>();\nfor (int i = 0; i < 3; i++)\n    acoes.Add(() => Console.Write($\"{i} \"));  // as três capturam o mesmo i\nforeach (var acao in acoes) acao();           // 3 3 3\nConsole.WriteLine();\n\nvar corrigidas = new List<Action>();\nfor (int i = 0; i < 3; i++)\n{\n    int copia = i;                            // uma variável nova a cada volta\n    corrigidas.Add(() => Console.Write($\"{copia} \"));\n}\nforeach (var acao in corrigidas) acao();      // 0 1 2\nConsole.WriteLine();\n\nFunc<int, int> triplo = static x => x * 3;    // static: proibido capturar\n// Func<int, int> errado = static x => x * limite;   // não compila: captura limite\nConsole.WriteLine(triplo(5));                 // 15",
                    },
                    {
                        type: "text",
                        value: "## Extension methods e os extension members do C# 14\n\nExtension method é um método estático que se chama como se fosse da instância. Você declara numa classe `static`, e o primeiro parâmetro leva `this`: com `public static string Truncar(this string texto, int max)`, a chamada `titulo.Truncar(20)` funciona em qualquer `string`, sem herdar nem alterar a classe `String`. O compilador só reescreve a chamada para `TextoExtensions.Truncar(titulo, 20)`. É assim que o LINQ existe: `Where`, `Select` e companhia são extension methods de `IEnumerable<T>` na classe `System.Linq.Enumerable`, e aparecem depois do ponto porque o namespace `System.Linq` está importado (os projetos atuais importam por padrão, com implicit usings).\n\nRegras e cuidados: a classe precisa ser estática, não genérica e não aninhada, e quem chama precisa do `using` do namespace dela. Extensão não enxerga membro privado; é só um método estático com açúcar na chamada. Se o tipo já tiver um método de instância com a mesma assinatura, o da instância ganha e a extensão é ignorada sem aviso.\n\nO **C# 14**, que veio com o .NET 10, trouxe o bloco `extension`, dentro de uma classe estática. Você declara o receptor uma vez, `extension(Pedido pedido)`, e escreve os membros como se estivesse na classe: métodos e também **propriedades de extensão**, que antes não existiam. Membro marcado com `static` dentro do bloco vira membro **estático** de extensão e se chama pelo tipo (`Pedido.Vazio`); quando o bloco só tem membros estáticos, o receptor pode ficar sem nome, como em `extension(Pedido)`. O receptor também pode ser genérico: `extension<T>(IEnumerable<T> itens)`. Duas coisas não mudaram. Extensão continua sem estado: propriedade de extensão é calculada e não ganha campo de apoio. E **o extension method clássico, com `this`, continua valendo** e convive com a sintaxe nova; ninguém precisa reescrever as extensões que já existem. O bloco `extension` é o caminho quando você quer propriedade ou membro estático.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing Loja;\n\nvar pedido = new Pedido(42, 250m, Prazo: new DateOnly(2026, 10, 1));\nvar hoje = new DateOnly(2026, 10, 20);\n\nConsole.WriteLine(\"Relatório de outubro\".Truncar(9));  // Relatório...\nConsole.WriteLine(pedido.EstaAtrasado(hoje));          // True: método no bloco extension\nConsole.WriteLine(pedido.TemFreteGratis);              // True: propriedade de extensão\nConsole.WriteLine(Pedido.Vazio.Id);                    // 0: membro estático de extensão\nList<int> fila = [];\nConsole.WriteLine(fila.EstaVazia);                     // True: receptor genérico\n\nnamespace Loja\n{\n    public record Pedido(int Id, decimal Valor, DateOnly Prazo);\n\n    public static class TextoExtensions\n    {\n        // Extension method clássico: continua valendo.\n        public static string Truncar(this string texto, int max) =>\n            texto.Length <= max ? texto : texto.Substring(0, max) + \"...\";\n    }\n\n    public static class PedidoExtensions\n    {\n        extension(Pedido pedido)                       // C# 14: receptor declarado uma vez\n        {\n            public bool TemFreteGratis => pedido.Valor >= 200m;               // propriedade\n            public bool EstaAtrasado(DateOnly hoje) => pedido.Prazo < hoje;   // método\n        }\n\n        extension(Pedido)                              // sem nome: membros estáticos\n        {\n            public static Pedido Vazio => new(0, 0m, DateOnly.MinValue);\n        }\n\n        extension<T>(IEnumerable<T> itens)             // receptor genérico\n        {\n            public bool EstaVazia => !itens.Any();\n        }\n    }\n}",
                    },
                    {
                        type: "quote",
                        value: "Delegate é função tratada como valor: `Func` quando devolve, `Action` quando não devolve, e a lambda é o jeito curto de escrever uma. A closure captura a variável, não o valor; e extensão acrescenta métodos a um tipo sem mexer nele, com propriedades e membros estáticos desde o C# 14 e o extension method clássico ainda valendo.",
                    },
                ],
                questions: [
                    {
                        statement: "O que o tipo `Func<int, string>` representa?",
                        difficulty: "facil",
                        options: [
                            { text: "Uma função que devolve `int` ou `string`, conforme o caso", isCorrect: false },
                            { text: "Uma função que recebe `int` e `string` e não devolve nada", isCorrect: false },
                            { text: "Uma função que recebe um `int` e devolve uma `string`", isCorrect: true },
                            { text: "Uma função que recebe uma `string` e devolve um `int`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Você quer guardar numa variável uma função que recebe a mensagem e grava no log, sem devolver nada. Qual tipo serve?",
                        difficulty: "facil",
                        options: [
                            { text: "`Action<string>`, porque a função não devolve nenhum valor", isCorrect: true },
                            { text: "`Predicate<string>`, porque a função só recebe um texto", isCorrect: false },
                            { text: "`Func<string, void>`, com `void` no lugar do tipo de retorno", isCorrect: false },
                            { text: "`Func<string>`, porque a função recebe uma `string` de entrada", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual declaração cria um extension method que permite escrever `nome.Gritar()` em qualquer `string`?",
                        difficulty: "medio",
                        options: [
                            { text: "`public static class Ext<T> { public static string Gritar(this string s) => s.ToUpper() + \"!\"; }`", isCorrect: false },
                            { text: "`public static class Ext { public static string Gritar(this string s) => s.ToUpper() + \"!\"; }`", isCorrect: true },
                            { text: "`public static class Ext { public string Gritar(this string s) => s.ToUpper() + \"!\"; }`", isCorrect: false },
                            { text: "`public class Ext { public static string Gritar(this string s) => s.ToUpper() + \"!\"; }`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No C# 14, qual declaração cria a propriedade de extensão `EstaVazia`, usada como `pedidos.EstaVazia`, para qualquer `IEnumerable<T>`?",
                        difficulty: "medio",
                        options: [
                            { text: "```csharp\npublic static class Ext\n{\n    public static bool EstaVazia<T>(this IEnumerable<T> itens)\n    {\n        return !itens.Any();\n    }\n}\n```", isCorrect: false },
                            { text: "```csharp\npublic static class Ext\n{\n    extension<T>(IEnumerable<T> itens)\n    {\n        public bool EstaVazia => !itens.Any();\n    }\n}\n```", isCorrect: true },
                            { text: "```csharp\nextension<T>(IEnumerable<T> itens)\n{\n    public bool EstaVazia => !itens.Any();\n}\n```", isCorrect: false },
                            { text: "```csharp\npublic class Ext\n{\n    extension<T>(IEnumerable<T> itens)\n    {\n        public bool EstaVazia => !itens.Any();\n    }\n}\n```", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é a saída deste programa?\n\n```csharp\nvar calculos = new List<Func<int>>();\nint fator = 1;\nforeach (var n in new[] { 1, 2, 3 })\n    calculos.Add(() => n * fator);\nfator = 10;\nConsole.WriteLine(string.Join(\" \", calculos.Select(f => f())));\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Não compila: `fator` muda depois de ser capturado, e isso é proibido", isCorrect: false },
                            { text: "`1 2 3`: cada lambda guardou os valores do momento da criação", isCorrect: false },
                            { text: "`10 20 30`: cada volta tem o seu `n`, e `fator` é lido na chamada", isCorrect: true },
                            { text: "`30 30 30`: as três lambdas dividem um `n` que termina em 3", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 4 - Erros, recursos e assincronia",
        aulas: [
            {
                titulo: "Exceções: capturar, relançar e não engolir",
                blocks: [
                    {
                        type: "text",
                        value: "# Exceções: capturar, relançar e não engolir\n\nUma importação de pedidos roda toda madrugada e, há três semanas, termina \"com sucesso\" sem importar nada. Ninguém percebeu porque alguém escreveu `catch (Exception) { }` em volta do laço para \"o sistema não cair\". O sistema não caiu: ele mentiu. Tratar exceção direito é decidir, em cada ponto, entre resolver o problema, acrescentar contexto ou deixar a falha subir até quem consegue resolver.\n\n## try, catch, when e finally\n\nQuando uma exceção é lançada, o runtime sobe pela pilha de chamadas procurando um `catch` compatível. Se não encontra nenhum, o processo termina e imprime a pilha. As peças:\n\n- **`try`** delimita o trecho que pode falhar.\n- **`catch (TipoDaExcecao ex)`** trata aquele tipo e os derivados dele. Com vários `catch`, vale o primeiro compatível, por isso eles vão do mais específico para o mais genérico. Na ordem invertida o código nem compila: `catch (Exception)` antes de `catch (FileNotFoundException)` dá o erro CS0160.\n- **`when`** é um filtro: `catch (FormatException ex) when (tolerante)` só captura se a condição for verdadeira. Se não for, a exceção continua subindo como se aquele `catch` não existisse.\n- **`finally`** roda com sucesso, com exceção e até depois de um `return` dentro do `try` (só fica de fora se o processo morrer antes, como num estouro de pilha). Ele roda antes de o controle sair do bloco, inclusive quando a exceção vai ser capturada por um `try` mais externo.\n\nUma exceção lançada dentro de um `catch` sobe como qualquer outra e pode ser capturada mais acima, depois de os `finally` do caminho rodarem.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nstring[] linhas = [\"1;Caneta;3\", \"2;Caderno;dois\", \"3;Lápis;10\"];\nint importadas = Importar(linhas, tolerante: true);\nConsole.WriteLine($\"{importadas} linhas importadas\");\n\nstatic int Importar(string[] linhas, bool tolerante)\n{\n    int importadas = 0;\n    try\n    {\n        foreach (var linha in linhas)\n        {\n            try\n            {\n                string[] campos = linha.Split(';');\n                int quantidade = int.Parse(campos[2]);   // \"dois\" lança FormatException\n                Console.WriteLine($\"{campos[1]}: {quantidade}\");\n                importadas++;\n            }\n            catch (FormatException ex) when (tolerante) // fora do modo tolerante, sobe\n            {\n                Console.WriteLine($\"Linha ignorada ({linha}): {ex.Message}\");\n            }\n        }\n        return importadas;\n    }\n    finally\n    {\n        Console.WriteLine(\"Importação encerrada\");   // roda até depois do return\n    }\n}\n\n// Saída:\n// Caneta: 3\n// Linha ignorada (2;Caderno;dois): The input string 'dois' was not in a correct format.\n// Lápis: 10\n// Importação encerrada\n// 2 linhas importadas",
                    },
                    {
                        type: "text",
                        value: "## throw; x throw ex;\n\nÀs vezes o `catch` existe só para registrar a falha ou desfazer algo que ficou pela metade, e a exceção precisa continuar subindo. Há dois jeitos de relançar, e só um presta:\n\n- **`throw;`** relança a exceção que está sendo tratada e mantém a pilha original, com o método e a linha onde ela nasceu.\n- **`throw ex;`** relança o mesmo objeto, mas a pilha recomeça na linha do `throw ex;`. Tudo o que havia entre a origem e o `catch` some do log.\n\nEm produção, é a diferença entre ler \"falhou em `Interpretar`, chamado por `LerConfig`\" e ler \"falhou em `Relancar`\", que não explica nada. O próprio build avisa com a regra CA2200. Quando você quer acrescentar contexto, crie uma exceção nova com a original dentro: `throw new LinhaInvalidaException(numero, ex);` guarda a causa em `InnerException`, com a pilha dela intacta.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: a mesma falha relançada de dois jeitos\ntry { Relancar(preservar: true); }\ncatch (Exception e) { Console.WriteLine($\"throw;\\n{e.StackTrace}\\n\"); }\n\ntry { Relancar(preservar: false); }\ncatch (Exception e) { Console.WriteLine($\"throw ex;\\n{e.StackTrace}\\n\"); }\n\nstatic void Relancar(bool preservar)\n{\n    try\n    {\n        LerConfig();\n    }\n    catch (Exception ex)\n    {\n        Console.WriteLine(\"Registrando a falha no log...\");\n        if (preservar)\n            throw;   // relança mantendo a pilha original\n        throw ex;    // aviso CA2200: a pilha recomeça nesta linha\n    }\n}\n\nstatic void LerConfig() => Interpretar(\"porta=abc\");\nstatic int Interpretar(string linha) => int.Parse(linha.Split('=')[1]);\n\n// Saída (pilhas resumidas):\n// Registrando a falha no log...\n// throw;    -> Int32.Parse, Interpretar, LerConfig, Relancar, Main\n// Registrando a falha no log...\n// throw ex; -> Relancar, Main",
                    },
                    {
                        type: "text",
                        value: "## Exceção personalizada\n\nAntes de criar uma, procure uma pronta. Argumento inválido é `ArgumentException` ou uma derivada (`ArgumentNullException`, `ArgumentOutOfRangeException`); objeto no estado errado para aquela operação é `InvalidOperationException`; operação que o tipo não suporta é `NotSupportedException`. Para validar argumentos, use os métodos prontos, que preenchem o nome do parâmetro sozinhos: `ArgumentNullException.ThrowIfNull(pedido)` e `ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantidade)`.\n\nCrie a sua quando quem chama precisa tratar aquele caso de um jeito próprio ou precisa de um dado a mais, como o número da linha que falhou. As regras atuais:\n\n- O nome termina em `Exception` e a classe deriva de `Exception`. Derivar de `ApplicationException` foi a orientação dos primeiros anos do .NET; a documentação atual manda derivar de `Exception`.\n- Ofereça os três construtores comuns: sem parâmetro, com mensagem e com mensagem mais exceção interna. É o último que permite embrulhar a causa sem perdê-la.\n- Não copie o construtor com `SerializationInfo` que aparece em código antigo. Ele pertence à serialização por formatter, obsoleta, e desde o .NET 8 gera o aviso SYSLIB0051.",
                    },
                    {
                        type: "code",
                        value: "// LinhaInvalidaException.cs\npublic class LinhaInvalidaException : Exception\n{\n    public int NumeroDaLinha { get; }\n\n    public LinhaInvalidaException() { }\n    public LinhaInvalidaException(string message) : base(message) { }\n    public LinhaInvalidaException(string message, Exception inner) : base(message, inner) { }\n\n    public LinhaInvalidaException(int numeroDaLinha, Exception inner)\n        : base($\"Linha {numeroDaLinha} do arquivo de pedidos está inválida\", inner)\n        => NumeroDaLinha = numeroDaLinha;\n}\n\n// LeitorDePedidos.cs\npublic record Pedido(int Id, int Quantidade);\n\npublic static class LeitorDePedidos\n{\n    public static Pedido Ler(string linha, int numero)\n    {\n        ArgumentNullException.ThrowIfNull(linha);                   // bug de quem chamou\n        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(numero);  // idem\n        try\n        {\n            string[] campos = linha.Split(';');\n            return new Pedido(int.Parse(campos[0]), int.Parse(campos[2]));\n        }\n        catch (FormatException ex)\n        {\n            throw new LinhaInvalidaException(numero, ex);   // contexto novo, causa guardada\n        }\n    }\n}\n\n// Quem chama trata o caso específico e ainda enxerga a causa:\n// catch (LinhaInvalidaException ex)\n// {\n//     Console.WriteLine($\"{ex.Message}: {ex.InnerException?.Message}\");\n// }",
                    },
                    {
                        type: "text",
                        value: "## Lançar ou devolver um resultado\n\nExceção é para o que quem chama não espera e normalmente não consegue resolver ali: bug (argumento nulo), contrato quebrado, banco fora do ar, disco cheio. Desfecho esperado do negócio, que a tela precisa tratar toda vez, como saldo insuficiente, cupom vencido ou CPF já cadastrado, fica melhor como valor de retorno. O resultado aparece na assinatura, obriga quem chama a olhar o desfecho e não paga o custo de lançar e capturar, que é bem maior que o de um `if`. A biblioteca do .NET segue o mesmo critério: `int.Parse` lança `FormatException`, e `int.TryParse` devolve `bool` para quando texto inválido é rotina.\n\n## Nunca engolir exceção\n\n`catch { }` e `catch (Exception) { }` vazios compilam sem nenhum aviso, e é por isso que tanta gente escreve. O efeito é o da importação do começo da aula: a falha some, a pilha vai junto e o programa segue com um estado falso. Capture só o tipo que você sabe tratar e, no `catch`, faça algo de verdade: valor padrão com registro no log, nova tentativa, tradução para um resultado. Se só quer registrar, registre e use `throw;`. O resto sobe até um ponto único, na borda do programa, que registra a exceção completa e encerra com código de erro.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\ntry\n{\n    var conta = new Conta(saldoInicial: 100m);\n    Resultado saque = conta.Sacar(250m);\n    Console.WriteLine(saque.Sucesso ? \"Saque feito\" : $\"Saque recusado: {saque.Erro}\");\n}\ncatch (Exception ex)                         // um ponto único, na borda do programa\n{\n    Console.Error.WriteLine($\"Falha inesperada: {ex}\");   // registra tudo, com a pilha\n    return 1;                                // sai com código de erro, sem fingir sucesso\n}\nreturn 0;\n\npublic readonly record struct Resultado(bool Sucesso, string? Erro = null)\n{\n    public static Resultado Ok() => new(true);\n    public static Resultado Falha(string erro) => new(false, erro);\n}\n\npublic class Conta(decimal saldoInicial)\n{\n    public decimal Saldo { get; private set; } = saldoInicial;\n\n    public Resultado Sacar(decimal valor)\n    {\n        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(valor); // bug de quem chamou\n        if (valor > Saldo)\n            return Resultado.Falha(\"saldo insuficiente\");          // rotina do negócio\n        Saldo -= valor;\n        return Resultado.Ok();\n    }\n}\n\n// Saída:\n// Saque recusado: saldo insuficiente",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\",\"O que fazer\",\"Por quê\"],[\"Argumento nulo ou fora da faixa\",\"Lançar (`ThrowIfNull`, `ThrowIfNegativeOrZero`)\",\"É bug de quem chamou: falhar cedo e alto\"],[\"Método chamado na hora errada (objeto já fechado)\",\"Lançar `InvalidOperationException` ou `ObjectDisposedException`\",\"Quem chamou quebrou o contrato da classe\"],[\"Saldo insuficiente, cupom vencido, CPF repetido\",\"Devolver um resultado\",\"Desfecho esperado, que a tela trata sempre\"],[\"Texto digitado que pode não ser número\",\"`TryParse`\",\"Entrada ruim é rotina, não exceção\"],[\"Banco fora do ar, disco cheio, rede caiu\",\"Deixar subir até a borda do programa\",\"Ninguém ali consegue resolver\"],[\"Só quer registrar e deixar a falha seguir\",\"Registrar e usar `throw;`\",\"Mantém a pilha original\"]]",
                    },
                    {
                        type: "quote",
                        value: "Capture só o que você sabe tratar, relance com `throw;` e guarde a causa em `InnerException` quando acrescentar contexto. Desfecho esperado do negócio vira resultado; exceção fica para o que é de fato excepcional.",
                    },
                ],
                questions: [
                    {
                        statement: "Dentro de um `catch (Exception ex)`, qual é a diferença entre relançar com `throw;` e com `throw ex;`?",
                        difficulty: "facil",
                        options: [
                            { text: "`throw;` mantém a pilha original da falha; `throw ex;` faz a pilha recomeçar na linha do catch", isCorrect: true },
                            { text: "Nenhuma: as duas relançam o mesmo objeto, então a pilha registrada no log é sempre a mesma", isCorrect: false },
                            { text: "`throw;` cria uma exceção nova com a original em InnerException; `throw ex;` relança a mesma", isCorrect: false },
                            { text: "`throw ex;` mantém a pilha original da falha; `throw;` faz a pilha recomeçar na linha do catch", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um colega envolveu a gravação do pedido no banco com `catch (Exception) { }` para o sistema não cair. Qual é o problema desse código?",
                        difficulty: "facil",
                        options: [
                            { text: "Não compila, porque o C# exige pelo menos uma instrução dentro de cada catch", isCorrect: false },
                            { text: "O catch vazio relança a exceção no fim do bloco, então a proteção não funciona", isCorrect: false },
                            { text: "Nenhum, porque o .NET registra sozinho no log toda exceção que cai num catch vazio", isCorrect: false },
                            { text: "A falha some sem rastro e o programa segue como se o pedido tivesse sido gravado", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Você vai criar `PagamentoRecusadoException` num projeto .NET 10. Qual definição segue a recomendação atual da documentação?",
                        difficulty: "medio",
                        options: [
                            { text: "Derivar de ApplicationException, que separa as exceções da aplicação das exceções lançadas pelo próprio runtime", isCorrect: false },
                            { text: "Derivar de Exception e incluir o construtor com SerializationInfo, exigido para atravessar processos", isCorrect: false },
                            { text: "Derivar de SystemException e oferecer só o construtor com mensagem, o único usado na prática pelo código", isCorrect: false },
                            { text: "Derivar de Exception e ter os construtores sem parâmetro, com mensagem e com mensagem mais exceção interna", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O método `Sacar` atende pedidos de saque vindos de um app. Saldo insuficiente acontece dezenas de vezes por dia, e o app precisa mostrar o motivo. Pelo critério da aula, como `Sacar` deve informar esse caso?",
                        difficulty: "medio",
                        options: [
                            { text: "Lançando InvalidOperationException, porque toda regra de negócio violada é uma exceção", isCorrect: false },
                            { text: "Devolvendo um resultado de falha com o motivo, por ser um desfecho esperado do negócio", isCorrect: true },
                            { text: "Devolvendo o saldo zerado, porque o app entende o zero como saque que foi recusado", isCorrect: false },
                            { text: "Lançando Exception com a mensagem, porque assim o app captura tudo num ponto só da tela", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que este trecho imprime?\n\n```csharp\ntry\n{\n    try\n    {\n        Console.Write(\"1\");\n        throw new FormatException();\n    }\n    catch (FormatException)\n    {\n        Console.Write(\"2\");\n        throw new InvalidOperationException();\n    }\n    finally\n    {\n        Console.Write(\"3\");\n    }\n}\ncatch (InvalidOperationException)\n{\n    Console.Write(\"4\");\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "124", isCorrect: false },
                            { text: "1234", isCorrect: true },
                            { text: "1243", isCorrect: false },
                            { text: "123", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Recursos: IDisposable, using e await using",
                blocks: [
                    {
                        type: "text",
                        value: "# Recursos: IDisposable, using e await using\n\nUm serviço de relatórios funciona por horas e, de repente, começa a falhar com \"Too many open files\" no Linux, ou com o pool de conexões do banco esgotado. A memória está ótima. O problema é outro: o coletor de lixo (GC) cuida de memória, não de arquivo aberto, socket ou conexão.\n\nO GC coleta quando ele decide, pela pressão de alocação, e não no momento em que você parou de usar o objeto. Até lá, o arquivo continua aberto e a conexão continua fora do pool. Os finalizadores até liberam esses recursos, mas sem hora marcada. Por isso os tipos que seguram recurso do sistema operacional implementam `IDisposable`, com um método `Dispose()` que libera na hora. A regra de bolso: **quem cria, descarta**. Se você criou um objeto `IDisposable`, chamar `Dispose` é responsabilidade sua, e o jeito certo de chamar é o `using`.\n\n## using em bloco e em declaração\n\nO `using` em bloco descarta ao fechar a chave. A declaração `using var`, que existe desde o C# 8, descarta no fim do escopo onde está, normalmente o fim do método. Com várias declarações no mesmo escopo, o descarte acontece na ordem inversa da criação, como numa pilha: o que foi aberto por último fecha primeiro.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nConsole.WriteLine(\"== bloco\");\nusing (var conexao = new Recurso(\"conexão\"))\n{\n    Console.WriteLine(\"usando a conexão\");\n}                                   // Dispose aqui, ao fechar a chave\n\nConsole.WriteLine(\"== declaração\");\nProcessar();\n\nstatic void Processar()\n{\n    using var arquivo = new Recurso(\"arquivo\");\n    using var trava = new Recurso(\"trava\");\n    Console.WriteLine(\"trabalhando\");\n}                                   // Dispose aqui, no fim do método, em ordem inversa\n\nsealed class Recurso(string nome) : IDisposable\n{\n    public void Dispose() => Console.WriteLine($\"Dispose de {nome}\");\n}\n\n// Saída:\n// == bloco\n// usando a conexão\n// Dispose de conexão\n// == declaração\n// trabalhando\n// Dispose de trava\n// Dispose de arquivo",
                    },
                    {
                        type: "text",
                        value: "## O que o using vira, e a armadilha do escopo\n\nO `using` é açúcar para `try`/`finally`: o compilador põe o seu código num `try` e chama `Dispose` num `finally`. Por isso o descarte acontece mesmo quando uma exceção estoura no meio do bloco, e acontece antes de qualquer `catch` mais externo rodar.\n\nA declaração `using var` deixa o código mais limpo, mas segura o recurso até o fim do escopo, e isso pega muita gente. O `StreamWriter` acumula o texto num buffer e só grava no disco no `Flush` ou no `Dispose`. Se você escreve e lê o mesmo arquivo dentro do mesmo método, o escritor ainda não foi descartado na hora da leitura. No Linux, a leitura volta vazia; no Windows, o arquivo ainda aberto para escrita faz a leitura falhar com `IOException`. A correção é um `using` em bloco em volta da escrita.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar caminho = Path.Combine(Path.GetTempPath(), \"pedido.txt\");\nConsole.WriteLine($\"Errado: [{GravarELer(caminho)}]\");\nConsole.WriteLine($\"Certo:  [{GravarELerCerto(caminho)}]\");\n\nstatic string GravarELer(string caminho)\n{\n    using var escritor = new StreamWriter(caminho);\n    escritor.Write(\"pedido 42\");\n    return File.ReadAllText(caminho);   // o texto ainda está no buffer do escritor\n}                                       // o Dispose, que grava e fecha, só roda aqui\n\nstatic string GravarELerCerto(string caminho)\n{\n    using (var escritor = new StreamWriter(caminho))\n    {\n        escritor.Write(\"pedido 42\");\n    }                                   // Dispose aqui: buffer gravado, arquivo fechado\n    return File.ReadAllText(caminho);\n}\n\n// Saída no Linux:\n// Errado: []\n// Certo:  [pedido 42]",
                    },
                    {
                        type: "text",
                        value: "## Implementando IDisposable\n\nSe a sua classe cria e guarda num campo algo `IDisposable`, ela passa a ser dona do recurso e também precisa ser `IDisposable`, descartando o que criou. Para a grande maioria das classes, basta isto:\n\n- Classe `sealed` com um `Dispose()` que descarta os campos. O padrão completo, com `protected virtual void Dispose(bool)`, existe para classes feitas para herança. Finalizador só entra quando a classe segura direto um handle não gerenciado (o identificador cru que o sistema operacional devolve ao abrir um arquivo ou socket), o que é raro, e mesmo aí o melhor é embrulhar o handle num `SafeHandle`, que já traz o finalizador.\n- `Dispose` pode ser chamado mais de uma vez sem quebrar.\n- Depois do descarte, os métodos lançam `ObjectDisposedException`, com `ObjectDisposedException.ThrowIf(_descartado, this)`.\n- Não descarte o que você recebeu de fora, como um `Stream` passado por parâmetro: quem criou é que descarta. `new StreamReader(stream, leaveOpen: true)` lê sem fechar o stream de quem chamou.\n\nE nem todo `IDisposable` deve ser descartado a cada uso. O `HttpClient` foi feito para durar: cada instância tem o próprio pool de conexões. Muita gente escreve `using var http = new HttpClient();` dentro do método que chama a API; sob carga, as conexões fechadas ficam em TIME_WAIT (estado em que o sistema segura a porta por um tempo depois do fechamento), as portas locais se esgotam e aparecem `SocketException`. O certo é uma instância compartilhada, com `PooledConnectionLifetime` para renovar as conexões e respeitar mudanças de DNS, ou clientes criados pela `IHttpClientFactory` em aplicações com injeção de dependência.",
                    },
                    {
                        type: "code",
                        value: "// RegistroDeAuditoria.cs\npublic sealed class RegistroDeAuditoria : IDisposable\n{\n    private readonly StreamWriter _escritor;   // criado por esta classe: ela descarta\n    private bool _descartado;\n\n    public RegistroDeAuditoria(string caminho)\n        => _escritor = new StreamWriter(caminho, append: true);\n\n    public void Registrar(string evento)\n    {\n        ObjectDisposedException.ThrowIf(_descartado, this);\n        _escritor.WriteLine($\"{DateTime.UtcNow:O} {evento}\");\n    }\n\n    public void Dispose()\n    {\n        if (_descartado) return;               // chamar duas vezes não pode quebrar\n        _descartado = true;\n        _escritor.Dispose();\n    }\n}\n\n// Http.cs: HttpClient é feito para durar; um só para o programa inteiro\npublic static class Http\n{\n    public static readonly HttpClient Cliente = new(new SocketsHttpHandler\n    {\n        PooledConnectionLifetime = TimeSpan.FromMinutes(5)  // renova conexões, respeita DNS novo\n    });\n}",
                    },
                    {
                        type: "text",
                        value: "## IAsyncDisposable e await using\n\nAlguns recursos precisam fazer I/O para fechar: gravar no disco o que sobrou no buffer, avisar o servidor que a conexão vai cair. Num `Dispose` síncrono, essa escrita bloqueia a thread. A interface `IAsyncDisposable` define `ValueTask DisposeAsync()`, e o `await using` chama esse método no lugar do `Dispose`. Ele funciona nas duas formas, em bloco e em declaração.\n\n`FileStream`, `StreamWriter` e as conexões de banco implementam as duas interfaces; em método `async`, prefira `await using`. Já o `HttpClient` só implementa `IDisposable`, e `await using var http = new HttpClient();` nem compila (erro CS8417).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar caminho = Path.Combine(Path.GetTempPath(), \"pedidos.csv\");\nawait ExportarAsync(caminho, [\"id;valor\", \"42;199.90\", \"43;35.00\"]);\nConsole.Write(await File.ReadAllTextAsync(caminho));\n\nstatic async Task ExportarAsync(string caminho, string[] linhas)\n{\n    await using var exportador = new ExportadorCsv(caminho);\n    foreach (var linha in linhas)\n        await exportador.EscreverAsync(linha);\n}   // DisposeAsync aqui: grava o que sobrou no buffer sem bloquear quem chamou\n\npublic sealed class ExportadorCsv(string caminho) : IAsyncDisposable\n{\n    private readonly StreamWriter _escritor = new(caminho);\n\n    public Task EscreverAsync(string linha) => _escritor.WriteLineAsync(linha);\n\n    public ValueTask DisposeAsync() => _escritor.DisposeAsync();\n}\n\n// Saída:\n// id;valor\n// 42;199.90\n// 43;35.00",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo\",\"O que segura\",\"Como descartar\"],[\"`FileStream`, `StreamWriter`\",\"Arquivo aberto e buffer\",\"`await using` em método async, `using` no resto\"],[\"Conexão de banco (`DbConnection`)\",\"Uma conexão do pool\",\"`await using`; o descarte devolve a conexão ao pool\"],[\"`HttpClient`\",\"Pool de conexões HTTP\",\"Não descartar a cada uso: uma instância compartilhada\"],[\"`CancellationTokenSource`\",\"Temporizador interno do `CancelAfter`\",\"`using`\"],[\"`Stream` recebido por parâmetro\",\"Recurso de quem chamou\",\"Não descartar: quem cria, descarta\"],[\"Classe sem `IDisposable`\",\"Só memória\",\"Nada: o GC cuida\"]]",
                    },
                    {
                        type: "quote",
                        value: "O GC cuida de memória; arquivo, conexão e socket se devolvem com `Dispose`, chamado pelo `using` ou pelo `await using`. Quem cria descarta, e o que foi feito para durar, como o `HttpClient`, se reutiliza.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que não basta deixar o coletor de lixo (GC) cuidar de um `FileStream` que você abriu e parou de usar?",
                        difficulty: "facil",
                        options: [
                            { text: "O GC fecha o arquivo assim que a variável sai de escopo, igual ao using", isCorrect: false },
                            { text: "O GC coleta num momento imprevisível, e até lá o arquivo continua aberto", isCorrect: true },
                            { text: "O GC só cuida de tipos de valor; objetos de referência dependem do Dispose", isCorrect: false },
                            { text: "O GC nunca coleta objetos que guardam um handle do sistema operacional", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A classe `Recurso` imprime `Dispose de` seguido do nome quando é descartada. O que o método abaixo imprime ao ser chamado?\n\n```csharp\nstatic void Importar()\n{\n    using var conexao = new Recurso(\"conexão\");\n    using var transacao = new Recurso(\"transação\");\n    Console.WriteLine(\"gravando\");\n}\n```",
                        difficulty: "facil",
                        options: [
                            { text: "Dispose de conexão, Dispose de transação, gravando", isCorrect: false },
                            { text: "gravando, Dispose de transação, Dispose de conexão", isCorrect: true },
                            { text: "gravando, e nenhum Dispose, porque faltam as chaves do using", isCorrect: false },
                            { text: "gravando, Dispose de conexão, Dispose de transação", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um serviço faz `using var http = new HttpClient();` dentro do método que chama uma API, executado milhares de vezes por minuto. O que costuma acontecer sob essa carga?",
                        difficulty: "medio",
                        options: [
                            { text: "Nada de ruim, porque o Dispose devolve a conexão a um pool global do processo", isCorrect: false },
                            { text: "As conexões fechadas ficam em TIME_WAIT e as portas locais podem se esgotar", isCorrect: true },
                            { text: "O using é ignorado em silêncio, porque o HttpClient não implementa IDisposable", isCorrect: false },
                            { text: "Só o GC sofre, porque cada HttpClient novo reaproveita o socket do anterior", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num método `async`, por que preferir `await using var escritor = new StreamWriter(caminho);` ao `using` comum?",
                        difficulty: "medio",
                        options: [
                            { text: "O using comum não compila com StreamWriter, que só implementa a IAsyncDisposable", isCorrect: false },
                            { text: "O await using descarta em paralelo todos os recursos declarados no mesmo método", isCorrect: false },
                            { text: "O descarte chama DisposeAsync, que grava o buffer pendente sem bloquear quem chamou", isCorrect: true },
                            { text: "O await using descarta o escritor antes da última escrita, liberando o arquivo antes", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Rodando no Linux, o que este método devolve?\n\n```csharp\nstatic string GravarELer(string caminho)\n{\n    using var escritor = new StreamWriter(caminho);\n    escritor.Write(\"pedido 42\");\n    return File.ReadAllText(caminho);\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "O texto pedido 42, porque o using var descarta o escritor antes do return", isCorrect: false },
                            { text: "Uma string vazia, porque o texto ainda está no buffer do escritor", isCorrect: true },
                            { text: "Lança ObjectDisposedException, porque o escritor já foi descartado", isCorrect: false },
                            { text: "O texto pedido 42, porque Write grava direto no disco a cada chamada", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "async e await: o que acontece de verdade",
                blocks: [
                    {
                        type: "text",
                        value: "# async e await: o que acontece de verdade\n\nUm serviço que atende mil requisições ao mesmo tempo, cada uma esperando 50 ms pelo banco de dados, passa quase todo o tempo esperando. Se cada espera segurasse uma thread, seriam mil threads paradas, cada uma com memória reservada para a pilha. E o pool de threads do .NET, o conjunto de threads que o runtime reaproveita entre tarefas, cria threads novas devagar quando as que existem estão ocupadas. O resultado é fila, lentidão e, sob carga, um serviço que parece travado.\n\nProgramação assíncrona resolve a espera. Enquanto a resposta não chega, nenhuma thread fica parada esperando: ela volta ao pool e atende outro trabalho. Quando a resposta chega, o .NET retoma o método de onde ele parou. O experimento abaixo mostra a diferença com 100 esperas de 1 segundo, feitas com `Task.Delay` (espera assíncrona) e com `Thread.Sleep` (espera que bloqueia a thread). `Task.WhenAll` espera todas as tarefas de uma lista terminarem.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: 100 esperas de 1 segundo, de dois jeitos\nusing System.Diagnostics;\n\nawait Medir(\"Task.Delay  \", () => Task.Delay(1000));\nawait Medir(\"Thread.Sleep\", () => Task.Run(() => Thread.Sleep(1000)));\n\nstatic async Task Medir(string nome, Func<Task> esperar)\n{\n    var relogio = Stopwatch.StartNew();\n    await Task.WhenAll(Enumerable.Range(0, 100).Select(_ => esperar()));  // espera as 100\n    Console.WriteLine($\"100 x {nome}: {relogio.Elapsed.TotalSeconds:F1} s, \" +\n                      $\"threads no pool: {ThreadPool.ThreadCount}\");\n}\n\n// Saída numa máquina de 12 núcleos (os números variam um pouco):\n// 100 x Task.Delay  : 1,0 s, threads no pool: 4\n// 100 x Thread.Sleep: 8,0 s, threads no pool: 14",
                    },
                    {
                        type: "text",
                        value: "## Task e Task<T>\n\n`Task` representa uma operação que termina no futuro; `Task<T>` representa uma que vai produzir um `T`. É uma promessa com estado (em andamento, concluída, com falha, cancelada) que guarda o resultado ou a exceção. `await tarefa` espera sem bloquear e entrega o `T`; se a operação falhou, o `await` relança a exceção original, com o tipo original.\n\nUm método marcado com `async` pode usar `await` e devolve `Task` ou `Task<T>`; por convenção, o nome termina em `Async`. As APIs de I/O do .NET têm versões assíncronas: `HttpClient.GetStringAsync`, `File.ReadAllTextAsync`, `Stream.ReadAsync` e os drivers de banco de dados.\n\nSendo preciso sobre threads: rede (HTTP, banco, sockets) não ocupa thread nenhuma durante a espera, porque o sistema operacional avisa quando o dado chega (IOCP no Windows, epoll no Linux); `Task.Delay` também não, porque quem espera é um temporizador. Arquivo é o caso diferente: no Linux, o .NET executa a leitura assíncrona de arquivo numa thread do pool. A API assíncrona continua valendo a pena, porque não bloqueia quem chamou, mas ali a espera não sai de graça.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing System.Text.Json;\n\nvar http = new HttpClient { BaseAddress = new Uri(\"https://api.github.com/\") };\nhttp.DefaultRequestHeaders.UserAgent.ParseAdd(\"estudo-csharp\");   // a API do GitHub exige\n\nint estrelas = await ContarEstrelasAsync(http, \"dotnet/runtime\");\nConsole.WriteLine($\"dotnet/runtime tem {estrelas} estrelas\");\n\nstatic async Task<int> ContarEstrelasAsync(HttpClient http, string repositorio)\n{\n    // No await, a thread volta ao pool enquanto a resposta não chega\n    string json = await http.GetStringAsync($\"repos/{repositorio}\");\n    using JsonDocument doc = JsonDocument.Parse(json);   // daqui em diante, já com a resposta\n    return doc.RootElement.GetProperty(\"stargazers_count\").GetInt32();\n}",
                    },
                    {
                        type: "text",
                        value: "## O que o await faz de fato\n\nO compilador transforma cada método `async` numa máquina de estados. Na execução, acontece isto:\n\n1. O método roda de forma síncrona, na thread de quem chamou, até o primeiro `await` de uma tarefa que ainda não terminou.\n2. Nesse `await`, a máquina de estados guarda as variáveis locais e o ponto de parada, registra o resto do método como continuação da tarefa e devolve a quem chamou uma `Task` incompleta. A thread fica livre.\n3. Quando a tarefa termina, a continuação é agendada. Se havia um `SynchronizationContext` capturado, como a thread de UI de um app de desktop, ela volta para ele. No console e no ASP.NET Core não há contexto, e a continuação roda numa thread qualquer do pool, muitas vezes outra.\n4. Se a tarefa já estava concluída no momento do `await`, nada é suspenso: o método simplesmente segue em frente.\n\nO `await` não cria thread. Ele marca o ponto onde o método pode ser suspenso sem prender ninguém.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nConsole.WriteLine($\"1. Main começa na thread {Environment.CurrentManagedThreadId}\");\nTask tarefa = ProcessarAsync();\nConsole.WriteLine(\"3. Main recebeu a Task ainda incompleta e seguiu\");\nawait tarefa;\nConsole.WriteLine($\"5. Main retoma na thread {Environment.CurrentManagedThreadId}\");\n\nstatic async Task ProcessarAsync()\n{\n    Console.WriteLine(\"2. Até o primeiro await, roda na thread de quem chamou\");\n    await Task.Delay(100);\n    Console.WriteLine($\"4. Depois do await, na thread {Environment.CurrentManagedThreadId}\");\n}\n\n// Saída (o número da thread do pool varia):\n// 1. Main começa na thread 1\n// 2. Até o primeiro await, roda na thread de quem chamou\n// 3. Main recebeu a Task ainda incompleta e seguiu\n// 4. Depois do await, na thread 5\n// 5. Main retoma na thread 5",
                    },
                    {
                        type: "table",
                        value: "[[\"Retorno do método async\",\"Quando usar\"],[\"`Task`\",\"Operação que não devolve valor\"],[\"`Task<T>`\",\"Operação que devolve um `T`\"],[\"`ValueTask<T>`\",\"Caminho muito usado que quase sempre termina sem esperar (tem regras próprias)\"],[\"`void`\",\"Só em manipulador de evento; fora disso, é uma armadilha\"],[\"`IAsyncEnumerable<T>`\",\"Sequência que chega aos poucos, consumida com `await foreach`\"]]",
                    },
                    {
                        type: "text",
                        value: "## Async não acelera conta, e o await esquecido\n\nAsync ajuda a esperar I/O; não deixa cálculo mais rápido. Somar milhões de números que já estão na memória leva o mesmo tempo com ou sem `async`, porque não há espera para aproveitar. Para tirar um cálculo pesado da thread de UI de um app de desktop, existe `Task.Run`; num servidor, `Task.Run` só troca uma thread do pool por outra.\n\nDepois que um método faz `await`, quem o chama também deve ser `async` e esperar com `await`, até o topo do programa: é o async de ponta a ponta. Misturar com `.Result` e `.Wait()` causa os problemas que aparecem mais adiante neste módulo.\n\nO erro mais comum é esquecer o `await`. Dentro de um método `async`, chamar algo que devolve `Task` e descartar o resultado gera o aviso CS4014: a operação fica solta, o método segue antes de ela terminar, e uma exceção lá dentro se perde. Trate esse aviso como erro.",
                    },
                    {
                        type: "quote",
                        value: "`await` não cria thread nem bloqueia: ele devolve a thread ao pool enquanto a operação espera e retoma o método quando ela termina. Por isso async rende em I/O e não muda nada em cálculo puro.",
                    },
                ],
                questions: [
                    {
                        statement: "Num método `async`, o que acontece quando a execução chega a um `await` de uma `Task` que ainda não terminou?",
                        difficulty: "facil",
                        options: [
                            { text: "A thread atual fica bloqueada até a Task terminar, como no Wait, só que sem a AggregateException", isCorrect: false },
                            { text: "A Task passa a rodar na thread atual, de forma síncrona, para garantir a ordem do código do método", isCorrect: false },
                            { text: "O método devolve o controle a quem chamou, e o resto dele é agendado para quando a Task terminar", isCorrect: true },
                            { text: "O await cria uma thread nova só para esperar a Task, e a thread original segue livre para o resto", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um programa de console soma 50 milhões de números que já estão na memória. Reescrever o método como `async`, devolvendo `Task<long>`, faz a soma terminar mais rápido?",
                        difficulty: "facil",
                        options: [
                            { text: "Não: async só funciona em aplicações web, e no console vira código síncrono", isCorrect: false },
                            { text: "Não: async ajuda a esperar I/O sem prender thread, não a fazer conta mais rápido", isCorrect: true },
                            { text: "Sim: cada await divide a soma entre os núcleos disponíveis na máquina do usuário", isCorrect: false },
                            { text: "Sim: o await libera a CPU durante o laço, e a soma roda com menos concorrência", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que este programa de console imprime?\n\n```csharp\nConsole.WriteLine(\"1\");\nTask t = TrabalharAsync();\nConsole.WriteLine(\"3\");\nawait t;\nConsole.WriteLine(\"5\");\n\nstatic async Task TrabalharAsync()\n{\n    Console.WriteLine(\"2\");\n    await Task.Delay(100);\n    Console.WriteLine(\"4\");\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "1 3 2 4 5", isCorrect: false },
                            { text: "1 2 3 4 5", isCorrect: true },
                            { text: "1 3 5 2 4", isCorrect: false },
                            { text: "1 2 4 3 5", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num programa de console, o código que vem depois de um `await Task.Delay(100);` roda em qual thread?",
                        difficulty: "medio",
                        options: [
                            { text: "Numa thread qualquer do pool, porque não existe SynchronizationContext para onde ela volte", isCorrect: true },
                            { text: "Sempre na mesma thread de antes, porque o await reserva a thread até a continuação poder rodar", isCorrect: false },
                            { text: "Sempre numa thread nova, criada pelo próprio await só para continuar a execução do método", isCorrect: false },
                            { text: "Sempre na thread principal, porque o console processa as continuações numa fila só dele", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Numa máquina de 12 núcleos, 100 tarefas `Task.Run(() => Thread.Sleep(1000))` esperadas com `Task.WhenAll` levaram cerca de 8 segundos, enquanto 100 `Task.Delay(1000)` levaram 1 segundo. O que explica a diferença?",
                        difficulty: "dificil",
                        options: [
                            { text: "O WhenAll espera as tarefas do Task.Run uma de cada vez, e as do Delay todas ao mesmo tempo", isCorrect: false },
                            { text: "Cada Sleep prende uma thread do pool, que cresce devagar; já o Delay espera sem ocupar thread", isCorrect: true },
                            { text: "O Sleep acumula o erro de precisão do relógio a cada chamada, e o Delay usa um relógio exato", isCorrect: false },
                            { text: "O compilador junta as 100 chamadas de Task.Delay numa espera só, coisa que não faz com o Sleep", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Armadilhas do async",
                blocks: [
                    {
                        type: "text",
                        value: "# Armadilhas do async\n\nCódigo assíncrono costuma falhar de um jeito que não aparece nos testes: o app de desktop congela no clique, uma exceção some, o processo cai de madrugada sem ninguém entender por quê. Quase sempre a causa é uma destas quatro armadilhas.\n\n## async void\n\nUm método `async void` não devolve `Task`, então ninguém consegue esperar por ele nem capturar as suas exceções. A exceção é relançada no contexto de sincronização; no console, que não tem contexto, ela vai parar numa thread do pool e derruba o processo. O `try`/`catch` em volta da chamada não vê nada, porque a chamada já voltou quando a exceção acontece.\n\nO único uso legítimo é o manipulador de evento, como o clique de um botão, porque a assinatura do evento exige `void`. Mesmo ali, envolva o corpo num `try`/`catch`.\n\nCuidado com o `async void` escondido: uma lambda async passada onde se espera uma `Action` vira `async void`. `lista.ForEach(async item => ...)` e `Parallel.ForEach(itens, async item => ...)` compilam sem nenhum aviso, e ninguém espera o trabalho terminar.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\ntry\n{\n    GravarAsync();                    // async void: não há Task para esperar\n}\ncatch (Exception ex)\n{\n    Console.WriteLine($\"capturei: {ex.Message}\");   // nunca roda\n}\nawait Task.Delay(500);\nConsole.WriteLine(\"fim\");             // nunca chega aqui\n\nstatic async void GravarAsync()\n{\n    await Task.Delay(100);\n    throw new InvalidOperationException(\"disco cheio\");\n}\n\n// Saída: o processo cai, e o catch acima não vê nada\n// Unhandled exception. System.InvalidOperationException: disco cheio\n//\n// Correção: static async Task GravarAsync() e, na chamada, await GravarAsync();",
                    },
                    {
                        type: "text",
                        value: "## .Result, .Wait() e o deadlock\n\n`.Result`, `.Wait()` e `.GetAwaiter().GetResult()` bloqueiam a thread atual até a tarefa terminar. O deadlock clássico, o impasse em que cada lado espera o outro para sempre, acontece quando essa thread pertence a um `SynchronizationContext` que executa tudo numa thread só: a thread de UI do WinForms e do WPF, ou o contexto de requisição do ASP.NET clássico, do .NET Framework. A sequência:\n\n1. O clique do botão chama `BaixarAsync(url).Result` na thread de UI.\n2. Dentro de `BaixarAsync`, o `await` captura o contexto da UI e o método devolve uma `Task` incompleta.\n3. O `.Result` bloqueia a thread de UI esperando essa `Task`.\n4. O download termina, e a continuação de `BaixarAsync` é agendada no contexto da UI, que só roda na thread de UI, bloqueada no passo 3. Ninguém anda, e a janela congela para sempre.\n\nNo console e no ASP.NET Core não existe `SynchronizationContext`: a continuação roda em outra thread do pool, e esse deadlock não acontece. O `.Result` continua ruim mesmo assim. Ele prende uma thread sem fazer nada, e sob carga muitas threads presas esgotam o pool, o que parece um travamento e leva segundos para se desfazer. Ele também embrulha a falha numa `AggregateException`, enquanto o `await` lança a exceção original.\n\nA correção é async de ponta a ponta. Já o `ConfigureAwait(false)` diz ao `await` que ele não precisa voltar ao contexto capturado. É a regra em **biblioteca de uso geral**, que não sabe se vai rodar atrás de uma tela: a continuação deixa de depender da thread de UI, o que tira o deadlock de quem bloqueia e poupa a volta até ela. Em código de aplicação, não use: no ASP.NET Core e no console ele não muda nada, porque não há contexto, e num app de desktop o código depois do `await` pode cair fora da thread de UI e perder o direito de mexer na tela.",
                    },
                    {
                        type: "code",
                        value: "// TelaPedidos.cs (WinForms): o clique roda na thread de UI\npublic class TelaPedidos : Form\n{\n    private static readonly HttpClient Http = new();\n    private readonly Label _rotulo = new() { AutoSize = true };\n\n    public TelaPedidos() => Controls.Add(_rotulo);\n\n    // TRAVA: o .Result bloqueia a thread de UI, e a continuação de\n    // BaixarAsync foi agendada justamente nessa thread\n    private void BotaoCarregar_Click(object? sender, EventArgs e)\n    {\n        string html = BaixarAsync(\"https://example.com\").Result;\n        _rotulo.Text = $\"{html.Length} caracteres\";\n    }\n\n    // CERTO: async de ponta a ponta (async void só porque é evento)\n    private async void BotaoCarregarCerto_Click(object? sender, EventArgs e)\n    {\n        try\n        {\n            string html = await BaixarAsync(\"https://example.com\");\n            _rotulo.Text = $\"{html.Length} caracteres\";   // de volta na thread de UI\n        }\n        catch (HttpRequestException ex)\n        {\n            _rotulo.Text = $\"Falha: {ex.Message}\";\n        }\n    }\n\n    private static async Task<string> BaixarAsync(string url)\n    {\n        string html = await Http.GetStringAsync(url);    // captura o contexto da UI\n        return html.Trim();\n    }\n}\n\n// Numa biblioteca, que não sabe se vai rodar atrás de uma tela:\npublic static class Downloads\n{\n    public static async Task<string> BaixarAsync(HttpClient http, string url)\n    {\n        string html = await http.GetStringAsync(url).ConfigureAwait(false);\n        return html.Trim();          // aqui pode ser qualquer thread do pool\n    }\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Onde o código roda\",\"Tem SynchronizationContext?\",\"`.Result` dá o deadlock clássico?\",\"`ConfigureAwait(false)`\"],[\"Console\",\"Não\",\"Não, mas prende uma thread\",\"Não muda nada\"],[\"ASP.NET Core\",\"Não\",\"Não, mas sob carga esgota o pool\",\"Não muda nada\"],[\"WinForms e WPF (thread de UI)\",\"Sim, de uma thread só\",\"Sim\",\"Não use antes de mexer na tela\"],[\"ASP.NET clássico (.NET Framework)\",\"Sim, o da requisição\",\"Sim\",\"Ajuda, mas o certo é async de ponta a ponta\"],[\"Biblioteca de uso geral\",\"Depende de quem chama\",\"Pode travar quem chama\",\"Use em todo `await`\"]]",
                    },
                    {
                        type: "text",
                        value: "## Cancelamento com CancellationToken\n\nToda operação longa precisa poder parar: o usuário desistiu, o tempo limite estourou, o programa está encerrando. No .NET o cancelamento é cooperativo. Quem decide cancelar tem um `CancellationTokenSource`; a operação recebe o `CancellationToken` dele e o repassa a cada chamada assíncrona que faz (`HttpClient`, `Task.Delay`, leitura de arquivo). Num laço de CPU, chame `token.ThrowIfCancellationRequested()` a cada volta.\n\n- Por convenção, o token é o último parâmetro: `CancellationToken cancellationToken = default`.\n- O cancelamento chega como `OperationCanceledException` (ou a derivada `TaskCanceledException`). Capture `OperationCanceledException` e não trate como falha: é o desfecho esperado de quem pediu para parar.\n- Tempo limite: `cts.CancelAfter(TimeSpan.FromSeconds(5))`. Para somar um limite próprio a um token que veio de fora, use `CancellationTokenSource.CreateLinkedTokenSource(token)`.\n- `CancellationTokenSource` é `IDisposable`, porque usa um temporizador: crie com `using`.\n- `Wait(5000)` não cancela nada: só para de esperar e devolve `false`, e a tarefa segue rodando por trás. `Thread.Abort` não funciona no .NET moderno e lança `PlatformNotSupportedException`. E o `HttpClient` tem o próprio limite, a propriedade `Timeout`, de 100 segundos por padrão.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: Ctrl+C cancela tudo, e cada página tem no máximo 5 segundos\nusing var cts = new CancellationTokenSource();\nConsole.CancelKeyPress += (_, e) =>\n{\n    e.Cancel = true;        // não mata o processo: deixa o programa encerrar direito\n    cts.Cancel();\n};\n\nvar http = new HttpClient();\nstring[] paginas = [\"https://example.com\", \"https://example.org\"];\ntry\n{\n    foreach (var url in paginas)\n    {\n        int tamanho = await BaixarAsync(http, url, TimeSpan.FromSeconds(5), cts.Token);\n        Console.WriteLine($\"{url}: {tamanho} caracteres\");\n    }\n}\ncatch (OperationCanceledException) when (cts.IsCancellationRequested)\n{\n    Console.WriteLine(\"Cancelado pelo usuário.\");\n}\ncatch (OperationCanceledException)\n{\n    Console.WriteLine(\"Uma página passou do tempo limite.\");\n}\n\nstatic async Task<int> BaixarAsync(HttpClient http, string url, TimeSpan limite,\n    CancellationToken cancellationToken = default)\n{\n    using var porTempo = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);\n    porTempo.CancelAfter(limite);                   // cancela sozinho ao passar do limite\n    string html = await http.GetStringAsync(url, porTempo.Token);\n    return html.Length;\n}",
                    },
                    {
                        type: "text",
                        value: "## ValueTask, de passagem\n\n`ValueTask<T>` é uma struct que evita alocar uma `Task` quando o resultado quase sempre já está pronto, como num cache que só de vez em quando vai à rede. Ela aparece em APIs do próprio .NET, como `DisposeAsync`, `Stream.ReadAsync` com `Memory<byte>` e o corpo do `Parallel.ForEachAsync`. As regras são estritas, porque por trás dela pode haver um objeto reaproveitado:\n\n- Dê `await` uma vez só: nada de aguardar duas vezes, nem em paralelo.\n- Não leia `.Result` antes de ela terminar.\n- Precisa guardar, esperar de novo ou passar para `Task.WhenAll`? Converta uma única vez com `.AsTask()`.\n\nO padrão continua sendo `Task`. `ValueTask` só entra onde a medição mostrar que a alocação pesa.",
                    },
                    {
                        type: "code",
                        value: "// Cotacoes.cs: quase sempre responde da memória, raramente vai à rede\nusing System.Collections.Concurrent;\nusing System.Globalization;\n\npublic sealed class Cotacoes(HttpClient http)\n{\n    private readonly ConcurrentDictionary<string, decimal> _cache = new();\n\n    public ValueTask<decimal> ObterAsync(string moeda)\n    {\n        if (_cache.TryGetValue(moeda, out decimal valor))\n            return ValueTask.FromResult(valor);              // caminho comum: nenhuma Task alocada\n        return new ValueTask<decimal>(BuscarAsync(moeda));   // caminho raro: embrulha a Task\n    }\n\n    private async Task<decimal> BuscarAsync(string moeda)\n    {\n        string texto = await http.GetStringAsync($\"cotacoes/{moeda}\");\n        decimal valor = decimal.Parse(texto, CultureInfo.InvariantCulture);\n        _cache[moeda] = valor;\n        return valor;\n    }\n}\n\n// Certo:  decimal dolar = await cotacoes.ObterAsync(\"USD\");\n// Errado: var vt = cotacoes.ObterAsync(\"USD\"); await vt; await vt;\n// Precisa esperar de novo ou guardar? Converta uma vez: Task<decimal> t = vt.AsTask();",
                    },
                    {
                        type: "quote",
                        value: "`async void` só em evento, nada de `.Result` para esperar tarefa em andamento, token de cancelamento repassado até o fim e `ConfigureAwait(false)` em biblioteca. O deadlock clássico precisa de um contexto de uma thread só; no console e no ASP.NET Core, o `.Result` não trava, mas desperdiça thread.",
                    },
                ],
                questions: [
                    {
                        statement: "Em qual situação `async void` é aceitável?",
                        difficulty: "facil",
                        options: [
                            { text: "Em método curto, no qual criar uma Task pesaria no desempenho", isCorrect: false },
                            { text: "Em método que não devolve valor, como o que grava um log", isCorrect: false },
                            { text: "Em manipulador de evento, cuja assinatura exige retorno void", isCorrect: true },
                            { text: "Em método chamado uma única vez, na inicialização do programa", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual é o jeito certo de impor um limite de 5 segundos a uma operação assíncrona que aceita `CancellationToken`?",
                        difficulty: "facil",
                        options: [
                            { text: "Chamar Wait(5000) na Task da operação, que interrompe a operação assim que o tempo de espera acaba", isCorrect: false },
                            { text: "Chamar Thread.Abort na thread da operação quando um Timer de 5 segundos disparar o seu aviso", isCorrect: false },
                            { text: "Criar um CancellationTokenSource com CancelAfter de 5 segundos e passar o token dele à operação", isCorrect: true },
                            { text: "Envolver a chamada num try/catch de TimeoutException configurado com 5 segundos de espera", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um método de biblioteca faz `await` sem `ConfigureAwait(false)`. Em qual destes lugares chamar `.Result` na `Task` dele pode causar o deadlock clássico?",
                        difficulty: "medio",
                        options: [
                            { text: "Numa tarefa de Task.Run de um programa de console, numa thread do pool", isCorrect: false },
                            { text: "Num endpoint do ASP.NET Core, ao atender uma requisição HTTP", isCorrect: false },
                            { text: "No Main síncrono de um programa de console, na thread principal", isCorrect: false },
                            { text: "No clique de um botão de um app WPF, executado na thread de UI", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Qual destes usos de um `ValueTask<int>` devolvido por um método é proibido pela documentação?",
                        difficulty: "medio",
                        options: [
                            { text: "Chamar AsTask() uma vez para guardar o resultado como Task<int>", isCorrect: false },
                            { text: "Dar await uma única vez, na linha em que o método é chamado", isCorrect: false },
                            { text: "Devolver ValueTask<int> de um método async que tem await dentro", isCorrect: false },
                            { text: "Guardar o ValueTask numa variável e dar await nele duas vezes", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que acontece ao rodar este programa de console?\n\n```csharp\nvar pedidos = new List<int> { 1, 2, 3 };\npedidos.ForEach(async id =>\n{\n    await Task.Delay(100);\n    Console.WriteLine($\"pedido {id} gravado\");\n});\nConsole.WriteLine(\"fim\");\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Imprime os pedidos em ordem aleatória e depois fim, porque o ForEach roda em paralelo", isCorrect: false },
                            { text: "Não compila, porque o ForEach recebe Action<int> e a lambda async devolveria uma Task", isCorrect: false },
                            { text: "Imprime só fim: a lambda vira async void, o ForEach não espera e o programa termina antes", isCorrect: true },
                            { text: "Imprime os três pedidos gravados e depois fim, porque o ForEach espera cada lambda terminar", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Concorrência e condição de corrida",
                blocks: [
                    {
                        type: "text",
                        value: "# Concorrência e condição de corrida\n\nA tela de checkout consulta estoque, frete e preço em três serviços, um depois do outro: 1 s, mais 2 s, mais 3 s, seis segundos de espera. As três consultas não dependem uma da outra, então dá para disparar as três juntas e esperar só pela mais lenta. É o ganho fácil da concorrência. O preço vem junto: quando tarefas simultâneas mexem no mesmo dado, aparecem erros que raramente se repetem do mesmo jeito.\n\n## Task.WhenAll: começar tudo, esperar tudo\n\nChamar um método async sem `await` já dispara a operação. Guarde as tarefas e espere todas com `await Task.WhenAll(...)`: o total fica perto do tempo da mais lenta, e os resultados voltam na ordem em que as tarefas foram passadas, não na ordem em que terminaram.\n\nSe mais de uma falhar, o `await` lança só uma das exceções; a `Task` devolvida pelo `WhenAll` guarda todas em `Exception.InnerExceptions`. Qual delas o `await` lança não é algo garantido pela documentação, então não escreva código que dependa disso. Para reagir à primeira tarefa que terminar, existe `Task.WhenAny`; para tratar cada uma assim que termina, `Task.WhenEach` com `await foreach`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing System.Diagnostics;\n\nvar relogio = Stopwatch.StartNew();\nawait ConsultarAsync(\"estoque\", 1000);\nawait ConsultarAsync(\"frete\", 2000);\nawait ConsultarAsync(\"preço\", 3000);\nConsole.WriteLine($\"Uma por vez: {relogio.Elapsed.TotalSeconds:F1} s\");\n\nrelogio.Restart();\nTask<string> estoque = ConsultarAsync(\"estoque\", 1000);   // começa já\nTask<string> frete = ConsultarAsync(\"frete\", 2000);       // começa já\nTask<string> preco = ConsultarAsync(\"preço\", 3000);       // começa já\nstring[] respostas = await Task.WhenAll(estoque, frete, preco);\nConsole.WriteLine($\"Juntas: {relogio.Elapsed.TotalSeconds:F1} s ({string.Join(\", \", respostas)})\");\n\n// Quando várias falham, o await lança só uma; a Task do WhenAll guarda todas\nTask todas = Task.WhenAll(FalharAsync(\"A\", 300), FalharAsync(\"B\", 100));\ntry\n{\n    await todas;\n}\ncatch (Exception ex)\n{\n    Console.WriteLine($\"catch: {ex.Message}\");\n    foreach (var erro in todas.Exception!.InnerExceptions)\n        Console.WriteLine($\"  registrada: {erro.Message}\");\n}\n\nstatic async Task<string> ConsultarAsync(string servico, int ms)\n{\n    await Task.Delay(ms);          // no lugar de uma chamada HTTP\n    return servico;\n}\n\nstatic async Task FalharAsync(string servico, int ms)\n{\n    await Task.Delay(ms);\n    throw new InvalidOperationException($\"serviço {servico} fora do ar\");\n}\n\n// Saída (a ordem das falhas não é garantida pela documentação):\n// Uma por vez: 6,0 s\n// Juntas: 3,0 s (estoque, frete, preço)\n// catch: serviço B fora do ar\n//   registrada: serviço B fora do ar\n//   registrada: serviço A fora do ar",
                    },
                    {
                        type: "text",
                        value: "## Muitas tarefas, com limite: Parallel.ForEachAsync\n\nCom 10.000 chamadas, o `WhenAll` dispara as 10.000 de uma vez: sobrecarrega o serviço do outro lado, abre conexões demais e costuma render bloqueio por excesso de requisições. `Parallel.ForEachAsync` mantém no máximo `MaxDegreeOfParallelism` execuções em andamento. O corpo é uma lambda async que recebe o item e um `CancellationToken` e devolve `ValueTask`. Sem opções, o limite é `Environment.ProcessorCount`, pensado para CPU; para I/O, escolha o número de propósito. Medindo com `Task.Delay` no lugar da rede, numa máquina de 12 núcleos, o pico foi de 12 execuções simultâneas sem opções e de 20 com o limite em 20.\n\nNão confunda com `Parallel.ForEach`, que é para trabalho de CPU e recebe uma `Action`: com uma lambda async, cada iteração vira `async void`, termina no primeiro `await`, e o limite deixa de valer. Num teste, o `Parallel.ForEach` voltou com 0 de 5 itens processados.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: 200 consultas, nunca mais de 20 ao mesmo tempo\nusing System.Collections.Concurrent;\n\nvar http = new HttpClient { BaseAddress = new Uri(\"https://api.example.com/\") };\nint[] ids = [.. Enumerable.Range(1, 200)];\nvar precos = new ConcurrentDictionary<int, string>();\nvar opcoes = new ParallelOptions { MaxDegreeOfParallelism = 20 };\n\nawait Parallel.ForEachAsync(ids, opcoes, async (id, token) =>\n{\n    precos[id] = await http.GetStringAsync($\"produtos/{id}/preco\", token);\n});\n\nConsole.WriteLine($\"{precos.Count} preços carregados\");",
                    },
                    {
                        type: "text",
                        value: "## Condição de corrida\n\n`contador++` parece uma operação só, mas são três: ler o valor, somar 1 e gravar. Se duas tarefas leem 41 ao mesmo tempo, as duas gravam 42, e um incremento some. O erro depende do momento exato em que cada thread roda: passa no teste da sua máquina e aparece em produção, sob carga.\n\nO programa abaixo roda de verdade, com 8 tarefas e 1 milhão de incrementos cada. O esperado é 8.000.000; sem proteção, seis execuções seguidas deram entre 2.382.872 e 4.700.028. Marcar o campo como `volatile` não resolve (deu 4.200.429 num teste), porque cada leitura e escrita fica visível para as outras threads, mas o `++` continua sendo três passos. Trocar `int` por `long` também não: a soma entre a leitura e a escrita continua desprotegida.\n\n- **`Interlocked`** faz operações atômicas numa variável só: `Increment`, `Add`, `Exchange`, `CompareExchange`. É o mais rápido, e serve para contador e flag.\n- **`lock`** deixa uma thread por vez dentro de um bloco. Serve para operação composta, como atualizar dois campos juntos ou checar e depois agir. Desde o C# 13, o `lock` reconhece o tipo `System.Threading.Lock`: em código novo, declare `private readonly Lock _trava = new();` no lugar de um `object`. Mantenha o bloco curto e sem I/O.\n- **`await` dentro de `lock` não compila** (erro CS1996), porque o lock pertence a uma thread, e depois do `await` o método pode continuar em outra. Para seção crítica com `await` dentro, use `SemaphoreSlim(1, 1)`, com `await WaitAsync()` e `Release()` num `finally`.\n- **Não compartilhar** é a melhor trava: cada tarefa calcula o seu resultado parcial, e você junta tudo no fim.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs: 8 tarefas, 1 milhão de incrementos cada\nconst int Vezes = 1_000_000;\n\nvar semProtecao = new Placar();\nawait EmOitoTarefas(() =>\n{\n    for (var i = 0; i < Vezes; i++) semProtecao.Total++;\n});\nConsole.WriteLine($\"++ sem proteção: {semProtecao.Total:N0}\");\n\nvar atomico = new Placar();\nawait EmOitoTarefas(() =>\n{\n    for (var i = 0; i < Vezes; i++) Interlocked.Increment(ref atomico.Total);\n});\nConsole.WriteLine($\"Interlocked:     {atomico.Total:N0}\");\n\nvar comLock = new Placar();\nvar trava = new Lock();\nawait EmOitoTarefas(() =>\n{\n    for (var i = 0; i < Vezes; i++) { lock (trava) { comLock.Total++; } }\n});\nConsole.WriteLine($\"lock:            {comLock.Total:N0}\");\n\nstatic Task EmOitoTarefas(Action trabalho) =>\n    Task.WhenAll(Enumerable.Range(0, 8).Select(_ => Task.Run(trabalho)));\n\nclass Placar { public int Total; }\n\n// Saída de uma execução (esperado: 8.000.000):\n// ++ sem proteção: 2.382.872   (muda a cada execução)\n// Interlocked:     8.000.000\n// lock:            8.000.000",
                    },
                    {
                        type: "code",
                        value: "// Conta.cs: seção crítica com await dentro\npublic sealed class Conta : IDisposable\n{\n    private readonly SemaphoreSlim _semaforo = new(1, 1);   // deixa entrar um por vez\n    private decimal _saldo;\n\n    public async Task DepositarAsync(decimal valor, CancellationToken token = default)\n    {\n        await _semaforo.WaitAsync(token);\n        try\n        {\n            await Task.Delay(10, token);   // por exemplo, gravar no banco antes do saldo\n            _saldo += valor;\n        }\n        finally\n        {\n            _semaforo.Release();           // sempre, mesmo se der erro\n        }\n    }\n\n    public void Dispose() => _semaforo.Dispose();\n}\n\n// Somas.cs: melhor ainda é não compartilhar nada\npublic static class Somas\n{\n    public static async Task<long> SomarAsync(int[][] lotes)\n    {\n        long[] parciais = await Task.WhenAll(              // cada tarefa soma o seu lote\n            lotes.Select(lote => Task.Run(() => lote.Sum(x => (long)x))));\n        return parciais.Sum();                              // e o total sai no fim\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Coleções concorrentes\n\n`List<T>` e `Dictionary<TKey,TValue>` não aguentam escrita simultânea. Num teste com 8 tarefas adicionando 100 mil itens cada a uma `List<int>`, uma execução terminou com 176.778 itens de 800.000, e as outras lançaram `ArgumentException`. O `Dictionary` lançou `InvalidOperationException`, avisando que uma atualização concorrente corrompeu o estado dele.\n\nO namespace `System.Collections.Concurrent` tem as versões seguras: `ConcurrentDictionary` (com `GetOrAdd`, `AddOrUpdate`, `TryAdd` e `TryRemove`), `ConcurrentQueue` e `ConcurrentBag`. Para produtor e consumidor, existe `Channel<T>`, do namespace `System.Threading.Channels`. Duas armadilhas:\n\n- **Cada operação é atômica, a sequência não.** `contagem[p] = contagem.GetValueOrDefault(p) + 1` lê e grava em duas chamadas separadas e perde contagem: 492.647 de 800.000 no teste. Com `contagem.AddOrUpdate(p, 1, (_, n) => n + 1)`, chegou aos 800.000.\n- **A fábrica do `GetOrAdd` pode rodar mais de uma vez** para a mesma chave quando várias tarefas pedem ao mesmo tempo, e só um dos valores é guardado. No teste, com 8 tarefas, a fábrica rodou 8 vezes. Se ela for cara ou tiver efeito colateral, guarde um `Lazy<T>` como valor.",
                    },
                    {
                        type: "table",
                        value: "[[\"Ferramenta\",\"Protege\",\"Quando usar\"],[\"`Interlocked`\",\"Uma variável numérica\",\"Contador, flag, troca atômica\"],[\"`lock` com `Lock`\",\"Um bloco curto e síncrono\",\"Atualizar vários campos juntos\"],[\"`SemaphoreSlim`\",\"Um bloco com `await` dentro\",\"Seção crítica assíncrona, ou limitar N acessos simultâneos\"],[\"`ConcurrentDictionary`\",\"Um mapa compartilhado\",\"Cache, contagem com `AddOrUpdate`\"],[\"`ConcurrentQueue`, `Channel<T>`\",\"Fila entre tarefas\",\"Uma tarefa produz, outras consomem\"],[\"Não compartilhar\",\"Tudo\",\"Cada tarefa devolve o seu resultado, e você junta no fim\"]]",
                    },
                    {
                        type: "quote",
                        value: "`Task.WhenAll` junta esperas, `Parallel.ForEachAsync` põe limite, e todo dado compartilhado e mutável precisa de `Interlocked`, `lock`, `SemaphoreSlim` ou de uma coleção concorrente. Melhor ainda é não compartilhar: cada tarefa com o seu resultado, somados no fim.",
                    },
                ],
                questions: [
                    {
                        statement: "Três consultas independentes levam 1 s, 2 s e 3 s. Feitas com `await` uma de cada vez, o total fica em uns 6 s. Quanto leva se você iniciar as três e fizer `await Task.WhenAll(...)`?",
                        difficulty: "facil",
                        options: [
                            { text: "Cerca de 1 s, porque o WhenAll devolve assim que a primeira das consultas termina", isCorrect: false },
                            { text: "Cerca de 2 s, porque o WhenAll divide o tempo total pela quantidade de consultas", isCorrect: false },
                            { text: "Cerca de 3 s, porque as três esperam ao mesmo tempo e o total é o da mais lenta", isCorrect: true },
                            { text: "Cerca de 6 s, porque o WhenAll só junta as esperas, sem sobrepor nenhuma delas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Oito tarefas fazem `placar.Total++` num campo `int` compartilhado, e o total final sai abaixo do número esperado. Qual troca resolve sem usar `lock`?",
                        difficulty: "facil",
                        options: [
                            { text: "Usar `Interlocked.Increment(ref placar.Total)`, que lê, soma e grava numa operação atômica", isCorrect: true },
                            { text: "Declarar o campo como `volatile`, que impede cada núcleo de guardar uma cópia própria do valor", isCorrect: false },
                            { text: "Trocar `placar.Total++` por `placar.Total += 1`, que o compilador gera como uma instrução só", isCorrect: false },
                            { text: "Trocar o `int` por `long`, porque leitura e escrita de 64 bits são atômicas no .NET moderno", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que acontece ao compilar esta classe no C# 14?\n\n```csharp\npublic class Conta\n{\n    private readonly Lock _trava = new();\n    private decimal _saldo;\n\n    public async Task DepositarAsync(decimal valor)\n    {\n        lock (_trava)\n        {\n            await Task.Delay(10);\n            _saldo += valor;\n        }\n    }\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Não compila: await dentro de lock é proibido (erro CS1996), e a saída é o SemaphoreSlim", isCorrect: true },
                            { text: "Compila: o lock é liberado durante o await e adquirido de novo quando o método continua", isCorrect: false },
                            { text: "Não compila só por causa do tipo Lock; com um object no lugar dele, o await é aceito", isCorrect: false },
                            { text: "Compila, mas pode travar em produção, porque o await continua o método em outra thread", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Várias tarefas contam palavras ao mesmo tempo num `ConcurrentDictionary<string, int>` chamado `contagem`. Qual linha conta certo?",
                        difficulty: "medio",
                        options: [
                            { text: "`contagem.AddOrUpdate(p, 1, (_, atual) => atual + 1);`", isCorrect: true },
                            { text: "`contagem[p] = contagem.GetValueOrDefault(p) + 1;`", isCorrect: false },
                            { text: "`contagem[p] = contagem.TryGetValue(p, out var n) ? n + 1 : 1;`", isCorrect: false },
                            { text: "`if (!contagem.TryAdd(p, 1)) contagem[p]++;`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Você precisa consultar uma API para 10.000 ids, sem passar de 20 chamadas simultâneas, num programa de console. Qual abordagem atende?",
                        difficulty: "dificil",
                        options: [
                            { text: "`Parallel.ForEachAsync` com `MaxDegreeOfParallelism = 20` e uma lambda async com o token", isCorrect: true },
                            { text: "`Parallel.ForEach` com `MaxDegreeOfParallelism = 20` e uma lambda async com await na chamada", isCorrect: false },
                            { text: "`Task.WhenAll` com as 10.000 tarefas, já que o HttpClient limita sozinho a 20 conexões por vez", isCorrect: false },
                            { text: "Um `lock` em volta do `await` da chamada HTTP, liberando 20 tarefas por vez dentro dele", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 5 - ASP.NET Core: uma API de verdade",
        aulas: [
            {
                titulo: "O host e a injeção de dependência",
                blocks: [
                    {
                        type: "text",
                        value: "# O host e a injeção de dependência\n\nImagine um endpoint (uma rota da API, como `GET /api/produtos`) que lista produtos e cria com `new` tudo de que precisa: o repositório, o relógio, o cliente do serviço de frete. No primeiro dia funciona. No dia em que o repositório em memória vira um banco de verdade, você caça `new` pelo código inteiro; no dia em que alguém quer testar a regra de frete, descobre que ela só roda com o serviço externo no ar. O ASP.NET Core resolve isso com duas peças: o **host**, que monta a aplicação, e o **contêiner de injeção de dependência** (DI, de *dependency injection*), que cria os objetos e entrega a cada classe aquilo que ela declara precisar.\n\n## O que o `CreateBuilder` monta\n\nUma linha, `WebApplication.CreateBuilder(args)`, prepara:\n\n- a **configuração**, lida dos arquivos `appsettings`, das variáveis de ambiente e da linha de comando;\n- o **logging**, já escrevendo no console;\n- o **contêiner de serviços**, exposto em `builder.Services`;\n- o **ambiente** (Development, Production), em `builder.Environment`;\n- o **Kestrel**, o servidor HTTP que escuta as requisições.\n\nO `Program.cs` tem duas fases, separadas pelo `builder.Build()`. Antes dele você **registra** serviços, ensinando ao contêiner como criar cada um. Depois dele você monta o **pipeline**, a sequência de etapas que toda requisição atravessa, e as rotas. Registrar depois do `Build()` não funciona: a coleção de serviços vira somente leitura, e a tentativa lança `InvalidOperationException` (The service collection cannot be modified because it is read-only).",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nvar builder = WebApplication.CreateBuilder(args);\n\n// Fase 1: ensinar ao contêiner como criar cada serviço\nbuilder.Services.AddSingleton<IProdutoRepositorio, ProdutoRepositorioEmMemoria>();\nbuilder.Services.AddSingleton(TimeProvider.System);\nbuilder.Services.AddScoped<ServicoDeVitrine>();\n\nvar app = builder.Build(); // daqui para baixo, o contêiner está fechado\n\n// Fase 2: pipeline e rotas; o parâmetro da lambda vem do contêiner\napp.MapGet(\"/api/vitrine\", (ServicoDeVitrine vitrine) => vitrine.MontarAsync());\n\napp.Run();\n\npublic record Vitrine(DateTimeOffset GeradaEm, IReadOnlyList<Produto> Destaques);\n\n// O contêiner lê o construtor e entrega as dependências prontas\npublic sealed class ServicoDeVitrine(IProdutoRepositorio repo, TimeProvider relogio)\n{\n    public async Task<Vitrine> MontarAsync() =>\n        new(relogio.GetUtcNow(), await repo.ListarAsync(busca: null, pagina: 1, tamanho: 5));\n}",
                    },
                    {
                        type: "text",
                        value: "## Pedir por interface, receber pronto\n\nO `ServicoDeVitrine` não sabe qual repositório vai receber: ele declara no construtor (um primary constructor) que precisa de um `IProdutoRepositorio` e de um `TimeProvider`, e o contêiner entrega os dois prontos. O endpoint faz o mesmo nos parâmetros da lambda. Trocar o repositório em memória por um de banco é mudar **uma linha de registro**, sem tocar em endpoint nenhum. O `TimeProvider`, do .NET 8 em diante, é o relógio injetável: em teste, um relógio falso deixa o horário sob controle.\n\nTrês situações que pegam muita gente:\n\n- **Mesma interface registrada duas vezes.** Quem pede a interface recebe o **último** registro; quem pede `IEnumerable<IProdutoRepositorio>` recebe todos, na ordem. O `TryAddSingleton` só registra se ainda não houver nenhum.\n- **Serviço esquecido.** Se um endpoint GET pede uma interface que ninguém registrou, a inferência das Minimal APIs supõe que ela vem do corpo, e a primeira requisição falha com Body was inferred but the method does not allow inferred body parameters. A mensagem fala de corpo; a causa é o registro que faltou.\n- **Estado compartilhado.** O repositório em memória **guarda os dados**, então é Singleton: uma instância só, para a aplicação inteira. Como essa instância atende várias requisições ao mesmo tempo, ela precisa ser thread-safe; daí o `ConcurrentDictionary` e o `Interlocked` do arquivo abaixo.",
                    },
                    {
                        type: "code",
                        value: "// ProdutoRepositorioEmMemoria.cs\nusing System.Collections.Concurrent;\n\npublic record Produto(int Id, string Nome, decimal Preco, int Estoque);\npublic record NovoProduto(string Nome, decimal Preco, int Estoque);\n\npublic interface IProdutoRepositorio\n{\n    Task<IReadOnlyList<Produto>> ListarAsync(string? busca, int pagina, int tamanho);\n    Task<Produto?> BuscarAsync(int id);\n    Task<Produto> AdicionarAsync(NovoProduto novo);\n    Task<bool> RemoverAsync(int id);\n}\n\n// Singleton: guarda os dados e atende requisições simultâneas, então é thread-safe\npublic sealed class ProdutoRepositorioEmMemoria : IProdutoRepositorio\n{\n    private readonly ConcurrentDictionary<int, Produto> _produtos = new();\n    private int _ultimoId;\n\n    public Task<IReadOnlyList<Produto>> ListarAsync(string? busca, int pagina, int tamanho)\n    {\n        IReadOnlyList<Produto> resultado = _produtos.Values\n            .Where(p => busca is null || p.Nome.Contains(busca, StringComparison.OrdinalIgnoreCase))\n            .OrderBy(p => p.Id)\n            .Skip((pagina - 1) * tamanho)\n            .Take(tamanho)\n            .ToList();\n        return Task.FromResult(resultado);\n    }\n\n    public Task<Produto?> BuscarAsync(int id) => Task.FromResult(_produtos.GetValueOrDefault(id));\n\n    public Task<Produto> AdicionarAsync(NovoProduto novo)\n    {\n        var id = Interlocked.Increment(ref _ultimoId); // dois POSTs simultâneos nunca repetem id\n        var produto = new Produto(id, novo.Nome, novo.Preco, novo.Estoque);\n        _produtos[id] = produto;\n        return Task.FromResult(produto);\n    }\n\n    public Task<bool> RemoverAsync(int id) => Task.FromResult(_produtos.TryRemove(id, out _));\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Tempo de vida\",\"Quantas instâncias\",\"Exemplo típico\",\"Cuidado\"],[\"Singleton (`AddSingleton`)\",\"Uma para a aplicação inteira\",\"`TimeProvider`, cache em memória, o repositório em memória deste módulo\",\"Precisa ser thread-safe e nunca guardar dado de uma requisição\"],[\"Scoped (`AddScoped`)\",\"Uma por requisição HTTP\",\"`DbContext` do EF Core, dados do usuário da requisição atual\",\"Não pode ser injetado em Singleton\"],[\"Transient (`AddTransient`)\",\"Uma nova a cada injeção\",\"Objetos leves e sem estado, como formatadores\",\"Objeto caro de criar vira custo a cada injeção\"]]",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (experimento: quem recebe a mesma instância?)\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddSingleton<Configuracao>();\nbuilder.Services.AddScoped<Carrinho>();\nbuilder.Services.AddTransient<Etiqueta>();\nbuilder.Services.AddScoped<Auditoria>();\n\nvar app = builder.Build();\n\napp.MapGet(\"/vida\", (Configuracao c, Carrinho ca, Etiqueta e, Auditoria a) => new\n{\n    singleton = c.Id,\n    scoped = ca.Id,\n    scopedNaAuditoria = a.Carrinho.Id,\n    transient = e.Id,\n    transientNaAuditoria = a.Etiqueta.Id\n});\n\napp.Run();\n\nclass Configuracao { public string Id { get; } = Guid.NewGuid().ToString()[..4]; }\nclass Carrinho { public string Id { get; } = Guid.NewGuid().ToString()[..4]; }\nclass Etiqueta { public string Id { get; } = Guid.NewGuid().ToString()[..4]; }\n\nclass Auditoria(Carrinho carrinho, Etiqueta etiqueta)\n{\n    public Carrinho Carrinho => carrinho;\n    public Etiqueta Etiqueta => etiqueta;\n}\n\n// Duas chamadas seguidas a GET /vida:\n// {\"singleton\":\"2b90\",\"scoped\":\"03e0\",\"scopedNaAuditoria\":\"03e0\",\"transient\":\"7403\",\"transientNaAuditoria\":\"f1f0\"}\n// {\"singleton\":\"2b90\",\"scoped\":\"4d52\",\"scopedNaAuditoria\":\"4d52\",\"transient\":\"5faf\",\"transientNaAuditoria\":\"65ef\"}",
                    },
                    {
                        type: "text",
                        value: "## O erro de injetar Scoped em Singleton\n\nO experimento confirma a tabela: o id do Singleton se repete entre as chamadas, o do Scoped é o mesmo dentro da requisição (no endpoint e na `Auditoria`) e muda na seguinte, e o do Transient é novo a cada injeção. Daí sai a regra: **um serviço não pode depender de outro que vive menos que ele**. O Singleton é construído uma vez; se o construtor dele pede um Scoped, aquela instância fica presa lá dentro para sempre. É a **dependência cativa** (*captive dependency*): o objeto que deveria nascer e morrer com cada requisição passa a ser dividido por todas.\n\nO comportamento muda com o ambiente, e é isso que torna o erro traiçoeiro:\n\n- Em **Development**, o host liga a validação de escopos (`ValidateScopes` e `ValidateOnBuild`), e o `builder.Build()` falha na hora. A validação percorre a cadeia inteira: um Transient no meio do caminho, que por sua vez recebe o Scoped, não esconde o problema.\n- Em **Production**, essa validação vem desligada. A aplicação sobe, e o defeito aparece como dado de um cliente na resposta de outro, como no primeiro código abaixo.\n\nPegar um Scoped direto de `app.Services`, o provedor raiz, é a mesma armadilha: em Development dá Cannot resolve scoped service ... from root provider; em produção, a instância vira um Singleton disfarçado. As correções estão no segundo código: o consumidor vira Scoped também, que é a saída mais comum, ou, quando ele precisa mesmo ser Singleton (um `BackgroundService`, que roda em segundo plano durante toda a vida da aplicação, ou um cache), recebe `IServiceScopeFactory` e abre um escopo por operação.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (o erro: um Singleton que recebe um Scoped no construtor)\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddScoped<DiarioDaRequisicao>();\nbuilder.Services.AddSingleton<ServicoDeCheckout>();\n\nvar app = builder.Build(); // em Development, a validação falha aqui\n\napp.MapGet(\"/checkout\", (string cliente, ServicoDeCheckout checkout) => checkout.Finalizar(cliente));\n\napp.Run();\n\n// Scoped: deveria nascer e morrer com cada requisição\npublic sealed class DiarioDaRequisicao\n{\n    private readonly List<string> _eventos = [];\n    public void Registrar(string evento) => _eventos.Add(evento);\n    public IReadOnlyList<string> Eventos => _eventos;\n}\n\n// Singleton: construído uma vez, prende para sempre o diário que recebeu\npublic sealed class ServicoDeCheckout(DiarioDaRequisicao diario)\n{\n    public IReadOnlyList<string> Finalizar(string cliente)\n    {\n        diario.Registrar($\"checkout de {cliente}\");\n        return diario.Eventos;\n    }\n}\n\n// Development: o builder.Build() lança AggregateException com a mensagem\n//   Cannot consume scoped service 'DiarioDaRequisicao' from singleton 'ServicoDeCheckout'.\n// Production: a API sobe, e o diário vira um só para todo mundo\n//   GET /checkout?cliente=ana    ->  [\"checkout de ana\"]\n//   GET /checkout?cliente=bruno  ->  [\"checkout de ana\",\"checkout de bruno\"]",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (corrigido; DiarioDaRequisicao continua igual)\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddScoped<DiarioDaRequisicao>();\n// Correção 1, a mais comum: AddScoped<ServicoDeCheckout>() e pronto.\n// Correção 2, para quando ele precisa mesmo ser Singleton:\nbuilder.Services.AddSingleton<ServicoDeCheckout>();\n\nvar app = builder.Build();\n\n// Na subida também não se pede Scoped direto de app.Services: abre-se um escopo\nusing (var escopo = app.Services.CreateScope())\n{\n    var diario = escopo.ServiceProvider.GetRequiredService<DiarioDaRequisicao>();\n    diario.Registrar(\"carga inicial\");\n}\n\napp.MapGet(\"/checkout\", (string cliente, ServicoDeCheckout checkout) => checkout.Finalizar(cliente));\n\napp.Run();\n\npublic sealed class ServicoDeCheckout(IServiceScopeFactory escopos)\n{\n    public IReadOnlyList<string> Finalizar(string cliente)\n    {\n        using var escopo = escopos.CreateScope(); // um escopo por operação\n        var diario = escopo.ServiceProvider.GetRequiredService<DiarioDaRequisicao>();\n        diario.Registrar($\"checkout de {cliente}\");\n        return diario.Eventos;\n    }\n}\n\n// GET /checkout?cliente=ana    ->  [\"checkout de ana\"]\n// GET /checkout?cliente=bruno  ->  [\"checkout de bruno\"]",
                    },
                    {
                        type: "quote",
                        value: "O host monta a aplicação e o contêiner entrega as dependências: registre por interface, escolha o tempo de vida pelo tempo que o dado precisa viver e nunca deixe um Singleton segurar um Scoped. O que a validação de Development acusa na hora, a produção só mostra como dado vazado entre clientes.",
                    },
                ],
                questions: [
                    {
                        statement: "Um serviço guarda o usuário autenticado da requisição atual e é consultado por vários outros serviços ao longo dessa mesma requisição. Qual tempo de vida ele deve ter?",
                        difficulty: "facil",
                        options: [
                            { text: "Transient, porque cada serviço que o consulta precisa de uma cópia própria", isCorrect: false },
                            { text: "Singleton com `lock`, para que duas requisições não alterem o usuário ao mesmo tempo", isCorrect: false },
                            { text: "Scoped, porque a mesma instância vale do começo ao fim de cada requisição HTTP", isCorrect: true },
                            { text: "Singleton, porque o usuário é lido uma vez e reaproveitado nas requisições seguintes", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O `Program.cs` registra a mesma interface duas vezes, nesta ordem. O que recebe um endpoint que pede `IRelogio`?\n\n```csharp\nbuilder.Services.AddSingleton<IRelogio, RelogioDoSistema>();\nbuilder.Services.AddSingleton<IRelogio, RelogioFixo>();\n```",
                        difficulty: "facil",
                        options: [
                            { text: "Uma coleção com os dois relógios, na ordem em que foram registrados", isCorrect: false },
                            { text: "Um `RelogioDoSistema`, porque o primeiro registro da interface é o que vale", isCorrect: false },
                            { text: "Nenhum: o `Build()` falha ao encontrar dois registros para a mesma interface", isCorrect: false },
                            { text: "Um `RelogioFixo`, porque o último registro da interface é o que vale no fim", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Uma API guarda os produtos num `ConcurrentDictionary` dentro de `ProdutoRepositorioEmMemoria`, registrado com `AddScoped`. O `POST /api/produtos` devolve 201, mas o `GET /api/produtos/1` feito logo em seguida devolve 404. Qual é a causa?",
                        difficulty: "medio",
                        options: [
                            { text: "O `ConcurrentDictionary` só publica a escrita para outras threads depois de um tempo", isCorrect: false },
                            { text: "Cada requisição recebe uma instância nova do repositório, com o dicionário vazio", isCorrect: true },
                            { text: "O 201 saiu antes de o `await` da gravação terminar, e o item se perdeu no caminho", isCorrect: false },
                            { text: "A restrição `{id:int}` da rota não casa com o id gerado por `Interlocked.Increment`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um serviço registrado como Singleton recebe no construtor um serviço Scoped que acumula os eventos da requisição. A API roda com `ASPNETCORE_ENVIRONMENT=Production` e nenhuma configuração extra no contêiner. O que acontece?",
                        difficulty: "medio",
                        options: [
                            { text: "A API sobe, mas a primeira requisição falha com erro de resolução e as outras funcionam", isCorrect: false },
                            { text: "A API sobe, e a mesma instância Scoped passa a ser dividida por todas as requisições", isCorrect: true },
                            { text: "A API não sobe, porque o `Build()` valida os tempos de vida em qualquer ambiente", isCorrect: false },
                            { text: "A API sobe, e o contêiner entrega ao Singleton uma instância Scoped nova por requisição", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com as validações padrão do ambiente Development (`ValidateScopes` e `ValidateOnBuild` ligadas), qual destes registros faz o `builder.Build()` falhar?",
                        difficulty: "dificil",
                        options: [
                            { text: "Scoped que recebe um Singleton, e esse Singleton não depende de ninguém", isCorrect: false },
                            { text: "Transient que recebe um Scoped, e esse Transient só é usado por Scoped", isCorrect: false },
                            { text: "Singleton que recebe um Transient, e esse Transient depende de um Scoped", isCorrect: true },
                            { text: "Singleton que recebe um Transient, e esse Transient não tem dependências", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Minimal APIs: rotas, parâmetros e respostas",
                blocks: [
                    {
                        type: "text",
                        value: "# Minimal APIs: rotas, parâmetros e respostas\n\nUma API de produtos precisa de meia dúzia de operações: listar, buscar, criar, remover. Nas Minimal APIs, cada operação é uma linha de mapeamento (`MapGet`, `MapPost`, `MapPut`, `MapDelete`) que liga um verbo HTTP e um template de rota a um **handler**, uma lambda ou um método. Os parâmetros do handler dizem do que ele precisa, e o ASP.NET Core descobre de onde tirar cada um.\n\n## Rotas, restrições e grupos\n\nNo template `/api/produtos/{id:int}`, `{id}` é um parâmetro de rota e `:int` é uma **restrição**: a rota só casa se o segmento for um inteiro. Com a restrição, `GET /api/produtos/abc` responde **404**, porque nenhuma rota casou; sem ela, a rota casaria, a conversão de `abc` para `int` falharia e a resposta seria **400**. Outras restrições comuns: `guid`, `long`, `bool`, `min(1)`, `range(1,100)` e `alpha`.\n\nQuando o `Program.cs` cresce, o caminho é agrupar. `MapGroup(\"/api/produtos\")` cria um grupo com prefixo comum, e o que se configura no grupo (tags do OpenAPI, filtros, autorização) vale para todas as rotas dele. Com um método de extensão por recurso, o `Program.cs` fica com uma linha por recurso, como `app.MapProdutos();`.",
                    },
                    {
                        type: "code",
                        value: "// ProdutoEndpoints.cs (no Program.cs basta uma linha: app.MapProdutos();)\nusing Microsoft.AspNetCore.Http.HttpResults;\n\npublic static class ProdutoEndpoints\n{\n    public static RouteGroupBuilder MapProdutos(this IEndpointRouteBuilder app)\n    {\n        var grupo = app.MapGroup(\"/api/produtos\").WithTags(\"Produtos\");\n\n        grupo.MapGet(\"/\", Listar);\n        grupo.MapGet(\"/{id:int}\", Buscar);\n        grupo.MapPost(\"/\", Criar);\n        grupo.MapDelete(\"/{id:int}\", Remover);\n\n        return grupo;\n    }\n\n    static async Task<Ok<IReadOnlyList<Produto>>> Listar(\n        [AsParameters] FiltroDeProdutos filtro, IProdutoRepositorio repo) =>\n        TypedResults.Ok(await repo.ListarAsync(filtro.Busca, filtro.Pagina, filtro.Tamanho));\n\n    static async Task<Results<Ok<Produto>, NotFound>> Buscar(int id, IProdutoRepositorio repo) =>\n        await repo.BuscarAsync(id) is { } produto ? TypedResults.Ok(produto) : TypedResults.NotFound();\n\n    static async Task<Created<Produto>> Criar(NovoProduto novo, IProdutoRepositorio repo)\n    {\n        var criado = await repo.AdicionarAsync(novo);\n        return TypedResults.Created($\"/api/produtos/{criado.Id}\", criado);\n    }\n\n    static async Task<Results<NoContent, NotFound>> Remover(int id, IProdutoRepositorio repo) =>\n        await repo.RemoverAsync(id) ? TypedResults.NoContent() : TypedResults.NotFound();\n}\n\n// GET /api/produtos?busca=tec&pagina=2: cada propriedade vira um parâmetro de query\npublic record FiltroDeProdutos(string? Busca, int Pagina = 1, int Tamanho = 20);",
                    },
                    {
                        type: "table",
                        value: "[[\"Origem\",\"Quando o ASP.NET Core usa\",\"Exemplo\"],[\"Rota\",\"O nome do parâmetro aparece no template\",\"`{id:int}` com `int id`\"],[\"Query string\",\"Tipo simples que não está na rota\",\"`?pagina=2` com `int pagina = 1`\"],[\"Corpo (JSON)\",\"Tipo complexo em POST, PUT ou PATCH\",\"`NovoProduto novo`\"],[\"Contêiner de DI\",\"Tipo registrado em `builder.Services`\",\"`IProdutoRepositorio repo`\"],[\"Tipos especiais\",\"Tipos conhecidos do framework\",\"`HttpContext` e `CancellationToken` (cancelado se o cliente desistir)\"],[\"Header\",\"Só com atributo explícito\",\"`[FromHeader(Name = \\\"X-Loja\\\")] string loja`\"]]",
                    },
                    {
                        type: "text",
                        value: "## Query, corpo e o erro de inferência\n\nTipo simples é o que se converte a partir de texto: `int`, `decimal`, `Guid`, `DateOnly`, `string`, enums. Fora da rota, ele vem da query string e, sem valor padrão, é **obrigatório**: sem `?ano=` na URL, a resposta é 400 (Required parameter \"int ano\" was not provided from query string). Para torná-lo opcional, dê um valor padrão (`int limite = 5`; valor padrão em lambda é recurso do C# 12) ou use um tipo anulável. Vários filtros juntos cabem num record marcado com `[AsParameters]`: cada propriedade vira um parâmetro, como em `FiltroDeProdutos`.\n\nO erro que mais assusta é um **tipo complexo sem atributo num GET**. A inferência supõe que ele vem do corpo, GET não aceita corpo inferido, e a montagem das rotas falha na primeira requisição, derrubando **todas** as rotas da API, não só a nova. A mensagem sugere `[FromBody]` ou `[FromServices]`, mas filtro de busca pede `[AsParameters]`.\n\nNo corpo, o `System.Text.Json` lê as propriedades sem diferenciar maiúsculas de minúsculas (`nome` e `Nome` funcionam) e escreve a resposta em camelCase. A requisição precisa do header `Content-Type: application/json`; sem ele, a resposta é **415** (Unsupported Media Type). E um detalhe que engana: um POST sem `nome` passa e grava `nome` nulo, mesmo com `string Nome` não anulável no record. Tipo não anulável é análise do compilador, não validação de entrada.",
                    },
                    {
                        type: "code",
                        value: "// Parâmetro simples que não está na rota vem da query string\napp.MapGet(\"/api/relatorios/vendas\", (int ano) => ano);              // obrigatório: sem ?ano=, 400\napp.MapGet(\"/api/destaques\", (int limite = 5) => limite);            // opcional, vale 5\napp.MapGet(\"/api/cupons\", (string? codigo) => codigo ?? \"nenhum\");   // opcional, pode vir nulo\n\n// Errado: tipo complexo sem atributo num GET é inferido como corpo\napp.MapGet(\"/api/produtos/busca\", (FiltroDeProdutos filtro) => filtro);\n// Na primeira requisição, TODAS as rotas da API passam a responder 500:\n//   InvalidOperationException: Body was inferred but the method does not allow\n//   inferred body parameters. ... Did you mean to register the \"Body (Inferred)\"\n//   parameter(s) as a Service or apply the [FromServices] or [FromBody] attribute?\n\n// Certo: [AsParameters] transforma cada propriedade do record num parâmetro\napp.MapGet(\"/api/produtos/busca\", ([AsParameters] FiltroDeProdutos filtro) => filtro);",
                    },
                    {
                        type: "text",
                        value: "## TypedResults e o tipo de retorno\n\nUm handler pode devolver um objeto qualquer, que vira 200 com JSON, mas uma API de verdade precisa responder 404, 201 e 204. Há duas fábricas para isso. `Results.Ok(...)` devolve `IResult`, uma interface que esconde o que vai sair. `TypedResults.Ok(...)` devolve `Ok<Produto>`, um **tipo concreto**: o gerador de OpenAPI lê dele o código e o schema da resposta, e um teste de unidade verifica o resultado sem subir servidor. Prefira `TypedResults`.\n\nO preço é declarar a união quando há mais de uma saída: `Results<Ok<Produto>, NotFound>`. Sem ela, os dois `return` têm tipos diferentes, a lambda fica sem tipo, e o compilador produz um erro que confunde: ele tenta a sobrecarga `MapGet(string, RequestDelegate)` e reclama do `RequestDelegate`, que não tem nada a ver com a causa. Com métodos nomeados, como em `ProdutoEndpoints`, o tipo de retorno já fica explícito.\n\nPara criação, `TypedResults.Created(uri, objeto)` devolve **201** com o header `Location` apontando para o recurso novo. Para remoção, `TypedResults.NoContent()` devolve **204**, sem corpo.",
                    },
                    {
                        type: "code",
                        value: "// Não compila: os dois return devolvem tipos diferentes (NotFound e Ok<Produto>),\n// a lambda fica sem tipo, e o compilador tenta MapGet(string, RequestDelegate):\n//   error CS1593: Delegate 'RequestDelegate' does not take 2 arguments\napp.MapGet(\"/api/produtos/{id:int}\", async (int id, IProdutoRepositorio repo) =>\n{\n    var produto = await repo.BuscarAsync(id);\n    if (produto is null) return TypedResults.NotFound();\n    return TypedResults.Ok(produto);\n});\n\n// Compila: o retorno declarado é a união das respostas possíveis\napp.MapGet(\"/api/produtos/{id:int}\", async Task<Results<Ok<Produto>, NotFound>> (\n    int id, IProdutoRepositorio repo) =>\n{\n    var produto = await repo.BuscarAsync(id);\n    if (produto is null) return TypedResults.NotFound();\n    return TypedResults.Ok(produto);\n});",
                    },
                    {
                        type: "code",
                        value: "# terminal (API no ar em localhost:5000; só as linhas que interessam da resposta)\ncurl -i -X POST localhost:5000/api/produtos -H \"Content-Type: application/json\" \\\n     -d '{\"nome\":\"Teclado\",\"preco\":199.9,\"estoque\":10}'\nHTTP/1.1 201 Created\nLocation: /api/produtos/1\n{\"id\":1,\"nome\":\"Teclado\",\"preco\":199.9,\"estoque\":10}\n\ncurl -i localhost:5000/api/produtos/abc             # a restrição :int não casa\nHTTP/1.1 404 Not Found\n\ncurl -i \"localhost:5000/api/produtos?pagina=xyz\"    # a rota casa, a conversão falha\nHTTP/1.1 400 Bad Request\n\ncurl -i -X POST localhost:5000/api/produtos -d '{\"nome\":\"Mouse\",\"preco\":89.5,\"estoque\":3}'\nHTTP/1.1 415 Unsupported Media Type                 # faltou o Content-Type\n\ncurl -i -X POST localhost:5000/api/produtos -H \"Content-Type: application/json\" \\\n     -d '{\"preco\":89.5,\"estoque\":3}'\nHTTP/1.1 201 Created                                # sem nome, e mesmo assim passou\n{\"id\":2,\"nome\":null,\"preco\":89.5,\"estoque\":3}\n\ncurl -i -X DELETE localhost:5000/api/produtos/1\nHTTP/1.1 204 No Content",
                    },
                    {
                        type: "quote",
                        value: "Rota com restrição, parâmetros que dizem de onde vêm e `TypedResults` com a união das respostas: com isso, cada endpoint descreve o próprio contrato. Quando a inferência estranhar um parâmetro, desconfie primeiro de um tipo complexo num GET ou de um serviço que ninguém registrou.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma rota foi mapeada com o template `/api/produtos/{id:int}`. O que a API responde para `GET /api/produtos/abc`?",
                        difficulty: "facil",
                        options: [
                            { text: "500, porque o handler recebe o `id` nulo e lança exceção", isCorrect: false },
                            { text: "400, porque o valor `abc` não pôde ser convertido para `int`", isCorrect: false },
                            { text: "200, com o `id` valendo zero, o valor padrão do tipo `int`", isCorrect: false },
                            { text: "404, porque a rota não casa quando a restrição `int` falha", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Por que preferir `TypedResults.Ok(produto)` a `Results.Ok(produto)` num endpoint de Minimal API?",
                        difficulty: "facil",
                        options: [
                            { text: "Ele devolve um tipo concreto, que alimenta o documento OpenAPI e facilita o teste", isCorrect: true },
                            { text: "Ele é o único dos dois que aceita um objeto anônimo como corpo da resposta", isCorrect: false },
                            { text: "Ele serializa o JSON mais rápido, porque dispensa a reflexão do `System.Text.Json`", isCorrect: false },
                            { text: "Ele valida o objeto com os atributos de DataAnnotations antes de escrever a resposta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual assinatura de handler faz `pagina` vir da query string como parâmetro opcional, valendo 1 quando o cliente não manda nada?",
                        difficulty: "medio",
                        options: [
                            { text: "`(int pagina = 1) => ...`", isCorrect: true },
                            { text: "`([FromRoute] int pagina = 1) => ...`", isCorrect: false },
                            { text: "`([FromQuery] int pagina) => ...`", isCorrect: false },
                            { text: "`(int pagina) => ...`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um time adicionou a rota abaixo, em que `FiltroDeProdutos` é um record com `Busca` e `Pagina` que deve ser lido da query string (`?busca=tec&pagina=2`). Na primeira requisição depois do deploy, todas as rotas da API passam a responder 500. Qual é a correção?\n\n```csharp\napp.MapGet(\"/api/produtos/busca\", (FiltroDeProdutos filtro) => filtro);\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Marcar o parâmetro com `[AsParameters]`, para cada propriedade vir da query", isCorrect: true },
                            { text: "Marcar o parâmetro com `[FromBody]`, para o GET aceitar o filtro no corpo", isCorrect: false },
                            { text: "Registrar `FiltroDeProdutos` com `AddScoped`, para o contêiner injetá-lo", isCorrect: false },
                            { text: "Trocar o record por uma classe com construtor vazio, que o binder sabe criar", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O endpoint abaixo não compila, e a mensagem de erro cita `RequestDelegate`. Qual é a causa real?\n\n```csharp\napp.MapDelete(\"/api/produtos/{id:int}\", async (int id, IProdutoRepositorio repo) =>\n{\n    var removido = await repo.RemoverAsync(id);\n    if (!removido) return TypedResults.NotFound();\n    return TypedResults.NoContent();\n});\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "O `repo` precisa de `[FromServices]`, porque a lambda é assíncrona", isCorrect: false },
                            { text: "O `MapDelete` não aceita lambda `async`, só método nomeado ou lambda síncrona", isCorrect: false },
                            { text: "Os dois `return` têm tipos diferentes, e a lambda fica sem tipo de retorno", isCorrect: true },
                            { text: "O `id` precisa de `[FromRoute]`, porque a restrição `:int` desliga a inferência", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Validação e erros",
                blocks: [
                    {
                        type: "text",
                        value: "# Validação e erros\n\nNa aula de Minimal APIs, um POST sem `nome` foi aceito e gravou um produto com nome nulo. Em produção, esse buraco vira registro corrompido, exceção três telas depois e cliente sem saber o que fez de errado. Uma API de verdade recusa a entrada inválida na porta, responde num formato que o cliente consegue ler e usa o código HTTP que diz o que aconteceu.\n\n## A validação embutida do .NET 10\n\nAntes do .NET 10, Minimal APIs não validavam nada sozinhas, e cada time escolhia uma biblioteca. Agora a validação faz parte do framework: depois de `builder.Services.AddValidation()`, os atributos de `System.ComponentModel.DataAnnotations` (`[Required]`, `[StringLength]`, `[Range]`, `[EmailAddress]` e companhia) são verificados **antes de o handler rodar**, nos parâmetros de rota, query, header e corpo. Falhou, a resposta é **400** com os erros por campo, e o handler nem executa. Em record, o atributo vai direto no parâmetro do construtor, como no `NovoProduto` abaixo, que substitui a versão sem atributos.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing System.ComponentModel.DataAnnotations;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddValidation();       // liga a validação embutida do .NET 10\nbuilder.Services.AddProblemDetails();   // respostas de erro no formato ProblemDetails\nbuilder.Services.AddSingleton<IProdutoRepositorio, ProdutoRepositorioEmMemoria>();\n\nvar app = builder.Build();\n\napp.MapPost(\"/api/produtos\", async (NovoProduto novo, IProdutoRepositorio repo) =>\n{\n    var criado = await repo.AdicionarAsync(novo); // só chega aqui se a validação passou\n    return TypedResults.Created($\"/api/produtos/{criado.Id}\", criado);\n});\n\n// Atributo direto no parâmetro: vale para query, rota e header\napp.MapGet(\"/api/produtos/mais-vendidos\", async ([Range(1, 50)] int quantidade, IProdutoRepositorio repo) =>\n    TypedResults.Ok(await repo.ListarAsync(busca: null, pagina: 1, tamanho: quantidade)));\n\napp.Run();\n\n// Substitui o NovoProduto sem atributos do repositório\npublic record NovoProduto(\n    [Required, StringLength(80, MinimumLength = 3)] string Nome,\n    [Range(0.01, 100_000, ErrorMessage = \"O preço deve ficar entre 0,01 e 100.000.\")] decimal Preco,\n    [Range(0, 10_000)] int Estoque);",
                    },
                    {
                        type: "code",
                        value: "# resposta de POST /api/produtos com o corpo {\"preco\":0,\"estoque\":-1}\nHTTP/1.1 400 Bad Request\nContent-Type: application/problem+json\n\n{\n  \"type\": \"https://tools.ietf.org/html/rfc9110#section-15.5.1\",\n  \"title\": \"One or more validation errors occurred.\",\n  \"status\": 400,\n  \"errors\": {\n    \"Nome\": [\"The Nome field is required.\"],\n    \"Preco\": [\"O preço deve ficar entre 0,01 e 100.000.\"],\n    \"Estoque\": [\"The field Estoque must be between 0 and 10000.\"]\n  },\n  \"traceId\": \"00-6f28ae16128069875661765a7972b761-bb872de44b1364ed-00\"\n}",
                    },
                    {
                        type: "text",
                        value: "## O que mais a validação faz, e o que ela não faz\n\n- **Regra entre campos.** Quando a regra envolve mais de uma propriedade, como preço promocional menor que o normal, implemente `IValidatableObject`. O `Validate` roda **por último** e **só se os atributos passaram**: um corpo com dois problemas pode voltar com um erro só, e o segundo aparece quando o cliente corrige o primeiro.\n- **Objetos aninhados e listas** também são validados, e o erro vem com o caminho do campo, como `Itens[0].Quantidade`.\n- **Exceção pontual.** `.DisableValidation()` desliga a validação num endpoint.\n- **Sem `AddValidation()`, nada é validado, e nada avisa.** Nenhum erro, nenhuma linha de log: os atributos ficam lá, decorativos, e o código parece protegido. É o erro mais comum.\n- **Onde vale.** Os metadados de validação são gerados em tempo de compilação para os tipos usados nos endpoints do projeto que chama `AddValidation()`. Tipo declarado em outra biblioteca precisa que ela também chame `AddValidation()`.\n\nEsse mecanismo é das Minimal APIs. Controllers continuam com a validação do MVC, ligada pelo atributo `[ApiController]`.",
                    },
                    {
                        type: "code",
                        value: "// Regra que envolve dois campos: IValidatableObject\npublic record NovaPromocao(\n    [Required] string Codigo,\n    decimal PrecoNormal,\n    decimal PrecoPromocional) : IValidatableObject\n{\n    public IEnumerable<ValidationResult> Validate(ValidationContext contexto)\n    {\n        if (PrecoPromocional >= PrecoNormal)\n            yield return new ValidationResult(\n                \"O preço promocional precisa ser menor que o normal.\",\n                [nameof(PrecoPromocional)]);\n    }\n}\n\n// app.MapPost(\"/api/promocoes\", (NovaPromocao promocao) => TypedResults.Ok(promocao));\n//\n// {\"codigo\":\"BF\",\"precoNormal\":100,\"precoPromocional\":120}\n//   400  \"errors\": {\"PrecoPromocional\":[\"O preço promocional precisa ser menor que o normal.\"]}\n// {\"precoNormal\":100,\"precoPromocional\":120}   (sem código)\n//   400  \"errors\": {\"Codigo\":[\"The Codigo field is required.\"]}\n//   o Validate nem rodou: ele só roda depois que os atributos passam",
                    },
                    {
                        type: "text",
                        value: "## ProblemDetails e o tratamento global\n\n**ProblemDetails** é o formato padronizado de erro para APIs HTTP (RFC 9457): um JSON com `type`, `title`, `status`, `detail` e campos extras como o `traceId`, servido como `application/problem+json`. Com `builder.Services.AddProblemDetails()`, o ASP.NET Core passa a usá-lo na validação, nas exceções e nos códigos de erro sem corpo. O tratamento global junta três peças:\n\n- `app.UseExceptionHandler()`, um **middleware** (uma etapa do pipeline, assunto da aula de middleware) registrado **no começo**: captura a exceção não tratada, registra no log com o stack trace e devolve um 500 genérico, sem vazar a mensagem interna. Sem `AddProblemDetails()` (ou um tratador registrado), essa chamada sem argumentos derruba a aplicação na subida.\n- `app.UseStatusCodePages()`: dá corpo ProblemDetails às respostas de erro vazias, como o 404 de rota inexistente e o `TypedResults.NotFound()`.\n- `IExceptionHandler`: uma classe sua que traduz exceções conhecidas em respostas específicas. Ela devolve `true` quando tratou e `false` para deixar a exceção seguir.\n\nFalha **esperada**, como estoque insuficiente, não precisa de exceção: o endpoint devolve `TypedResults.Problem(statusCode: 409, ...)` direto. O tratamento global é a rede para o que ninguém previu, e o `IExceptionHandler` serve para exceções que nascem longe do endpoint, numa regra usada por vários lugares. Atenção a uma mudança do .NET 10: quando o seu `IExceptionHandler` devolve `true`, o middleware **deixa de registrar** aquela exceção no log. Se ela merece registro, registre no próprio tratador, como no código abaixo.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (tratamento de erros da API inteira)\nusing Microsoft.AspNetCore.Diagnostics;\nusing Microsoft.AspNetCore.Http.HttpResults;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddProblemDetails();\nbuilder.Services.AddExceptionHandler<TratadorDeEstoque>();\n\nvar app = builder.Build();\n\napp.UseExceptionHandler();   // primeiro do pipeline: envolve tudo o que vem depois\napp.UseStatusCodePages();    // dá corpo ProblemDetails a 404, 405 e outros erros vazios\n\n// Falha esperada: o endpoint devolve o 409 direto, sem lançar exceção\napp.MapPost(\"/api/pedidos\", Results<Created<Pedido>, ProblemHttpResult> (NovoPedido novo) =>\n{\n    const int emEstoque = 5;\n    if (novo.Quantidade > emEstoque)\n        return TypedResults.Problem(\n            title: \"Estoque insuficiente\",\n            detail: $\"Pedido de {novo.Quantidade} unidades, só há {emEstoque} em estoque.\",\n            statusCode: StatusCodes.Status409Conflict);\n\n    var pedido = new Pedido(42, novo.ProdutoId, novo.Quantidade);\n    return TypedResults.Created($\"/api/pedidos/{pedido.Id}\", pedido);\n});\n\napp.Run();\n\npublic record NovoPedido(int ProdutoId, int Quantidade);\npublic record Pedido(int Id, int ProdutoId, int Quantidade);\npublic class EstoqueInsuficienteException(string mensagem) : Exception(mensagem);\n\n// Exceção conhecida, lançada longe do endpoint, vira 409; as outras seguem para o 500\npublic sealed class TratadorDeEstoque(IProblemDetailsService problemDetails, ILogger<TratadorDeEstoque> logger)\n    : IExceptionHandler\n{\n    public async ValueTask<bool> TryHandleAsync(\n        HttpContext http, Exception exception, CancellationToken cancellationToken)\n    {\n        if (exception is not EstoqueInsuficienteException)\n            return false; // não é comigo: o middleware responde 500\n\n        logger.LogWarning(exception, \"Pedido recusado por falta de estoque\"); // no .NET 10, o middleware não loga mais\n        http.Response.StatusCode = StatusCodes.Status409Conflict;\n        return await problemDetails.TryWriteAsync(new ProblemDetailsContext\n        {\n            HttpContext = http,\n            Exception = exception,\n            ProblemDetails = { Title = \"Estoque insuficiente\", Detail = exception.Message }\n        });\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O código certo para cada situação\n\nO código HTTP é a primeira coisa que o cliente, o balanceador de carga e o monitoramento leem. Três erros comuns:\n\n- **200 com `\"sucesso\": false` no corpo.** Para o monitoramento, tudo deu certo; o cliente precisa abrir o JSON para descobrir que falhou.\n- **500 para erro do cliente.** Entrada inválida respondida com 500 dispara alerta de servidor por culpa de quem chamou. Erro do cliente é da família 4xx.\n- **404 para lista vazia.** Uma busca sem resultado deu certo: é 200 com `[]`. O 404 é para o recurso que não existe, como `/api/produtos/99`.",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\",\"Código\",\"Como devolver\"],[\"Leitura com sucesso\",\"200 OK\",\"`TypedResults.Ok(dto)`\"],[\"Recurso criado\",\"201 Created, com `Location`\",\"`TypedResults.Created(uri, dto)`\"],[\"Sucesso sem corpo (PUT, DELETE)\",\"204 No Content\",\"`TypedResults.NoContent()`\"],[\"Entrada inválida\",\"400 Bad Request\",\"Validação automática ou `TypedResults.ValidationProblem(erros)`\"],[\"Sem autenticação válida\",\"401 Unauthorized\",\"O middleware de autorização devolve sozinho\"],[\"Autenticado, mas sem permissão\",\"403 Forbidden\",\"O middleware de autorização devolve sozinho\"],[\"Recurso inexistente\",\"404 Not Found\",\"`TypedResults.NotFound()`\"],[\"Conflito com o estado atual (duplicado, sem estoque)\",\"409 Conflict\",\"`TypedResults.Problem(statusCode: 409, ...)`\"],[\"Falha inesperada no servidor\",\"500 Internal Server Error\",\"Tratamento global; nunca de propósito\"]]",
                    },
                    {
                        type: "quote",
                        value: "Valide na porta com `AddValidation()`, responda erro sempre em ProblemDetails e deixe o tratamento global como rede para o imprevisto, sem vazar detalhe interno. O código HTTP certo é parte do contrato: 4xx para o erro de quem chamou, 5xx só para o erro do servidor.",
                    },
                ],
                questions: [
                    {
                        statement: "O record `NovoProduto` tem `[Required]` no parâmetro `Nome`, mas um POST sem `nome` chega ao handler e devolve 201. O `Program.cs` tem `AddProblemDetails()` e nenhuma outra linha sobre validação. O que falta?",
                        difficulty: "facil",
                        options: [
                            { text: "Chamar `builder.Services.AddValidation()`, que liga a validação antes do handler", isCorrect: true },
                            { text: "Ligar `<Nullable>enable</Nullable>` no `.csproj`, para o `string` barrar o valor nulo", isCorrect: false },
                            { text: "Chamar `app.UseExceptionHandler()`, que transforma os atributos em respostas 400", isCorrect: false },
                            { text: "Usar `[property: Required]`, porque em record o atributo no parâmetro é ignorado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um `POST /api/produtos` acabou de criar o produto de id 7. Qual resposta segue a convenção HTTP?",
                        difficulty: "facil",
                        options: [
                            { text: "204 No Content, porque o cliente já tem os dados que acabou de enviar", isCorrect: false },
                            { text: "202 Accepted, porque a gravação aconteceu depois de a requisição chegar", isCorrect: false },
                            { text: "201 Created, com o header `Location` apontando para `/api/produtos/7`", isCorrect: true },
                            { text: "200 OK, com o produto no corpo e o id repetido num header `X-Id`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `AddValidation()` ligado, o endpoint `POST /api/promocoes` recebe o record abaixo. Um cliente envia `{\"precoNormal\":100,\"precoPromocional\":120}`, sem `codigo`. Quais erros voltam no 400?\n\n```csharp\npublic record NovaPromocao([Required] string Codigo, decimal PrecoNormal, decimal PrecoPromocional)\n    : IValidatableObject\n{\n    public IEnumerable<ValidationResult> Validate(ValidationContext contexto)\n    {\n        if (PrecoPromocional >= PrecoNormal)\n            yield return new ValidationResult(\"Promoção maior que o preço normal\", [nameof(PrecoPromocional)]);\n    }\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Um erro de leitura do JSON, porque o record exige `codigo` no construtor", isCorrect: false },
                            { text: "Os dois erros, de `Codigo` e de `PrecoPromocional`, juntos no mesmo `errors`", isCorrect: false },
                            { text: "Só o erro de `PrecoPromocional`, porque a regra do objeto roda antes dos atributos", isCorrect: false },
                            { text: "Só o erro de `Codigo`, porque o `Validate` roda depois que os atributos passam", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com `AddProblemDetails()` e `app.UseExceptionHandler()` no `Program.cs`, um endpoint lança `InvalidOperationException(\"senha do banco: 123\")` em produção. O que o cliente recebe?",
                        difficulty: "medio",
                        options: [
                            { text: "400 em `application/problem+json`, porque `InvalidOperationException` indica uso errado", isCorrect: false },
                            { text: "500 em `application/problem+json`, com a mensagem da exceção no campo `detail`", isCorrect: false },
                            { text: "500 em `application/problem+json`, com título genérico e sem a mensagem da exceção", isCorrect: true },
                            { text: "500 com o stack trace em texto, porque o ambiente não muda o tratamento global", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um `IExceptionHandler` converte `EstoqueInsuficienteException` em 409 e devolve `true`. Depois da migração para o .NET 10, o time percebe que essas exceções sumiram do log, embora os clientes continuem recebendo o 409. O que aconteceu?",
                        difficulty: "dificil",
                        options: [
                            { text: "O nível mínimo padrão do log passou de Information para Warning no ASP.NET Core 10", isCorrect: false },
                            { text: "O `IExceptionHandler` passou a rodar depois do log, que agora só registra respostas 500", isCorrect: false },
                            { text: "O `AddProblemDetails()` passou a engolir as exceções antes de elas chegarem ao middleware", isCorrect: false },
                            { text: "O middleware deixou de registrar as exceções que um `IExceptionHandler` trata com `true`", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Configuração e segredos",
                blocks: [
                    {
                        type: "text",
                        value: "# Configuração e segredos\n\nA URL do serviço de pagamento muda entre o ambiente de teste e o de produção; o limite de itens por pedido muda quando o comercial decide; a chave da API de pagamento não pode estar no código, muito menos no Git. Configuração é tudo o que muda **sem recompilar**. O ASP.NET Core junta várias **fontes** numa visão só, em que cada chave tem um caminho com dois-pontos, como `Loja:MaxItensPorPedido`.\n\n## Fontes e ambientes\n\nO `WebApplication.CreateBuilder` empilha as fontes numa ordem fixa e, quando a mesma chave aparece em mais de uma, **vence a que entra por último** (tabela abaixo). O arquivo do ambiente não substitui o `appsettings.json` inteiro: ele sobrescreve só as chaves que declara, e o resto continua valendo.\n\nO ambiente vem da variável `ASPNETCORE_ENVIRONMENT` (ou `DOTNET_ENVIRONMENT`). **Sem nenhuma das duas, o ambiente é Production.** Quem põe Development na sua máquina é o `Properties/launchSettings.json`, usado pelo `dotnet run` e que não vai junto no deploy. No código, `app.Environment.IsDevelopment()` liga o que só deve existir em desenvolvimento.\n\nVariável de ambiente não aceita dois-pontos em todo sistema, então ali o separador vira **dois sublinhados**: `Loja__MaxItensPorPedido=20` sobrescreve `Loja:MaxItensPorPedido`.",
                    },
                    {
                        type: "code",
                        value: "# appsettings.json (vai para o repositório: nada de segredo aqui)\n{\n  \"Logging\": {\n    \"LogLevel\": {\n      \"Default\": \"Information\",\n      \"Microsoft.AspNetCore\": \"Warning\"\n    }\n  },\n  \"AllowedHosts\": \"*\",\n  \"Loja\": {\n    \"Nome\": \"Loja Exemplo\",\n    \"MaxItensPorPedido\": 10,\n    \"FreteGratisAcimaDe\": 199.90\n  },\n  \"Pagamentos\": {\n    \"UrlBase\": \"https://sandbox.pagamentos.exemplo\",\n    \"ChaveApi\": \"\"\n  }\n}\n\n# appsettings.Development.json (sobrescreve só as chaves que declara)\n{\n  \"Loja\": {\n    \"MaxItensPorPedido\": 50\n  }\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Ordem\",\"Fonte\",\"Exemplo para Loja:MaxItensPorPedido\"],[\"1 (base)\",\"`appsettings.json`\",\"10\"],[\"2\",\"`appsettings.{Ambiente}.json`\",\"50 no `appsettings.Development.json`\"],[\"3\",\"User-secrets (só em Development)\",\"70 com `dotnet user-secrets set`\"],[\"4\",\"Variáveis de ambiente\",\"20 com `Loja__MaxItensPorPedido=20`\"],[\"5 (vence)\",\"Argumentos de linha de comando\",\"30 com `--Loja:MaxItensPorPedido=30`\"]]",
                    },
                    {
                        type: "text",
                        value: "## O padrão Options\n\nDá para ler a configuração na mão, com `builder.Configuration[\"Pagamentos:UrlBase\"]` ou `GetValue<int>(\"Loja:MaxItensPorPedido\")`, mas isso espalha strings mágicas pelo código, não tem tipo e não valida nada: uma chave digitada errado vira `null` em silêncio. O **padrão Options** liga uma seção a uma classe. `BindConfiguration(\"Loja\")` preenche `LojaOptions` a partir de todas as fontes, `ValidateDataAnnotations()` aplica os atributos da classe e `ValidateOnStart()` faz a validação rodar **na subida**. Quem precisa da configuração recebe `IOptions<LojaOptions>` por injeção, como qualquer serviço.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (padrão Options)\nusing System.ComponentModel.DataAnnotations;\nusing Microsoft.Extensions.Options;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddOptions<LojaOptions>()\n    .BindConfiguration(LojaOptions.Secao)   // lê a seção \"Loja\" de todas as fontes\n    .ValidateDataAnnotations()              // aplica os atributos da classe\n    .ValidateOnStart();                     // valor inválido derruba a subida\n\n// Leitura avulsa também existe, mas sem tipo e sem validação\nvar urlPagamentos = builder.Configuration[\"Pagamentos:UrlBase\"];\n\nvar app = builder.Build();\n\napp.MapGet(\"/api/frete\", (decimal valorDoPedido, IOptions<LojaOptions> opcoes) =>\n    TypedResults.Ok(new { freteGratis = valorDoPedido >= opcoes.Value.FreteGratisAcimaDe }));\n\napp.Run();\n\npublic sealed class LojaOptions\n{\n    public const string Secao = \"Loja\";\n\n    [Required]\n    public string Nome { get; set; } = \"\";\n\n    [Range(1, 100)]\n    public int MaxItensPorPedido { get; set; }\n\n    public decimal FreteGratisAcimaDe { get; set; }\n}",
                    },
                    {
                        type: "text",
                        value: "## IOptions, IOptionsSnapshot ou IOptionsMonitor\n\nO `appsettings.json` é recarregado quando muda no disco, mas cada interface reage de um jeito. Num teste com a API no ar, mudando `MaxItensPorPedido` de 10 para 15, a requisição seguinte mostrou 10 no `IOptions`, 15 no `IOptionsSnapshot` e 15 no `IOptionsMonitor`. Dois cuidados:\n\n- `IOptionsSnapshot<T>` é Scoped. Injetado num Singleton, cai na dependência cativa, e em Development o `Build()` acusa Cannot consume scoped service.\n- Sem `ValidateOnStart()`, a validação só roda quando alguém lê `.Value`. A aplicação sobe com o valor errado, e a primeira rota que usa a opção responde 500 com `OptionsValidationException`. Com ele, o deploy falha na hora (Hosting failed to start), que é onde configuração errada deve aparecer.",
                    },
                    {
                        type: "table",
                        value: "[[\"Interface\",\"Tempo de vida\",\"Vê mudança no arquivo?\",\"Quando usar\"],[\"`IOptions<T>`\",\"Singleton\",\"Não: calcula o valor uma vez\",\"Configuração que só muda com novo deploy\"],[\"`IOptionsSnapshot<T>`\",\"Scoped\",\"Sim, a cada requisição\",\"Valor que pode mudar, lido por requisição\"],[\"`IOptionsMonitor<T>`\",\"Singleton\",\"Sim, em `CurrentValue`, com aviso por `OnChange`\",\"Singleton que precisa do valor atual\"]]",
                    },
                    {
                        type: "text",
                        value: "## Segredos fora do repositório\n\nSenha de banco, chave de API e token de serviço **nunca** vão para o `appsettings.json`: ele está no Git, e tudo o que entra no histórico do Git deve ser tratado como vazado, mesmo que um commit seguinte apague a linha. Segredo que vazou se troca (rotaciona); apagar o arquivo não basta.\n\nEm desenvolvimento, o caminho é o **Secret Manager** (`dotnet user-secrets`). Ele guarda os valores num `secrets.json` no perfil do seu usuário, fora da pasta do projeto, ligado ao projeto pelo `UserSecretsId` que o `init` grava no `.csproj` (sem o `init`, o `set` falha). O `CreateBuilder` só lê esse arquivo no ambiente Development. Repare que ele **não criptografa nada**: é conveniência para não versionar segredo, não cofre. Em produção, o segredo chega por variável de ambiente injetada pela plataforma ou por um cofre de segredos do provedor de nuvem.",
                    },
                    {
                        type: "code",
                        value: "# terminal, na pasta do projeto\ndotnet user-secrets init\n# Set UserSecretsId to '48913ed1-0757-4739-8a48-e6d5b281dcda' for MSBuild project '.../Loja.csproj'.\n\ndotnet user-secrets set \"Pagamentos:ChaveApi\" \"sk_test_abc123\"\n# Successfully saved Pagamentos:ChaveApi to the secret store.\n\ndotnet user-secrets list\n# Pagamentos:ChaveApi = sk_test_abc123\n\n# Onde o valor fica (texto puro, fora da pasta do projeto):\n#   Linux e macOS: ~/.microsoft/usersecrets/<UserSecretsId>/secrets.json\n#   Windows:       %APPDATA%\\Microsoft\\UserSecrets\\<UserSecretsId>\\secrets.json\n# O CreateBuilder só lê esse arquivo quando o ambiente é Development.\n\n# Em produção, o mesmo valor chega por variável de ambiente (ou por um cofre de segredos)\nexport Pagamentos__ChaveApi=\"valor-de-producao\"",
                    },
                    {
                        type: "quote",
                        value: "Configuração muda sem recompilar e chega em camadas, com a última fonte vencendo; o padrão Options dá tipo e validação a ela, e o `ValidateOnStart` faz o erro aparecer no deploy. Segredo não entra no repositório: user-secrets na sua máquina, variável de ambiente ou cofre em produção.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual variável de ambiente sobrescreve a chave `Loja:MaxItensPorPedido` do `appsettings.json` numa API rodando em contêiner Linux?",
                        difficulty: "facil",
                        options: [
                            { text: "`Loja.MaxItensPorPedido=20`, com um ponto entre a seção e a chave, como em C#", isCorrect: false },
                            { text: "`Loja_MaxItensPorPedido=20`, com um sublinhado só entre a seção e a chave", isCorrect: false },
                            { text: "`Loja__MaxItensPorPedido=20`, com dois sublinhados entre a seção e a chave", isCorrect: true },
                            { text: "`Loja-MaxItensPorPedido=20`, com um hífen entre a seção e a chave, como em URL", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para que serve o `dotnet user-secrets` num projeto ASP.NET Core?",
                        difficulty: "facil",
                        options: [
                            { text: "Guardar os segredos de produção, lidos pela API em qualquer ambiente", isCorrect: false },
                            { text: "Guardar segredos de desenvolvimento fora da pasta do projeto, longe do Git", isCorrect: true },
                            { text: "Compartilhar os segredos com o time, sincronizados pelo repositório remoto", isCorrect: false },
                            { text: "Criptografar o `appsettings.json` antes do commit, para ele ir seguro ao Git", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No ambiente Development, a chave `Loja:MaxItensPorPedido` vale 10 no `appsettings.json`, 50 no `appsettings.Development.json`, 70 no user-secrets e 20 numa variável de ambiente. Nenhum argumento de linha de comando foi passado. Qual valor a aplicação enxerga?",
                        difficulty: "medio",
                        options: [
                            { text: "50", isCorrect: false },
                            { text: "10", isCorrect: false },
                            { text: "20", isCorrect: true },
                            { text: "70", isCorrect: false },
                        ],
                    },
                    {
                        statement: "A API lê `LojaOptions` em três rotas: uma recebe `IOptions<LojaOptions>`, outra `IOptionsSnapshot<LojaOptions>` e a terceira `IOptionsMonitor<LojaOptions>`. As três já foram chamadas e mostraram `MaxItensPorPedido` igual a 10. Com a API no ar, alguém muda o valor para 15 no `appsettings.json`. O que as três rotas mostram na chamada seguinte?",
                        difficulty: "medio",
                        options: [
                            { text: "10 nas três, porque a configuração só é lida uma vez, na subida da aplicação", isCorrect: false },
                            { text: "10 no `IOptions` e no `IOptionsSnapshot`, 15 só no `IOptionsMonitor`", isCorrect: false },
                            { text: "15 nas três, porque o arquivo é recarregado e todas leem a configuração atual", isCorrect: false },
                            { text: "10 no `IOptions`, 15 no `IOptionsSnapshot` e 15 no `IOptionsMonitor`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "`LojaOptions` tem `[Range(1, 100)]` em `MaxItensPorPedido` e é registrada com `AddOptions<LojaOptions>().BindConfiguration(\"Loja\").ValidateDataAnnotations()`, sem `ValidateOnStart()`. Em produção, uma variável de ambiente define o valor 500. O que acontece?",
                        difficulty: "dificil",
                        options: [
                            { text: "A API sobe e lê 500 sem erro, porque o `[Range]` só vale para valores vindos do JSON", isCorrect: false },
                            { text: "A API sobe, e a rota que lê a opção responde 500 com `OptionsValidationException`", isCorrect: true },
                            { text: "A API sobe, e o valor 500 é rebaixado para 100, o máximo declarado no `[Range]`", isCorrect: false },
                            { text: "A API não sobe, porque a validação de DataAnnotations sempre roda durante o `Build()`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "OpenAPI, controllers e middleware",
                blocks: [
                    {
                        type: "text",
                        value: "# OpenAPI, controllers e middleware\n\nO time do aplicativo vai consumir a sua API e pergunta: quais rotas existem, o que cada uma recebe, o que devolve, quais erros podem voltar? Responder isso num documento escrito à mão é garantia de desatualização. O **OpenAPI** é a especificação padrão para descrever APIs HTTP, e o ASP.NET Core gera esse documento a partir do próprio código.\n\n## O documento OpenAPI nativo\n\nCom o pacote `Microsoft.AspNetCore.OpenApi`, `builder.Services.AddOpenApi()` registra o gerador e `app.MapOpenApi()` publica o documento em `/openapi/v1.json`. No .NET 10 ele sai em OpenAPI 3.1, e uma segunda chamada com o sufixo `.yaml` entrega o mesmo documento em YAML. O pacote gera **só o documento**: interface interativa, como Scalar ou Swagger UI, é escolha à parte. O Swashbuckle, que fazia esse papel nos templates antigos, saiu dos templates no .NET 9; o template `webapi` atual já vem com `AddOpenApi()`.\n\nO documento expõe a superfície inteira da API, então publique só em Development, como no código abaixo, ou proteja a rota com autorização.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (documento OpenAPI nativo; pacote Microsoft.AspNetCore.OpenApi)\nusing Microsoft.AspNetCore.Http.HttpResults;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddOpenApi();\nbuilder.Services.AddSingleton<IProdutoRepositorio, ProdutoRepositorioEmMemoria>();\n\nvar app = builder.Build();\n\nif (app.Environment.IsDevelopment())\n{\n    app.MapOpenApi();                                // GET /openapi/v1.json\n    app.MapOpenApi(\"/openapi/{documentName}.yaml\");  // o mesmo documento em YAML\n}\n\nvar produtos = app.MapGroup(\"/api/produtos\").WithTags(\"Produtos\");\n\nprodutos.MapGet(\"/{id:int}\", async Task<Results<Ok<Produto>, NotFound>> (int id, IProdutoRepositorio repo) =>\n        await repo.BuscarAsync(id) is { } produto ? TypedResults.Ok(produto) : TypedResults.NotFound())\n    .WithName(\"BuscarProduto\")\n    .WithSummary(\"Busca um produto pelo id\");\n\n// Mesma rota com Results (IResult): compila, mas o documento perde o 404 e o schema\nprodutos.MapGet(\"/legado/{id:int}\", async (int id, IProdutoRepositorio repo) =>\n    await repo.BuscarAsync(id) is { } produto ? Results.Ok(produto) : Results.NotFound());\n\napp.Run();\n\n// Trecho do /openapi/v1.json gerado (resumido):\n// \"openapi\": \"3.1.1\",\n// \"/api/produtos/{id}\": { \"get\": { \"tags\": [\"Produtos\"], \"summary\": \"Busca um produto pelo id\",\n//     \"operationId\": \"BuscarProduto\", \"responses\": {\n//       \"200\": { \"content\": { \"application/json\": { \"schema\": { \"$ref\": \"#/components/schemas/Produto\" } } } },\n//       \"404\": { \"description\": \"Not Found\" } } } },\n// \"/api/produtos/legado/{id}\": { \"get\": { \"tags\": [\"Produtos\"], \"responses\": {\n//       \"200\": { \"description\": \"OK\" } } } }      <- sem o 404 e sem o schema",
                    },
                    {
                        type: "text",
                        value: "## Metadados e o custo de devolver IResult\n\n`WithTags`, `WithName` e `WithSummary` enriquecem o documento, e os tipos de `TypedResults` fazem o resto: com `Results<Ok<Produto>, NotFound>`, o gerador documenta o 200 com o schema de `Produto` e o 404. A rota que devolve `Results.Ok` (um `IResult`) compila e funciona igual, mas o documento só mostra um 200 sem schema, e quem gerar um cliente a partir dele nem fica sabendo que existe o 404.\n\n## Controllers ainda fazem sentido?\n\nControllers são classes que herdam de `ControllerBase`, com um método (action) por operação. A documentação do ASP.NET Core 10 recomenda Minimal APIs para projetos novos e lista os casos em que controllers ainda compensam: extensibilidade de model binding (`IModelBinder`), validação avançada com `IModelValidator`, application parts e OData. Pesa também a base existente: uma API grande já organizada em controllers não ganha nada com uma reescrita. O template `webapi` gera Minimal APIs por padrão, e a opção `--use-controllers` gera a versão com controllers. As duas abordagens convivem no mesmo projeto.",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\",\"Minimal APIs\",\"Controllers\"],[\"Recomendação atual\",\"Padrão para projeto novo\",\"Alternativa para casos específicos\"],[\"Organização\",\"`MapGroup` e um método de extensão por recurso\",\"Uma classe por recurso, herdando de `ControllerBase`\"],[\"Validação\",\"`AddValidation()`, do .NET 10\",\"Validação do MVC, automática com `[ApiController]`\"],[\"Extensibilidade\",\"Filtros de endpoint e código próprio\",\"`IModelBinder`, `IModelValidator`, application parts, OData\"],[\"Quando escolher\",\"API nova, serviço pequeno ou médio\",\"Base grande já em MVC ou recurso que só o MVC tem\"]]",
                    },
                    {
                        type: "code",
                        value: "// Controllers/ProdutosController.cs (no Program.cs: AddControllers() e MapControllers())\nusing Microsoft.AspNetCore.Mvc;\n\n[ApiController]                     // 400 automático com ProblemDetails, origem dos parâmetros inferida\n[Route(\"api/v1/[controller]\")]      // [controller] vira \"Produtos\"\npublic class ProdutosController(IProdutoRepositorio repo) : ControllerBase\n{\n    [HttpGet(\"{id:int}\")]\n    public async Task<ActionResult<Produto>> Buscar(int id) =>\n        await repo.BuscarAsync(id) is { } produto ? produto : NotFound();\n\n    [HttpPost]\n    public async Task<ActionResult<Produto>> Criar(NovoProduto novo)\n    {\n        var criado = await repo.AdicionarAsync(novo);\n        return CreatedAtAction(nameof(Buscar), new { id = criado.Id }, criado);\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O pipeline de middleware\n\nToda requisição atravessa uma cadeia de **middlewares**: componentes que fazem algo, chamam o próximo e fazem mais algo quando ele termina. A ordem em que aparecem no `Program.cs` é a ordem na ida; na volta, é a inversa. Com dois middlewares A e B registrados nessa ordem, cada um escrevendo antes e depois de `await proximo(contexto)`, uma requisição produz A entrou, B entrou, endpoint, B saiu, A saiu.\n\nA ordem recomendada pela documentação: tratamento de exceção primeiro (ele só pega o que acontece **depois** dele), HSTS (o header que manda o navegador usar só HTTPS), redirecionamento para HTTPS, arquivos estáticos, roteamento, CORS, autenticação, autorização e, no fim, os endpoints. O `WebApplication` facilita: se você não chamar `UseRouting`, ele põe o roteamento no começo, e os endpoints sempre rodam no fim; por isso, a posição do `MapGet` em relação ao `app.Use` não muda nada.\n\nTrês armadilhas:\n\n- **Middleware antes do `UseExceptionHandler`.** Uma exceção lançada nele escapa do tratamento global e vira 500 sem corpo.\n- **Header depois de chamar o próximo.** Quando o endpoint escreve o corpo, os headers já foram enviados; mexer neles depois lança Headers are read-only, response has already started. Use `Response.OnStarting`, chamado logo antes do envio.\n- **Curto-circuito.** Um middleware que não chama o próximo encerra a requisição ali: útil num modo de manutenção que responde 503, perigoso quando acontece sem querer.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs (a ordem do pipeline)\nusing System.Diagnostics;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddProblemDetails();\n\nvar app = builder.Build();\n\napp.UseExceptionHandler();      // 1. primeiro: pega exceções de tudo o que vem depois\napp.UseHttpsRedirection();      // 2. HTTP vira HTTPS\n// app.UseCors();               // 3. CORS, autenticação e autorização, nesta ordem\n// app.UseAuthentication();\n// app.UseAuthorization();\n\napp.Use(async (contexto, proximo) =>     // 4. middleware próprio: mede cada requisição\n{\n    var inicio = Stopwatch.GetTimestamp();\n\n    // Header só pode ser escrito antes de a resposta começar: OnStarting é o último momento\n    contexto.Response.OnStarting(() =>\n    {\n        var ms = (int)Stopwatch.GetElapsedTime(inicio).TotalMilliseconds;\n        contexto.Response.Headers[\"X-Tempo-Ms\"] = ms.ToString();\n        return Task.CompletedTask;\n    });\n\n    await proximo(contexto);  // tudo o que vem depois roda aqui dentro\n\n    app.Logger.LogInformation(\"{Metodo} {Caminho} respondeu {Status} em {DuracaoMs} ms\",\n        contexto.Request.Method, contexto.Request.Path, contexto.Response.StatusCode,\n        Stopwatch.GetElapsedTime(inicio).TotalMilliseconds);\n});\n\napp.MapGet(\"/ola\", () => \"olá\");  // 5. os endpoints rodam no fim do pipeline\n\napp.Run();\n\n// GET /ola responde 200 com o header X-Tempo-Ms, e o console mostra:\n//   info: Loja[0]\n//         GET /ola respondeu 200 em 0.216 ms\n// (Loja é o nome do projeto: app.Logger usa o nome da aplicação como categoria)",
                    },
                    {
                        type: "text",
                        value: "## ILogger: o básico bem feito\n\nPeça `ILogger<T>` por injeção; o `T` vira a **categoria** do log, normalmente a classe que escreve. Os níveis, do mais detalhado ao mais grave: `Trace`, `Debug`, `Information`, `Warning`, `Error` e `Critical`. O mínimo de cada categoria vem da seção `Logging:LogLevel` da configuração, e a regra mais específica vence: com `\"Default\": \"Information\"` e `\"Microsoft.AspNetCore\": \"Warning\"`, o seu código registra a partir de Information, e as categorias que começam com `Microsoft.AspNetCore` só a partir de Warning.\n\nA regra que mais importa é usar **message template**, nunca interpolação. No template, os nomes entre chaves batizam **campos estruturados**, que o destino do log guarda separados da frase: dá para filtrar todos os registros com `PedidoId` igual a 42. Com interpolação, a frase chega pronta e os campos se perdem. Os valores entram **por posição**, não pelo nome: argumentos trocados gravam campos trocados, sem aviso nenhum. Para registrar erro, passe a exceção como primeiro argumento (`logger.LogError(ex, \"Falha ao cobrar o pedido {PedidoId}\", pedidoId)`), e nunca registre senha, token ou dado pessoal sensível. Em caminho muito quente, o atributo `[LoggerMessage]` gera o código de log em tempo de compilação, com o mesmo template e menos custo.",
                    },
                    {
                        type: "code",
                        value: "// Logging com message template (ILogger<Program> vem do contêiner)\napp.MapPost(\"/api/pedidos\", (NovoPedido pedido, ILogger<Program> logger) =>\n{\n    var pedidoId = 42;\n\n    // Certo: os nomes entre chaves batizam os campos; os valores entram por posição\n    logger.LogInformation(\"Pedido {PedidoId} criado para o cliente {ClienteId}\", pedidoId, pedido.ClienteId);\n\n    // Errado: a interpolação monta a frase antes, e o registro chega sem campos\n    logger.LogInformation($\"Pedido {pedidoId} criado para o cliente {pedido.ClienteId}\");\n\n    // Errado e silencioso: argumentos trocados gravam os campos trocados\n    logger.LogInformation(\"Pedido {PedidoId} criado para o cliente {ClienteId}\", pedido.ClienteId, pedidoId);\n\n    logger.LogDebug(\"Pedido com {QuantidadeDeItens} itens\", pedido.QuantidadeDeItens); // só com nível Debug\n\n    return TypedResults.Created($\"/api/pedidos/{pedidoId}\", new { pedidoId });\n});\n\n// Saída com builder.Logging.AddJsonConsole() (resumida), uma linha por chamada:\n// {\"LogLevel\":\"Information\",\"Category\":\"Program\",\"Message\":\"Pedido 42 criado para o cliente 7\",\n//  \"State\":{\"PedidoId\":42,\"ClienteId\":7,\"{OriginalFormat}\":\"Pedido {PedidoId} criado para o cliente {ClienteId}\"}}\n// {\"LogLevel\":\"Information\",\"Category\":\"Program\",\"Message\":\"Pedido 42 criado para o cliente 7\",\n//  \"State\":{\"{OriginalFormat}\":\"Pedido 42 criado para o cliente 7\"}}\n// {\"LogLevel\":\"Information\",\"Category\":\"Program\",\"Message\":\"Pedido 7 criado para o cliente 42\",\n//  \"State\":{\"PedidoId\":7,\"ClienteId\":42,\"{OriginalFormat}\":\"Pedido {PedidoId} criado para o cliente {ClienteId}\"}}",
                    },
                    {
                        type: "quote",
                        value: "O OpenAPI nativo transforma o código no contrato da API, e os `TypedResults` mantêm esse contrato honesto; controllers continuam válidos onde o MVC oferece algo de que você precisa. A ordem do pipeline vale na ida e se inverte na volta, e log bom é message template com campos, nunca frase interpolada.",
                    },
                ],
                questions: [
                    {
                        statement: "Dois middlewares, A e depois B, escrevem uma linha antes e outra depois de `await proximo(contexto)`. Em que ordem as linhas aparecem numa requisição que chega ao endpoint?",
                        difficulty: "facil",
                        options: [
                            { text: "A entrou, A saiu, B entrou, B saiu, endpoint", isCorrect: false },
                            { text: "B entrou, A entrou, endpoint, A saiu, B saiu", isCorrect: false },
                            { text: "A entrou, B entrou, endpoint, A saiu, B saiu", isCorrect: false },
                            { text: "A entrou, B entrou, endpoint, B saiu, A saiu", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Num projeto .NET 10 com `builder.Services.AddOpenApi()` e `app.MapOpenApi()`, o que o desenvolvedor encontra ao subir a API em Development?",
                        difficulty: "facil",
                        options: [
                            { text: "Nada em tempo de execução: o documento só sai num arquivo gerado pelo `dotnet build`", isCorrect: false },
                            { text: "Uma interface interativa em `/openapi`, gerada junto com o documento em JSON", isCorrect: false },
                            { text: "O documento em `/openapi/v1.json`, sem nenhuma interface interativa incluída", isCorrect: true },
                            { text: "O documento em `/swagger/v1/swagger.json` e a interface do Swagger UI em `/swagger`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com `var pedidoId = 42;` e `var clienteId = 7;`, qual chamada grava os campos estruturados `PedidoId` = 42 e `ClienteId` = 7?",
                        difficulty: "medio",
                        options: [
                            { text: "`logger.LogInformation($\"Pedido {pedidoId} do cliente {clienteId}\");`", isCorrect: false },
                            { text: "`logger.LogInformation(\"Pedido {PedidoId} do cliente {ClienteId}\", clienteId, pedidoId);`", isCorrect: false },
                            { text: "`logger.LogInformation(\"Pedido {PedidoId} do cliente {ClienteId}\", pedidoId, clienteId);`", isCorrect: true },
                            { text: "`logger.LogInformation(\"Pedido {pedidoId} do cliente {clienteId}\");`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Em qual situação a documentação do ASP.NET Core 10 ainda indica controllers no lugar de Minimal APIs?",
                        difficulty: "medio",
                        options: [
                            { text: "Quando a API precisa de documento OpenAPI, que Minimal APIs não geram sozinhas", isCorrect: false },
                            { text: "Quando a API recebe muito tráfego, porque controllers têm menos sobrecarga", isCorrect: false },
                            { text: "Quando o projeto precisa de recursos do MVC, como `IModelBinder` próprio ou OData", isCorrect: true },
                            { text: "Quando a API precisa validar DataAnnotations, o que Minimal APIs não fazem sozinhas", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um middleware mede o tempo da requisição e grava o header `X-Tempo-Ms` depois de `await proximo(contexto)`. Em produção, os clientes recebem a resposta sem o header, e o log mostra Headers are read-only, response has already started. Qual é a correção?",
                        difficulty: "dificil",
                        options: [
                            { text: "Gravar o header num callback de `contexto.Response.OnStarting`, registrado antes do `proximo`", isCorrect: true },
                            { text: "Gravar o header antes do `await proximo(contexto)`, com o tempo medido até aquele ponto", isCorrect: false },
                            { text: "Registrar o middleware depois dos `MapGet`, para ele rodar quando os endpoints já terminaram", isCorrect: false },
                            { text: "Trocar a atribuição em `Headers[\"X-Tempo-Ms\"]` por `Headers.Append`, que aceita resposta já iniciada", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 6 - Dados com EF Core",
        aulas: [
            {
                titulo: "DbContext e entidades",
                blocks: [
                    {
                        type: "text",
                        value: "# DbContext e entidades\n\nAté aqui a API guardava os produtos num repositório em memória, registrado como Singleton. Funciona na demonstração e quebra no primeiro dia de uso real: o processo reiniciou, os dados sumiram; subiu uma segunda instância atrás do balanceador, cada uma tem a sua lista e as duas discordam entre si. Os dados precisam morar num banco, e o caminho padrão no .NET para isso é o **Entity Framework Core** (EF Core).\n\nO EF Core é um ORM (*object-relational mapper*, o mapeador entre objetos e tabelas). Você descreve as entidades como classes C# comuns, e ele faz três trabalhos: **mapeia** cada classe para uma tabela, **traduz** consultas LINQ para SQL e **rastreia** o que mudou nos objetos para gerar `INSERT`, `UPDATE` e `DELETE` na hora de salvar. Escrever SQL à mão (com Dapper ou ADO.NET, por exemplo) continua possível e às vezes é o certo; o EF Core tira de você o SQL repetitivo do dia a dia.\n\nO banco deste módulo é o **PostgreSQL**, acessado pelo provedor do projeto Npgsql. A regra de versão não envelhece: a versão maior do provedor acompanha a do EF Core, que acompanha a do .NET. Projeto em .NET 10 usa EF Core 10 (LTS, com suporte até novembro de 2028) e `Npgsql.EntityFrameworkCore.PostgreSQL` 10, que em outubro de 2026 está na 10.0.3 e já traz o EF Core como dependência.",
                    },
                    {
                        type: "code",
                        value: "# terminal, na pasta da API\ndotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 10.0.3",
                    },
                    {
                        type: "code",
                        value: "// Entidades.cs\npublic class Produto\n{\n    public int Id { get; set; }\n    public required string Nome { get; set; }\n    public required string Sku { get; set; }\n    public string? Descricao { get; set; }\n    public decimal Preco { get; set; }\n    public bool Ativo { get; set; } = true;\n}\n\npublic enum StatusPedido { Aberto, Pago, Cancelado }\n\npublic class Pedido\n{\n    public int Id { get; set; }\n    public string? Codigo { get; set; }\n    public required string ClienteEmail { get; set; }\n    public DateTime CriadoEm { get; set; }\n    public StatusPedido Status { get; set; }\n    public List<ItemPedido> Itens { get; } = [];\n}\n\npublic class ItemPedido\n{\n    public int Id { get; set; }\n    public int PedidoId { get; set; }\n    public Pedido Pedido { get; set; } = null!;\n    public int ProdutoId { get; set; }\n    public Produto Produto { get; set; } = null!;\n    public int Quantidade { get; set; }\n    public decimal PrecoUnitario { get; set; }\n}",
                    },
                    {
                        type: "text",
                        value: "## Convenções: o que o EF deduz sozinho\n\nAs classes não herdam de nada nem têm atributo, e mesmo assim o EF Core já sabe montar o banco, porque aplica **convenções**. Uma propriedade chamada `Id`, ou o nome da classe seguido de `Id` (`ProdutoId` dentro de `Produto`), vira a chave primária, e chave `int` passa a ser gerada pelo banco. Uma navegação (`ItemPedido.Pedido`, `Pedido.Itens`) vira relacionamento, e o `PedidoId` ao lado dela, em `ItemPedido`, vira a chave estrangeira. Cada tabela ganha o nome do `DbSet` que a expõe no contexto, escrito como no C#; no PostgreSQL, nome com maiúscula só funciona entre aspas (`SELECT \"Nome\" FROM \"Produtos\"`). Se o time prefere snake_case, o pacote da comunidade `EFCore.NamingConventions` (Apache 2.0, com versão 10 para o EF Core 10) resolve com `UseSnakeCaseNamingConvention()`. Decida antes da primeira migration, porque trocar depois renomeia o banco inteiro.\n\nA nulidade vem dos *nullable reference types*, ligados por padrão nos templates: `string` vira coluna `NOT NULL` e `string?` vira coluna que aceita nulo. Quem desliga o recurso ganha o contrário, e toda `string` vira opcional: o banco passa a aceitar pedido sem e-mail. A tabela abaixo saiu da migration que o EF gerou para estas classes.",
                    },
                    {
                        type: "table",
                        value: "[[\"No C#\",\"O que a convenção entende\",\"Coluna gerada no PostgreSQL\"],[\"`int Id`\",\"chave primária gerada pelo banco\",\"`integer GENERATED BY DEFAULT AS IDENTITY`\"],[\"`string ClienteEmail`\",\"obrigatória, porque não tem `?`\",\"`text NOT NULL`\"],[\"`string? Codigo`\",\"opcional\",\"`text`, aceitando nulo\"],[\"`decimal` sem configuração\",\"número exato\",\"`numeric`, sem precisão definida\"],[\"`DateTime CriadoEm`\",\"data e hora\",\"`timestamp with time zone`\"],[\"`StatusPedido Status` (enum)\",\"valor numérico do enum\",\"`integer`\"],[\"`int PedidoId` com `Pedido Pedido`\",\"chave estrangeira obrigatória\",\"FK com `ON DELETE CASCADE` e índice próprio\"]]",
                    },
                    {
                        type: "code",
                        value: "// LojaDbContext.cs\nusing Microsoft.EntityFrameworkCore;\n\npublic class LojaDbContext(DbContextOptions<LojaDbContext> options) : DbContext(options)\n{\n    public DbSet<Produto> Produtos => Set<Produto>();\n    public DbSet<Pedido> Pedidos => Set<Pedido>();\n    public DbSet<ItemPedido> Itens => Set<ItemPedido>();\n\n    protected override void OnModelCreating(ModelBuilder modelBuilder)\n    {\n        modelBuilder.Entity<Produto>(produto =>\n        {\n            produto.Property(p => p.Nome).HasMaxLength(200);\n            produto.Property(p => p.Sku).HasMaxLength(40);\n            produto.Property(p => p.Preco).HasPrecision(10, 2);\n            produto.HasIndex(p => p.Sku).IsUnique();\n        });\n\n        modelBuilder.Entity<ItemPedido>(item =>\n        {\n            item.ToTable(\"ItensPedido\");\n            item.Property(i => i.PrecoUnitario).HasPrecision(10, 2);\n            item.HasOne(i => i.Produto)\n                .WithMany()\n                .OnDelete(DeleteBehavior.Restrict);\n        });\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Fluent API: o que a convenção não adivinha\n\nConvenção não sabe que nome cabe em 200 caracteres, que preço tem duas casas decimais ou que SKU não se repete. Isso vai no `OnModelCreating`, com a **Fluent API**: `HasMaxLength(200)` vira `character varying(200)`, `HasPrecision(10, 2)` vira `numeric(10,2)` e `HasIndex(...).IsUnique()` vira índice único. O `ToTable(\"ItensPedido\")` troca o nome que viria do `DbSet` (`Itens`), e o `OnDelete(DeleteBehavior.Restrict)` impede apagar um produto que já aparece em algum pedido, no lugar do cascade da convenção.\n\nExistem atributos para parte disso (`[MaxLength(200)]` na propriedade), mas, quando os dois configuram a mesma coisa, a Fluent API vence: ela tem a palavra final, a anotação vem antes dela e a convenção só vale onde ninguém configurou nada. Quando o `OnModelCreating` crescer, mova a configuração de cada entidade para uma classe `IEntityTypeConfiguration<T>` e registre todas de uma vez com `modelBuilder.ApplyConfigurationsFromAssembly(...)`.\n\n## Registrar na API\n\nO contexto entra no contêiner com `AddDbContext`, e o endpoint o recebe por injeção, como qualquer serviço. A connection string vem da configuração (`GetConnectionString(\"Loja\")` lê a seção `ConnectionStrings`), e a versão com senha nunca vai para o `appsettings.json`: em desenvolvimento ela fica nos user-secrets, na chave `ConnectionStrings:Loja`, e em produção numa variável de ambiente `ConnectionStrings__Loja`.",
                    },
                    {
                        type: "code",
                        value: "// Program.cs\nusing Microsoft.AspNetCore.Http.HttpResults;\nusing Microsoft.EntityFrameworkCore;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddDbContext<LojaDbContext>(options =>\n    options.UseNpgsql(builder.Configuration.GetConnectionString(\"Loja\")));\n\nvar app = builder.Build();\n\napp.MapGet(\"/produtos/{id:int}\", async Task<Results<Ok<Produto>, NotFound>> (\n    int id, LojaDbContext db, CancellationToken ct) =>\n{\n    var produto = await db.Produtos.FindAsync([id], ct);\n    return produto is null ? TypedResults.NotFound() : TypedResults.Ok(produto);\n});\n\napp.Run();\n\n// appsettings.json: a seção nova, sem a senha\n{\n  \"ConnectionStrings\": {\n    \"Loja\": \"Host=localhost;Port=5432;Database=loja;Username=loja_app\"\n  }\n}",
                    },
                    {
                        type: "text",
                        value: "## Um contexto por requisição, uma operação por vez\n\nO `AddDbContext` registra o contexto como **Scoped**: cada requisição recebe o seu, descartado no fim dela. Esse tempo de vida não é detalhe. O `DbContext` é uma unidade de trabalho curta, com uma conexão e um rastreador próprios, e **não aceita duas operações ao mesmo tempo**. Muita gente aprende `Task.WhenAll` e tenta contar produtos e pedidos em paralelo com o mesmo contexto; o EF costuma lançar `InvalidOperationException` com \"A second operation was started on this context instance before a previous operation completed\". A detecção é de melhor esforço: numa corrida apertada a primeira rodada pode até passar, e o erro aparece depois, então não conte com a exceção para achar o problema. Aguarde uma consulta de cada vez ou, quando o paralelismo for mesmo necessário, registre `AddDbContextFactory` e crie um contexto por tarefa.\n\n## Data e hora em UTC\n\nDesde o Npgsql 6, `DateTime` vira `timestamp with time zone`, e o provedor só aceita gravar nessa coluna valores com `Kind` igual a `Utc`. Quem grava `DateTime.Now` recebe uma `DbUpdateException` no `SaveChangesAsync`, com a exceção interna dizendo \"Cannot write DateTime with Kind=Local to PostgreSQL type 'timestamp with time zone', only UTC is supported\". O mesmo acontece com `Kind` Unspecified, o das datas montadas com `new DateTime(2026, 10, 20)`. Grave `DateTime.UtcNow` e converta para o fuso do usuário só na hora de exibir; na leitura, o valor volta com `Kind` Utc.",
                    },
                    {
                        type: "quote",
                        value: "O `DbContext` é a sessão com o banco: as entidades são classes comuns, as convenções resolvem o óbvio e a Fluent API resolve o resto. Registre-o com `AddDbContext`, use um por requisição e uma operação por vez, e grave datas em UTC.",
                    },
                ],
                questions: [
                    {
                        statement: "Quando a API registra o contexto com `builder.Services.AddDbContext<LojaDbContext>(...)`, qual é o tempo de vida do `LojaDbContext` no contêiner de injeção de dependência?",
                        difficulty: "facil",
                        options: [
                            { text: "Scoped por thread: uma instância para cada thread do pool de threads", isCorrect: false },
                            { text: "Scoped: uma instância por requisição, descartada quando ela termina", isCorrect: true },
                            { text: "Transient: uma instância nova a cada vez que um serviço pede o contexto", isCorrect: false },
                            { text: "Singleton: uma instância para a aplicação inteira, reaproveitada sempre", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com nullable reference types ligado (o padrão dos templates), a entidade `Pedido` tem `public string ClienteEmail { get; set; }` e `public string? Codigo { get; set; }`, sem configuração na Fluent API. Que colunas a migration cria no PostgreSQL?",
                        difficulty: "facil",
                        options: [
                            { text: "`ClienteEmail` como `varchar(max) NOT NULL` e `Codigo` fica fora da tabela", isCorrect: false },
                            { text: "As duas como `text` que aceita nulo, porque `string` é tipo de referência", isCorrect: false },
                            { text: "As duas como `varchar(255) NOT NULL`, o tamanho padrão do provedor Npgsql", isCorrect: false },
                            { text: "`ClienteEmail` como `text NOT NULL` e `Codigo` como `text` que aceita nulo", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A propriedade `Nome` de `Cliente` tem o atributo `[MaxLength(100)]`, e o `OnModelCreating` faz `modelBuilder.Entity<Cliente>().Property(c => c.Nome).HasMaxLength(200)`. Qual tamanho máximo vale no modelo?",
                        difficulty: "medio",
                        options: [
                            { text: "100, porque em conflito o EF fica com o limite mais restrito", isCorrect: false },
                            { text: "200, porque a configuração da Fluent API vence a anotação", isCorrect: true },
                            { text: "100, porque a anotação na propriedade vence a Fluent API", isCorrect: false },
                            { text: "Nenhum, porque o EF recusa montar o modelo com as duas regras", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um endpoint faz `pedido.CriadoEm = DateTime.Now;` e grava numa coluna `timestamp with time zone`, usando o Npgsql 10. O que acontece no `SaveChangesAsync`?",
                        difficulty: "medio",
                        options: [
                            { text: "Grava sem conversão nenhuma, e na leitura o valor volta com `Kind` igual a Local", isCorrect: false },
                            { text: "Falha com exceção: o Npgsql só grava nessa coluna `DateTime` com `Kind` Utc", isCorrect: true },
                            { text: "Grava, convertendo a hora local para UTC antes de mandar ao PostgreSQL", isCorrect: false },
                            { text: "Grava a hora local como se fosse UTC, deslocada pela diferença do fuso", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Um endpoint recebe o `LojaDbContext` injetado e quer as duas contagens em paralelo:\n\n```csharp\nvar produtos = db.Produtos.CountAsync(ct);\nvar pedidos = db.Pedidos.CountAsync(ct);\nawait Task.WhenAll(produtos, pedidos);\n```\n\nO que acontece?",
                        difficulty: "dificil",
                        options: [
                            { text: "Lança `InvalidOperationException`: o contexto não aceita duas operações ao mesmo tempo", isCorrect: true },
                            { text: "Funciona, porque `CountAsync` só lê dados e não passa pelo rastreador de mudanças", isCorrect: false },
                            { text: "As duas contagens rodam em paralelo, cada uma numa conexão diferente do pool de conexões", isCorrect: false },
                            { text: "O EF enfileira a segunda contagem, e as duas terminam sem erro, uma depois da outra", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Migrations: criar, aplicar e reverter",
                blocks: [
                    {
                        type: "text",
                        value: "# Migrations: criar, aplicar e reverter\n\nO modelo mudou: o produto agora precisa de estoque. No seu computador, um `ALTER TABLE` resolve. Agora repita isso no banco do colega, no de homologação e no de produção, na ordem certa e sem esquecer nenhum. Esquema alterado à mão em cada ambiente diverge em poucas semanas, e ninguém consegue dizer qual banco está em qual versão.\n\n**Migrations** tratam o esquema como código. Cada mudança vira uma classe C# versionada no git, com o passo de ida (`Up`) e o de volta (`Down`), e o próprio banco guarda quais já recebeu. São duas peças: a ferramenta de linha de comando `dotnet-ef` e o pacote `Microsoft.EntityFrameworkCore.Design` no projeto do `DbContext`. Instale a ferramenta como *local tool* (ferramenta do repositório): a versão fica registrada no `dotnet-tools.json`, e todo mundo do time, inclusive o CI, usa a mesma.",
                    },
                    {
                        type: "code",
                        value: "# terminal, na pasta da API (uma vez por repositório)\ndotnet new tool-manifest\ndotnet tool install dotnet-ef --version 10.0.13\ndotnet add package Microsoft.EntityFrameworkCore.Design --version 10.0.13\n\n# o ciclo do dia a dia\ndotnet ef migrations add CriarCatalogo     # gera a migration a partir do modelo\ndotnet ef database update                  # aplica no banco o que falta\ndotnet ef migrations list                  # lista e marca as pendentes com (Pending)\ndotnet ef database update CriarCatalogo    # leva o banco de volta até essa migration\ndotnet ef migrations remove                # apaga a última migration, se não estiver aplicada",
                    },
                    {
                        type: "text",
                        value: "## O que o migrations add gera\n\nO comando cria três arquivos na pasta `Migrations`: a migration em si (com data e hora no nome, como `20261020123207_AdicionarEstoque.cs`), um `.Designer.cs` com os metadados dela e o `LojaDbContextModelSnapshot.cs`, a fotografia do modelo inteiro depois dessa migration. O snapshot é a peça que mais gente entende errado: **para decidir o que entra na migration nova, o EF compara o modelo atual com o snapshot, não com o banco**. O `migrations add` nem precisa de banco para rodar. Na prática, uma coluna criada à mão direto no banco é invisível para o EF, e a próxima migration pode tentar criá-la de novo.\n\nDepois de acrescentar `public int Estoque { get; set; }` em `Produto`, o comando `dotnet ef migrations add AdicionarEstoque` gerou isto:",
                    },
                    {
                        type: "code",
                        value: "// Migrations/20261020123207_AdicionarEstoque.cs (gerado; aqui sem os comentários)\npublic partial class AdicionarEstoque : Migration\n{\n    protected override void Up(MigrationBuilder migrationBuilder)\n    {\n        migrationBuilder.AddColumn<int>(\n            name: \"Estoque\",\n            table: \"Produtos\",\n            type: \"integer\",\n            nullable: false,\n            defaultValue: 0);\n    }\n\n    protected override void Down(MigrationBuilder migrationBuilder)\n    {\n        migrationBuilder.DropColumn(\n            name: \"Estoque\",\n            table: \"Produtos\");\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## Aplicar, conferir e voltar\n\nO `database update` aplica as migrations pendentes e registra cada uma na tabela `__EFMigrationsHistory`, que o EF cria no próprio banco (colunas `MigrationId` e `ProductVersion`): é por ela que ele sabe o que já rodou. Desde o EF Core 9, o comando pega um lock exclusivo no banco antes de aplicar, e duas execuções simultâneas não se atropelam.\n\nVoltar é aplicar \"até\" uma migration anterior. `dotnet ef database update CriarCatalogo` roda o `Down` de tudo o que veio depois (aqui, um `ALTER TABLE \"Produtos\" DROP COLUMN \"Estoque\"`) e apaga as linhas correspondentes do histórico. Repare que o `Down` destrói dados: o estoque de todos os produtos foi embora com a coluna. Já o `migrations remove` só mexe nos arquivos do projeto, e se recusa a apagar uma migration que o banco já recebeu, com um conselho que vale guardar: \"If the migration has been applied to other databases, consider reverting its changes using a new migration instead\". Migration que chegou a produção não se edita nem se apaga; corrige-se com uma migration nova.",
                    },
                    {
                        type: "text",
                        value: "## Leia a migration antes de aplicar\n\nO EF gera, mas quem responde pelo banco é você. Dois casos testados no EF Core 10 com PostgreSQL:\n\n- **Renomear uma propriedade.** Se só o nome muda (`Descricao` para `Detalhes`), o EF percebe e gera `RenameColumn`. Se nome e nulidade mudam juntos (`string? Descricao` para `string Detalhes`), ele não consegue casar as duas e gera `DropColumn` seguido de `AddColumn`: o texto de todos os produtos vai embora. O terminal avisa com \"An operation was scaffolded that may result in the loss of data. Please review the migration for accuracy\", e muita gente segue em frente sem ler. Separe em duas migrations (primeiro o nome, depois a nulidade) ou edite a gerada.\n- **Tornar obrigatória uma coluna opcional.** Trocar `string? Codigo` por `string` gera `UPDATE \"Pedidos\" SET \"Codigo\" = '' WHERE \"Codigo\" IS NULL` antes do `SET NOT NULL`. Não quebra, mas grava texto vazio onde antes havia \"sem código\". Se o valor certo é outro, escreva-o na migration.\n\nO esquecimento contrário também é vigiado: desde o EF Core 9, aplicar migrations com o modelo alterado e sem migration nova falha com \"The model for context 'LojaDbContext' has pending changes. Add a new migration before updating the database\". No CI, `dotnet ef migrations has-pending-model-changes` faz essa checagem e sai com código 1 quando alguém esqueceu o `migrations add`.",
                    },
                    {
                        type: "text",
                        value: "## Migration em produção, com cuidado\n\nRodar `dotnet ef database update` contra produção a partir do seu computador exige SDK, código-fonte e a credencial do banco na sua máquina, e aplica SQL que ninguém revisou. Chamar `Database.MigrateAsync()` na subida da aplicação parece cômodo, mas obriga a aplicação a ter permissão para alterar o esquema (o usuário do dia a dia deveria só ler e gravar dados), faz cada réplica tentar migrar ao subir e não oferece revisão nem volta simples. O lock do EF Core 9 impede duas réplicas de corromperem o banco; o resto continua valendo.\n\nEm 2026, a documentação do EF Core indica dois caminhos para produção: o **script SQL**, quando o SQL precisa ser revisado, guardado ou entregue a um DBA, e o **bundle** (um executável `efbundle` gerado no CI, que aplica as pendentes sem SDK nem código-fonte) para o deploy automatizado. Nos dois, quem aplica é um passo do deploy, com uma credencial que pode alterar o esquema e que não é a da aplicação. O script sai com `--idempotent`: cada comando vem embrulhado num teste contra o histórico, e o mesmo arquivo serve para um banco vazio, um atrasado e um que já está em dia.",
                    },
                    {
                        type: "code",
                        value: "# terminal, no CI: gera o script para revisão e aplicação com psql\ndotnet ef migrations script --idempotent --output artifacts/migracoes.sql\n\n# ou um bundle, que aplica as pendentes sem SDK no servidor\ndotnet ef migrations bundle --output artifacts/efbundle\n./artifacts/efbundle --connection \"$CONEXAO_DEPLOY\"\n\n-- trecho do artifacts/migracoes.sql gerado para o PostgreSQL\nSTART TRANSACTION;\n\nDO $EF$\nBEGIN\n    IF NOT EXISTS(SELECT 1 FROM \"__EFMigrationsHistory\" WHERE \"MigrationId\" = '20261020123207_AdicionarEstoque') THEN\n    ALTER TABLE \"Produtos\" ADD \"Estoque\" integer NOT NULL DEFAULT 0;\n    END IF;\nEND $EF$;\n\nDO $EF$\nBEGIN\n    IF NOT EXISTS(SELECT 1 FROM \"__EFMigrationsHistory\" WHERE \"MigrationId\" = '20261020123207_AdicionarEstoque') THEN\n    INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\")\n    VALUES ('20261020123207_AdicionarEstoque', '10.0.13');\n    END IF;\nEND $EF$;\nCOMMIT;",
                    },
                    {
                        type: "table",
                        value: "[[\"Forma\",\"Quem aplica e como\",\"Bom para\",\"Cuidado\"],[\"`dotnet ef database update`\",\"quem desenvolve, com SDK e código na máquina\",\"desenvolvimento local\",\"aplica sem revisão; não leve para produção\"],[\"Script `--idempotent`\",\"o deploy, com psql, a partir do arquivo gerado no CI\",\"produção com revisão do SQL\",\"fica fora do lock do EF: rode um deploy por vez\"],[\"Bundle (`efbundle`)\",\"o deploy, executando o binário gerado no CI\",\"deploy automatizado\",\"não mostra o SQL: revise a migration antes de gerar\"],[\"`MigrateAsync()` na subida\",\"a própria aplicação, a cada inicialização\",\"protótipo e ambiente de teste\",\"aplicação com permissão de alterar esquema e cada réplica migrando\"]]",
                    },
                    {
                        type: "quote",
                        value: "Migration é o esquema como código: gerada a partir do snapshot, registrada no histórico do banco e corrigida com outra migration, nunca editada depois de aplicada. Leia o que o EF gerou antes de aplicar e leve para produção um script idempotente ou um bundle, executado pelo deploy.",
                    },
                ],
                questions: [
                    {
                        statement: "Ao rodar `dotnet ef migrations add AdicionarEstoque`, com o que o EF Core compara o modelo atual para decidir o que entra na migration nova?",
                        difficulty: "facil",
                        options: [
                            { text: "Com o snapshot do modelo, guardado na pasta Migrations do projeto", isCorrect: true },
                            { text: "Com o esquema real do banco, lido pela connection string configurada", isCorrect: false },
                            { text: "Com as linhas gravadas na tabela `__EFMigrationsHistory` do banco", isCorrect: false },
                            { text: "Com o SQL da última migration que foi aplicada no banco de produção", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O banco já recebeu `CriarCatalogo` e `AdicionarEstoque`. O que faz o comando `dotnet ef database update CriarCatalogo`?",
                        difficulty: "facil",
                        options: [
                            { text: "Apaga do projeto os arquivos `.cs` da migration `AdicionarEstoque`", isCorrect: false },
                            { text: "Roda o `Down` de `AdicionarEstoque` e tira a linha dela do histórico", isCorrect: true },
                            { text: "Marca `AdicionarEstoque` como pendente sem alterar o esquema do banco", isCorrect: false },
                            { text: "Roda de novo o `Up` de `CriarCatalogo`, recriando as tabelas do zero", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que gerar o script de produção com `dotnet ef migrations script --idempotent`, e não com o script comum?",
                        difficulty: "medio",
                        options: [
                            { text: "O script compara o esquema coluna por coluna e aplica só as diferenças", isCorrect: false },
                            { text: "O script pula as migrations que o EF marcou com risco de perda de dados", isCorrect: false },
                            { text: "O script cria o banco de dados quando ele ainda não existe no servidor", isCorrect: false },
                            { text: "Cada migration confere o histórico e só roda se ainda não foi aplicada", isCorrect: true },
                        ],
                    },
                    {
                        statement: "A migration `AdicionarEstoque` já foi aplicada em produção, e você descobriu um erro nela. Qual é o caminho seguro?",
                        difficulty: "medio",
                        options: [
                            { text: "Rodar `migrations remove` e gerar a versão certa no lugar", isCorrect: false },
                            { text: "Apagar a linha dela do histórico e aplicar a versão corrigida", isCorrect: false },
                            { text: "Criar uma migration nova que corrige o esquema e aplicá-la", isCorrect: true },
                            { text: "Editar o `Up` da migration e rodar `database update` de novo", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Na entidade `Produto`, você troca `public string? Descricao { get; set; }` por `public string Detalhes { get; set; } = \"\";`, mudando nome e nulidade de uma vez, e roda `dotnet ef migrations add`. O terminal avisa que uma operação pode perder dados. O que a migration gerada faz com o texto que já está no banco?",
                        difficulty: "dificil",
                        options: [
                            { text: "Cria `Detalhes`, copia o texto de `Descricao` e só depois apaga a antiga", isCorrect: false },
                            { text: "Renomeia a coluna e troca os nulos por texto vazio antes do `NOT NULL`", isCorrect: false },
                            { text: "Apaga `Descricao` e cria `Detalhes` vazia: o texto antigo se perde", isCorrect: true },
                            { text: "Gera só um `RenameColumn`: o texto passa intacto para `Detalhes`", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Consultas com LINQ to Entities",
                blocks: [
                    {
                        type: "text",
                        value: "# Consultas com LINQ to Entities\n\nVocê já conhece LINQ: `Where`, `Select`, `OrderBy`, avaliação adiada. Com o EF Core a sintaxe é a mesma, e a pergunta passa a ser **onde aquilo roda**. `db.Produtos` é um `IQueryable<Produto>`: cada operador acrescenta um pedaço a uma árvore de expressão, e só quando você materializa (`ToListAsync`, `FirstOrDefaultAsync`, `CountAsync`, `AnyAsync`, ou percorre o resultado num `foreach`) o EF traduz a árvore inteira para SQL e manda ao banco. Tudo o que vem depois da materialização já é LINQ to Objects, rodando em memória sobre uma lista.\n\nO erro mais caro desta aula é materializar cedo demais. Muita gente escreve `ToListAsync()` \"para garantir\" e filtra depois: em desenvolvimento, com 30 produtos, ninguém percebe; em produção, com 2 milhões, a busca traz a tabela inteira pela rede para usar 20 linhas.",
                    },
                    {
                        type: "code",
                        value: "// Filtro no banco: o Where vira WHERE e só as linhas que servem saem do PostgreSQL\ndecimal precoMinimo = 100m;\nvar caros = await db.Produtos\n    .Where(p => p.Preco > precoMinimo)\n    .OrderBy(p => p.Nome)\n    .ToListAsync(ct);\n\n// Filtro em memória: o ToListAsync veio cedo e trouxe a tabela inteira\nvar todos = await db.Produtos.ToListAsync(ct);\nvar carosEmMemoria = todos.Where(p => p.Preco > precoMinimo).ToList();",
                    },
                    {
                        type: "text",
                        value: "Nem todo C# vira SQL. Um método seu dentro do `Where`, como `Texto.Normalizar(p.Nome)`, faz o EF lançar `InvalidOperationException` com \"could not be translated\" na hora de executar. Desde o EF Core 3.0 não existe mais o plano B de antigamente, em que o EF trazia tudo e filtrava em memória; hoje ele falha, e você reescreve o filtro com o que tem tradução (`p.Nome.Trim().ToUpper()` vira `upper(btrim(...))` no PostgreSQL) ou decide, de forma explícita, trazer os dados antes. A exceção é o `Select` final: ali o EF aceita chamar método C# sobre o que já veio do banco.\n\n## Rastreamento: ler para alterar ou só ler\n\nPor padrão, toda entidade que uma consulta devolve fica **rastreada**: o contexto guarda uma cópia dos valores originais e, no `SaveChangesAsync`, compara com os atuais para gerar o `UPDATE` só das colunas que mudaram. O rastreador também garante **uma instância por chave**: consultar duas vezes o mesmo produto no mesmo contexto devolve o mesmo objeto, e os valores dele **não** são atualizados com o que veio do banco na segunda vez. Tudo isso custa memória e CPU, e não serve para nada quando a consulta só monta uma resposta. Para esse caso existe o `AsNoTracking()`.",
                    },
                    {
                        type: "table",
                        value: "[[\"Leitura\",\"Rastreada?\",\"Quando usar\",\"Armadilha\"],[\"Consulta padrão (`db.Produtos.Where(...)`)\",\"sim\",\"vai alterar e chamar `SaveChangesAsync`\",\"contexto que vive muito acumula entidades e devolve valores velhos\"],[\"`AsNoTracking()`\",\"não\",\"resposta de API, relatório, só leitura\",\"alterar o objeto e salvar não grava nada\"],[\"`Select` para um DTO\",\"não, porque não é entidade\",\"leitura que usa poucas colunas\",\"projeção que chama método seu traz a linha inteira\"],[\"`FindAsync(id)`\",\"sim\",\"buscar pela chave, talvez já carregada\",\"olha o rastreador antes e só vai ao banco se não achar\"]]",
                    },
                    {
                        type: "code",
                        value: "// Leitura para devolver na API: ninguém vai alterar, então sem rastreamento\nvar vitrine = await db.Produtos\n    .AsNoTracking()\n    .Where(p => p.Ativo)\n    .OrderBy(p => p.Nome)\n    .ToListAsync(ct);\n\n// Leitura para alterar: rastreada, o SaveChanges descobre sozinho o que mudou\nvar produto = await db.Produtos.SingleAsync(p => p.Sku == \"SKU-001\", ct);\nproduto.Preco = 9.90m;\nawait db.SaveChangesAsync(ct); // UPDATE só da coluna Preco",
                    },
                    {
                        type: "text",
                        value: "## Include e o problema N+1\n\nSem você pedir, o EF não carrega navegação nenhuma: um pedido consultado sozinho vem com `Itens` vazia, e isso não quer dizer que ele não tem itens. (Se alguns itens já estiverem rastreados no mesmo contexto, o EF os pendura no pedido, o chamado *fixup*, e a lista vem pela metade, o que confunde ainda mais.) A saída intuitiva é buscar os itens de cada pedido dentro de um laço, e é aí que nasce o **N+1**: uma consulta para a lista e mais uma para cada elemento dela. Cada consulta é uma ida e volta pela rede; com 200 pedidos são 201 comandos, e a 2 ms por ida e volta isso já passa de 400 ms só de espera.\n\nO `Include` pede os relacionados na mesma consulta, com JOIN, e o `ThenInclude` desce mais um nível (`Include(p => p.Itens).ThenInclude(i => i.Produto)`). O EF Core também tem *lazy loading* (carregar a navegação na hora em que ela é lida), mas desligado por padrão: exige o pacote `Microsoft.EntityFrameworkCore.Proxies`, `UseLazyLoadingProxies()` e navegações `virtual`. Com ele ligado, o N+1 some do código e continua no banco, porque basta ler `pedido.Itens` dentro do laço para disparar uma consulta. Um último cuidado: incluir **duas coleções** na mesma consulta (os pedidos e os endereços de um cliente, por exemplo) multiplica as linhas do JOIN; o EF avisa no log, e o `AsSplitQuery()` divide em consultas separadas.",
                    },
                    {
                        type: "code",
                        value: "// N+1: uma consulta para a lista e mais uma para cada pedido\nvar pedidos = await db.Pedidos.AsNoTracking().ToListAsync(ct);\nforeach (var pedido in pedidos)\n{\n    var itens = await db.Itens\n        .Where(i => i.PedidoId == pedido.Id)\n        .ToListAsync(ct);\n    // ... usa os itens do pedido\n}\n// 200 pedidos: 201 comandos SQL\n\n// Include: os itens vêm junto, num LEFT JOIN\nvar pedidosComItens = await db.Pedidos\n    .AsNoTracking()\n    .Include(p => p.Itens)\n    .ToListAsync(ct);\n// 200 pedidos: 1 comando SQL",
                    },
                    {
                        type: "text",
                        value: "## Ver o SQL gerado\n\nNão adivinhe o SQL: olhe. Há três jeitos, do mais pontual ao mais amplo.\n\n- `ToQueryString()` devolve o SQL de uma consulta sem executá-la. Serve para conferir uma tradução enquanto você escreve.\n- O **log** do EF: a categoria `Microsoft.EntityFrameworkCore.Database.Command` registra cada comando executado, com o tempo que levou, no nível Information. O template web vem com `\"Default\": \"Information\"`, então em desenvolvimento o SQL já aparece no console, com os valores dos parâmetros trocados por `?`. Em produção, muita equipe sobe essa categoria para `Warning` no `appsettings.Production.json` para não inundar o log.\n- `EnableSensitiveDataLogging()`, nas opções do contexto, mostra os valores dos parâmetros. Só em desenvolvimento: em produção ele espalha e-mail, CPF e o que mais passar pelas consultas nos logs.\n\nO `TagWith(\"...\")` põe um comentário no SQL. Ele aparece no log da aplicação e no log de consultas lentas do PostgreSQL, e é o jeito de achar, no meio de mil consultas, qual endpoint gerou aquela que demora.",
                    },
                    {
                        type: "code",
                        value: "// ToQueryString devolve o SQL sem executar a consulta\ndecimal precoMinimo = 100m;\nvar consulta = db.Produtos\n    .TagWith(\"Vitrine: produtos caros\")\n    .Where(p => p.Preco > precoMinimo)\n    .OrderBy(p => p.Nome);\nConsole.WriteLine(consulta.ToQueryString());\n\n// Saída com EF Core 10 e Npgsql 10:\n// -- @precoMinimo='100'\n// -- Vitrine: produtos caros\n// SELECT p.\"Id\", p.\"Ativo\", p.\"Descricao\", p.\"Estoque\", p.\"Nome\", p.\"Preco\", p.\"Sku\"\n// FROM \"Produtos\" AS p\n// WHERE p.\"Preco\" > @precoMinimo\n// ORDER BY p.\"Nome\"",
                    },
                    {
                        type: "quote",
                        value: "Com EF Core, o LINQ vira SQL até o ponto da materialização: filtre e ordene antes do `ToListAsync`, use `AsNoTracking` no que é só leitura, troque o laço de consultas por `Include` e confira o SQL com `ToQueryString` ou com o log.",
                    },
                ],
                questions: [
                    {
                        statement: "Uma listagem faz `var ativos = db.Produtos.ToList().Where(p => p.Ativo);`. Onde o filtro por `Ativo` é aplicado?",
                        difficulty: "facil",
                        options: [
                            { text: "No banco, porque o `ToList` só executa quando a expressão termina", isCorrect: false },
                            { text: "No banco, porque o EF move o `Where` para dentro do SQL gerado", isCorrect: false },
                            { text: "Em lugar nenhum: o código não compila com `Where` após o `ToList`", isCorrect: false },
                            { text: "No C#, depois que um `SELECT` sem `WHERE` trouxe a tabela inteira", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O que acontece no trecho abaixo?\n\n```csharp\nvar produto = await db.Produtos.AsNoTracking().FirstAsync(p => p.Id == 1, ct);\nproduto.Preco = 999m;\nvar linhas = await db.SaveChangesAsync(ct);\n```",
                        difficulty: "facil",
                        options: [
                            { text: "`linhas` vale 1: o `AsNoTracking` vale na leitura, não na gravação", isCorrect: false },
                            { text: "`linhas` vale 1: o SaveChanges compara com o banco e envia o `UPDATE`", isCorrect: false },
                            { text: "O `SaveChangesAsync` lança exceção por haver entidade não rastreada", isCorrect: false },
                            { text: "`linhas` vale 0: a entidade não está rastreada e nenhum `UPDATE` sai", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Com 200 pedidos no banco, quantos comandos SQL este trecho envia?\n\n```csharp\ndecimal total = 0;\nvar pedidos = await db.Pedidos.AsNoTracking().ToListAsync(ct);\nforeach (var pedido in pedidos)\n{\n    var itens = await db.Itens\n        .Where(i => i.PedidoId == pedido.Id)\n        .ToListAsync(ct);\n    total += itens.Sum(i => i.Quantidade * i.PrecoUnitario);\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "2: o EF junta as consultas do laço num único comando com `IN`", isCorrect: false },
                            { text: "201: um para a lista de pedidos e mais um para cada pedido do laço", isCorrect: true },
                            { text: "200: a lista de pedidos sai do cache do contexto, sem ir ao banco", isCorrect: false },
                            { text: "1: o EF percebe o laço e troca tudo por um `JOIN` na primeira consulta", isCorrect: false },
                        ],
                    },
                    {
                        statement: "`Texto.Normalizar` é um método estático seu, escrito em C#. O que acontece ao executar `await db.Produtos.Where(p => Texto.Normalizar(p.Nome).StartsWith(\"PRODUTO\")).ToListAsync(ct)`?",
                        difficulty: "medio",
                        options: [
                            { text: "Traz todos os produtos e aplica o filtro em memória, no lado do C#", isCorrect: false },
                            { text: "Gera SQL chamando uma função `Normalizar`, que precisa existir no banco", isCorrect: false },
                            { text: "Lança `InvalidOperationException`: a expressão não pode ser traduzida", isCorrect: true },
                            { text: "Não compila: método próprio não pode aparecer dentro de um `Where`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No mesmo contexto, você lê o produto 2 com rastreamento: preço 12. Outro processo muda o preço desse produto no banco para 17. Em seguida, você roda de novo `await db.Produtos.SingleAsync(p => p.Id == 2, ct)`, também rastreado. O que volta?",
                        difficulty: "dificil",
                        options: [
                            { text: "Uma instância nova com 17, e a antiga sai do rastreador", isCorrect: false },
                            { text: "A mesma instância de antes, atualizada para o preço 17", isCorrect: false },
                            { text: "A mesma instância de antes, que continua com o preço 12", isCorrect: true },
                            { text: "Uma `DbUpdateConcurrencyException` por valores divergentes", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Gravação, transações e concorrência",
                blocks: [
                    {
                        type: "text",
                        value: "# Gravação, transações e concorrência\n\nGravar parece a parte fácil: muda o objeto, chama `SaveChangesAsync`. Os problemas aparecem em produção, e são dois. O primeiro é a **atomicidade**: um pedido que grava o cabeçalho e dois itens e falha no terceiro deixa no banco algo que não existe no negócio. O segundo é a **atualização perdida** (*lost update*): dois atendentes abrem o mesmo produto, um corrige o preço, o outro corrige a descrição e salva por último, levando junto o preço antigo que estava na tela dele. Nenhum erro aparece, e a correção do primeiro some.\n\nTudo passa pelo rastreador de mudanças. Cada entidade que o contexto conhece tem um **estado**, e é o estado que diz ao `SaveChangesAsync` o que fazer com ela.",
                    },
                    {
                        type: "table",
                        value: "[[\"Estado\",\"Como a entidade chega nele\",\"O que o SaveChangesAsync faz\"],[\"`Added`\",\"`db.Pedidos.Add(pedido)`, ou adicionada a uma navegação de entidade rastreada\",\"`INSERT`, e lê de volta o `Id` gerado\"],[\"`Unchanged`\",\"veio de uma consulta rastreada e ninguém mexeu\",\"nada\"],[\"`Modified`\",\"uma propriedade rastreada mudou de valor\",\"`UPDATE` só das colunas alteradas\"],[\"`Deleted`\",\"`db.Produtos.Remove(produto)`\",\"`DELETE`\"],[\"`Detached`\",\"o contexto não a conhece, como o objeto que veio de `AsNoTracking`\",\"nada: ela é ignorada\"]]",
                    },
                    {
                        type: "code",
                        value: "// POST /pedidos: monta o pedido em memória e grava tudo num SaveChanges só\napp.MapPost(\"/pedidos\", async Task<Results<Created<PedidoCriado>, ValidationProblem>> (\n    NovoPedido entrada, LojaDbContext db, CancellationToken ct) =>\n{\n    var ids = entrada.Itens.Select(i => i.ProdutoId).ToList();\n    var produtos = await db.Produtos\n        .Where(p => ids.Contains(p.Id) && p.Ativo)\n        .ToDictionaryAsync(p => p.Id, ct);\n\n    var pedido = new Pedido { ClienteEmail = entrada.Email, CriadoEm = DateTime.UtcNow };\n    foreach (var item in entrada.Itens)\n    {\n        if (!produtos.TryGetValue(item.ProdutoId, out var produto) || produto.Estoque < item.Quantidade)\n            return TypedResults.ValidationProblem(new Dictionary<string, string[]>\n            {\n                [\"itens\"] = [$\"Produto {item.ProdutoId} inexistente, inativo ou sem estoque.\"]\n            });\n\n        produto.Estoque -= item.Quantidade;   // vira UPDATE no SaveChanges\n        pedido.Itens.Add(new ItemPedido        // vira INSERT no SaveChanges\n        {\n            Produto = produto, Quantidade = item.Quantidade, PrecoUnitario = produto.Preco\n        });\n    }\n\n    db.Pedidos.Add(pedido);\n    await db.SaveChangesAsync(ct);             // tudo numa transação só\n    return TypedResults.Created($\"/pedidos/{pedido.Id}\", new PedidoCriado(pedido.Id));\n});\n\n// Dtos.cs\nrecord ItemNovo(int ProdutoId, int Quantidade);\nrecord NovoPedido(string Email, List<ItemNovo> Itens);\nrecord PedidoCriado(int Id);",
                    },
                    {
                        type: "text",
                        value: "Num pedido de dois produtos, esse `SaveChangesAsync` do EF Core 10 gravou cinco linhas com dois comandos, agrupando vários comandos por ida ao banco (o *batching*): o `INSERT` do pedido com `RETURNING \"Id\"` junto dos `UPDATE` de estoque, e depois os `INSERT` dos itens, já com o `Id` do pedido. Tudo dentro de **uma transação que o próprio `SaveChangesAsync` abre**: se o terceiro item violar uma chave estrangeira, o banco desfaz o pedido e os itens anteriores, e você recebe uma `DbUpdateException` com o erro do PostgreSQL dentro. Repare também que o `Id` só existe depois desse ponto: logo após o `Add`, `pedido.Id` ainda vale 0.\n\nUma armadilha clássica de API é montar a entidade com o que veio no corpo da requisição e chamar `db.Produtos.Update(produto)`. O `Update` marca **todas** as propriedades como alteradas, e o `UPDATE` grava o que veio e também o que não veio: a `Descricao` que o cliente não mandou vira `NULL` e o `Estoque` vira 0. Carregue a entidade, mude só o que a requisição pede e deixe o rastreador descobrir o resto.",
                    },
                    {
                        type: "text",
                        value: "## Transação explícita: quando um SaveChanges não basta\n\nSe tudo cabe num `SaveChangesAsync`, a transação implícita resolve. A explícita entra quando o mesmo trabalho precisa de **mais de um** `SaveChangesAsync`, ou mistura `SaveChangesAsync` com comandos que não passam pelo rastreador, como o `ExecuteUpdateAsync` da aula de desempenho. O exemplo abaixo é comum: o código legível do pedido (`PED-000206`) depende do `Id` que o banco gera, então são duas gravações, e um pedido sem código não pode sobrar no banco se a segunda falhar.\n\nDentro de uma transação aberta por você, o `SaveChangesAsync` não faz commit: ele usa a transação que já existe, e quem confirma é o `CommitAsync`. Se uma exceção escapar antes dele, o `await using` descarta a transação e o PostgreSQL desfaz as duas gravações. Duas regras de produção. Não segure transação aberta enquanto espera algo de fora (uma chamada HTTP a um gateway de pagamento, por exemplo), porque ela prende conexão e bloqueios durante toda a espera. E, se o contexto usa `EnableRetryOnFailure()` (repetição automática em falha transitória), a transação aberta à mão falha com \"The configured execution strategy 'NpgsqlRetryingExecutionStrategy' does not support user-initiated transactions\"; nesse caso, o bloco inteiro vai dentro da estratégia de execução, para ser repetido como uma unidade.",
                    },
                    {
                        type: "code",
                        value: "// O código legível do pedido depende do Id que o banco gera no INSERT\nawait using var transacao = await db.Database.BeginTransactionAsync(ct);\n\ndb.Pedidos.Add(pedido);\nawait db.SaveChangesAsync(ct);           // INSERT: o banco devolve o Id\n\npedido.Codigo = $\"PED-{pedido.Id:D6}\";   // regra que precisa do Id\nawait db.SaveChangesAsync(ct);           // UPDATE do código\n\nawait transacao.CommitAsync(ct);         // sem o Commit, o descarte desfaz as duas\n\n// No lugar do bloco acima, quando o contexto usa EnableRetryOnFailure:\n// a transação inteira vai dentro da estratégia de execução\nvar estrategia = db.Database.CreateExecutionStrategy();\nawait estrategia.ExecuteAsync(async () =>\n{\n    await using var transacao = await db.Database.BeginTransactionAsync(ct);\n    // ... as mesmas gravações, montadas aqui dentro (o bloco pode rodar de novo)\n    await transacao.CommitAsync(ct);\n});",
                    },
                    {
                        type: "text",
                        value: "## Concorrência otimista com token\n\nPara a atualização perdida, a solução padrão é a **concorrência otimista**: ninguém bloqueia nada na leitura, mas cada `UPDATE` só vale se a linha ainda estiver na versão que foi lida. No PostgreSQL essa versão já existe: toda linha tem a coluna de sistema `xmin`, que muda a cada atualização. O Npgsql mapeia uma propriedade `uint` para ela com `IsRowVersion()` (ou com o atributo `[Timestamp]`), e a migration gerada não cria coluna nenhuma.\n\nCom o token mapeado, o EF passa a escrever `UPDATE \"Produtos\" SET \"Preco\" = @p0 WHERE \"Id\" = @p1 AND xmin = @p2`. Se outra gravação chegou antes, a linha não está mais naquela versão, o comando afeta 0 linhas e o EF lança `DbUpdateConcurrencyException`; na API, isso vira 409 Conflict. Como a versão é da linha, qualquer alteração conta: a baixa de estoque feita por um pedido também invalida a edição de preço aberta na tela de alguém.\n\nO detalhe que separa o exemplo de livro do código que funciona: numa API, a leitura (GET) e a gravação (PUT) são requisições diferentes, com contextos diferentes. O cliente recebe a versão no GET e a devolve no PUT, e o handler precisa colocá-la como **valor original** do token, porque é o original que vai no `WHERE`. Muita gente atribui a versão do cliente à propriedade (`produto.Versao = entrada.Versao`); isso muda só o valor atual, o EF continua comparando com o `xmin` que acabou de ler, e o conflito passa sem ser detectado.",
                    },
                    {
                        type: "code",
                        value: "// Entidades.cs: o produto ganha a versão da linha\npublic uint Versao { get; set; }\n\n// LojaDbContext.cs, dentro de modelBuilder.Entity<Produto>(...): mapeia para o xmin\nproduto.Property(p => p.Versao).IsRowVersion();\n\n// PUT /produtos/5/preco com o corpo { \"preco\": 19.90, \"versao\": 812 }\napp.MapPut(\"/produtos/{id:int}/preco\", async Task<Results<NoContent, NotFound, Conflict<string>>> (\n    int id, AlterarPreco entrada, LojaDbContext db, CancellationToken ct) =>\n{\n    var produto = await db.Produtos.FindAsync([id], ct);\n    if (produto is null) return TypedResults.NotFound();\n\n    // a versão que o cliente leu vira a original: é ela que vai no WHERE\n    db.Entry(produto).Property(p => p.Versao).OriginalValue = entrada.Versao;\n    produto.Preco = entrada.Preco;\n    try\n    {\n        await db.SaveChangesAsync(ct);\n        return TypedResults.NoContent();\n    }\n    catch (DbUpdateConcurrencyException)\n    {\n        return TypedResults.Conflict(\"O produto mudou depois da sua leitura. Recarregue e tente de novo.\");\n    }\n});\n\n// Dtos.cs\nrecord AlterarPreco(decimal Preco, uint Versao);",
                    },
                    {
                        type: "table",
                        value: "[[\"Abordagem\",\"Como funciona\",\"Quando faz sentido\"],[\"Sem token\",\"o último `SaveChangesAsync` vence, em silêncio\",\"dado que só uma pessoa edita\"],[\"`xmin` com `IsRowVersion()`\",\"o `WHERE` compara a versão da linha, e o conflito vira `DbUpdateConcurrencyException`\",\"padrão no PostgreSQL: não cria coluna e pega qualquer alteração da linha\"],[\"Token da aplicação (`IsConcurrencyToken()`)\",\"o mesmo `WHERE`, numa coluna sua, como um `Guid` que o código troca a cada gravação\",\"banco sem versão de linha, ou quando só algumas mudanças devem conflitar\"],[\"Bloqueio pessimista (`SELECT ... FOR UPDATE`)\",\"trava a linha até o fim da transação; no EF, com SQL escrito à mão\",\"disputa curta e frequente pela mesma linha\"]]",
                    },
                    {
                        type: "quote",
                        value: "O `SaveChangesAsync` já grava tudo numa transação; a explícita só entra quando o trabalho precisa de mais de uma gravação. Contra a atualização perdida, mapeie o `xmin` como token, use a versão que o cliente leu como valor original e devolva 409 no `DbUpdateConcurrencyException`.",
                    },
                ],
                questions: [
                    {
                        statement: "Um pedido novo com três itens é gravado num único `SaveChangesAsync`. O terceiro item aponta para um produto que não existe e viola a chave estrangeira. O que fica no banco?",
                        difficulty: "facil",
                        options: [
                            { text: "Só o pedido, porque os itens vão num lote separado, com transação própria", isCorrect: false },
                            { text: "Tudo menos o terceiro item, que o EF descarta e registra como aviso no log", isCorrect: false },
                            { text: "O pedido e os dois primeiros itens, que entraram antes da falha do terceiro", isCorrect: false },
                            { text: "Nada: o SaveChanges grava tudo numa transação e desfaz o que já tinha feito", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Em que momento o `INSERT` de um pedido novo chega ao banco?",
                        difficulty: "facil",
                        options: [
                            { text: "No `Add`, que envia o `INSERT` e deixa o commit para o `SaveChanges`", isCorrect: false },
                            { text: "No descarte do contexto, quando a requisição termina e ele é fechado", isCorrect: false },
                            { text: "No `SaveChangesAsync`: o `Add` apenas marca a entidade como `Added`", isCorrect: true },
                            { text: "No `AddAsync`, a versão assíncrona do `Add`, que já grava a linha", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O código abaixo lança exceção na linha marcada. O que fica gravado no banco?\n\n```csharp\nawait using var transacao = await db.Database.BeginTransactionAsync(ct);\n\ndb.Pedidos.Add(pedido);\nawait db.SaveChangesAsync(ct);\n\npedido.Codigo = GerarCodigo(pedido.Id); // lança exceção aqui\nawait db.SaveChangesAsync(ct);\n\nawait transacao.CommitAsync(ct);\n```",
                        difficulty: "medio",
                        options: [
                            { text: "O pedido sem código: o primeiro `SaveChangesAsync` já fez o commit dele", isCorrect: false },
                            { text: "O pedido com o código vazio, gravado pelo descarte da transação aberta", isCorrect: false },
                            { text: "O pedido sem código, até o PostgreSQL expirar a transação esquecida", isCorrect: false },
                            { text: "Nada: sem o `CommitAsync`, o descarte da transação desfaz o `INSERT`", isCorrect: true },
                        ],
                    },
                    {
                        statement: "`Versao` está mapeada para o `xmin` com `IsRowVersion()`. Dois atendentes carregam o mesmo produto ao mesmo tempo; o primeiro salva e, logo depois, o segundo salva também. O que acontece no `SaveChangesAsync` do segundo?",
                        difficulty: "medio",
                        options: [
                            { text: "O segundo sobrescreve o primeiro, e o EF registra um aviso no log", isCorrect: false },
                            { text: "O `UPDATE` afeta 0 linhas e o EF lança `DbUpdateConcurrencyException`", isCorrect: true },
                            { text: "O EF mescla as colunas que cada um alterou e grava as duas mudanças", isCorrect: false },
                            { text: "O PostgreSQL segura o segundo `UPDATE` até o primeiro acabar e aplica", isCorrect: false },
                        ],
                    },
                    {
                        statement: "No PUT, o cliente devolve a `Versao` que recebeu no GET, e o handler faz:\n\n```csharp\nvar produto = await db.Produtos.FindAsync([id], ct);\nproduto!.Versao = entrada.Versao;\nproduto.Preco = entrada.Preco;\nawait db.SaveChangesAsync(ct);\n```\n\nEntre o GET e o PUT, outra pessoa já tinha alterado o produto. O que acontece?",
                        difficulty: "dificil",
                        options: [
                            { text: "Lança exceção, porque `xmin` é coluna de sistema e não aceita valor", isCorrect: false },
                            { text: "Grava sem conflito: o `WHERE` usa o `xmin` lido agora no `FindAsync`", isCorrect: true },
                            { text: "Lança `DbUpdateConcurrencyException`: a versão do cliente é velha", isCorrect: false },
                            { text: "Grava a `Versao` do cliente, e o conflito aparece só na próxima edição", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Desempenho: carregar só o que usa",
                blocks: [
                    {
                        type: "text",
                        value: "# Desempenho: carregar só o que usa\n\nO endpoint que lista produtos estava rápido em desenvolvimento e passou a demorar segundos em produção. Ninguém mudou o código; mudou o volume. A versão ingênua faz quatro coisas caras de uma vez: lê a entidade inteira, inclusive a `Descricao` de 2 mil caracteres que a listagem nem mostra; rastreia cada produto, guardando cópias que ninguém vai comparar; não pagina, e devolve todas as linhas; e serializa tudo isso em JSON. Com 30 produtos, cada escolha custa pouco. Com 300 mil, a soma derruba o endpoint.\n\n## Projetar com Select\n\nA primeira correção é pedir ao banco só o que a resposta usa. Um `Select` para um DTO (*data transfer object*, o tipo que define o contrato da resposta) faz o EF pedir só aquelas colunas, e o resultado não é rastreado, porque não é entidade. De quebra, a API para de expor o modelo do banco: se a entidade ganhar uma coluna interna amanhã, ela não vaza na resposta.",
                    },
                    {
                        type: "code",
                        value: "// Dtos.cs\npublic record ProdutoResumo(int Id, string Nome, decimal Preco);\n\n// Program.cs\n// GET /produtos?pagina=3&tamanho=20\napp.MapGet(\"/produtos\", async (LojaDbContext db, CancellationToken ct, int pagina = 1, int tamanho = 20) =>\n{\n    pagina = Math.Max(pagina, 1);\n    tamanho = Math.Clamp(tamanho, 1, 100);       // o cliente não escolhe baixar a tabela toda\n\n    var itens = await db.Produtos\n        .Where(p => p.Ativo)\n        .OrderBy(p => p.Nome).ThenBy(p => p.Id)  // o Id desempata: a ordem fica única\n        .Skip((pagina - 1) * tamanho)\n        .Take(tamanho)\n        .Select(p => new ProdutoResumo(p.Id, p.Nome, p.Preco))\n        .ToListAsync(ct);\n\n    return TypedResults.Ok(itens);\n});",
                    },
                    {
                        type: "code",
                        value: "-- db.Produtos.Where(p => p.Ativo): a entidade inteira, com a descrição longa\nSELECT p.\"Id\", p.\"Ativo\", p.\"Descricao\", p.\"Estoque\", p.\"Nome\", p.\"Preco\", p.\"Sku\", p.xmin\nFROM \"Produtos\" AS p\nWHERE p.\"Ativo\"\n\n-- a listagem acima, com pagina=3 e tamanho=20: só o que o DTO usa\n-- @p1='20'\n-- @p='40'\nSELECT p.\"Id\", p.\"Nome\", p.\"Preco\"\nFROM \"Produtos\" AS p\nWHERE p.\"Ativo\"\nORDER BY p.\"Nome\", p.\"Id\"\nLIMIT @p1 OFFSET @p",
                    },
                    {
                        type: "text",
                        value: "A projeção também resolve dados relacionados sem `Include`: `Select(p => new { p.Id, Itens = p.Itens.Count, Total = p.Itens.Sum(i => i.Quantidade * i.PrecoUnitario) })` vira subconsultas com `count(*)` e `sum(...)` calculadas no PostgreSQL, e só os números atravessam a rede. O cuidado é manter o `new` **dentro** da expressão. Muita gente extrai a projeção para um método, `.Select(p => Mapear.ParaResumo(p))`, para reaproveitar; o EF não enxerga o corpo de um método compilado, então passa a trazer a linha inteira e chama o método em memória. O resultado é o mesmo, e o ganho some sem aviso.\n\n## Paginação\n\nToda listagem que pode crescer precisa de página, com tamanho máximo decidido pelo servidor e **ordem única**. Bancos relacionais não garantem ordem nenhuma sem `ORDER BY`, nem a da chave primária, e ordenar só por `Nome` deixa os empatados trocando de lugar entre uma página e outra; daí o `ThenBy(p => p.Id)`. Sem `OrderBy`, o EF executa e só avisa no log: \"The query uses a row limiting operator ('Skip'/'Take') without an 'OrderBy' operator\". O `Skip`/`Take` (paginação por offset) é simples e permite pular para a página 37; o custo é que o banco percorre e descarta todas as linhas anteriores, e a página 5.000 fica lenta. Para rolagem infinita e listas enormes, use a paginação por **keyset**: o cliente devolve o último `Id` que viu e o filtro vai direto pelo índice.",
                    },
                    {
                        type: "code",
                        value: "// Keyset: o cliente devolve o último Id que viu e o banco vai direto pelo índice\nvar proximaPagina = await db.Produtos\n    .Where(p => p.Ativo && p.Id > ultimoId)\n    .OrderBy(p => p.Id)\n    .Take(tamanho)\n    .Select(p => new ProdutoResumo(p.Id, p.Nome, p.Preco))\n    .ToListAsync(ct);",
                    },
                    {
                        type: "table",
                        value: "[[\"Critério\",\"Offset (`Skip`/`Take`)\",\"Keyset (`Where` depois do último)\"],[\"O que o cliente manda\",\"o número da página\",\"o último valor visto, aqui o `Id`\"],[\"Custo de uma página lá no fim\",\"cresce: o banco percorre e descarta as linhas puladas\",\"estável: vai direto pelo índice\"],[\"Pular para a página 37\",\"possível\",\"não dá: só a próxima e a anterior\"],[\"Linha inserida ou apagada no meio\",\"itens repetidos ou pulados entre páginas\",\"a sequência continua estável\"]]",
                    },
                    {
                        type: "text",
                        value: "## Atualizar e apagar em lote\n\nDesativar os produtos sem estoque do jeito clássico é carregar todos, mudar `Ativo` em cada um e chamar `SaveChangesAsync`: um `SELECT` com as linhas inteiras e um `UPDATE` por produto. O `ExecuteUpdateAsync` e o `ExecuteDeleteAsync` (desde o EF Core 7) fazem o trabalho num comando só, direto no banco, sem carregar entidade nenhuma. No EF Core 10, o argumento do `ExecuteUpdateAsync` virou um lambda comum, e não mais uma árvore de expressão, então dá para acrescentar colunas com `if`.\n\nO preço da velocidade é que esses comandos **passam por fora do rastreador**:\n\n- Executam na hora. Não há `SaveChangesAsync` para chamar depois, e eles também não entram na transação implícita dele: se precisam ser atômicos com outras gravações, use a transação explícita da aula anterior.\n- Não atualizam entidades já carregadas. Um produto rastreado continua com o preço antigo em memória, e, com o `xmin` como token, o próximo `SaveChangesAsync` dele falha com `DbUpdateConcurrencyException`, porque o comando em lote mudou a versão da linha.\n- Não carregam nada, então não existe o cascade que o EF faz em memória: o `ExecuteDeleteAsync` dos pedidos levou os itens junto só porque a chave estrangeira no banco tem `ON DELETE CASCADE`.",
                    },
                    {
                        type: "code",
                        value: "// Desativa o que está sem estoque: um UPDATE, nenhuma entidade carregada\nint desativados = await db.Produtos\n    .Where(p => p.Estoque == 0 && p.Ativo)\n    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Ativo, false), ct);\n\n// Apaga cancelados com mais de 90 dias: um DELETE (os itens saem pelo ON DELETE CASCADE)\nvar limite = DateTime.UtcNow.AddDays(-90);\nint apagados = await db.Pedidos\n    .Where(p => p.Status == StatusPedido.Cancelado && p.CriadoEm < limite)\n    .ExecuteDeleteAsync(ct);\n\n// EF Core 10: o setter é um lambda comum, então cabe um if\nawait db.Produtos\n    .Where(p => p.Id == id)\n    .ExecuteUpdateAsync(s =>\n    {\n        s.SetProperty(p => p.Preco, novoPreco);\n        if (novoNome is not null)\n            s.SetProperty(p => p.Nome, novoNome);\n    }, ct);\n\n// SQL dos dois primeiros comandos:\n// UPDATE \"Produtos\" AS p\n// SET \"Ativo\" = @p\n// WHERE p.\"Estoque\" = 0 AND p.\"Ativo\"\n//\n// DELETE FROM \"Pedidos\" AS p\n// WHERE p.\"Status\" = 2 AND p.\"CriadoEm\" < @limite",
                    },
                    {
                        type: "text",
                        value: "## O custo do que você não usa\n\nO mesmo raciocínio vale em escala menor, em todo endpoint:\n\n- Para saber se existe, `AnyAsync` vira `SELECT EXISTS (...)` e para na primeira linha que encontra; `CountAsync() > 0` conta todas, e `(await ToListAsync()).Count` ainda traz todas pela rede.\n- `Include` de navegação que a resposta não usa é JOIN e coluna de graça para o banco montar e para a rede carregar.\n- Consulta só de leitura com rastreamento gasta memória com cópias que ninguém vai comparar: use `AsNoTracking` ou projeção.\n- Filtro e ordenação frequentes pedem índice (`HasIndex` na Fluent API). Pegue o SQL do log e rode `EXPLAIN ANALYZE` no PostgreSQL para ver se ele usa o índice ou lê a tabela inteira.\n\nMeça antes de otimizar. O log do EF traz o tempo de cada comando (`Executed DbCommand (38ms)`), e é ali que aparece a consulta que realmente pesa.",
                    },
                    {
                        type: "quote",
                        value: "Desempenho com EF Core é pedir menos: projete com `Select` só as colunas que a resposta usa, pagine com ordem única e tamanho máximo, atualize e apague em lote com `ExecuteUpdateAsync` e `ExecuteDeleteAsync` sabendo que eles ignoram o rastreador, e meça pelo SQL do log.",
                    },
                ],
                questions: [
                    {
                        statement: "A listagem troca `db.Produtos.ToListAsync(ct)` por `db.Produtos.Select(p => new ProdutoResumo(p.Id, p.Nome, p.Preco)).ToListAsync(ct)`. O que muda no SQL?",
                        difficulty: "facil",
                        options: [
                            { text: "O `SELECT` traz as três colunas e mais as chaves estrangeiras", isCorrect: false },
                            { text: "O `SELECT` passa a trazer só as três colunas `Id`, `Nome` e `Preco`", isCorrect: true },
                            { text: "Nada muda: o EF lê todas as colunas e monta o DTO em memória depois", isCorrect: false },
                            { text: "O EF faz duas consultas: uma pelas chaves e outra pelos campos", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Depois de `await db.Pedidos.Where(p => p.Status == StatusPedido.Cancelado).ExecuteDeleteAsync(ct);`, o que falta para as linhas saírem do banco?",
                        difficulty: "facil",
                        options: [
                            { text: "Nada: o `DELETE` já foi executado no banco no momento da chamada", isCorrect: true },
                            { text: "Chamar `SaveChangesAsync`, que envia o `DELETE` que ficou pendente", isCorrect: false },
                            { text: "Carregar as entidades antes, para o EF conhecer as chaves a apagar", isCorrect: false },
                            { text: "Chamar `CommitAsync`, porque o comando abriu uma transação própria", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma paginação faz `db.Produtos.Skip((pagina - 1) * 20).Take(20)` sem nenhum `OrderBy`. O que pode acontecer?",
                        difficulty: "medio",
                        options: [
                            { text: "Nada de errado: o EF ordena sozinho pela chave primária quando falta o `OrderBy`", isCorrect: false },
                            { text: "Itens repetidos ou pulados entre páginas, porque o banco não garante ordem", isCorrect: true },
                            { text: "Nada de errado: o PostgreSQL devolve as linhas na ordem em que entraram", isCorrect: false },
                            { text: "O EF recusa executar a consulta e lança exceção pedindo um `OrderBy`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O produto 5 está rastreado no contexto com preço 15. Em seguida, roda `await db.Produtos.Where(p => p.Id == 5).ExecuteUpdateAsync(s => s.SetProperty(p => p.Preco, p => p.Preco * 1.10m), ct);`, que afeta 1 linha. Quanto vale `produto.Preco` na entidade rastreada?",
                        difficulty: "medio",
                        options: [
                            { text: "15, e a entidade passa ao estado `Modified`, com o valor novo pendente", isCorrect: false },
                            { text: "16,50, mas só depois de um `SaveChangesAsync` para sincronizar tudo", isCorrect: false },
                            { text: "15: o `ExecuteUpdateAsync` vai direto ao banco e não toca no rastreador", isCorrect: true },
                            { text: "16,50: o EF atualiza junto as entidades rastreadas que o comando alcançou", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para reaproveitar a projeção, alguém troca o `new` por um método:\n\n```csharp\npublic static class Mapear\n{\n    public static ProdutoResumo ParaResumo(Produto p) => new(p.Id, p.Nome, p.Preco);\n}\n\n// antes: o new dentro da expressão\nvar antes = await db.Produtos\n    .Select(p => new ProdutoResumo(p.Id, p.Nome, p.Preco))\n    .ToListAsync(ct);\n\n// depois: o mesmo new, escondido num método\nvar depois = await db.Produtos\n    .Select(p => Mapear.ParaResumo(p))\n    .ToListAsync(ct);\n```\n\nO que muda entre as duas consultas?",
                        difficulty: "dificil",
                        options: [
                            { text: "Nada muda: o EF lê o corpo de `ParaResumo` e pede as mesmas colunas", isCorrect: false },
                            { text: "A segunda falha: o EF não traduz método próprio dentro de um `Select`", isCorrect: false },
                            { text: "O resultado é o mesmo, mas a segunda traz todas as colunas do produto", isCorrect: true },
                            { text: "A segunda traz só o `Id` e depois busca o resto produto a produto", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
    {
        titulo: "Módulo 7 - Testes e qualidade",
        aulas: [
            {
                titulo: "Testes unitários com xUnit v3",
                blocks: [
                    {
                        type: "text",
                        value: "# Testes unitários com xUnit v3\n\nSexta à tarde, alguém troca `>=` por `>` na regra de frete grátis. O código compila, a API sobe, o deploy passa. Na segunda-feira, o financeiro descobre que pedidos de exatamente 200 reais pagaram frete o fim de semana inteiro. Ninguém agiu de má-fé: só não existia nada conferindo a regra a cada mudança.\n\nTeste unitário é esse conferente. Ele chama um pedaço pequeno do código, como um método ou uma classe, com uma entrada conhecida e compara o resultado com o esperado, sem rede, sem disco e sem banco. Por isso roda em milissegundos e dá o mesmo resultado em qualquer máquina, o que permite rodar centenas deles a cada build.\n\nNesta aula você cria o projeto de testes da API com o **xUnit v3**, a geração atual de um dos frameworks de teste mais usados no .NET, e escreve os primeiros testes da regra de frete. Os exemplos do módulo usam uma API pequena de loja com a mesma forma da que você construiu: Minimal APIs, EF Core e PostgreSQL.",
                    },
                    {
                        type: "text",
                        value: "## Criando o projeto de testes\n\nAntes do comando, duas armadilhas de nome:\n\n- \"xUnit v3\" é a **geração** do framework, não a versão do pacote. O pacote se chama `xunit.v3` e, em outubro de 2026, está na versão 4.0 (lançada em agosto de 2026).\n- O template `xunit` que vem dentro do SDK do .NET 10 ainda cria um projeto da geração antiga, com o pacote `xunit` 2.9. Muita gente começa por ele e só percebe meses depois que está na v2. Para a v3, instale os templates oficiais e use o `xunit3`.\n\nO que o template `xunit3` entrega, e por que cada item importa:\n\n- **`OutputType` igual a `Exe`**: na v3, o projeto de testes é um programa, e `dotnet run` roda os testes direto.\n- **O pacote `xunit.v3.mtp-v2`**, que traz as asserções e o `xunit.analyzers` (avisos de uso errado já na compilação). Se você montar o projeto à mão, `dotnet add package xunit.v3` instala esse mesmo conjunto.\n- **Um `global.json` com o runner `Microsoft.Testing.Platform`.** No SDK do .NET 10, é esse arquivo que liga o `dotnet test` à plataforma de testes nova, e o `dotnet test` o procura da pasta atual para cima. O template acrescenta a seção `test` ao `global.json` que achar acima da pasta do projeto; se não houver nenhum, cria o arquivo na raiz do repositório (a pasta do `.git`) ou, sem Git, na pasta do arquivo de solução. Só quando não acha nada disso ele grava o arquivo dentro da pasta do próprio projeto, e aí o `dotnet test` rodado da raiz para com o erro \"Testing with VSTest target is no longer supported by Microsoft.Testing.Platform on .NET 10 SDK and later\". Por isso, crie a solução antes do projeto de testes e confira onde o arquivo foi parar.\n- **`net8.0` como padrão**: passe `-f net10.0` para acompanhar a API.",
                    },
                    {
                        type: "code",
                        value: "# terminal, na raiz da solução (a pasta do arquivo .slnx)\ndotnet new install xunit.v3.templates\ndotnet new xunit3 -f net10.0 -o tests/Loja.Testes.Unidade\ndotnet sln add tests/Loja.Testes.Unidade\ndotnet add tests/Loja.Testes.Unidade reference src/Loja.Api\n\n# o template acrescenta isto ao global.json da raiz (e cria o arquivo, se não existir):\n# { \"test\": { \"runner\": \"Microsoft.Testing.Platform\" } }\n\n# todos os testes da solução\ndotnet test\n\n# um projeto só: no modo novo, o caminho vai em --project\ndotnet test --project tests/Loja.Testes.Unidade\n\n# uma classe (nome completo) ou métodos pelo nome\ndotnet test --project tests/Loja.Testes.Unidade --filter-class \"Loja.Testes.Unidade.RegraDeFreteTests\"\ndotnet test --project tests/Loja.Testes.Unidade --filter-method \"*Cupom*\"\n\n# o projeto é executável: isto também roda os testes\ndotnet run --project tests/Loja.Testes.Unidade",
                    },
                    {
                        type: "text",
                        value: "## Anatomia de um teste: Arrange, Act, Assert\n\nA regra de frete da API é uma função pura: recebe o total e a UF e devolve o valor do frete. Função pura é o melhor caso para teste unitário, porque não depende de nada além dos parâmetros.\n\nTodo teste tem três partes, e separá-las deixa claro o que está sendo provado:\n\n- **Arrange** (preparar): monta a entrada e o que mais o teste precisa.\n- **Act** (agir): chama o código testado, uma vez.\n- **Assert** (conferir): compara o resultado com o esperado.\n\nO atributo `[Fact]` marca um método como teste sem parâmetros: um fato que vale sempre. E o nome do método faz parte do teste. Quando ele falhar daqui a seis meses, a primeira coisa que alguém vai ler é o nome na saída do `dotnet test`. `Pedido_a_partir_de_200_reais_tem_frete_gratis` conta a regra de negócio que quebrou; `Test1` ou `CalcularTest` obrigam a abrir o código para entender. Escreva o nome como uma frase sobre o comportamento, não sobre o método.",
                    },
                    {
                        type: "code",
                        value: "// src/Loja.Api/Dominio/RegraDeFrete.cs\nnamespace Loja.Api.Dominio;\n\npublic static class RegraDeFrete\n{\n    public const decimal MinimoParaFreteGratis = 200m;\n\n    public static decimal Calcular(decimal totalDoPedido, string uf)\n    {\n        ArgumentOutOfRangeException.ThrowIfNegative(totalDoPedido);\n\n        if (totalDoPedido >= MinimoParaFreteGratis)\n            return 0m;\n\n        return uf is \"SP\" or \"RJ\" or \"MG\" or \"ES\" ? 15m : 25m;\n    }\n}\n\n// tests/Loja.Testes.Unidade/RegraDeFreteTests.cs\nusing Loja.Api.Dominio;\n\nnamespace Loja.Testes.Unidade;\n\npublic class RegraDeFreteTests\n{\n    [Fact]\n    public void Pedido_a_partir_de_200_reais_tem_frete_gratis()\n    {\n        // Arrange\n        var total = 200m;\n\n        // Act\n        var frete = RegraDeFrete.Calcular(total, \"BA\");\n\n        // Assert\n        Assert.Equal(0m, frete);\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## `[Theory]`: a mesma regra com vários exemplos\n\nRegra de negócio quase sempre tem mais de um caso, e o bug mora na borda: 199,99, 200,00 e 200,01. Em vez de copiar o mesmo teste quatro vezes, use `[Theory]`: o método recebe parâmetros e o xUnit roda uma vez para cada linha de dados, mostrando cada execução separada na saída.\n\n- `[InlineData(...)]` põe os dados direto no atributo. Serve para `string`, números inteiros, `bool` e os outros tipos que o C# aceita em argumento de atributo.\n- `decimal` **não** é um desses tipos: `[InlineData(199.99m)]` nem compila (erro CS0182). O xUnit até converte um `199.99` (que é `double`) para um parâmetro `decimal`, mas aí a conferência de tipo fica para a hora da execução. Para dinheiro, prefira `TheoryData<decimal, decimal>` com `[MemberData]`: o compilador confere o tipo de cada linha.\n\nExceção também é comportamento. `Assert.Throws<T>` executa o código, confere que a exceção lançada é **exatamente** do tipo `T` e devolve a exceção, para você inspecionar detalhes como o nome do parâmetro.",
                    },
                    {
                        type: "code",
                        value: "// tests/Loja.Testes.Unidade/RegraDeFreteTests.cs (continuação da classe)\n[Theory]\n[InlineData(\"SP\")]\n[InlineData(\"RJ\")]\n[InlineData(\"MG\")]\n[InlineData(\"ES\")]\npublic void Sudeste_paga_15_reais_abaixo_do_minimo(string uf)\n{\n    var frete = RegraDeFrete.Calcular(199.99m, uf);\n\n    Assert.Equal(15m, frete);\n}\n\npublic static TheoryData<decimal, decimal> ValoresNaBorda => new()\n{\n    { 199.99m, 25m },\n    { 200.00m, 0m },\n    { 200.01m, 0m },\n};\n\n[Theory]\n[MemberData(nameof(ValoresNaBorda))]\npublic void Fora_do_sudeste_o_frete_respeita_a_borda_do_minimo(decimal total, decimal esperado)\n{\n    var frete = RegraDeFrete.Calcular(total, \"BA\");\n\n    Assert.Equal(esperado, frete);\n}\n\n[Fact]\npublic void Total_negativo_e_rejeitado()\n{\n    var erro = Assert.Throws<ArgumentOutOfRangeException>(\n        () => RegraDeFrete.Calcular(-1m, \"SP\"));\n\n    Assert.Equal(\"totalDoPedido\", erro.ParamName);\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Asserção\", \"O que confere\", \"Detalhe que pega gente\"], [\"`Assert.Equal(esperado, atual)`\", \"Igualdade de valores, inclusive de coleções e records\", \"O esperado vem primeiro; invertido, a mensagem de falha confunde, e o xUnit2000 avisa quando um literal está do lado errado\"], [\"`Assert.True` e `Assert.False`\", \"Uma condição booleana\", \"Na falha só diz que era falso; a asserção específica mostra os valores\"], [\"`Assert.Null` e `Assert.NotNull`\", \"Referência nula ou não\", \"Depois do `NotNull`, o compilador trata a variável como não nula\"], [\"`Assert.Single(colecao)`\", \"Que há exatamente um item, e devolve esse item\", \"Substitui o par `Assert.Equal(1, lista.Count)` e `lista[0]`\"], [\"`Assert.Contains(colecao, predicado)`\", \"Que algum item satisfaz a condição\", \"Confere o seu dado sem depender do que mais está na coleção\"], [\"`Assert.Throws<T>(acao)`\", \"Que a ação lança exatamente `T`\", \"Exceção derivada de `T` falha; para aceitar derivadas, `Assert.ThrowsAny<T>`\"], [\"`Assert.ThrowsAsync<T>(acao)`\", \"O mesmo, para código assíncrono\", \"Precisa de `await`; sem ele, o analisador xUnit2021 barra o build\"]]",
                    },
                    {
                        type: "text",
                        value: "## Erros comuns (e o que o xUnit faz com eles)\n\n- **Contar com estado entre testes.** O xUnit cria uma instância nova da classe de teste para cada teste: o construtor roda antes de cada um, e os campos de instância começam do zero. Isso é proposital, para um teste não depender da ordem dos outros. Campo `static`, por outro lado, é compartilhado por todos, e teste que grava nele passa sozinho e quebra na suíte.\n- **Inverter esperado e atual** no `Assert.Equal`. O teste passa ou falha igual, mas a mensagem de falha mostra \"Expected\" e \"Actual\" trocados e confunde quem investiga. O analisador xUnit2000 avisa no build quando um valor literal está na posição do atual.\n- **`async void` em teste.** A v3 removeu o suporte: o build falha com o xUnit1049. Teste assíncrono retorna `Task` (ou `ValueTask`).\n- **Ignorar o cancelamento.** A v3 expõe `TestContext.Current.CancellationToken`, que é cancelado quando a rodada de testes é interrompida. Passe esse token para os métodos assíncronos; o analisador xUnit1051 lembra quando você esquece.\n- **Testar método privado.** Se a regra importa, ela aparece no comportamento público. Testar o privado prende o teste à implementação, e qualquer refatoração quebra testes sem mudar comportamento nenhum.",
                    },
                    {
                        type: "quote",
                        value: "Teste unitário bom é rápido, determinístico e tem nome de regra de negócio: quando quebra, a saída do `dotnet test` já diz o que parou de funcionar. Comece pelas funções puras e pelas bordas, que é onde o bug mora.",
                    },
                ],
                questions: [
                    {
                        statement: "Você está no SDK do .NET 10 e quer um projeto de testes com xUnit v3. Por que não basta rodar `dotnet new xunit`?",
                        difficulty: "facil",
                        options: [
                            { text: "O template embutido saiu do SDK do .NET 10, e o comando avisa que ele não foi encontrado", isCorrect: false },
                            { text: "O template embutido no SDK ainda cria um projeto da v2, com o pacote `xunit` 2.9", isCorrect: true },
                            { text: "O template embutido mira o .NET 8 por padrão, e o projeto não consegue referenciar a API", isCorrect: false },
                            { text: "O template embutido já gera a v3, mas sem as asserções, que ficam noutro pacote", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Qual nome de teste ajuda mais quem lê a saída do `dotnet test` depois que ele falha?",
                        difficulty: "facil",
                        options: [
                            { text: "`RegraDeFreteTests_Calcular_DeveRetornarOValorCorreto`", isCorrect: false },
                            { text: "`CalcularFrete_Teste1_ComValoresVariados`", isCorrect: false },
                            { text: "`Pedido_a_partir_de_200_reais_tem_frete_gratis`", isCorrect: true },
                            { text: "`TestarMetodoCalcularComTotalIgualA200`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O método testado lança `ArgumentOutOfRangeException` quando o total é negativo, e essa classe herda de `ArgumentException`. O que acontece com este teste?\n\n```csharp\n[Fact]\npublic void Total_negativo_e_rejeitado()\n{\n    Assert.Throws<ArgumentException>(\n        () => RegraDeFrete.Calcular(-1m, \"SP\"));\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Falha: o `Assert.Throws` exige o tipo exato e não aceita classe derivada", isCorrect: true },
                            { text: "Não compila: o tipo genérico tem de ser o mesmo que o método declara lançar", isCorrect: false },
                            { text: "Passa: a exceção lançada herda de `ArgumentException`, então o tipo confere", isCorrect: false },
                            { text: "Passa, mas o analisador avisa que existe um tipo de exceção mais específico", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Você criou o projeto de testes com `dotnet new xunit3 -n Loja.Tests` numa pasta avulsa, sem solução nem Git, e depois o moveu para `tests/` no repositório da API. Na raiz, o `dotnet test` falha com \"Testing with VSTest target is no longer supported by Microsoft.Testing.Platform on .NET 10 SDK and later\". Qual é a correção?",
                        difficulty: "medio",
                        options: [
                            { text: "Rodar o `dotnet test` com `--framework net8.0`, que é o alvo padrão do template", isCorrect: false },
                            { text: "Apagar o `xunit.runner.json`, que força o modo VSTest e conflita com o SDK do .NET 10", isCorrect: false },
                            { text: "Trocar o `OutputType` de `Exe` para `Library`, como era nos projetos de teste antigos", isCorrect: false },
                            { text: "Levar para a raiz o `global.json` que o template gravou dentro da pasta do projeto", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Os dois testes abaixo estão na mesma classe. O que acontece ao rodar a classe inteira?\n\n```csharp\npublic class ContadorTests\n{\n    private static int _instancias;\n\n    public ContadorTests() => _instancias++;\n\n    [Fact]\n    public void Primeiro() => Assert.Equal(1, _instancias);\n\n    [Fact]\n    public void Segundo() => Assert.Equal(1, _instancias);\n}\n```",
                        difficulty: "dificil",
                        options: [
                            { text: "Os dois passam: o xUnit cria uma instância por teste e zera todos os campos", isCorrect: false },
                            { text: "O resultado muda a cada execução, porque os dois testes rodam em paralelo", isCorrect: false },
                            { text: "Um deles falha: cada teste cria uma instância, mas o campo estático é um só", isCorrect: true },
                            { text: "Os dois falham: o construtor roda uma vez só, antes do primeiro teste da classe", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Dublês: fakes à mão e NSubstitute",
                blocks: [
                    {
                        type: "text",
                        value: "# Dublês: fakes à mão e NSubstitute\n\nO checkout da loja faz três coisas: aplica o cupom se ele ainda vale, cobra o cartão no gateway de pagamento e avisa o cliente. Tente escrever um teste unitário para isso usando as peças de verdade e os problemas aparecem na hora: o gateway cobra dinheiro de verdade (ou exige o sandbox do provedor, rede e credencial), o aviso sai para alguém, e o teste do cupom vencido depende do dia em que você roda.\n\nA saída é trocar essas dependências, só no teste, por **dublês** (test doubles): objetos que se passam pela dependência real e que o teste controla. Para isso dar certo, a classe precisa **receber** as dependências em vez de criá-las por dentro. É a injeção de dependência que você usou na API: o serviço pede interfaces no construtor, e o `Program.cs` decide qual implementação entra em produção.",
                    },
                    {
                        type: "code",
                        value: "// src/Loja.Api/Dominio/Checkout.cs\nnamespace Loja.Api.Dominio;\n\npublic interface IGatewayDePagamento\n{\n    Task<bool> CobrarAsync(string tokenDoCartao, decimal valor, CancellationToken ct);\n}\n\npublic interface INotificador\n{\n    Task EnviarAsync(string email, string mensagem, CancellationToken ct);\n}\n\npublic sealed record Carrinho(string EmailCliente, decimal Total);\n\npublic sealed record Cupom(string Codigo, decimal Percentual, DateTimeOffset ValidoAte);\n\npublic enum ResultadoCheckout { Aprovado, Recusado }\n\npublic sealed class ServicoDeCheckout(\n    IGatewayDePagamento gateway, INotificador notificador, TimeProvider relogio)\n{\n    public async Task<ResultadoCheckout> FinalizarAsync(\n        Carrinho carrinho, Cupom? cupom, string tokenDoCartao, CancellationToken ct)\n    {\n        var valor = carrinho.Total;\n        if (cupom is not null && relogio.GetUtcNow() <= cupom.ValidoAte)\n            valor -= valor * cupom.Percentual / 100m;\n\n        var aprovado = await gateway.CobrarAsync(tokenDoCartao, valor, ct);\n        if (!aprovado)\n            return ResultadoCheckout.Recusado;\n\n        await notificador.EnviarAsync(carrinho.EmailCliente, \"Pagamento aprovado\", ct);\n        return ResultadoCheckout.Aprovado;\n    }\n}\n\n// src/Loja.Api/Program.cs (trecho): em produção entram as implementações reais\nbuilder.Services.AddSingleton(TimeProvider.System);\nbuilder.Services.AddHttpClient<IGatewayDePagamento, GatewayDePagamentoHttp>(cliente =>\n    cliente.BaseAddress = new Uri(builder.Configuration[\"Pagamentos:Url\"] ?? \"https://pagamentos.invalid\"));\nbuilder.Services.AddScoped<INotificador, NotificadorPorLog>();\nbuilder.Services.AddScoped<ServicoDeCheckout>();",
                    },
                    {
                        type: "text",
                        value: "## O relógio também é dependência\n\n`DateTime.UtcNow` dentro da regra é uma dependência escondida: o teste do cupom vencido passa hoje e falha quando o calendário anda, ou o contrário. Desde o .NET 8, a biblioteca padrão tem a classe abstrata `TimeProvider`. Em produção, registre `TimeProvider.System`; no teste, use o `FakeTimeProvider` (pacote `Microsoft.Extensions.TimeProvider.Testing`), que começa na data que você escolher e só anda quando você manda, com `Advance` ou `SetUtcNow`.\n\n## O dublê mais simples: uma classe escrita à mão\n\nUm fake escrito à mão é só uma classe que implementa a interface e guarda o que recebeu. Não precisa de biblioteca, é fácil de ler e serve para muitos testes. O `GatewayQueResponde` devolve a resposta que o teste pediu e anota os valores cobrados; o `NotificadorEmMemoria` anota para quem foi o aviso.",
                    },
                    {
                        type: "code",
                        value: "// tests/Loja.Testes.Unidade/ServicoDeCheckoutTests.cs\n// dotnet add tests/Loja.Testes.Unidade package Microsoft.Extensions.TimeProvider.Testing\nusing Loja.Api.Dominio;\nusing Microsoft.Extensions.Time.Testing;\n\nnamespace Loja.Testes.Unidade;\n\nsealed class GatewayQueResponde(bool aprova) : IGatewayDePagamento\n{\n    public List<decimal> ValoresCobrados { get; } = [];\n\n    public Task<bool> CobrarAsync(string tokenDoCartao, decimal valor, CancellationToken ct)\n    {\n        ValoresCobrados.Add(valor);\n        return Task.FromResult(aprova);\n    }\n}\n\nsealed class NotificadorEmMemoria : INotificador\n{\n    public List<string> Destinatarios { get; } = [];\n\n    public Task EnviarAsync(string email, string mensagem, CancellationToken ct)\n    {\n        Destinatarios.Add(email);\n        return Task.CompletedTask;\n    }\n}\n\npublic class ServicoDeCheckoutTests\n{\n    private static readonly DateTimeOffset Agora = new(2026, 10, 20, 12, 0, 0, TimeSpan.Zero);\n    private readonly FakeTimeProvider _relogio = new(Agora);\n\n    [Fact]\n    public async Task Pagamento_aprovado_avisa_o_cliente()\n    {\n        var gateway = new GatewayQueResponde(aprova: true);\n        var notificador = new NotificadorEmMemoria();\n        var servico = new ServicoDeCheckout(gateway, notificador, _relogio);\n\n        var resultado = await servico.FinalizarAsync(\n            new Carrinho(\"ana@exemplo.com\", 150m), cupom: null, \"tok_123\",\n            TestContext.Current.CancellationToken);\n\n        Assert.Equal(ResultadoCheckout.Aprovado, resultado);\n        var destinatario = Assert.Single(notificador.Destinatarios);\n        Assert.Equal(\"ana@exemplo.com\", destinatario);\n    }\n\n    [Fact]\n    public async Task Cupom_dentro_da_validade_desconta_na_cobranca()\n    {\n        var gateway = new GatewayQueResponde(aprova: true);\n        var servico = new ServicoDeCheckout(gateway, new NotificadorEmMemoria(), _relogio);\n        var cupom = new Cupom(\"OUTUBRO10\", 10m, ValidoAte: Agora.AddHours(1));\n\n        await servico.FinalizarAsync(\n            new Carrinho(\"ana@exemplo.com\", 150m), cupom, \"tok_123\",\n            TestContext.Current.CancellationToken);\n\n        Assert.Equal([135m], gateway.ValoresCobrados);\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## O mesmo, com NSubstitute\n\nEscrever uma classe por cenário cansa quando cada teste quer uma resposta diferente. O **NSubstitute** cria o dublê em tempo de execução a partir da interface: `Substitute.For<T>()` devolve um objeto que aceita qualquer chamada, `Returns` diz o que responder e `Received` confere o que foi chamado. A versão 6 saiu em julho de 2026, com licença BSD, livre inclusive para uso comercial.\n\n- `gateway.CobrarAsync(\"tok_123\", 150m, Arg.Any<CancellationToken>()).Returns(false)` configura a resposta só para esses argumentos.\n- `Arg.Any<T>()` aceita qualquer valor; `Arg.Is<T>(x => ...)` aceita os valores que passam no predicado.\n- `Received(1)` confere que a chamada aconteceu uma vez com esses argumentos; `DidNotReceive()` confere que não aconteceu.\n\nFake à mão ou biblioteca? Os dois valem. O fake à mão compensa quando o dublê tem comportamento que muitos testes reaproveitam; a biblioteca brilha quando cada teste precisa de uma resposta diferente ou quer conferir a chamada.",
                    },
                    {
                        type: "code",
                        value: "// tests/Loja.Testes.Unidade/ServicoDeCheckoutTests.cs (continuação da classe)\n// dotnet add tests/Loja.Testes.Unidade package NSubstitute\n// no topo do arquivo: using NSubstitute;\n[Fact]\npublic async Task Pagamento_recusado_nao_avisa_ninguem()\n{\n    var gateway = Substitute.For<IGatewayDePagamento>();\n    gateway.CobrarAsync(\"tok_123\", 150m, Arg.Any<CancellationToken>()).Returns(false);\n    var notificador = Substitute.For<INotificador>();\n    var servico = new ServicoDeCheckout(gateway, notificador, _relogio);\n\n    var resultado = await servico.FinalizarAsync(\n        new Carrinho(\"ana@exemplo.com\", 150m), cupom: null, \"tok_123\",\n        TestContext.Current.CancellationToken);\n\n    Assert.Equal(ResultadoCheckout.Recusado, resultado);\n    await notificador.DidNotReceive().EnviarAsync(\n        Arg.Any<string>(), Arg.Any<string>(), Arg.Any<CancellationToken>());\n}\n\n[Fact]\npublic async Task Cupom_vencido_nao_da_desconto()\n{\n    var gateway = Substitute.For<IGatewayDePagamento>();\n    gateway.CobrarAsync(Arg.Any<string>(), Arg.Any<decimal>(), Arg.Any<CancellationToken>())\n        .Returns(true);\n    var servico = new ServicoDeCheckout(gateway, Substitute.For<INotificador>(), _relogio);\n    var cupom = new Cupom(\"OUTUBRO10\", 10m, ValidoAte: Agora.AddHours(1));\n\n    _relogio.Advance(TimeSpan.FromHours(2));\n    await servico.FinalizarAsync(\n        new Carrinho(\"ana@exemplo.com\", 150m), cupom, \"tok_123\",\n        TestContext.Current.CancellationToken);\n\n    await gateway.Received(1).CobrarAsync(\"tok_123\", 150m, Arg.Any<CancellationToken>());\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Tipo\", \"O que faz\", \"Exemplo nesta aula\"], [\"Dummy\", \"Só preenche um parâmetro; o teste não liga para ele\", \"`Substitute.For<INotificador>()` no teste do cupom vencido\"], [\"Stub\", \"Devolve respostas prontas para o código seguir um caminho\", \"O gateway configurado para recusar, no teste de pagamento recusado\"], [\"Spy\", \"Grava o que recebeu para o teste conferir depois\", \"`GatewayQueResponde`, que anota cada valor cobrado\"], [\"Mock\", \"Confere se a interação esperada aconteceu, com os argumentos certos\", \"`gateway.Received(1).CobrarAsync(...)`, que falha se a cobrança não saiu com 150\"], [\"Fake\", \"Implementação que funciona de verdade, só que simplificada\", \"`FakeTimeProvider`, um relógio que só anda quando o teste manda\"]]",
                    },
                    {
                        type: "text",
                        value: "## O que mockar e o que não\n\nNo dia a dia, todo mundo chama qualquer dublê de mock. O que importa é saber o que trocar. Troque o que **cruza a fronteira do processo** e você não controla: gateway de pagamento, envio de e-mail e SMS, API de terceiros, relógio. De preferência atrás de uma interface sua, no formato que o seu domínio precisa.\n\nNão troque:\n\n- **A classe que você está testando.** Acontece quando o teste substitui métodos da própria classe para isolar um trecho: aí ele prova o dublê, não o código.\n- **Records, DTOs e objetos de valor.** Use os de verdade; criar um `Carrinho` custa uma linha.\n- **`DbContext` e `DbSet`.** Consulta LINQ é método de extensão sobre `IQueryable`, e a documentação do EF Core desaconselha mockar `DbSet` para consulta. Banco se testa com banco, como você vai ver daqui a duas aulas.\n- **`ILogger`.** `LogInformation` é método de extensão, e o NSubstitute só intercepta membro de interface ou membro virtual. Para ignorar o log, passe `NullLogger<T>.Instance`; para conferir o log, use o `FakeLogger<T>` (pacote `Microsoft.Extensions.Diagnostics.Testing`).\n- **Classe concreta com método não virtual.** O NSubstitute não intercepta, e o `Returns` lança `CouldNotSetReturnDueToNoLastCallException`. Instale o `NSubstitute.Analyzers.CSharp`: ele avisa no build (NS1000 e NS1001).\n\nE o erro mais caro: **conferir cada chamada interna**. Teste que faz `Received` em tudo quebra quando alguém refatora sem mudar comportamento, e a equipe aprende a ignorar teste vermelho. Confira o resultado sempre que puder; confira a chamada quando ela **é** o efeito que importa, como o valor cobrado no cartão.",
                    },
                    {
                        type: "code",
                        value: "// Um serviço qualquer que registra log\npublic class ProcessadorDePedido(ILogger<ProcessadorDePedido> logger)\n{\n    public void Processar(int pedidoId) => logger.LogInformation(\"Pedido {PedidoId} processado\", pedidoId);\n}\n\npublic class ProcessadorDePedidoTests\n{\n    // Armadilha: LogInformation é método de extensão. O substituto recebe Log<FormattedLogValues>,\n    // a comparação do estado não bate e o teste falha (o NS1001 avisa já no build).\n    [Fact]\n    public void Conferir_log_com_Received_nao_funciona()\n    {\n        var logger = Substitute.For<ILogger<ProcessadorDePedido>>();\n        new ProcessadorDePedido(logger).Processar(42);\n        logger.Received().LogInformation(\"Pedido {PedidoId} processado\", 42);\n    }\n\n    // Caminho: o FakeLogger (pacote Microsoft.Extensions.Diagnostics.Testing) guarda cada registro\n    [Fact]\n    public void FakeLogger_guarda_a_mensagem_ja_montada()\n    {\n        var logger = new FakeLogger<ProcessadorDePedido>();\n        new ProcessadorDePedido(logger).Processar(42);\n\n        var registro = logger.Collector.LatestRecord;\n        Assert.Equal(LogLevel.Information, registro.Level);\n        Assert.Equal(\"Pedido 42 processado\", registro.Message);\n    }\n}",
                    },
                    {
                        type: "quote",
                        value: "Dublê tira do teste o que é lento, caro ou imprevisível, e só funciona se a classe recebe as dependências por interface. Troque a fronteira, nunca o próprio código, e confira a chamada só quando ela é o resultado que importa.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que o `ServicoDeCheckout` recebe um `TimeProvider` no construtor em vez de chamar `DateTime.UtcNow` direto?",
                        difficulty: "facil",
                        options: [
                            { text: "Porque o `DateTime.UtcNow` virou obsoleto no .NET 10 e passou a gerar aviso em todo build", isCorrect: false },
                            { text: "Para o teste controlar a hora com `FakeTimeProvider` e não depender do dia em que roda", isCorrect: true },
                            { text: "Para o ASP.NET Core converter a hora para o fuso do cliente em cada requisição", isCorrect: false },
                            { text: "Porque o `TimeProvider` consulta um servidor de hora e evita o relógio desajustado da máquina", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num teste unitário do `ServicoDeCheckout`, qual destas peças deve virar dublê?",
                        difficulty: "facil",
                        options: [
                            { text: "O `CancellationToken`, para o teste simular o cancelamento da cobrança", isCorrect: false },
                            { text: "O `IGatewayDePagamento`, que cobra o cartão num serviço externo", isCorrect: true },
                            { text: "O record `Carrinho`, para o teste não depender do construtor dele", isCorrect: false },
                            { text: "O próprio `ServicoDeCheckout`, para isolar o método `FinalizarAsync`", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O que acontece neste teste?\n\n```csharp\npublic class CalculadoraDeImposto\n{\n    public decimal Calcular(decimal valor) => valor * 0.1m;\n}\n\n[Fact]\npublic void Imposto_configurado()\n{\n    var calc = Substitute.For<CalculadoraDeImposto>();\n    calc.Calcular(100m).Returns(999m);\n    Assert.Equal(999m, calc.Calcular(100m));\n}\n```",
                        difficulty: "medio",
                        options: [
                            { text: "Passa: o NSubstitute gera uma subclasse que substitui todo método público da classe", isCorrect: false },
                            { text: "Passa na primeira chamada e devolve o cálculo real a partir da segunda chamada", isCorrect: false },
                            { text: "Não compila: o `Substitute.For` aceita só interface como tipo genérico, nunca classe", isCorrect: false },
                            { text: "Falha no `Returns`: o método não é virtual, e o NSubstitute não intercepta a chamada", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O teste faz `logger.Received().LogInformation(\"Pedido {PedidoId} processado\", 42)` num substituto de `ILogger<T>` e falha, embora o código tenha registrado exatamente esse log. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "O NSubstitute não aceita interface genérica e cria um `ILogger<T>` vazio, sem registrar nada", isCorrect: false },
                            { text: "O `Received` só confere métodos assíncronos, e o `LogInformation` devolve `void`", isCorrect: false },
                            { text: "Faltou configurar um `Returns` no substituto antes de conferir a chamada com o `Received`", isCorrect: false },
                            { text: "`LogInformation` é extensão: a chamada real é `Log<TState>`, e o estado não bate", isCorrect: true },
                        ],
                    },
                    {
                        statement: "Um colega guardou o cliente numa variável local em vez de buscá-lo duas vezes no repositório. O comportamento do serviço não mudou, mas 30 testes quebraram, todos com `repositorio.Received(2).BuscarClienteAsync(...)`. Qual é o diagnóstico?",
                        difficulty: "dificil",
                        options: [
                            { text: "Os testes fixavam detalhe de implementação; deviam conferir resultado e efeito externo", isCorrect: true },
                            { text: "Nada de errado nos testes: refatoração que muda as chamadas exige atualizar os testes junto", isCorrect: false },
                            { text: "O NSubstitute conta errado as chamadas assíncronas; um fake à mão resolveria o caso", isCorrect: false },
                            { text: "Faltou `Arg.Any` nas verificações, o que deixaria a contagem de chamadas mais flexível", isCorrect: false },
                        ],
                    },
                ],
            },
            {
                titulo: "Testes de integração com WebApplicationFactory",
                blocks: [
                    {
                        type: "text",
                        value: "# Testes de integração com WebApplicationFactory\n\nTodos os testes unitários passam, você faz o deploy e o `POST /checkout` responde 500. O motivo: ninguém registrou o `ServicoDeCheckout` no contêiner de injeção de dependência. O teste unitário nunca veria isso, porque cria o serviço com `new`. Da mesma família são a rota com erro de digitação, a validação que não foi ligada, o JSON com nome de campo diferente do esperado e o middleware na ordem errada: tudo isso mora no `Program.cs`, e teste unitário não passa por lá.\n\nTeste de integração sobe a API **inteira** (o `Program.cs`, a injeção de dependência, o roteamento, a validação, a serialização) e conversa com ela por HTTP, como um cliente faria.\n\n## Como a WebApplicationFactory funciona\n\nO pacote `Microsoft.AspNetCore.Mvc.Testing` traz a `WebApplicationFactory<TEntryPoint>`. Ela executa o `Program.cs` da API dentro do processo de teste, com um servidor em memória (o `TestServer`) no lugar do Kestrel: não abre porta, não passa pela rede e não conflita com nada que esteja rodando na máquina. `CreateClient()` devolve um `HttpClient` já apontado para esse servidor, com endereço base `http://localhost/`.",
                    },
                    {
                        type: "text",
                        value: "Três detalhes que confundem no começo:\n\n- **O tipo `Program`.** Com top-level statements, o compilador gera a classe `Program`, e ela precisa ser pública para outro projeto usá-la em `WebApplicationFactory<Program>`. No .NET 10, um gerador de código do ASP.NET Core já declara `public partial class Program`. Em projetos mais antigos você vai achar essa linha no fim do `Program.cs`: era o mesmo ajuste, feito à mão.\n- **O ambiente é `Development`** por padrão. Se a API tem configuração específica para teste, chame `UseEnvironment` no builder da fábrica.\n- **Subir o host custa caro.** Com `IClassFixture<WebApplicationFactory<Program>>`, o xUnit cria a fábrica uma vez por classe de teste e entrega a mesma instância, pelo construtor, a todos os testes dela.",
                    },
                    {
                        type: "code",
                        value: "# terminal, na raiz da solução\ndotnet new xunit3 -f net10.0 -o tests/Loja.Testes.Integracao\ndotnet sln add tests/Loja.Testes.Integracao\ndotnet add tests/Loja.Testes.Integracao reference src/Loja.Api\ndotnet add tests/Loja.Testes.Integracao package Microsoft.AspNetCore.Mvc.Testing",
                    },
                    {
                        type: "code",
                        value: "// tests/Loja.Testes.Integracao/ApiTests.cs\nusing System.Net;\nusing System.Net.Http.Json;\nusing Loja.Api.Dominio;\nusing Microsoft.AspNetCore.Http;\nusing Microsoft.AspNetCore.Mvc.Testing;\nusing Microsoft.AspNetCore.TestHost;\nusing Microsoft.Extensions.DependencyInjection;\nusing Microsoft.Extensions.DependencyInjection.Extensions;\n\nnamespace Loja.Testes.Integracao;\n\npublic class ApiTests(WebApplicationFactory<Program> fabrica)\n    : IClassFixture<WebApplicationFactory<Program>>\n{\n    [Fact]\n    public async Task Produto_sem_nome_volta_400_com_o_campo_que_falhou()\n    {\n        var cliente = fabrica.CreateClient();\n\n        var resposta = await cliente.PostAsJsonAsync(\"/produtos\",\n            new { nome = \"\", sku = \"CAF-001\", preco = 10m },\n            TestContext.Current.CancellationToken);\n\n        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);\n        var problema = await resposta.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(\n            TestContext.Current.CancellationToken);\n        Assert.NotNull(problema);\n        Assert.Contains(\"Nome\", problema.Errors.Keys);\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "Esse teste prova coisas que nenhum teste unitário provaria: que a rota existe, que a validação das Minimal APIs está ligada (`AddValidation`), que a resposta sai como `application/problem+json` e que o erro aponta o campo `Nome`. Repare que ele não confere a mensagem em inglês nem o corpo inteiro: o `traceId` muda a cada requisição, e o texto da mensagem pode mudar sem que a regra mude.\n\n## Trocando o que sai do processo\n\nO endpoint de checkout chama o gateway de pagamento de verdade. No teste de integração você quer a API real **menos** as dependências externas, e o lugar para trocá-las é o `ConfigureTestServices`: ele roda depois dos registros do `Program.cs`, então o que você registra ali vence. Remova o registro original com `RemoveAll<T>()` e registre o fake. O `WithWebHostBuilder` cria uma fábrica derivada, com outro host: use para os cenários que pedem configuração diferente, não em todo teste.",
                    },
                    {
                        type: "code",
                        value: "// src/Loja.Api/Program.cs (trecho): o endpoint que o teste exercita\napp.MapPost(\"/checkout\", async Task<Results<NoContent, ProblemHttpResult>> (\n    PedidoDeCheckout pedido, ServicoDeCheckout checkout, CancellationToken ct) =>\n{\n    var carrinho = new Carrinho(pedido.Email, pedido.Total);\n    var resultado = await checkout.FinalizarAsync(carrinho, cupom: null, pedido.TokenDoCartao, ct);\n\n    return resultado == ResultadoCheckout.Aprovado\n        ? TypedResults.NoContent()\n        : TypedResults.Problem(title: \"Pagamento recusado\", statusCode: StatusCodes.Status422UnprocessableEntity);\n});\n\n// tests/Loja.Testes.Integracao/ApiTests.cs (continuação)\nsealed class GatewayQueRecusa : IGatewayDePagamento\n{\n    public Task<bool> CobrarAsync(string tokenDoCartao, decimal valor, CancellationToken ct)\n        => Task.FromResult(false);\n}\n\n// dentro da classe ApiTests\n[Fact]\npublic async Task Checkout_recusado_pelo_gateway_volta_422()\n{\n    var cliente = fabrica.WithWebHostBuilder(builder =>\n            builder.ConfigureTestServices(services =>\n            {\n                services.RemoveAll<IGatewayDePagamento>();\n                services.AddSingleton<IGatewayDePagamento, GatewayQueRecusa>();\n            }))\n        .CreateClient();\n\n    var resposta = await cliente.PostAsJsonAsync(\"/checkout\",\n        new { email = \"ana@exemplo.com\", total = 150m, tokenDoCartao = \"tok_123\" },\n        TestContext.Current.CancellationToken);\n\n    Assert.Equal(HttpStatusCode.UnprocessableEntity, resposta.StatusCode);\n}",
                    },
                    {
                        type: "table",
                        value: "[[\"Problema\", \"Teste unitário\", \"Teste com WebApplicationFactory\"], [\"Regra de negócio errada (frete, cupom)\", \"Pega, e aponta a regra pelo nome\", \"Pega, mas a causa fica mais longe do sintoma\"], [\"Serviço não registrado na injeção de dependência\", \"Não pega: o teste cria com `new`\", \"Pega: o endpoint resolve pelo contêiner real\"], [\"Rota ou verbo HTTP errado\", \"Não pega\", \"Pega: a requisição recebe 404 ou 405\"], [\"Validação desligada ou mal configurada\", \"Não pega\", \"Pega: o 400 com `ProblemDetails` não aparece\"], [\"Nome de campo diferente no JSON\", \"Não pega\", \"Pega: o campo chega vazio e a resposta muda\"], [\"Consulta que só falha no banco real\", \"Não pega\", \"Só pega com um banco de verdade por trás\"]]",
                    },
                    {
                        type: "text",
                        value: "## Cuidados que evitam dor de cabeça\n\n- **O banco continua lá.** A fábrica sobe a API com a connection string do `appsettings.json`. Os testes desta aula não tocam no banco (a validação barra antes, e o checkout não usa EF Core), mas um `GET /produtos/1` tentaria conectar no banco configurado. Nunca aponte teste para o banco de desenvolvimento \"porque ele já está rodando\": teste grava dados, suja o banco de quem desenvolve e colide quando duas pessoas (ou a CI) rodam ao mesmo tempo. A aula seguinte resolve isso com um banco descartável.\n- **Dependência externa não trocada sai de verdade.** Se o gateway HTTP não for substituído, o teste chama o endereço configurado. Troque tudo o que cruza a fronteira.\n- **Confira status e corpo.** Só o status deixa passar resposta certa com conteúdo errado; o corpo inteiro como string quebra por qualquer detalhe irrelevante. Leia o JSON para um tipo e confira os campos que expressam a regra.\n- **Passe `TestContext.Current.CancellationToken`** nas chamadas HTTP, como nos testes unitários.",
                    },
                    {
                        type: "quote",
                        value: "O teste com `WebApplicationFactory` roda o `Program.cs` de verdade e conversa por HTTP sem rede, então pega o que mora na composição da API: injeção de dependência, rota, validação e JSON. Troque só o que sai do processo e confira status e campos, não o corpo inteiro.",
                    },
                ],
                questions: [
                    {
                        statement: "O que a `WebApplicationFactory<Program>` sobe quando o teste chama `CreateClient()`?",
                        difficulty: "facil",
                        options: [
                            { text: "Um processo separado com o Kestrel, ouvindo numa porta aleatória livre da máquina", isCorrect: false },
                            { text: "Um contêiner Docker com a API, gerado a partir do Dockerfile do projeto web", isCorrect: false },
                            { text: "A API real, executando o `Program.cs`, num servidor em memória sem porta de rede", isCorrect: true },
                            { text: "Uma cópia simplificada do pipeline HTTP, montada sem passar pelo `Program.cs` da API", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que a classe de teste usa `IClassFixture<WebApplicationFactory<Program>>` em vez de criar `new WebApplicationFactory<Program>()` dentro de cada teste?",
                        difficulty: "facil",
                        options: [
                            { text: "O construtor da fábrica é interno, e só o xUnit consegue criá-la por meio da fixture", isCorrect: false },
                            { text: "Subir o host custa caro: a fixture cria um por classe, e os testes dela reaproveitam", isCorrect: true },
                            { text: "Criada dentro do teste, a fábrica ignora o `Program.cs` e sobe uma API vazia", isCorrect: false },
                            { text: "Sem a fixture, o `CreateClient()` devolve um cliente sem o endereço base configurado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num projeto anterior ao .NET 10, você encontra `public partial class Program { }` no fim do `Program.cs`. Para que servia essa linha?",
                        difficulty: "medio",
                        options: [
                            { text: "Tornar `Program` público para o projeto de testes usar `WebApplicationFactory<Program>`", isCorrect: true },
                            { text: "Registrar o `Program` como serviço Singleton no contêiner de injeção de dependência da API", isCorrect: false },
                            { text: "Ligar os top-level statements, que antes exigiam a declaração explícita da classe `Program`", isCorrect: false },
                            { text: "Permitir que o `dotnet run` encontrasse o método `Main` gerado pelo compilador", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O teste de checkout com `WebApplicationFactory` está fazendo cobranças no sandbox do provedor de pagamento de verdade. Qual é a correção?",
                        difficulty: "medio",
                        options: [
                            { text: "Subir a fábrica no ambiente `Testing`, que desliga as chamadas HTTP de saída da API", isCorrect: false },
                            { text: "Apagar a seção `Pagamentos` do `appsettings.json` para a chamada ficar sem destino", isCorrect: false },
                            { text: "Trocar o cliente de `CreateClient()` por um `new HttpClient()` apontado para a API", isCorrect: false },
                            { text: "Trocar o `IGatewayDePagamento` por um fake no `ConfigureTestServices` da fábrica", isCorrect: true },
                        ],
                    },
                    {
                        statement: "O teste envia um produto sem nome e recebe 400 com `application/problem+json`. Qual asserção confere a regra sem deixar o teste frágil?",
                        difficulty: "dificil",
                        options: [
                            { text: "Conferir só que o status não é 200, porque qualquer erro prova que a validação rodou", isCorrect: false },
                            { text: "Comparar o corpo inteiro com um JSON de referência guardado num arquivo do projeto de teste", isCorrect: false },
                            { text: "Conferir que o corpo contém o texto \"The Nome field is required.\" da mensagem padrão", isCorrect: false },
                            { text: "Ler o corpo como `HttpValidationProblemDetails` e conferir que `Errors` traz a chave `Nome`", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Banco real nos testes com Testcontainers",
                blocks: [
                    {
                        type: "text",
                        value: "# Banco real nos testes com Testcontainers\n\nA suíte passava inteira com o provedor em memória do EF Core (`UseInMemoryDatabase`). Em produção, cadastrar um produto com SKU repetido devolveu 500 em vez de 409, e o endpoint de reajuste em lote, que usa `ExecuteUpdateAsync`, nunca tinha rodado em teste nenhum. Os testes não mentiram de propósito: eles testaram outro banco.\n\nO provedor em memória não é um PostgreSQL mais rápido. É uma coleção de objetos que não conhece índice único, tipo de coluna, transação nem SQL. A tabela abaixo saiu de rodar o mesmo código contra os dois, com EF Core 10 e Npgsql 10:",
                    },
                    {
                        type: "table",
                        value: "[[\"Situação\", \"Provedor em memória\", \"PostgreSQL de verdade\"], [\"Dois produtos com o mesmo SKU (índice único)\", \"Grava os dois, sem erro\", \"`DbUpdateException` com o código 23505\"], [\"`DateTime.Now` numa coluna `timestamp with time zone`\", \"Grava\", \"Recusa: o Npgsql só aceita `DateTime` em UTC nesse tipo\"], [\"Busca com `EF.Functions.ILike`\", \"Lança exceção ao avaliar a consulta\", \"Funciona\"], [\"`ExecuteUpdateAsync` e `ExecuteDeleteAsync`\", \"Não suportados: lançam exceção\", \"Funcionam\"], [\"`BeginTransactionAsync`\", \"Lança o aviso `TransactionIgnoredWarning` como erro (ou ignora, se suprimido)\", \"Funciona\"], [\"`MigrateAsync`\", \"Lança exceção: migration é recurso de banco relacional\", \"Aplica as migrations como em produção\"]]",
                    },
                    {
                        type: "text",
                        value: "A documentação do EF Core é direta: usar o provedor em memória como dublê de banco é \"highly discouraged\" (altamente desaconselhado), e a recomendação é testar contra o mesmo sistema de banco de produção. SQLite em memória é menos ruim, mas continua sendo outro banco, com outro dialeto de SQL.\n\n## Testcontainers: um PostgreSQL descartável por execução\n\nO **Testcontainers** é uma biblioteca que fala com o Docker a partir do código de teste: sobe um contêiner, espera o serviço ficar pronto e entrega o endereço. Cada execução ganha um banco limpo, numa **porta aleatória** do host (sem conflito com o PostgreSQL que já roda na 5432), e um contêiner auxiliar, o Ryuk, remove tudo no fim, mesmo se o processo de teste morrer no meio. O requisito é ter Docker disponível, o que os runners Linux de CI costumam oferecer.\n\nNo .NET, o pacote `Testcontainers.PostgreSql` (versão 4.16 em outubro de 2026, licença MIT) traz o `PostgreSqlBuilder`. A fixture abaixo junta as duas peças: a `WebApplicationFactory` da aula anterior e um contêiner do PostgreSQL.",
                    },
                    {
                        type: "code",
                        value: "// tests/Loja.Testes.Integracao/ApiComBancoReal.cs\n// dotnet add tests/Loja.Testes.Integracao package Testcontainers.PostgreSql\nusing Loja.Api;\nusing Microsoft.AspNetCore.Hosting;\nusing Microsoft.AspNetCore.Mvc.Testing;\nusing Microsoft.EntityFrameworkCore;\nusing Microsoft.Extensions.DependencyInjection;\nusing Testcontainers.PostgreSql;\n\nnamespace Loja.Testes.Integracao;\n\npublic sealed class ApiComBancoReal : WebApplicationFactory<Program>, IAsyncLifetime\n{\n    private readonly PostgreSqlContainer _postgres =\n        new PostgreSqlBuilder(\"postgres:17-alpine\").Build();\n\n    public async ValueTask InitializeAsync()\n    {\n        await _postgres.StartAsync();\n\n        using var escopo = Services.CreateScope();\n        var db = escopo.ServiceProvider.GetRequiredService<LojaDbContext>();\n        await db.Database.MigrateAsync();\n    }\n\n    protected override void ConfigureWebHost(IWebHostBuilder builder)\n    {\n        builder.UseSetting(\"ConnectionStrings:Loja\", _postgres.GetConnectionString());\n    }\n\n    public override async ValueTask DisposeAsync()\n    {\n        await base.DisposeAsync();\n        await _postgres.DisposeAsync();\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "## A fixture, linha por linha\n\n- **`new PostgreSqlBuilder(\"postgres:17-alpine\")`**: a imagem vai explícita, na mesma versão major do banco de produção. Na versão 4.16 do Testcontainers, o construtor sem imagem já está obsoleto (aviso CS0618): a versão do banco é decisão sua, não um padrão escondido na biblioteca.\n- **`IAsyncLifetime`**: no xUnit v3, `InitializeAsync` e `DisposeAsync` devolvem `ValueTask`. O xUnit chama `InitializeAsync` antes dos testes que usam a fixture.\n- **A ordem importa.** O contêiner sobe primeiro; só depois o código toca em `Services`, que é o que monta o host e chama o `ConfigureWebHost`. Invertido, o `GetConnectionString()` lança `InvalidOperationException`, porque antes do `StartAsync` o contêiner não existe e não há porta mapeada para informar.\n- **`UseSetting` troca a connection string** da API: o valor entra na configuração antes de o `Program.cs` rodar e vence o que está no `appsettings.json`. O resto da API não sabe que está num teste.\n- **`MigrateAsync`, e não `EnsureCreatedAsync`**: o teste aplica as migrations de verdade e, de quebra, prova que elas rodam. `EnsureCreated` cria o schema direto do modelo e pula as migrations.\n- **`DisposeAsync`** derruba o host e depois o contêiner.",
                    },
                    {
                        type: "code",
                        value: "// tests/Loja.Testes.Integracao/ProdutosComBancoTests.cs\nusing System.Net;\nusing System.Net.Http.Json;\nusing Loja.Api;\n\nnamespace Loja.Testes.Integracao;\n\npublic class ProdutosComBancoTests(ApiComBancoReal api) : IClassFixture<ApiComBancoReal>\n{\n    [Fact]\n    public async Task Produto_criado_pode_ser_lido_de_volta()\n    {\n        var cliente = api.CreateClient();\n        var ct = TestContext.Current.CancellationToken;\n\n        var criacao = await cliente.PostAsJsonAsync(\"/produtos\",\n            new { nome = \"Café torrado 500 g\", sku = \"CAF-500\", preco = 32.90m }, ct);\n        Assert.Equal(HttpStatusCode.Created, criacao.StatusCode);\n        var criado = await criacao.Content.ReadFromJsonAsync<ProdutoResposta>(ct);\n        Assert.NotNull(criado);\n\n        var lido = await cliente.GetFromJsonAsync<ProdutoResposta>($\"/produtos/{criado.Id}\", ct);\n\n        Assert.Equal(criado, lido);\n    }\n\n    [Fact]\n    public async Task Sku_repetido_volta_409()\n    {\n        var cliente = api.CreateClient();\n        var ct = TestContext.Current.CancellationToken;\n        var produto = new { nome = \"Filtro de papel 103\", sku = \"FIL-103\", preco = 8.50m };\n\n        await cliente.PostAsJsonAsync(\"/produtos\", produto, ct);\n        var repetido = await cliente.PostAsJsonAsync(\"/produtos\", produto, ct);\n\n        Assert.Equal(HttpStatusCode.Conflict, repetido.StatusCode);\n    }\n\n    [Fact]\n    public async Task Busca_por_nome_ignora_maiusculas()\n    {\n        var cliente = api.CreateClient();\n        var ct = TestContext.Current.CancellationToken;\n        await cliente.PostAsJsonAsync(\"/produtos\",\n            new { nome = \"Moedor Manual\", sku = \"MOE-001\", preco = 189.00m }, ct);\n\n        var achados = await cliente.GetFromJsonAsync<List<ProdutoResposta>>(\"/produtos?busca=moedor\", ct);\n\n        Assert.NotNull(achados);\n        Assert.Contains(achados, p => p.Sku == \"MOE-001\");\n    }\n}",
                    },
                    {
                        type: "text",
                        value: "O teste do SKU repetido só faz sentido com banco de verdade: quem barra a duplicata é o índice único do PostgreSQL (erro 23505), e a API traduz isso para 409. Com o provedor em memória, o segundo cadastro passaria e o teste ficaria verde mentindo. O mesmo vale para a busca, que usa `EF.Functions.ILike`, uma função do PostgreSQL.\n\n## Isolamento e velocidade\n\nOs três testes dividem o mesmo banco, e isso é intencional: um contêiner por teste seria lento. O preço é cuidar do isolamento:\n\n- **Cada teste cria os próprios dados**, com chaves únicas (cada um usa um SKU diferente), e confere **o próprio dado**. `Assert.Contains(achados, p => p.Sku == \"MOE-001\")` continua certo se outro teste cadastrar mais produtos; contar a tabela inteira não continua.\n- **Escopo do contêiner.** Com `IClassFixture`, cada classe de teste ganha o seu contêiner. Com muitas classes, o xUnit v3 tem a fixture de assembly: `[assembly: AssemblyFixture(typeof(ApiComBancoReal))]` cria uma só para o projeto inteiro, e as classes recebem a instância pelo construtor, sem `IClassFixture`. Lembre que classes diferentes rodam em paralelo por padrão, então banco compartilhado entre classes pede ainda mais disciplina com os dados de cada teste.\n- **Quando precisar de tabela vazia** (relatório, contagem), dê a esses testes um banco só deles: outra fixture, com outro contêiner. Limpar a tabela no começo do teste não basta se outras classes gravam no mesmo banco em paralelo.\n\nQuanto custa? Na conferência deste material, subir o contêiner, aplicar a migration e rodar os testes levou alguns segundos. É mais lento que teste unitário, por isso a proporção continua valendo: muitos testes unitários para as regras, menos testes de integração para a composição e o banco.",
                    },
                    {
                        type: "quote",
                        value: "Teste de banco se faz com o banco de produção, não com um parecido: o provedor em memória aprova SKU repetido, data local e código que nem roda no PostgreSQL. Com Testcontainers, cada execução ganha um PostgreSQL descartável, as migrations rodam de verdade e cada teste confere o próprio dado.",
                    },
                ],
                questions: [
                    {
                        statement: "Por que o provedor em memória do EF Core (`UseInMemoryDatabase`) é um mau substituto do PostgreSQL nos testes da API?",
                        difficulty: "facil",
                        options: [
                            { text: "Exige Docker rodando na máquina de cada pessoa, o que complica a execução dos testes na CI", isCorrect: false },
                            { text: "Ignora as regras do banco real, como o índice único, e aprova código que falha em produção", isCorrect: true },
                            { text: "Foi removido do EF Core 10 e não pode mais ser instalado como pacote pelo NuGet oficial", isCorrect: false },
                            { text: "Só funciona com SQL Server e rejeita qualquer modelo configurado para o provedor Npgsql", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Você já tem um PostgreSQL rodando na porta 5432. O que acontece quando o Testcontainers sobe o contêiner do teste?",
                        difficulty: "facil",
                        options: [
                            { text: "Reaproveita o PostgreSQL local da 5432 e cria um schema separado só para o teste", isCorrect: false },
                            { text: "Mapeia uma porta livre aleatória, e o teste pega o endereço com `GetConnectionString()`", isCorrect: true },
                            { text: "Conecta no PostgreSQL local por engano, porque o `GetConnectionString()` devolve `localhost:5432`", isCorrect: false },
                            { text: "Falha com conflito de porta até você parar o PostgreSQL que está rodando na 5432", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Por que a fixture chama `MigrateAsync()` em vez de `EnsureCreatedAsync()` depois de subir o contêiner?",
                        difficulty: "medio",
                        options: [
                            { text: "Porque o `MigrateAsync` é mais rápido: pula índices e restrições para ganhar tempo", isCorrect: false },
                            { text: "Para aplicar as migrations reais, e o teste também provar que elas rodam no banco", isCorrect: true },
                            { text: "Porque o `EnsureCreatedAsync` apaga e recria o banco inteiro a cada nova chamada", isCorrect: false },
                            { text: "Porque o `EnsureCreatedAsync` não existe no EF Core 10 para o provedor Npgsql", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Com o provedor em memória, gravar `CriadoEm = DateTime.Now` funcionava. Com o PostgreSQL do contêiner, a gravação numa coluna `timestamp with time zone` falha. Por quê?",
                        difficulty: "medio",
                        options: [
                            { text: "O Npgsql só aceita `DateTime` em UTC nesse tipo de coluna, e o provedor em memória não confere", isCorrect: true },
                            { text: "O Npgsql exige `DateTimeOffset` nessa coluna e recusa qualquer `DateTime`, mesmo que esteja em UTC", isCorrect: false },
                            { text: "O contêiner roda em UTC e recusa qualquer horário que venha de outro fuso horário", isCorrect: false },
                            { text: "O `DateTime.Now` tem precisão maior do que a coluna aceita, e o banco recusa o valor", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Duas classes de teste dividem o mesmo contêiner por uma fixture de assembly. Um teste cadastra um produto, lista todos e faz `Assert.Single(produtos)`. Ele passa sozinho e falha na suíte completa. Qual é o diagnóstico?",
                        difficulty: "dificil",
                        options: [
                            { text: "O Testcontainers recria o banco entre as classes, e a lista some no meio do teste", isCorrect: false },
                            { text: "Testes da mesma classe rodam em paralelo por padrão, e por isso a contagem dobra", isCorrect: false },
                            { text: "O `MigrateAsync` roda de novo para cada classe e duplica as linhas já gravadas no banco", isCorrect: false },
                            { text: "Outra classe grava no mesmo banco em paralelo; o teste deve conferir o próprio produto", isCorrect: true },
                        ],
                    },
                ],
            },
            {
                titulo: "Qualidade no dia a dia e fechamento",
                blocks: [
                    {
                        type: "text",
                        value: "# Qualidade no dia a dia e fechamento\n\nTrês cenas comuns numa equipe de backend. Metade dos comentários do pull request é sobre espaço e chave fora do lugar. Um `NullReferenceException` chega em produção num trecho em que o compilador tinha avisado, mas o aviso estava perdido entre outros duzentos. E uma atualização de pacote entra sem ninguém ler, trazendo uma versão nova com licença paga.\n\nAs três têm a mesma cura: deixar a máquina conferir o que é mecânico, em todo build e na CI, para a revisão humana gastar tempo com o que importa. Nesta aula: analisadores, aviso de nulo como erro, `dotnet format`, auditoria de dependências e o critério para escolher pacote, que ficou mais sério depois que bibliotecas populares mudaram de licença.\n\n## Analisadores e o aviso de nulo como erro\n\nO SDK do .NET já vem com analisadores (as regras CA) ligados. A propriedade `AnalysisLevel` escolhe o conjunto: com `latest-recommended`, mais regras viram aviso no build. `EnforceCodeStyleInBuild` faz as regras de estilo (as IDE) configuradas no `.editorconfig` valerem no build, não só no editor. Pacotes trazem analisadores também: o `xunit.analyzers` chega junto com o xUnit v3, e o `NSubstitute.Analyzers.CSharp` você instala.",
                    },
                    {
                        type: "text",
                        value: "O aviso de nulo merece tratamento especial. Com `<Nullable>enable</Nullable>`, o compilador avisa quando você desreferencia algo que pode ser nulo (CS8602), mas aviso ignorado é aviso morto: em pouco tempo são duzentos, e ninguém lê. `<WarningsAsErrors>nullable</WarningsAsErrors>` transforma todos os avisos de nulo em erro de compilação. Tudo isso vai num `Directory.Build.props` na raiz do repositório, que vale para todos os projetos de uma vez.\n\nAo ligar esse arquivo na API dos exemplos, apareceram dois casos instrutivos. O CA1848 apontou o `LogInformation` do notificador e sugeriu `[LoggerMessage]`, o log gerado por código, mais eficiente. E o CA1707 reclamou dos sublinhados nos nomes de teste, que aqui são escolha da casa. Analisador é ferramenta, não dogma: a equipe decide, registra a decisão num `.editorconfig` (que pode valer só para uma pasta) e segue.",
                    },
                    {
                        type: "code",
                        value: "<!-- Directory.Build.props, na raiz: vale para todos os projetos abaixo dela -->\n<Project>\n  <PropertyGroup>\n    <Nullable>enable</Nullable>\n    <WarningsAsErrors>$(WarningsAsErrors);nullable;NU1903;NU1904</WarningsAsErrors>\n    <AnalysisLevel>latest-recommended</AnalysisLevel>\n    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>\n  </PropertyGroup>\n</Project>\n\n# tests/.editorconfig: nome de teste com sublinhado é escolha da casa\n[*.cs]\ndotnet_diagnostic.CA1707.severity = none",
                    },
                    {
                        type: "code",
                        value: "// Com o Directory.Build.props acima, isto deixa de compilar:\npublic static class Apelidos\n{\n    public static int Tamanho(string? apelido) => apelido.Length; // error CS8602\n}\n\n// src/Loja.Api/Dominio/Infra.cs: o CA1848 pediu log gerado por código\npublic sealed partial class NotificadorPorLog(ILogger<NotificadorPorLog> logger) : INotificador\n{\n    public Task EnviarAsync(string email, string mensagem, CancellationToken ct)\n    {\n        AvisoEnviado(logger, email, mensagem);\n        return Task.CompletedTask;\n    }\n\n    [LoggerMessage(Level = LogLevel.Information, Message = \"Aviso para {Email}: {Mensagem}\")]\n    private static partial void AvisoEnviado(ILogger logger, string email, string mensagem);\n}",
                    },
                    {
                        type: "text",
                        value: "## Formatação sem discussão: dotnet format\n\nO `dotnet format` vem no SDK e aplica o `.editorconfig` ao código: espaços, chaves, `using` e as regras de estilo que você configurou. Rode na sua máquina antes do commit; na CI, use `--verify-no-changes`, que não altera nada e sai com código 2 quando encontra algo fora do padrão, o que derruba o passo do pipeline. A discussão sobre formatação acontece uma vez, no `.editorconfig`, e nunca mais no pull request.\n\n## Dependências: vulnerabilidade e versão\n\nO `dotnet restore` audita os pacotes contra a base de vulnerabilidades do GitHub (GitHub Advisory Database) desde o SDK do .NET 8. Em projetos `net10.0`, a auditoria inclui por padrão as dependências **transitivas** (as que chegam por outro pacote), e não só as que você referenciou. O resultado aparece como avisos de NU1901 a NU1904, da severidade baixa à crítica; o `Directory.Build.props` acima transforma alta e crítica (NU1903 e NU1904) em erro. Para olhar com calma, use os comandos abaixo. No .NET 10 eles ganharam a forma com o substantivo primeiro (`dotnet package list`), e a forma antiga (`dotnet list package`) continua funcionando.",
                    },
                    {
                        type: "code",
                        value: "# terminal, na raiz da solução\ndotnet format                          # corrige a formatação\ndotnet format --verify-no-changes      # só confere, para a CI: sai com código 2 se algo mudaria\n\ndotnet package list --vulnerable --include-transitive\ndotnet package list --outdated\ndotnet package update --vulnerable     # sobe para a primeira versão sem vulnerabilidade conhecida\ndotnet nuget why src/Loja.Api Npgsql   # mostra por qual caminho um pacote transitivo entrou",
                    },
                    {
                        type: "text",
                        value: "## Licença também é dependência\n\nEm 2025, três bibliotecas muito populares no .NET mudaram de licença, e quem atualizou sem ler aceitou um contrato novo sem saber:\n\n- **FluentAssertions 8** (janeiro de 2025) passou para a licença da Xceed: gratuita para uso não comercial, e uso comercial exige assinatura paga. A linha 7.x segue Apache 2.0. A comunidade criou o fork **AwesomeAssertions**, que manteve Apache 2.0, e o **Shouldly** continua livre (BSD).\n- **MediatR 13** e **AutoMapper 15** (julho de 2025) passaram a ter licença dupla: comercial, com uma edição Community gratuita para empresas com receita anual abaixo de 5 milhões de dólares (e outras condições). O MediatR 12.x (Apache 2.0) e o AutoMapper 14.x (MIT) ficam na licença antiga, sem versões novas. O **Mapperly**, que gera o código de mapeamento na compilação, é uma alternativa livre (Apache 2.0).\n\nO erro comum não é usar essas bibliotecas: é subir a versão major sem olhar a licença, muitas vezes num pull request aberto por bot de dependências e aprovado porque \"a CI passou\". A CI confere o código, não o contrato. Para escolher (e para manter) um pacote:\n\n1. **Licença da versão exata**, conferida no nuget.org antes de cada major. Licença é por versão, não por pacote.\n2. **Quem mantém e como se sustenta.** Projeto de uma pessoa só, sem financiamento, corre risco de abandono ou de mudança de licença.\n3. **Custo de sair.** Biblioteca de asserção se espalha por milhares de linhas de teste; biblioteca de mapeamento entra em todo endpoint. Quanto mais espalhada, mais cara a troca.\n4. **Precisa mesmo?** O `Assert` do xUnit cobre quase tudo, mapear um DTO à mão são poucas linhas, e chamar o serviço direto dispensa um mediador.\n5. **O que a plataforma já dá.** `TimeProvider`, `FakeLogger`, a validação embutida e o OpenAPI nativo vêm da própria Microsoft, sem pacote de terceiro.",
                    },
                    {
                        type: "table",
                        value: "[[\"Pacote\", \"O que mudou\", \"Caminhos livres\"], [\"FluentAssertions 8+\", \"Licença Xceed: uso comercial exige assinatura paga (desde janeiro de 2025)\", \"`Assert` do xUnit, AwesomeAssertions (Apache 2.0), Shouldly (BSD) ou ficar na 7.x (Apache 2.0)\"], [\"MediatR 13+\", \"Licença dupla; edição Community gratuita abaixo de 5 milhões de dólares de receita anual\", \"Chamar o serviço direto, ou ficar na 12.x, que não recebe versões novas\"], [\"AutoMapper 15+\", \"Licença dupla, nas mesmas condições do MediatR\", \"Mapear à mão, Mapperly (Apache 2.0) ou ficar na 14.x, sem versões novas\"]]",
                    },
                    {
                        type: "text",
                        value: "## Fechamento\n\nOlhe o caminho até aqui. Você começou no `dotnet new`, entendeu o que o runtime faz com o seu código e passou por tipos, orientação a objetos, records, coleções, LINQ, exceções e `async`/`await`. Montou uma API com Minimal APIs, validação, configuração e OpenAPI, guardou dados no PostgreSQL com EF Core e migrations e, neste módulo, cercou tudo com testes unitários, testes de integração com banco de verdade e um build que recusa nulo descuidado, código fora do padrão e pacote vulnerável.\n\nMais do que a lista de APIs, fica o hábito: código que compila, teste que prova a regra, dependência escolhida com critério e data em tudo o que muda com o tempo. O que vem mais adiante, com mensageria, observabilidade e nuvem, se apoia exatamente nisso.",
                    },
                    {
                        type: "quote",
                        value: "Qualidade que depende de memória não dura: analisadores, nulo como erro, `dotnet format` e auditoria de pacotes transformam disciplina em build vermelho. Do `dotnet new` até uma API testada contra um PostgreSQL de verdade, o que fica é o hábito de deixar a máquina provar o que a gente só acha.",
                    },
                ],
                questions: [
                    {
                        statement: "Qual é o efeito de `<WarningsAsErrors>nullable</WarningsAsErrors>` no `Directory.Build.props`?",
                        difficulty: "facil",
                        options: [
                            { text: "O compilador passa a inserir uma checagem de nulo em tempo de execução em cada acesso", isCorrect: false },
                            { text: "Os tipos de referência deixam de aceitar nulo, e escrever `string?` vira erro de sintaxe", isCorrect: false },
                            { text: "Os avisos de nulo, como a desreferência possivelmente nula, passam a quebrar o build", isCorrect: true },
                            { text: "Os avisos de nulo saem da saída do build e passam a aparecer apenas no editor de código", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Para que serve `dotnet format --verify-no-changes` num passo de CI?",
                        difficulty: "facil",
                        options: [
                            { text: "Listar os pacotes desatualizados que podem mudar a formatação do código gerado no build", isCorrect: false },
                            { text: "Falhar o passo quando há código fora do padrão do `.editorconfig`, sem alterar arquivos", isCorrect: true },
                            { text: "Formatar os arquivos no servidor e fazer o commit da correção na branch do pull request", isCorrect: false },
                            { text: "Rodar os testes e conferir se a saída deles não mudou desde o último build aprovado", isCorrect: false },
                        ],
                    },
                    {
                        statement: "O bot de dependências abriu um pull request que sobe a FluentAssertions de 7.2 para 8.x num projeto de empresa, e a CI passou. O que precisa ser conferido antes do merge?",
                        difficulty: "medio",
                        options: [
                            { text: "A cobertura de testes, que cai quando a biblioteca de asserção muda", isCorrect: false },
                            { text: "Se a 7.2 tinha vulnerabilidade, já que só a 8 recebe correções", isCorrect: false },
                            { text: "A licença da versão 8, que exige assinatura paga para uso comercial", isCorrect: true },
                            { text: "Nada além da CI, porque a atualização no NuGet nunca muda a licença", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Num projeto `net10.0`, uma dependência **transitiva** tem uma vulnerabilidade de severidade alta publicada. O que o `dotnet restore` faz por padrão?",
                        difficulty: "medio",
                        options: [
                            { text: "Nada: a auditoria do restore só olha os pacotes que você referencia direto", isCorrect: false },
                            { text: "Atualiza sozinho a dependência para a primeira versão sem a vulnerabilidade", isCorrect: false },
                            { text: "Emite o aviso NU1903, porque em `net10.0` a auditoria inclui as transitivas", isCorrect: true },
                            { text: "Falha o restore com erro, porque vulnerabilidade alta é sempre erro no NuGet", isCorrect: false },
                        ],
                    },
                    {
                        statement: "Uma empresa com receita anual de 40 milhões de dólares começa uma API nova e quer mapear entidades para DTOs sem custo de licença e sem depender de versão parada. Qual escolha segue o critério da aula?",
                        difficulty: "dificil",
                        options: [
                            { text: "Mapear à mão ou usar o Mapperly, que gera o mapeamento e é Apache 2.0", isCorrect: true },
                            { text: "Usar o AutoMapper 15 sem chave de licença, já que o pacote roda sem ela", isCorrect: false },
                            { text: "Fixar o AutoMapper 14.x, que é MIT e segue recebendo versões de correção", isCorrect: false },
                            { text: "Usar o AutoMapper 15 na edição Community, gratuita para qualquer empresa", isCorrect: false },
                        ],
                    },
                ],
            },
        ],
    },
] as unknown as Modulo[];

async function seed() {
    mesclarSolucoes(MODULOS, "csharp-dotnet");
    let [trilha] = await db.select().from(trails).where(eq(trails.name, NOME));
    if (!trilha) {
        [trilha] = await db
            .insert(trails)
            .values({ name: NOME, trailLevel: LEVEL, description: DESCRICAO, workloadHours: HORAS })
            .returning();
        console.log("Trilha criada: " + trilha.name);
    }

    const existentes = await db.select().from(lessons).where(eq(lessons.trailId, trilha.id));
    if (existentes.length > 0) {
        const n = await backfillExplicacoes(trilha.id, MODULOS);
        console.log("Trilha " + NOME + " já existe; " + n + " explicações atualizadas.");
        return;
    }

    let totalAulas = 0;
    let totalQuestoes = 0;
    for (let mi = 0; mi < MODULOS.length; mi++) {
        const m = MODULOS[mi];
        const [mod] = await db
            .insert(modules)
            .values({ trailId: trilha.id, title: m.titulo, position: mi + 1 })
            .returning();
        for (let li = 0; li < m.aulas.length; li++) {
            const a = m.aulas[li];
            const [lesson] = await db
                .insert(lessons)
                .values({
                    trailId: trilha.id,
                    moduleId: mod.id,
                    title: a.titulo,
                    content: null,
                    contentBlocks: a.blocks,
                    position: li + 1,
                    published: true,
                })
                .returning();
            for (let qi = 0; qi < a.questions.length; qi++) {
                const q = a.questions[qi];
                const [questao] = await db
                    .insert(questions)
                    .values({
                        lessonId: lesson.id,
                        statement: q.statement,
                        explanation: q.explanation ?? null,
                        difficulty: q.difficulty,
                        position: qi + 1,
                    })
                    .returning();
                await db.insert(questionOptions).values(
                    q.options.map((o, k) => ({
                        questionId: questao.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: k + 1,
                    })),
                );
            }
            totalAulas++;
            totalQuestoes += a.questions.length;
        }
    }
    console.log(
        "Seed concluído: " +
            MODULOS.length +
            " módulos, " +
            totalAulas +
            " aulas, " +
            totalQuestoes +
            " questões.",
    );
}

seed()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error("Falha no seed:", e);
        process.exit(1);
    });
