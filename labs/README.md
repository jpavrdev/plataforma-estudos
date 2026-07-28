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

1. Crie o usuário do remap e as faixas de UID/GID:

```bash
adduser --system --group --no-create-home dockremap
echo 'dockremap:500000:65536' >> /etc/subuid
echo 'dockremap:500000:65536' >> /etc/subgid
```

2. Configure o daemon dos labs em `/etc/docker/daemon-labs.json`:

```json
{
  "userns-remap": "dockremap",
  "data-root": "/var/lib/docker-labs",
  "hosts": ["unix:///var/run/docker-labs.sock"],
  "iptables": false,
  "bridge": "none"
}
```

3. Suba como serviço próprio (`/etc/systemd/system/docker-labs.service`):

```ini
[Unit]
Description=Docker daemon dos laboratorios
After=network.target

[Service]
ExecStart=/usr/bin/dockerd --config-file /etc/docker/daemon-labs.json
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload && systemctl enable --now docker-labs
```

4. Construa a imagem do lab **nesse** daemon:

```bash
LAB_DOCKER_HOST=unix:///var/run/docker-labs.sock bash labs/build-images.sh
```

Confira que o remap pegou: o processo dentro do lab tem que aparecer com UID alto
no host.

```bash
DOCKER_HOST=unix:///var/run/docker-labs.sock docker run --rm lab-linux id
# uid=1000(aluno) ... visto de dentro
ps -eo user,cmd | grep bash
# 500000 ... visto do host
```

## Ajustes

| variável | padrão | o que faz |
|---|---|---|
| `MAX_SESSOES` | 20 | sessões simultâneas antes de recusar novas |
| `LAB_TTL_MINUTOS` | 45 | tempo de vida da sessão |
| `LAB_MEMORIA` | 256m | memória por lab |
| `LAB_CPUS` | 0.5 | CPU por lab |
| `LAB_DOCKER_HOST` | vazio | socket do daemon dos labs; vazio usa o padrão (só em dev) |

Um shell parado custa de 10 a 20 MB, então o gargalo costuma ser CPU, não memória.

## Limites conhecidos

Sem rede dentro do lab, então `apt install` não funciona e as aulas de systemd,
pacotes e rede pedem mais trabalho (systemd como PID 1 e egress por allowlist).
Montar disco de verdade e labs de Kubernetes com vários nós ficam fora: para isso
seria preciso microVM, que exige virtualização aninhada, algo que a Hostinger não
oferece.
