# Ambiente do lab de Linux. Debian de propósito, não Alpine: a trilha ensina as
# flags do GNU coreutils, e o busybox do Alpine aceita um conjunto diferente, o
# que faria o aluno decorar comando que não funciona num servidor de verdade.
FROM debian:12-slim

# Ferramentas que as aulas usam. strace atende o módulo de syscalls; procps,
# psmisc e lsof atendem o de processos e sinais.
RUN apt-get update && apt-get install -y --no-install-recommends \
    sudo bash coreutils findutils grep sed gawk diffutils \
    less nano vim procps psmisc lsof file tree strace \
    ca-certificates bash-completion \
    && rm -rf /var/lib/apt/lists/*

# O aluno não é root: o módulo de permissões precisa de alguém que apanhe do
# "Permission denied" antes de resolver com sudo. O sudo é sem senha porque não
# existe senha para ele saber, e a caixa é descartável de qualquer jeito.
RUN useradd -m -s /bin/bash aluno \
    && echo 'aluno ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/aluno \
    && chmod 0440 /etc/sudoers.d/aluno

# Um cenário mínimo para as aulas de navegação, busca e permissões terem o que
# explorar já no primeiro comando.
RUN mkdir -p /home/aluno/projeto/logs /home/aluno/projeto/config \
    && printf 'erro: falha ao conectar\naviso: cache cheio\nerro: timeout\n' > /home/aluno/projeto/logs/app.log \
    && printf 'porta=8080\ndebug=false\n' > /home/aluno/projeto/config/app.conf \
    && printf 'Bem-vindo ao laboratorio.\n' > /home/aluno/leia-me.txt \
    && chown -R aluno:aluno /home/aluno

USER aluno
WORKDIR /home/aluno
ENV TERM=xterm-256color LANG=C.UTF-8
CMD ["/bin/bash", "-l"]
