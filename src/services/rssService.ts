import { XMLParser } from 'fast-xml-parser';
import { NewsItem } from './newsService';

// Interface para item do RSS
interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  creator?: string;
  categories?: string[];
  isoDate?: string;
  description?: string;
  'content:encoded'?: string;
}

// Interface para feed RSS
interface RSSFeed {
  title?: string;
  description?: string;
  link?: string;
  items: RSSItem[];
}

// Configuração dos feeds RSS dos principais portais de BH
const RSS_FEEDS = [
  {
    url: 'https://feeds.feedburner.com/oreilly/radar/pt',
    source: 'O\'Reilly Radar',
    baseUrl: 'https://www.oreilly.com'
  },
  {
    url: 'https://rss.cnn.com/rss/edition.rss',
    source: 'CNN Internacional',
    baseUrl: 'https://edition.cnn.com'
  },
  {
    url: 'https://feeds.reuters.com/reuters/topNews',
    source: 'Reuters Top News',
    baseUrl: 'https://reuters.com'
  },
  {
    url: 'https://hnrss.org/frontpage',
    source: 'Hacker News',
    baseUrl: 'https://news.ycombinator.com'
  }
];

// Proxy CORS alternativo (AllOrigins é mais confiável)
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

// Parser XML configurado para RSS
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: 'text',
  parseAttributeValue: true,
  trimValues: true
});

// Função para extrair itens do XML RSS
const extractRSSItems = (xmlData: any): RSSItem[] => {
  try {
    console.log('RSS: Iniciando extração de itens...');
    let items: any[] = [];
    
    // Debug: mostra a estrutura do XML
    console.log('RSS: Estrutura XML recebida:', Object.keys(xmlData || {}));
    
    // RSS 2.0 format
    if (xmlData.rss?.channel?.item) {
      console.log('RSS: Detectado formato RSS 2.0');
      items = Array.isArray(xmlData.rss.channel.item) 
        ? xmlData.rss.channel.item 
        : [xmlData.rss.channel.item];
      console.log(`RSS: ${items.length} itens encontrados no RSS 2.0`);
    } 
    // Atom feed format
    else if (xmlData.feed?.entry) {
      console.log('RSS: Detectado formato Atom');
      items = Array.isArray(xmlData.feed.entry) 
        ? xmlData.feed.entry 
        : [xmlData.feed.entry];
      console.log(`RSS: ${items.length} itens encontrados no Atom`);
    }
    // RDF format
    else if (xmlData['rdf:RDF']?.item) {
      console.log('RSS: Detectado formato RDF');
      items = Array.isArray(xmlData['rdf:RDF'].item) 
        ? xmlData['rdf:RDF'].item 
        : [xmlData['rdf:RDF'].item];
      console.log(`RSS: ${items.length} itens encontrados no RDF`);
    }
    // Tenta buscar em qualquer estrutura que contenha 'item' ou 'entry'
    else {
      console.log('RSS: Formato não reconhecido, tentando busca genérica...');
      const searchForItems = (obj: any, path: string = ''): any[] => {
        if (!obj || typeof obj !== 'object') return [];
        
        let found: any[] = [];
        
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if ((key === 'item' || key === 'entry') && value) {
            console.log(`RSS: Encontrados itens em ${currentPath}`);
            found = found.concat(Array.isArray(value) ? value : [value]);
          } else if (typeof value === 'object') {
            found = found.concat(searchForItems(value, currentPath));
          }
        }
        
        return found;
      };
      
      items = searchForItems(xmlData);
      console.log(`RSS: ${items.length} itens encontrados via busca genérica`);
    }

    if (items.length === 0) {
      console.warn('RSS: Nenhum item encontrado, estrutura XML:', JSON.stringify(xmlData, null, 2).substring(0, 500));
      return [];
    }

    // Processa os itens encontrados
    const processedItems = items.map((item, index) => {
      console.log(`RSS: Processando item ${index + 1}/${items.length}`);
      
      // Extrai dados com múltiplas tentativas para cada campo
      const title = extractField(item, ['title', 'title.text', 'title._text', '@_title']);
      const link = extractField(item, ['link', 'link.text', 'link.@_href', 'link._text', 'guid', 'id']);
      const pubDate = extractField(item, ['pubDate', 'pubDate.text', 'published', 'published.text', 'date', 'dc:date']);
      const description = extractField(item, ['description', 'description.text', 'summary', 'summary.text', 'content', 'content.text']);
      const content = extractField(item, ['content:encoded', 'content:encoded.text', 'content', 'content.text', 'description', 'description.text']);
      const creator = extractField(item, ['dc:creator', 'dc:creator.text', 'author', 'author.name', 'author.name.text']);
      
      // Extrai categorias
      let categories: string[] = [];
      if (item.category) {
        categories = Array.isArray(item.category) 
          ? item.category.map((cat: any) => extractField(cat, ['text', '_text', '@_term']) || cat.toString())
          : [extractField(item.category, ['text', '_text', '@_term']) || item.category.toString()];
      }
      
      const processedItem = {
        title: title || 'Título não disponível',
        link: link || '',
        pubDate: pubDate || new Date().toISOString(),
        description: description || '',
        content: content || description || '',
        creator: creator || '',
        categories: categories.filter(Boolean)
      };
      
      console.log(`RSS: Item processado:`, { title: processedItem.title, link: processedItem.link });
      return processedItem;
    });

    console.log(`RSS: ${processedItems.length} itens processados com sucesso`);
    return processedItems;
    
  } catch (error) {
    console.error('RSS: Erro ao extrair itens:', error);
    return [];
  }
};

// Função auxiliar para extrair campos com múltiplas tentativas
const extractField = (obj: any, paths: string[]): string => {
  for (const path of paths) {
    try {
      const value = path.split('.').reduce((current, key) => current?.[key], obj);
      if (value && typeof value === 'string' && value.trim()) {
        return value.trim();
      }
      if (value && typeof value === 'object' && value.text) {
        return value.text.trim();
      }
    } catch (e) {
      // Continue tentando outros caminhos
    }
  }
  return '';
};

// Função para detectar categoria baseada no título e conteúdo
const detectCategory = (title: string, content: string, categories?: string[]): string => {
  const text = `${title} ${content}`.toLowerCase();
  
  // Palavras-chave por categoria
  const categoryKeywords = {
    'Transporte': ['metrô', 'metro', 'ônibus', 'trânsito', 'transporte', 'via', 'estrada', 'ciclovia', 'brt'],
    'Esportes': ['atlético', 'cruzeiro', 'futebol', 'esporte', 'jogo', 'campeonato', 'time', 'gol'],
    'Política': ['prefeito', 'vereador', 'eleição', 'político', 'prefeitura', 'governo', 'câmara'],
    'Economia': ['economia', 'empresa', 'negócio', 'investimento', 'mercado', 'emprego', 'renda'],
    'Cultura': ['cultura', 'festival', 'arte', 'música', 'teatro', 'cinema', 'show', 'evento'],
    'Saúde': ['saúde', 'hospital', 'médico', 'sus', 'vacina', 'doença', 'tratamento'],
    'Tecnologia': ['tecnologia', 'startup', 'inovação', 'digital', 'internet', 'app'],
    'Meio Ambiente': ['meio ambiente', 'parque', 'verde', 'sustentável', 'ecologia', 'natureza']
  };
  
  // Verifica categorias do RSS primeiro
  if (categories && categories.length > 0) {
    for (const category of categories) {
      const cat = category.toLowerCase();
      if (cat.includes('esporte')) return 'Esportes';
      if (cat.includes('política')) return 'Política';
      if (cat.includes('economia')) return 'Economia';
      if (cat.includes('cultura')) return 'Cultura';
      if (cat.includes('saúde')) return 'Saúde';
      if (cat.includes('tecnologia')) return 'Tecnologia';
      if (cat.includes('ambiente')) return 'Meio Ambiente';
    }
  }
  
  // Detecta por palavras-chave
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return 'Geral';
};

// Função para limpar e extrair sumário do conteúdo
const extractSummary = (content: string, title: string): string => {
  if (!content) return title;
  
  // Remove tags HTML
  const cleanContent = content.replace(/<[^>]*>/g, '');
  
  // Pega as primeiras 2 frases ou 200 caracteres
  const sentences = cleanContent.split(/[.!?]+/);
  const summary = sentences.slice(0, 2).join('. ').trim();
  
  return summary.length > 200 ? summary.substring(0, 200) + '...' : summary + '.';
};

// Função para filtrar notícias por período
const filterRecentNews = (items: RSSItem[], daysLimit: number = 3): RSSItem[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysLimit);
  
  return items.filter(item => {
    if (!item.pubDate && !item.isoDate) return true; // Mantém se não tem data
    
    const itemDate = new Date(item.isoDate || item.pubDate || '');
    return itemDate >= cutoffDate;
  });
};

// Função para buscar RSS de um feed específico
export const fetchRSSFeed = async (feedConfig: typeof RSS_FEEDS[0]): Promise<NewsItem[]> => {
  try {
    console.log(`RSS: Buscando feed de ${feedConfig.source}...`);
    console.log(`RSS: URL original: ${feedConfig.url}`);
    
    // Primeiro tenta buscar diretamente (para feeds que permitem CORS)
    let response: Response;
    let xmlContent: string;
    
    try {
      console.log(`RSS: Tentando acesso direto para ${feedConfig.source}...`);
      
      // Adiciona timeout de 10 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      response = await fetch(feedConfig.url, {
        mode: 'cors',
        signal: controller.signal,
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        xmlContent = await response.text();
        console.log(`RSS: ✓ Acesso direto bem-sucedido para ${feedConfig.source}`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (directError) {
      console.log(`RSS: Acesso direto falhou para ${feedConfig.source}, tentando proxy...`);
      
      // Usa proxy CORS como fallback
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedConfig.url)}`;
      console.log(`RSS: URL do proxy: ${proxyUrl}`);
      
      // Timeout para proxy também
      const proxyController = new AbortController();
      const proxyTimeoutId = setTimeout(() => proxyController.abort(), 15000);
      
      response = await fetch(proxyUrl, {
        signal: proxyController.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)'
        }
      });
      
      clearTimeout(proxyTimeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      xmlContent = data.contents || data.data || '';
      console.log(`RSS: ✓ Proxy bem-sucedido para ${feedConfig.source}`);
    }
    
    if (!xmlContent || xmlContent.trim().length === 0) {
      throw new Error('Conteúdo XML vazio ou inválido');
    }
    
    console.log(`RSS: Conteúdo XML recebido (${xmlContent.length} caracteres)`);
    
    // Parse do XML com tratamento de erro mais detalhado
    let parsedXml: any;
    try {
      parsedXml = xmlParser.parse(xmlContent);
      console.log(`RSS: ✓ XML parseado com sucesso para ${feedConfig.source}`);
    } catch (parseError) {
      console.error(`RSS: Erro no parse XML:`, parseError);
      console.error(`RSS: Conteúdo XML (primeiros 500 chars):`, xmlContent.substring(0, 500));
      throw new Error(`Erro ao fazer parse do XML: ${parseError}`);
    }
    
    const items = extractRSSItems(parsedXml);
    console.log(`RSS: ${items.length} itens extraídos de ${feedConfig.source}`);
    
    if (items.length === 0) {
      console.warn(`RSS: Nenhum item encontrado na estrutura XML de ${feedConfig.source}`);
      console.log(`RSS: Estrutura XML:`, JSON.stringify(parsedXml, null, 2).substring(0, 1000));
    }
    
    // Converte itens RSS para NewsItem
    const newsItems: NewsItem[] = items.map((item, index) => {
      const title = item.title || 'Título não disponível';
      const content = item.content || item.description || '';
      const summary = extractSummary(content, title);
      const category = detectCategory(title, content, item.categories);
      
      return {
        id: `rss-${feedConfig.source.replace(/\s+/g, '-')}-${index}`,
        title,
        summary,
        content,
        source: feedConfig.source,
        url: item.link || feedConfig.baseUrl,
        publishedAt: item.pubDate || new Date().toISOString(),
        imageUrl: `https://images.unsplash.com/photo-${1544620000000 + index}?w=800&h=400&fit=crop`, // Placeholder
        category,
        location: "Belo Horizonte"
      };
    });
    
    console.log(`RSS: ${newsItems.length} notícias processadas de ${feedConfig.source}`);
    return newsItems;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error(`RSS: Erro detalhado ao buscar feed de ${feedConfig.source}:`, {
      error,
      message: errorMessage,
      url: feedConfig.url,
      source: feedConfig.source
    });
    return [];
  }
};

// Função principal para buscar todas as fontes RSS
export const fetchAllRSSFeeds = async (daysLimit: number = 3): Promise<NewsItem[]> => {
  console.log('RSS: Iniciando busca em todos os feeds RSS');
  console.log(`RSS: Filtro de ${daysLimit} dias aplicado`);
  
  try {
    // Busca todos os feeds em paralelo
    const feedPromises = RSS_FEEDS.map(feedConfig => fetchRSSFeed(feedConfig));
    const feedResults = await Promise.allSettled(feedPromises);
    
    // Coleta resultados bem-sucedidos
    const allNews: NewsItem[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    feedResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
        successCount++;
        console.log(`RSS: ✓ ${RSS_FEEDS[index].source} - ${result.value.length} notícias`);
      } else {
        errorCount++;
        console.error(`RSS: ✗ ${RSS_FEEDS[index].source} - Erro:`, result.reason);
      }
    });
    
    console.log(`RSS: Total de ${allNews.length} notícias coletadas`);
    console.log(`RSS: ${successCount} feeds bem-sucedidos, ${errorCount} com erro`);
    
    // Filtra por período
    const recentNews = allNews.filter(item => {
      const itemDate = new Date(item.publishedAt);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysLimit);
      return itemDate >= cutoffDate;
    });
    
    // Ordena por data (mais recentes primeiro)
    recentNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    console.log(`RSS: ${recentNews.length} notícias após filtro de ${daysLimit} dias`);
    console.log('RSS: Fontes encontradas:', [...new Set(recentNews.map(item => item.source))]);
    
    return recentNews;
    
  } catch (error) {
    console.error('RSS: Erro geral na busca de feeds:', error);
    return [];
  }
};

// Função para testar conectividade com um feed
export const testRSSFeed = async (url: string): Promise<boolean> => {
  try {
    console.log(`RSS: Testando ${url}...`);
    
    // Tenta acesso direto primeiro
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const directResponse = await fetch(url, {
        mode: 'cors',
        signal: controller.signal,
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (directResponse.ok) {
        const xmlContent = await directResponse.text();
        const parsedXml = xmlParser.parse(xmlContent);
        const items = extractRSSItems(parsedXml);
        console.log(`RSS: ✓ Teste direto bem-sucedido para ${url} (${items.length} itens)`);
        return items.length > 0;
      }
    } catch (directError) {
      console.log(`RSS: Acesso direto falhou para ${url}, tentando proxy...`);
    }
    
    // Fallback para proxy
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
    const proxyController = new AbortController();
    const proxyTimeoutId = setTimeout(() => proxyController.abort(), 8000);
    
    const response = await fetch(proxyUrl, {
      signal: proxyController.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Reader/1.0)'
      }
    });
    
    clearTimeout(proxyTimeoutId);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    const xmlContent = data.contents || data.data;
    
    if (!xmlContent) {
      return false;
    }
    
    const parsedXml = xmlParser.parse(xmlContent);
    const items = extractRSSItems(parsedXml);
    
    console.log(`RSS: ✓ Teste via proxy bem-sucedido para ${url} (${items.length} itens)`);
    return items.length > 0;
  } catch (error) {
    console.error(`RSS: Teste falhou para ${url}:`, error instanceof Error ? error.message : error);
    return false;
  }
};