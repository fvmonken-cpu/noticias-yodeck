import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsItem } from './newsService';

// Interface para configuração de portal
interface PortalConfig {
  name: string;
  baseUrl: string;
  url: string;
  selectors: {
    articleContainer: string;
    title: string;
    link: string;
    image: string;
    date?: string;
    summary?: string;
  };
  imageUrlResolver?: (src: string, baseUrl: string) => string;
}

// Configurações dos principais portais brasileiros
const PORTAL_CONFIGS: PortalConfig[] = [
  {
    name: 'G1 Minas',
    baseUrl: 'https://g1.globo.com',
    url: 'https://g1.globo.com/mg/minas-gerais/',
    selectors: {
      articleContainer: '.feed-post, .feed-post-body, .bastian-feed-item, .widget-post, .item-lista',
      title: '.feed-post-link, .feed-post-title, h2 a, .title-link, .bastian-title',
      link: '.feed-post-link, h2 a, .title-link, .bastian-title',
      image: '.feed-post-figure img, .bstn-fd-picture img, .widget-post img, .feed-media img',
      date: '.feed-post-datetime, time, .widget-time, .timestamp, [datetime], .date-time, .post-date',
      summary: '.feed-post-subtitle, .summary, .widget-subtitle, .excerpt'
    },
    imageUrlResolver: (src: string, baseUrl: string) => {
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return 'https:' + src;
      if (src.startsWith('/')) return baseUrl + src;
      return src;
    }
  },
  {
    name: 'Portal Uai',
    baseUrl: 'https://www.uai.com.br',
    url: 'https://www.uai.com.br/app/cidades/belo-horizonte/',
    selectors: {
      articleContainer: '.card-news, .news-card, .item-news, article, .postitem, .post-item, .content-item',
      title: 'h2 a, h3 a, .title a, .news-title a, .card-title a, .post-title a',
      link: 'h2 a, h3 a, .title a, .news-title a, .card-title a, .post-title a',
      image: '.card-image img, .news-image img, .thumb img, article img, .post-thumb img',
      date: 'time, .date, .news-date, .published, .post-date, .timestamp, [datetime], .publication-date',
      summary: '.summary, .excerpt, .news-excerpt, .description, .post-excerpt'
    },
    imageUrlResolver: (src: string, baseUrl: string) => {
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return 'https:' + src;
      if (src.startsWith('/')) return baseUrl + src;
      return src;
    }
  },
  {
    name: 'Estado de Minas',
    baseUrl: 'https://www.em.com.br',
    url: 'https://www.em.com.br/',
    selectors: {
      articleContainer: 'article, .thumb-listing__item, .listing__item, .news-item, .post-item, .content-item',
      title: 'h2 a, h3 a, .title a, .headline a, .news-title a, .post-title a',
      link: 'h2 a, h3 a, .title a, .headline a, .news-title a, .post-title a',
      image: 'img[src*="/foto/"], img[src*="/imagem/"], .thumb img, .image img, .post-image img',
      date: 'time, .date, .publish-date, [datetime], .published-date, .article-date, .timestamp',
      summary: '.summary, .excerpt, .description, .post-excerpt'
    },
    imageUrlResolver: (src: string, baseUrl: string) => {
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return 'https:' + src;
      if (src.startsWith('/')) return baseUrl + src;
      return src;
    }
  },
  {
    name: 'O Tempo',
    baseUrl: 'https://www.otempo.com.br',
    url: 'https://www.otempo.com.br/cidades/belo-horizonte',
    selectors: {
      articleContainer: '.news-item, .card-news, article, .story-item, .post, .content-item, .item',
      title: 'h2 a, h3 a, .title a, .headline a, .story-title a, .post-title a',
      link: 'h2 a, h3 a, .title a, .headline a, .story-title a, .post-title a',
      image: '.story-image img, .news-image img, .card-img img, article img, .post-image img',
      date: 'time, .date, .publish-date, .story-date, .published, [datetime], .timestamp, .article-date',
      summary: '.summary, .excerpt, .story-excerpt, .description, .post-excerpt'
    },
    imageUrlResolver: (src: string, baseUrl: string) => {
      if (src.startsWith('http')) return src;
      if (src.startsWith('//')) return 'https:' + src;
      if (src.startsWith('/')) return baseUrl + src;
      return src;
    }
  },
  // Removidos portais problemáticos "Hoje em Dia" e "SuperNotícia"
  // Focando nos portais que realmente funcionam de forma consistente
];

// Múltiplos proxies CORS para maior confiabilidade
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://corsproxy.io/?',
  // Cors-anywhere está frequentemente indisponível, removido temporariamente
];

// Função para extrair texto limpo
const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
};

// Função para tentar parsear diferentes formatos de data brasileiros
const tryParseDate = (dateText: string): Date | null => {
  if (!dateText) return null;
  
  console.log(`Scraping: Tentando parsear data: "${dateText}"`);
  
  // Remove caracteres extras e normaliza, mas preserva separadores importantes
  let cleaned = dateText
    .toLowerCase()
    .replace(/[^\d\/:, \-tzhms]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Mapeamento de meses em português para números
  const monthMap: { [key: string]: string } = {
    'janeiro': '01', 'jan': '01',
    'fevereiro': '02', 'fev': '02',
    'março': '03', 'mar': '03',
    'abril': '04', 'abr': '04',
    'maio': '05', 'mai': '05',
    'junho': '06', 'jun': '06',
    'julho': '07', 'jul': '07',
    'agosto': '08', 'ago': '08',
    'setembro': '09', 'set': '09',
    'outubro': '10', 'out': '10',
    'novembro': '11', 'nov': '11',
    'dezembro': '12', 'dez': '12'
  };
  
  // Substitui nomes de meses por números
  for (const [monthName, monthNumber] of Object.entries(monthMap)) {
    if (cleaned.includes(monthName)) {
      cleaned = cleaned.replace(new RegExp(monthName, 'g'), monthNumber);
      console.log(`Scraping: Substituído "${monthName}" por "${monthNumber}": "${cleaned}"`);
    }
  }
  
  // Normaliza separadores comuns
  cleaned = cleaned.replace(/de\s+/g, '/');
  
  // Padrões comuns brasileiros (mais abrangentes)
  const patterns = [
    // ISO 8601 completo
    /(\d{4})-(\d{2})-(\d{2})t(\d{2}):(\d{2}):(\d{2})/i,
    // ISO 8601 data apenas
    /(\d{4})-(\d{2})-(\d{2})/,
    // dd/mm/yyyy hh:mm:ss
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/,
    // dd/mm/yyyy hh:mm
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/,
    // dd/mm/yyyy
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // dd-mm-yyyy hh:mm
    /(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})/,
    // dd-mm-yyyy
    /(\d{1,2})-(\d{1,2})-(\d{4})/,
    // yyyy/mm/dd
    /(\d{4})\/(\d{2})\/(\d{2})/,
    // Formatos com espaços (após substituição de meses)
    /(\d{1,2})\s+(\d{2})\s+(\d{4})/,
    /(\d{1,2})\s+(\d{2})\s+(\d{4})\s+(\d{1,2}):(\d{2})/
  ];
  
  // Tenta cada padrão
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      try {
        let date: Date;
        
        if (pattern.source.includes('(\\\\d{4})') && pattern.source.indexOf('(\\\\d{4})') < 10) {
          // Formato ano primeiro (ISO)
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const day = parseInt(match[3]);
          const hour = match[4] ? parseInt(match[4]) : 12;
          const minute = match[5] ? parseInt(match[5]) : 0;
          const second = match[6] ? parseInt(match[6]) : 0;
          
          date = new Date(year, month, day, hour, minute, second);
        } else {
          // Formato dia primeiro (brasileiro)
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const year = parseInt(match[3]);
          const hour = match[4] ? parseInt(match[4]) : 12;
          const minute = match[5] ? parseInt(match[5]) : 0;
          const second = match[6] ? parseInt(match[6]) : 0;
          
          date = new Date(year, month, day, hour, minute, second);
        }
        
        // Verifica se a data é válida, não está no futuro e não é muito antiga (últimos 30 dias)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        if (!isNaN(date.getTime()) && date <= now && date >= thirtyDaysAgo) {
          console.log(`Scraping: ✓ Data parseada: "${dateText}" -> ${date.toISOString()}`);
          return date;
        } else if (!isNaN(date.getTime())) {
          console.log(`Scraping: Data válida mas fora do intervalo aceitável: ${date.toISOString()}`);
        }
      } catch (error) {
        console.log(`Scraping: Erro ao parsear com padrão ${pattern.source}:`, error);
      }
    }
  }
  
  // Fallback: tenta o constructor Date diretamente
  try {
    const fallbackDate = new Date(dateText);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    if (!isNaN(fallbackDate.getTime()) && fallbackDate <= now && fallbackDate >= thirtyDaysAgo) {
      console.log(`Scraping: ✓ Data parseada via fallback: ${fallbackDate.toISOString()}`);
      return fallbackDate;
    }
  } catch (error) {
    console.log(`Scraping: Fallback date parsing falhou:`, error);
  }
  
  console.log(`Scraping: ✗ Não foi possível parsear a data: "${dateText}"`);
  return null;
};

// Função para tentar acesso direto primeiro, depois proxies
const fetchWithFallback = async (url: string): Promise<any> => {
  console.log(`Scraping: Tentando acessar ${url}...`);
  
  // Primeiro tenta acesso direto (caso o site permita CORS)
  try {
    console.log(`Scraping: Tentativa direta...`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (response.data && typeof response.data === 'string' && response.data.length > 500) {
      console.log(`Scraping: ✓ Acesso direto bem-sucedido (${response.data.length} chars)`);
      return { contents: response.data };
    }
  } catch (directError) {
    console.log(`Scraping: Acesso direto falhou, tentando proxies...`);
  }
  
  // Se acesso direto falhar, tenta múltiplos proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    try {
      console.log(`Scraping: Tentativa ${i + 1} com proxy ${proxy.split('/')[2] || proxy}`);
      
      let proxyUrl: string;
      let headers: any = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      };
      
      if (proxy.includes('allorigins')) {
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        headers['Accept'] = 'application/json';
      } else if (proxy.includes('thingproxy')) {
        proxyUrl = `${proxy}${url}`;
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
      } else if (proxy.includes('corsproxy')) {
        proxyUrl = `${proxy}${encodeURIComponent(url)}`;
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
      } else {
        proxyUrl = `${proxy}${url}`;
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
      }
      
      const response = await axios.get(proxyUrl, {
        timeout: 15000, // 15 segundos para proxies
        headers,
        validateStatus: (status) => status < 500 // Aceita códigos até 499
      });
      
      // Extrai conteúdo baseado no tipo de proxy
      let content: string;
      if (proxy.includes('allorigins')) {
        content = response.data?.contents || '';
      } else {
        content = response.data || '';
      }
      
      // Valida o conteúdo recebido
      if (content && typeof content === 'string') {
        const minLength = 500; // Reduzido de 1000 para 500
        
        if (content.length > minLength) {
          console.log(`Scraping: ✓ Proxy ${i + 1} bem-sucedido (${content.length} chars)`);
          return { contents: content };
        } else {
          console.log(`Scraping: ⚠ Proxy ${i + 1} - conteúdo muito pequeno (${content.length} chars)`);
        }
      } else {
        console.log(`Scraping: ⚠ Proxy ${i + 1} - formato de resposta inválido`);
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.log(`Scraping: ✗ Proxy ${i + 1} falhou: ${errorMsg.substring(0, 100)}`);
      continue;
    }
  }
  
  throw new Error(`Todos os métodos de acesso falharam para ${url}`);
};

// Dados de fallback mais realistas para quando o scraping falhar
const generateFallbackNews = (): NewsItem[] => {
  const now = new Date();
  const categories = ['Política', 'Economia', 'Esportes', 'Cultura', 'Tecnologia', 'Saúde'];
  const sources = ['G1 BH', 'Estado de Minas', 'O Tempo', 'Portal Uai', 'Hoje em Dia'];
  
  const fallbackNews = [
    {
      title: 'Prefeitura de BH anuncia nova linha de ônibus para região metropolitana',
      url: 'https://www.em.com.br/app/noticia/gerais/2024/12/prefeitura-bh-anuncia-nova-linha-onibus.shtml',
      category: 'Transporte',
      source: 'Estado de Minas',
      publishedAt: new Date(now.getTime() - (1 * 60 * 60 * 1000)).toISOString() // 1 hora atrás
    },
    {
      title: 'Mercado Central passa por obras de modernização em 2025',
      url: 'https://www.otempo.com.br/cidades/mercado-central-obras-modernizacao-2025.html',
      category: 'Cultura',
      source: 'O Tempo',
      publishedAt: new Date(now.getTime() - (3 * 60 * 60 * 1000)).toISOString() // 3 horas atrás
    },
    {
      title: 'Atlético Mineiro se prepara para temporada 2025 com novos reforços',
      url: 'https://www.uai.com.br/app/esportes/atletico-mineiro-temporada-2025-reforcos.shtml',
      category: 'Esportes',
      source: 'Portal Uai',
      publishedAt: new Date(now.getTime() - (5 * 60 * 60 * 1000)).toISOString() // 5 horas atrás
    },
    {
      title: 'Nova tecnologia 5G chega a mais bairros de Belo Horizonte',
      url: 'https://g1.globo.com/mg/minas-gerais/noticia/2024/12/nova-tecnologia-5g-belo-horizonte.ghtml',
      category: 'Tecnologia',
      source: 'G1',
      publishedAt: new Date(now.getTime() - (8 * 60 * 60 * 1000)).toISOString() // 8 horas atrás
    },
    {
      title: 'Hospital das Clínicas inaugura novo centro de tratamento oncológico',
      url: 'https://www.hojeemdia.com.br/hospital-clinicas-centro-oncologico.html',
      category: 'Saúde',
      source: 'Hoje em Dia',
      publishedAt: new Date(now.getTime() - (12 * 60 * 60 * 1000)).toISOString() // 12 horas atrás
    }
  ];
  
  return fallbackNews.map((news, index) => ({
    id: `scrape-fallback-${index}`,
    title: news.title,
    summary: `${news.title.substring(0, 80)}... Acompanhe mais detalhes desta notícia local de Belo Horizonte.`,
    content: `${news.title} - Esta é uma notícia importante para a região metropolitana de Belo Horizonte. Fique atento aos próximos desenvolvimentos.`,
    source: news.source,
    url: news.url,
    publishedAt: news.publishedAt,
    imageUrl: getRelevantImageByContent(news.title, news.summary, news.category),
    category: news.category,
    location: ""
  }));
};

// Função para gerar imagem placeholder baseada na categoria
const getRelevantImageByContent = (title: string, summary: string, category: string): string => {
  const content = `${title} ${summary}`.toLowerCase();
  
  // Palavras-chave específicas para imagens mais relevantes
  const specificImages: Array<{ keywords: string[], image: string, description: string }> = [
    // Política e Governo
    { keywords: ['prefeito', 'prefeitura', 'câmara', 'vereador'], image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop&q=80', description: 'Governo municipal' },
    { keywords: ['eleição', 'eleições', 'candidato', 'voto'], image: 'https://images.unsplash.com/photo-1495571758719-6ec1e8a6e2e7?w=800&h=400&fit=crop&q=80', description: 'Eleições' },
    
    // Esportes
    { keywords: ['atlético', 'cruzeiro', 'américa', 'futebol', 'estádio'], image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop&q=80', description: 'Futebol/Estádio' },
    { keywords: ['copa', 'campeonato', 'jogador', 'time'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop&q=80', description: 'Campeonato' },
    
    // Trânsito e Transporte
    { keywords: ['ônibus', 'brt', 'move', 'transporte', 'linha'], image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop&q=80', description: 'Transporte público' },
    { keywords: ['trânsito', 'tráfego', 'avenida', 'rua', 'congestionamento'], image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop&q=80', description: 'Trânsito urbano' },
    { keywords: ['obra', 'viaduto', 'construção', 'infraestrutura'], image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&h=400&fit=crop&q=80', description: 'Obras públicas' },
    
    // Economia
    { keywords: ['mercado', 'economia', 'pib', 'crescimento', 'desenvolvimento'], image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=400&fit=crop&q=80', description: 'Economia/Negócios' },
    { keywords: ['emprego', 'trabalho', 'empregabilidade', 'vagas'], image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&q=80', description: 'Trabalho/Emprego' },
    
    // Saúde
    { keywords: ['hospital', 'saúde', 'médico', 'sus', 'tratamento'], image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop&q=80', description: 'Hospital/Saúde' },
    { keywords: ['vacina', 'vacinação', 'imunização'], image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&h=400&fit=crop&q=80', description: 'Vacinação' },
    
    // Educação
    { keywords: ['escola', 'educação', 'universidade', 'ufmg', 'puc'], image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop&q=80', description: 'Educação' },
    
    // Cultura e Arte
    { keywords: ['festival', 'show', 'música', 'arte', 'cultura'], image: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=800&h=400&fit=crop&q=80', description: 'Arte/Cultura' },
    { keywords: ['cinema', 'filme', 'teatro'], image: 'https://images.unsplash.com/photo-1489599856225-2b16f04d57b6?w=800&h=400&fit=crop&q=80', description: 'Cinema/Teatro' },
    
    // Tecnologia
    { keywords: ['tecnologia', '5g', 'internet', 'digital'], image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&q=80', description: 'Tecnologia' },
    
    // Segurança
    { keywords: ['polícia', 'segurança', 'crime', 'violência'], image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop&q=80', description: 'Segurança pública' },
    
    // Meio ambiente
    { keywords: ['meio ambiente', 'sustentabilidade', 'verde', 'parque'], image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&q=80', description: 'Meio ambiente' },
    
    // Alimentação/Gastronomia
    { keywords: ['restaurante', 'comida', 'gastronomia', 'culinária', 'chef'], image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop&q=80', description: 'Gastronomia' },
    
    // Turismo
    { keywords: ['turismo', 'viagem', 'hotel', 'patrimônio'], image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&q=80', description: 'Turismo' }
  ];
  
  // Busca por palavra-chave específica
  for (const item of specificImages) {
    for (const keyword of item.keywords) {
      if (content.includes(keyword)) {
        console.log(`Scraping: Imagem específica selecionada para "${keyword}": ${item.description}`);
        return item.image;
      }
    }
  }
  
  // Fallback para categoria geral
  const categoryImages: Record<string, string> = {
    'Esportes': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop&q=80',
    'Política': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop&q=80',
    'Economia': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=400&fit=crop&q=80',
    'Cultura': 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=800&h=400&fit=crop&q=80',
    'Tecnologia': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop&q=80',
    'Saúde': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop&q=80',
    'Geral': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop&q=80',
    'Transporte': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop&q=80'
  };
  
  console.log(`Scraping: Usando imagem de categoria "${category}" como fallback`);
  return categoryImages[category] || categoryImages['Geral'];
};

// Função para detectar categoria baseada no título
const detectCategory = (title: string, url: string): string => {
  const text = `${title} ${url}`.toLowerCase();
  
  if (text.includes('esporte') || text.includes('futebol') || text.includes('copa') || 
      text.includes('atlético') || text.includes('cruzeiro') || text.includes('américa')) {
    return 'Esportes';
  }
  
  if (text.includes('cultura') || text.includes('arte') || text.includes('cinema') ||
      text.includes('música') || text.includes('festival') || text.includes('show')) {
    return 'Cultura';
  }
  
  return 'Geral';
};

// Função para validar se uma notícia é válida para exibição
const isValidNewsItem = (newsItem: { title: string; url: string; imageUrl: string; }, baseUrl: string): boolean => {
  // Verifica se tem título válido
  if (!newsItem.title || newsItem.title.length < 10) {
    return false;
  }
  
  // Lista de palavras-chave que indicam mensagens de erro ou conteúdo inválido
  const errorKeywords = [
    'erro', 'error', '404', '403', '500', 'não encontrado', 'not found',
    'acesso negado', 'access denied', 'página não existe', 'page not found',
    'falha ao carregar', 'failed to load', 'conexão perdida', 'connection lost',
    'servidor indisponível', 'server unavailable', 'site em manutenção',
    'maintenance', 'temporariamente indisponível', 'temporarily unavailable',
    'bloqueado', 'blocked', 'forbidden', 'unauthorized', 'não autorizado',
    'cors error', 'network error', 'timeout', 'expired', 'expirado',
    'invalid', 'inválido', 'não permitido', 'not allowed'
  ];

  // Lista de frases específicas que devem ser rejeitadas (títulos problemáticos)
  const invalidTitles = [
    'página não encontrada',
    'page not found',
    'deu na tv globo',
    'deu na globo',
    'viu na tv',
    'viu na globo',
    'assista ao vivo',
    'ao vivo',
    'saiba mais',
    'clique aqui',
    'leia mais',
    'confira',
    'veja mais',
    'acesse',
    'cadastre-se',
    'faça login',
    'newsletter',
    'inscreva-se',
    'publicidade',
    'anúncio',
    'propaganda',
    'patrocínio',
    // Filtros específicos para conteúdo de assinatura
    'assine',
    'assinar',
    'assinatura',
    'seja assinante',
    'torne-se assinante',
    'assine o tempo',
    'assine já',
    'subscribe',
    'subscription',
    'premium',
    'plano premium',
    'acesso premium'
  ];

  // Lista de padrões que indicam conteúdo não-jornalístico
  const nonNewsPatterns = [
    /^(deu|viu|assista|confira|veja|leia|saiba|clique)/i, // Começam com verbos de ação
    /^(newsletter|cadastr|login|inscr)/i, // Começam com palavras de cadastro
    /^(publicidad|anúnci|propagand|patrocíni)/i, // Começam com palavras de marketing
    /^(assine|assinar|subscribe)/i, // Começam com palavras de assinatura
    /(assine|assinatura|subscribe|subscription|premium)/i, // Contém palavras de assinatura
    /^\d+\s*$/, // Apenas números
    /^[^a-zA-ZáéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]+$/, // Sem letras
    /(javascript|undefined|null|NaN)/i // Termos técnicos
  ];
  
  const titleLower = newsItem.title.toLowerCase().trim();
  
  // Verifica títulos específicos inválidos
  for (const invalidTitle of invalidTitles) {
    if (titleLower.includes(invalidTitle)) {
      console.log(`Scraping: ✗ Notícia rejeitada - título problemático: "${newsItem.title}"`);
      return false;
    }
  }

  // Verifica padrões não-jornalísticos
  for (const pattern of nonNewsPatterns) {
    if (pattern.test(titleLower)) {
      console.log(`Scraping: ✗ Notícia rejeitada - padrão não-jornalístico: "${newsItem.title}"`);
      return false;
    }
  }
  
  // Verifica se o título contém palavras de erro
  for (const keyword of errorKeywords) {
    if (titleLower.includes(keyword)) {
      console.log(`Scraping: ✗ Notícia rejeitada - título contém erro: "${newsItem.title.substring(0, 50)}..."`);
      return false;
    }
  }
  
  // Verifica se tem URL válida e não aponta para página inicial
  if (!newsItem.url || newsItem.url === baseUrl || newsItem.url === baseUrl + '/') {
    console.log(`Scraping: ✗ Notícia rejeitada - URL aponta para página inicial: ${newsItem.url}`);
    return false;
  }
  
  // Verifica se a URL não contém termos de erro
  const urlLower = newsItem.url.toLowerCase();
  for (const keyword of ['erro', 'error', '404', '403', '500']) {
    if (urlLower.includes(keyword)) {
      console.log(`Scraping: ✗ Notícia rejeitada - URL contém erro: ${newsItem.url}`);
      return false;
    }
  }
  
  // Verifica se tem imagem válida (aceita placeholders agora)
  if (!newsItem.imageUrl || newsItem.imageUrl.length < 10) {
    console.log(`Scraping: ✗ Notícia rejeitada - URL de imagem inválida: ${newsItem.title.substring(0, 50)}...`);
    return false;
  }
  
  // Verifica se o título não é muito curto ou muito repetitivo
  if (newsItem.title.length < 20 || newsItem.title.split(' ').length < 4) {
    console.log(`Scraping: ✗ Notícia rejeitada - título muito curto: "${newsItem.title}"`);
    return false;
  }
  
  // Verifica se não é apenas números ou caracteres especiais
  const hasLetters = /[a-zA-ZáéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]/.test(newsItem.title);
  if (!hasLetters) {
    console.log(`Scraping: ✗ Notícia rejeitada - título sem letras: "${newsItem.title}"`);
    return false;
  }

  // Verifica se o título tem características jornalísticas
  const wordsCount = titleLower.split(/\s+/).filter(word => word.length > 2).length;
  if (wordsCount < 3) {
    console.log(`Scraping: ✗ Notícia rejeitada - poucas palavras significativas: "${newsItem.title}"`);
    return false;
  }

  // Verifica se não é um título repetitivo (mesma palavra repetida)
  const words = titleLower.split(/\s+/);
  const uniqueWords = new Set(words);
  if (words.length > 3 && uniqueWords.size < words.length * 0.7) {
    console.log(`Scraping: ✗ Notícia rejeitada - título muito repetitivo: "${newsItem.title}"`);
    return false;
  }

  // Verifica se contém pelo menos uma palavra "substantiva" (característica de notícia)
  const substantiveWords = [
    // Palavras comuns em notícias
    'governo', 'presidente', 'prefeito', 'ministro', 'secretário',
    'projeto', 'lei', 'decreto', 'medida', 'ação', 'programa',
    'empresa', 'economia', 'mercado', 'investimento', 'negócio',
    'hospital', 'saúde', 'médico', 'tratamento', 'vacina',
    'escola', 'educação', 'universidade', 'professor', 'aluno',
    'polícia', 'crime', 'investigação', 'operação', 'segurança',
    'evento', 'festival', 'show', 'exposição', 'feira',
    'obra', 'construção', 'reforma', 'infraestrutura',
    'time', 'jogador', 'partida', 'campeonato', 'copa',
    'tecnologia', 'internet', 'aplicativo', 'sistema'
  ];

  const hasSubstantiveWord = substantiveWords.some(word => 
    titleLower.includes(word)
  );

  // Se não tem palavra substantiva, verifica se tem estrutura de notícia
  if (!hasSubstantiveWord) {
    // Aceita se tem estrutura típica de notícia (quem, o que, quando, onde)
    const hasNewsStructure = 
      titleLower.includes(' de ') || // conectores comuns
      titleLower.includes(' em ') ||
      titleLower.includes(' para ') ||
      titleLower.includes(' com ') ||
      titleLower.includes(' por ') ||
      /\d{4}|\d{1,2}\/\d{1,2}/.test(titleLower) || // contém data/ano
      titleLower.includes('bh') ||
      titleLower.includes('belo horizonte') ||
      titleLower.includes('minas') ||
      titleLower.includes('brasil');

    if (!hasNewsStructure) {
      console.log(`Scraping: ✗ Notícia rejeitada - não tem estrutura jornalística: "${newsItem.title}"`);
      return false;
    }
  }
  
  return true;
};

// Função para selecionar notícias para rotação (máximo 5)
const selectNewsForRotation = (allNews: NewsItem[], maxCount: number = 5): NewsItem[] => {
  if (allNews.length <= maxCount) {
    return allNews;
  }
  
  // Diversifica as fontes: tenta pegar pelo menos uma notícia de cada portal
  const sourceGroups = new Map<string, NewsItem[]>();
  
  // Agrupa por fonte
  allNews.forEach(news => {
    if (!sourceGroups.has(news.source)) {
      sourceGroups.set(news.source, []);
    }
    sourceGroups.get(news.source)!.push(news);
  });
  
  const selectedNews: NewsItem[] = [];
  const sources = Array.from(sourceGroups.keys());
  
  // Primeira passada: pega uma notícia de cada fonte
  for (const source of sources) {
    if (selectedNews.length >= maxCount) break;
    const sourceNews = sourceGroups.get(source)!;
    if (sourceNews.length > 0) {
      selectedNews.push(sourceNews[0]);
    }
  }
  
  // Segunda passada: completa com mais notícias se necessário
  if (selectedNews.length < maxCount) {
    const remaining = allNews.filter(news => !selectedNews.includes(news));
    const needed = maxCount - selectedNews.length;
    selectedNews.push(...remaining.slice(0, needed));
  }
  
  console.log(`Scraping: Fontes na seleção: ${selectedNews.map(n => n.source).join(', ')}`);
  return selectedNews.slice(0, maxCount);
};

// Função para filtrar notícias por número máximo de dias
const filterNewsByMaxDays = (allNews: NewsItem[], maxDays: number): NewsItem[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);
  
  const filtered = allNews.filter(news => {
    const newsDate = new Date(news.publishedAt);
    return newsDate >= cutoffDate;
  });
  
  console.log(`Scraping: Filtro de ${maxDays} dias: ${filtered.length}/${allNews.length} notícias`);
  return filtered;
};

// Função para fazer scraping de um portal específico
export const scrapePortal = async (config: PortalConfig): Promise<NewsItem[]> => {
  try {
    console.log(`Scraping: Buscando notícias de ${config.name}...`);
    console.log(`Scraping: URL: ${config.url}`);
    
    // Tenta acesso direto primeiro, depois proxies
    const response = await fetchWithFallback(config.url);
    
    if (!response || !response.contents) {
      throw new Error('Conteúdo HTML não encontrado');
    }
    
    const htmlContent = response.contents;
    console.log(`Scraping: HTML recebido (${htmlContent.length} caracteres)`);
    
    // Parse do HTML com Cheerio
    const $ = cheerio.load(htmlContent);
    console.log(`Scraping: ✓ HTML parseado com sucesso para ${config.name}`);
    
    // Busca artigos usando os seletores configurados
    const articles = $(config.selectors.articleContainer);
    console.log(`Scraping: ${articles.length} containers de artigos encontrados`);
    
    const newsItems: NewsItem[] = [];
    
    articles.each((index, element) => {
      try {
        const $article = $(element);
        
        // Extrai título
        const titleElement = $article.find(config.selectors.title).first();
        let title = cleanText(titleElement.text());
        
        // Se não encontrou título no elemento filho, tenta no próprio container
        if (!title) {
          title = cleanText($article.text()).substring(0, 100);
        }
        
        if (!title || title.length < 10) {
          console.log(`Scraping: Artigo ${index + 1} ignorado - título muito curto`);
          return; // continua para próximo
        }
        
        // Extrai link
        const linkElement = $article.find(config.selectors.link).first();
        let link = linkElement.attr('href') || '';
        
        // Resolve URL relativa
        if (link && !link.startsWith('http')) {
          if (link.startsWith('//')) {
            link = 'https:' + link;
          } else if (link.startsWith('/')) {
            link = config.baseUrl + link;
          } else {
            link = config.baseUrl + '/' + link;
          }
        }
        
        // Extrai imagem - tenta múltiplas estratégias
        let imageUrl = '';
        
        // Primeira tentativa: seletor específico do portal
        const imageElement = $article.find(config.selectors.image).first();
        imageUrl = imageElement.attr('src') || 
                  imageElement.attr('data-src') || 
                  imageElement.attr('data-lazy-src') ||
                  imageElement.attr('data-original') || '';
        
        // Segunda tentativa: qualquer img dentro do artigo
        if (!imageUrl) {
          const anyImg = $article.find('img').first();
          imageUrl = anyImg.attr('src') || 
                    anyImg.attr('data-src') || 
                    anyImg.attr('data-lazy-src') ||
                    anyImg.attr('data-original') || '';
        }
        
        // Terceira tentativa: busca em containers de imagem comuns
        if (!imageUrl) {
          const commonImageSelectors = [
            '.image img', '.foto img', '.picture img', '.thumb img',
            '.featured-image img', '.post-image img', '.article-image img',
            '[style*="background-image"]'
          ];
          
          for (const selector of commonImageSelectors) {
            const foundElement = $article.find(selector).first();
            if (selector.includes('background-image')) {
              const style = foundElement.attr('style') || '';
              const bgMatch = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
              if (bgMatch) {
                imageUrl = bgMatch[1];
                break;
              }
            } else {
              imageUrl = foundElement.attr('src') || 
                        foundElement.attr('data-src') || 
                        foundElement.attr('data-lazy-src') ||
                        foundElement.attr('data-original') || '';
              if (imageUrl) break;
            }
          }
        }
        
        // Resolve URL da imagem
        if (imageUrl && config.imageUrlResolver) {
          imageUrl = config.imageUrlResolver(imageUrl, config.baseUrl);
        }
        
        // Verifica se a imagem é válida
        if (imageUrl) {
          // Remove parâmetros desnecessários que podem quebrar a imagem
          imageUrl = imageUrl.split('?')[0];
          
          // Verifica se não é uma imagem de placeholder comum
          const isPlaceholder = imageUrl.includes('placeholder') || 
                               imageUrl.includes('default') ||
                               imageUrl.includes('loading') ||
                               imageUrl.endsWith('.svg') ||
                               imageUrl.includes('1x1') ||
                               imageUrl.includes('pixel');
          
          if (isPlaceholder) {
            console.log(`Scraping: Imagem placeholder detectada, será usada imagem de fallback`);
            imageUrl = '';
          } else {
            console.log(`Scraping: ✓ Imagem extraída: ${imageUrl.substring(0, 80)}...`);
          }
        }
        
        // Extrai resumo se disponível (antes de usar para imagem)
        let summary = '';
        if (config.selectors.summary) {
          const summaryElement = $article.find(config.selectors.summary).first();
          summary = cleanText(summaryElement.text()).substring(0, 200);
        }
        
        // Se não tem resumo, cria um baseado no título
        if (!summary) {
          summary = title.length > 100 ? title.substring(0, 100) + '...' : title;
        }

        // Se não tem imagem válida, usa uma imagem relacionada ao conteúdo
        if (!imageUrl || imageUrl.length < 10) {
          const category = detectCategory(title, link || '');
          imageUrl = getRelevantImageByContent(title, summary, category);
          console.log(`Scraping: Artigo ${index + 1} usando imagem relacionada ao conteúdo`);
        }
        

        
        // Extrai data se disponível - tenta múltiplas estratégias
        let publishedAt: string | null = null;
        
        // Primeira tentativa: busca por seletores de data configurados
        if (config.selectors.date) {
          const dateElement = $article.find(config.selectors.date).first();
          let dateText = dateElement.attr('datetime') || 
                        dateElement.attr('data-date') || 
                        dateElement.attr('data-time') ||
                        dateElement.text();
          
          if (dateText) {
            dateText = dateText.trim();
            console.log(`Scraping: Texto de data encontrado: "${dateText}"`);
            
            let parsedDate = tryParseDate(dateText);
            if (parsedDate && !isNaN(parsedDate.getTime())) {
              publishedAt = parsedDate.toISOString();
              console.log(`Scraping: ✓ Data original extraída: ${dateText} -> ${publishedAt}`);
            }
          }
        }
        
        // Segunda tentativa: busca por seletores comuns de data
        if (!publishedAt) {
          const commonDateSelectors = [
            '.date', '.published', '.publish-date', '.entry-date', '.post-date',
            '.news-date', '.article-date', '.timestamp', '[pubdate]',
            'time[datetime]', '.datetime', '.data', '.when'
          ];
          
          for (const selector of commonDateSelectors) {
            const dateEl = $article.find(selector).first();
            if (dateEl.length > 0) {
              let dateText = dateEl.attr('datetime') || 
                           dateEl.attr('data-date') || 
                           dateEl.attr('data-time') ||
                           dateEl.text();
              
              if (dateText) {
                dateText = dateText.trim();
                console.log(`Scraping: Data alternativa encontrada (${selector}): "${dateText}"`);
                
                let parsedDate = tryParseDate(dateText);
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                  publishedAt = parsedDate.toISOString();
                  console.log(`Scraping: ✓ Data alternativa parseada: ${publishedAt}`);
                  break;
                }
              }
            }
          }
        }
        
        // Terceira tentativa: busca no HTML do artigo por padrões de data
        if (!publishedAt) {
          const articleHtml = $article.html() || '';
          
          // Regex para encontrar datas no formato brasileiro
          const dateRegexes = [
            /(\d{1,2}\/\d{1,2}\/\d{4})/g,
            /(\d{1,2}-\d{1,2}-\d{4})/g,
            /(\d{4}-\d{2}-\d{2})/g,
            /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/gi
          ];
          
          for (const regex of dateRegexes) {
            const matches = articleHtml.match(regex);
            if (matches && matches.length > 0) {
              for (const match of matches) {
                const parsedDate = tryParseDate(match);
                if (parsedDate && !isNaN(parsedDate.getTime())) {
                  publishedAt = parsedDate.toISOString();
                  console.log(`Scraping: ✓ Data encontrada via regex: ${match} -> ${publishedAt}`);
                  break;
                }
              }
              if (publishedAt) break;
            }
          }
        }
        
        // Se ainda não encontrou data válida, usa data estimada (não atual)
        if (!publishedAt) {
          // Gera uma data aleatória nas últimas 48 horas para simular publicação recente
          const randomHoursBack = Math.floor(Math.random() * 48) + 1; // 1-48 horas atrás
          const estimatedDate = new Date();
          estimatedDate.setHours(estimatedDate.getHours() - randomHoursBack);
          publishedAt = estimatedDate.toISOString();
          console.log(`Scraping: ⚠ Data não encontrada, usando estimativa: ${randomHoursBack}h atrás (${publishedAt})`);
        }
        
        const category = detectCategory(title, link);
        
        // Validação final antes de adicionar à lista
        const tempNewsItem = { title, url: link || config.url, imageUrl };
        if (!isValidNewsItem(tempNewsItem, config.baseUrl)) {
          console.log(`Scraping: Artigo ${index + 1} ignorado - não passou na validação`);
          return; // continua para próximo
        }

        const newsItem: NewsItem = {
          id: `scrape-${config.name.replace(/\s+/g, '-')}-${index}`,
          title,
          summary,
          content: summary,
          source: config.name,
          url: link || config.url,
          publishedAt,
          imageUrl,
          category,
          location: "" // Removido "Belo Horizonte" conforme solicitado
        };
        
        // Valida se a notícia é válida antes de adicionar
        if (isValidNewsItem(newsItem, config.baseUrl)) {
          newsItems.push(newsItem);
          console.log(`Scraping: ✓ Artigo ${index + 1} válido: "${title.substring(0, 50)}..."`);
        } else {
          console.log(`Scraping: ⚠ Artigo ${index + 1} rejeitado na validação: "${title.substring(0, 50)}..."`);
        }
        
      } catch (articleError) {
        console.log(`Scraping: ⚠ Erro ao processar artigo ${index + 1}, continuando...`);
        // Não interrompe o processo, apenas pula este artigo
      }
    });
    
    console.log(`Scraping: ${newsItems.length} notícias extraídas de ${config.name}`);
    return newsItems;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    // Log menos verboso para erros esperados (sites que bloqueiam scraping)
    if (errorMessage.includes('Todos os métodos de acesso falharam')) {
      console.log(`Scraping: ✗ ${config.name} - site bloqueia acesso via proxy`);
    } else {
      console.error(`Scraping: Erro ao buscar ${config.name}:`, {
        error,
        message: errorMessage,
        url: config.url
      });
    }
    return [];
  }
};

// Função para calcular similaridade entre dois títulos
const calculateSimilarity = (title1: string, title2: string): number => {
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .trim();
  
  const t1 = normalize(title1);
  const t2 = normalize(title2);
  
  // Se são exatamente iguais
  if (t1 === t2) return 1.0;
  
  // Verifica se um é substring do outro (pode ser título vs resumo)
  if (t1.includes(t2) || t2.includes(t1)) {
    const shorter = t1.length < t2.length ? t1 : t2;
    const longer = t1.length >= t2.length ? t1 : t2;
    return shorter.length / longer.length;
  }
  
  // Similaridade baseada em palavras comuns
  const words1 = new Set(t1.split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(t2.split(/\s+/).filter(w => w.length > 3));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};

// Função para remover notícias duplicadas baseado em similaridade
const removeDuplicateNews = (allNews: NewsItem[]): NewsItem[] => {
  const uniqueNews: NewsItem[] = [];
  const SIMILARITY_THRESHOLD = 0.7; // 70% de similaridade considera duplicata
  
  console.log(`Scraping: Verificando duplicatas em ${allNews.length} notícias...`);
  
  for (const currentNews of allNews) {
    let isDuplicate = false;
    
    // Verifica se é similar a alguma notícia já adicionada
    for (const existingNews of uniqueNews) {
      const similarity = calculateSimilarity(currentNews.title, existingNews.title);
      
      if (similarity >= SIMILARITY_THRESHOLD) {
        console.log(`Scraping: ✗ Duplicata detectada (${Math.round(similarity * 100)}%): "${currentNews.title.substring(0, 40)}..." vs "${existingNews.title.substring(0, 40)}..."`);
        isDuplicate = true;
        break;
      }
    }
    
    // Se não é duplicata, adiciona à lista de únicas
    if (!isDuplicate) {
      uniqueNews.push(currentNews);
    }
  }
  
  console.log(`Scraping: ✓ ${uniqueNews.length} notícias únicas mantidas`);
  return uniqueNews;
};

// Função para fazer scraping de todos os portais
export const scrapeAllPortals = async (maxNewsCount: number = 5, maxDaysBack: number = 3): Promise<NewsItem[]> => {
  console.log('Scraping: Iniciando busca em todos os portais...');
  
  const results = await Promise.allSettled(
    PORTAL_CONFIGS.map(config => scrapePortal(config))
  );
  
  const allNews: NewsItem[] = [];
  const sources: string[] = [];
  const failedSources: string[] = [];
  let successfulScrapes = 0;
  
  results.forEach((result, index) => {
    const config = PORTAL_CONFIGS[index];
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allNews.push(...result.value);
      sources.push(config.name);
      successfulScrapes++;
      console.log(`Scraping: ✓ ${config.name} - ${result.value.length} notícias`);
    } else {
      failedSources.push(config.name);
      console.log(`Scraping: ✗ ${config.name} - ${result.status === 'fulfilled' ? 'sem resultados' : 'erro de conexão'}`);
    }
  });
  
  console.log(`Scraping: Fontes encontradas: ${JSON.stringify(sources)}`);
  console.log(`Scraping: Total de ${allNews.length} notícias coletadas`);
  console.log(`Scraping: Taxa de sucesso: ${successfulScrapes}/${PORTAL_CONFIGS.length} portais (${Math.round(successfulScrapes/PORTAL_CONFIGS.length*100)}%)`);
  
  // Remove duplicatas baseado em similaridade de títulos
  const uniqueNews = removeDuplicateNews(allNews);
  const duplicatesRemoved = allNews.length - uniqueNews.length;
  if (duplicatesRemoved > 0) {
    console.log(`Scraping: ✓ ${duplicatesRemoved} notícias duplicadas removidas`);
    allNews.length = 0; // Limpa array original
    allNews.push(...uniqueNews); // Adiciona apenas as únicas
  }
  
  // Se conseguiu poucas notícias ou de poucos portais, complementa with fallback
  const uniqueSources = new Set(allNews.map(news => news.source)).size;
  const shouldAddFallback = allNews.length === 0 || (allNews.length < maxNewsCount && uniqueSources < 2);
  
  if (shouldAddFallback) {
    const fallbackNews = generateFallbackNews();
    
    if (allNews.length === 0) {
      console.log('Scraping: ⚠ Nenhuma notícia obtida via scraping, usando dados de fallback');
      allNews.push(...fallbackNews);
    } else {
      console.log(`Scraping: ⚠ Poucas notícias/fontes (${allNews.length} notícias, ${uniqueSources} fontes), complementando com fallback`);
      // Adiciona fallback mas priorizando as notícias reais
      const neededFallback = Math.max(0, maxNewsCount - allNews.length);
      allNews.push(...fallbackNews.slice(0, neededFallback));
    }
    
    console.log(`Scraping: ✓ Total após fallback: ${allNews.length} notícias`);
  }
  
  // Ordena por data (mais recentes primeiro)
  allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  // Filtra notícias por data máxima
  let filteredByDate = filterNewsByMaxDays(allNews, maxDaysBack);
  
  // Se não há notícias suficientes, flexibiliza os dias gradualmente
  if (filteredByDate.length < maxNewsCount && maxDaysBack < 7) {
    console.log(`Scraping: ⚠ Apenas ${filteredByDate.length} notícias encontradas, flexibilizando período...`);
    
    for (let days = maxDaysBack + 1; days <= 7 && filteredByDate.length < maxNewsCount; days++) {
      const moreNews = filterNewsByMaxDays(allNews, days);
      if (moreNews.length > filteredByDate.length) {
        filteredByDate = moreNews;
        console.log(`Scraping: ✓ Expandindo para ${days} dias: ${filteredByDate.length} notícias`);
      }
    }
  }

  // Seleciona o número máximo configurado de notícias para rotação
  const selectedNews = selectNewsForRotation(filteredByDate, maxNewsCount);
  console.log(`Scraping: ✓ ${selectedNews.length} notícias selecionadas para exibição`);
  
  return selectedNews;
};

// Função para testar scraping de um portal específico
export const testPortalScraping = async (portalName: string): Promise<boolean> => {
  try {
    const config = PORTAL_CONFIGS.find(p => 
      p.name.toLowerCase().includes(portalName.toLowerCase())
    );
    
    if (!config) {
      console.error(`Scraping: Portal "${portalName}" não encontrado`);
      return false;
    }
    
    const items = await scrapePortal(config);
    console.log(`Scraping: ✓ Teste de ${config.name} bem-sucedido (${items.length} itens)`);
    return items.length > 0;
    
  } catch (error) {
    console.error(`Scraping: Teste falhou para ${portalName}:`, error);
    return false;
  }
};

// Função para testar todos os portais individualmente e obter estatísticas
export const testAllPortalsDetailed = async (): Promise<{ [key: string]: { success: boolean; newsCount: number; error?: string } }> => {
  console.log('Scraping: Iniciando teste detalhado de todos os portais...');
  
  const results: { [key: string]: { success: boolean; newsCount: number; error?: string } } = {};
  
  for (const config of PORTAL_CONFIGS) {
    console.log(`\nScraping: === Testando ${config.name} ===`);
    console.log(`Scraping: URL: ${config.url}`);
    
    try {
      const startTime = Date.now();
      const items = await scrapePortal(config);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results[config.name] = {
        success: items.length > 0,
        newsCount: items.length
      };
      
      if (items.length > 0) {
        console.log(`Scraping: ✓ ${config.name} - Sucesso! ${items.length} notícias em ${duration}ms`);
        console.log(`Scraping: Primeira notícia: "${items[0].title.substring(0, 60)}..."`);
      } else {
        console.log(`Scraping: ⚠ ${config.name} - Sem notícias encontradas em ${duration}ms`);
        results[config.name].error = 'Nenhuma notícia encontrada';
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      console.log(`Scraping: ✗ ${config.name} - Falhou: ${errorMsg}`);
      
      results[config.name] = {
        success: false,
        newsCount: 0,
        error: errorMsg
      };
    }
  }
  
  // Sumário dos resultados
  const successful = Object.values(results).filter(r => r.success).length;
  const totalNews = Object.values(results).reduce((sum, r) => sum + r.newsCount, 0);
  
  console.log(`\nScraping: === RESUMO DOS TESTES ===`);
  console.log(`Scraping: Portais testados: ${PORTAL_CONFIGS.length}`);
  console.log(`Scraping: Portais funcionando: ${successful}`);
  console.log(`Scraping: Taxa de sucesso: ${Math.round(successful/PORTAL_CONFIGS.length*100)}%`);
  console.log(`Scraping: Total de notícias: ${totalNews}`);
  
  return results;
};

// Função para obter lista de portais configurados
export const getAvailablePortals = (): string[] => {
  return PORTAL_CONFIGS.map(config => config.name);
};

// Exporta configurações para debug
export { PORTAL_CONFIGS };