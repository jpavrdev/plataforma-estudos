import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { metaDaRota, SITE, type MetaPagina } from '../data/seo';

function definirMeta(chave: string, atributo: 'name' | 'property', conteudo: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${chave}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(atributo, chave);
    document.head.appendChild(el);
  }
  el.setAttribute('content', conteudo);
}

function definirCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

/**
 * Mantém título, descrição, canonical e robots em dia com a rota atual. É
 * chamado uma vez no topo do app; uma página pode chamar de novo passando um
 * título próprio quando os dados chegarem (o nome da trilha, por exemplo).
 *
 * Vale a ressalva: isso roda no navegador. O Google executa JavaScript e
 * enxerga o resultado, mas os robôs de link (WhatsApp, LinkedIn, Discord) não
 * executam, então para eles continua valendo só o que está no index.html.
 */
export function useSeo(override?: Partial<MetaPagina>) {
  const { pathname } = useLocation();
  const tituloEscolhido = override?.titulo;
  const descricaoEscolhida = override?.descricao;

  useEffect(() => {
    const base = metaDaRota(pathname);
    const titulo = tituloEscolhido ?? base.titulo;
    const descricao = descricaoEscolhida ?? base.descricao ?? SITE.descricao;
    const indexar = base.indexar ?? true;
    const url = SITE.url + (pathname === '/' ? '/' : pathname);

    document.title = titulo;
    definirMeta('description', 'name', descricao);
    definirMeta('robots', 'name', indexar ? 'index, follow' : 'noindex, follow');
    definirMeta('og:title', 'property', titulo);
    definirMeta('og:description', 'property', descricao);
    definirMeta('og:url', 'property', url);
    definirMeta('twitter:title', 'name', titulo);
    definirMeta('twitter:description', 'name', descricao);
    definirCanonical(url);
  }, [pathname, tituloEscolhido, descricaoEscolhida]);
}
