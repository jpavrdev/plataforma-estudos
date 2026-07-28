# Laboratórios de Linux

Terminal de verdade dentro das aulas. Cada sessão ganha um container descartável
com shell, ligado ao navegador por WebSocket. O aluno pode usar `sudo` à vontade:
quebrar aquela máquina não afeta nada, porque ela é só dele e some no fim.

```
navegador (xterm.js)
   |  WebSocket
backend  (confere de quem é a sessão; o ticket vale 30s e queima no primeiro uso)
   |  WebSocket
labs     (único serviço que fala com o Docker)
   |  docker run
container do aluno  (sem rede, com limite de CPU, memória e PIDs, e TTL)
```

## Por que o lab não usa as mesmas travas do runner dos desafios

O runner roda com `--cap-drop ALL` e `--security-opt no-new-privileges`. Num lab
isso não serve: `no-new-privileges` mata o setuid, então o `sudo` para de
funcionar, e sem capabilities metade do módulo de permissões deixa de rodar.

Quem segura o host aqui é outra coisa: o **user namespace**. Com `userns-remap`,
o UID 0 de dentro do container vira um UID alto e sem privilégio nenhum para o
kernel do host. O aluno é root da caixa dele e ninguém lá fora.

## Preparando o servidor

O `userns-remap` é configuração do daemon inteiro, não de um container. Ligar no
daemon principal remapearia dono de arquivo em todos os volumes e mexeria com
backend, banco e Caddy de uma vez. Por isso os labs usam um **segundo daemon**.

> [!] Os dois daemons dividem o mesmo host, então tudo que é caminho ou nome
> precisa ser diferente: pidfile, exec-root, socket, data-root, namespace do
> containerd e bridge. Errar qualquer um deles derruba ou corrompe o daemon
> principal.

### 1. Usuário do remap e faixas de UID/GID

```bash
adduser --system --group --no-create-home dockremap
echo 'dockremap:500000:65536' >> /etc/subuid
echo 'dockremap:500000:65536' >> /etc/subgid
```

### 2. Configuração em `/etc/docker/daemon-labs.json`

```json
{
  "userns-remap": "dockremap",
  "data-root": "/var/lib/docker-labs",
  "exec-root": "/var/run/docker-labs",
  "pidfile": "/var/run/docker-labs.pid",
  "hosts": ["unix:///var/run/docker-labs.sock"],
  "containerd": "/run/containerd/containerd.sock",
  "containerd-namespace": "moby-labs",
  "containerd-plugins-namespace": "plugins-moby-labs",
  "iptables": false,
  "ip6tables": false,
  "bridge": "docker-labs0",
  "fixed-cidr": "172.31.250.0/24",
  "log-driver": "local",
  "log-opts": { "max-size": "5m", "max-file": "2", "compress": "false" }
}
```

Três armadilhas que essa configuração resolve, todas descobertas na prática:

- **Nunca use `"bridge": "none"`.** O dockerd assume a gestão da bridge padrão e
  **apaga a `docker0` do host**, que pertence ao daemon principal. O app não cai
  na hora, porque o compose usa redes próprias, mas todo `docker build` passa a
  falhar, e o deploy quebra. Use um nome próprio.
- `pidfile`, `exec-root` e o namespace do containerd precisam ser próprios. Sem
  eles o daemon nem sobe, reclamando do PID do daemon principal.
- No driver `local`, `max-file: 1` é inválido junto com compressão. Deixe
  `max-file: 2` e `compress: false`, senão todo container falha ao iniciar.

### 3. Serviço em `/etc/systemd/system/docker-labs.service`

O Docker exige que uma bridge de nome customizado exista **antes** de subir.
Criar pelo `ExecStartPre` faz o daemon sobreviver a um reboot, o que um
`ip link` manual não faria.

```ini
[Unit]
Description=Docker daemon dos laboratorios de Linux
After=network.target docker.service

[Service]
Type=notify
ExecStartPre=-/usr/sbin/ip link add name docker-labs0 type bridge
ExecStartPre=-/usr/sbin/ip addr add 172.31.250.1/24 dev docker-labs0
ExecStartPre=-/usr/sbin/ip link set docker-labs0 up
ExecStart=/usr/bin/dockerd --config-file /etc/docker/daemon-labs.json
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always
RestartSec=3
LimitNOFILE=infinity
LimitNPROC=infinity
TasksMax=infinity
Delegate=yes
KillMode=process
OOMScoreAdjust=-500

[Install]
WantedBy=multi-user.target
UNIT
```

```bash
systemctl daemon-reload && systemctl enable --now docker-labs
```

### 4. Imagem do lab

O daemon dos labs não tem rede de propósito, então **não dá para construir nele**:
o `apt` do Dockerfile não teria como baixar nada. Construa no daemon principal e
transfira.

```bash
cd /opt/ensinadev/plataforma-estudos
docker build -t lab-linux labs/image
docker save lab-linux | DOCKER_HOST=unix:///var/run/docker-labs.sock docker load
```

### 5. Limite o disco dos labs

Sem isso, um aluno enche o disco do servidor em cerca de um minuto e meio com um
`dd`, e derruba o Postgres junto. Cota por container (`--storage-opt size=`) não
resolve aqui: ela exige xfs com `pquota`, e a raiz é ext4. A saída é dar aos labs
um disco próprio de tamanho fixo, num arquivo montado por loopback.

```bash
systemctl stop docker-labs
fallocate -l 10G /var/lib/docker-labs.img
mkfs.ext4 -q -F /var/lib/docker-labs.img
mv /var/lib/docker-labs /var/lib/docker-labs.antigo
mkdir -p /var/lib/docker-labs
mount -o loop /var/lib/docker-labs.img /var/lib/docker-labs
cp -a /var/lib/docker-labs.antigo/. /var/lib/docker-labs/ && rm -rf /var/lib/docker-labs.antigo
echo '/var/lib/docker-labs.img /var/lib/docker-labs ext4 loop,defaults,nofail 0 0' >> /etc/fstab
systemctl start docker-labs
```

Não use a opção `discard` na montagem: em arquivo de loopback ela perfura bloco a
bloco e a escrita fica lenta a ponto de travar. O arquivo cresce até o teto de
10 GB e para; para devolver ao host o que estiver livre, um `fstrim` periódico
resolve (há um `fstrim-labs.timer` semanal no servidor).

Confira que o teto pegou: dentro do lab, `df -h /` tem que mostrar o tamanho do
loopback, não o disco do host.

### 6. Confirme que o remap pegou

É o teste que prova a segurança toda. De dentro o aluno é root; do host, ninguém.

```bash
export DOCKER_HOST=unix:///var/run/docker-labs.sock
docker run -d --rm --name t --network none lab-linux sleep 60
docker exec t sudo id        # uid=0(root)
ps -eo uid,cmd | grep 'sleep 60'   # 501000 no host
docker rm -f t
```

## Ajustes

| variável | padrão | o que faz |
|---|---|---|
| `MAX_SESSOES` | 6 | sessões simultâneas antes de recusar novas (uma por aluno) |
| `LAB_TTL_MINUTOS` | 45 | tempo de vida da sessão |
| `LAB_MEMORIA` | 256m | memória por lab |
| `LAB_CPUS` | 0.25 | CPU por lab; o peso na disputa é baixo, então o app ganha do laboratório |
| `LAB_DOCKER_HOST` | vazio | socket do daemon dos labs; vazio usa o padrão (só em dev) |

Um shell parado custa de 10 a 20 MB, então o gargalo costuma ser CPU, não memória.
O teto é conservador de propósito: a máquina tem 2 vCPUs e o Postgres roda nela.
Melhor recusar a sétima sessão do que deixar o site lento para todo mundo.

## Limites conhecidos

Sem rede dentro do lab, então `apt install` não funciona e as aulas de systemd,
pacotes e rede pedem mais trabalho (systemd como PID 1 e egress por allowlist).
Montar disco de verdade e labs de Kubernetes com vários nós ficam fora: para isso
seria preciso microVM, que exige virtualização aninhada, algo que a Hostinger não
oferece.
