import { NewsItem } from "../components/NewsApp"

// Simulação de scraping de portais de notícias de BH
// Em produção, você usaria APIs ou scrapers reais
interface ScrapedArticle {
  url: string
  title: string
  summary: string
  content: string
  publishedAt: Date
  imageUrl?: string
  source: string
  category: string
}

// Simulação de portais de BH com URLs reais
const BH_NEWS_PORTALS = [
  {
    name: "Portal G1 Minas",
    baseUrl: "https://g1.globo.com/mg/minas-gerais/",
    categories: ["Transporte", "Política", "Economia"]
  },
  {
    name: "Estado de Minas",
    baseUrl: "https://www.em.com.br/",
    categories: ["Cultura", "Esportes", "Política"]
  },
  {
    name: "Hoje em Dia",
    baseUrl: "https://www.hojeemdia.com.br/",
    categories: ["Economia", "Transporte", "Meio Ambiente"]
  },
  {
    name: "Super Esportes",
    baseUrl: "https://www.superesportes.com.br/",
    categories: ["Esportes"]
  },
  {
    name: "Portal PBH",
    baseUrl: "https://prefeitura.pbh.gov.br/noticias",
    categories: ["Meio Ambiente", "Transporte", "Política"]
  },
  {
    name: "Jornal do Commercio MG",
    baseUrl: "https://jornaldecomercio.com/",
    categories: ["Economia", "Tecnologia"]
  }
]

// Dados simulados que representariam o resultado do scraping
// Usando datas dinâmicas baseadas na data atual para garantir notícias recentes
const generateRecentDate = (daysAgo: number, hour: number = 10, minute: number = 0): Date => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date
}

const SIMULATED_SCRAPED_NEWS: ScrapedArticle[] = [
  {
    url: "https://g1.globo.com/mg/minas-gerais/noticia/2024/01/15/nova-linha-metro-bh-inaugurada.html",
    title: "Nova Linha do Metrô de BH é Inaugurada com Investimento de R$ 2 Bilhões",
    summary: "Linha Verde conecta região da Pampulha ao centro da cidade, melhorando significativamente a mobilidade urbana da capital mineira",
    content: "A nova linha do metrô de Belo Horizonte foi inaugurada hoje pela manhã, conectando a região da Pampulha ao centro da cidade. O investimento total de R$ 2 bilhões beneficiará mais de 300 mil usuários diários, segundo estimativas da CBTU.",
    publishedAt: generateRecentDate(0, 8, 30), // Hoje às 08:30
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop",
    source: "Portal G1 Minas",
    category: "Transporte"
  },
  {
    url: "https://www.em.com.br/cultura/2024/01/festival-inverno-bonito-2024.html",
    title: "Festival de Inverno de Bonito Celebra 30ª Edição com Programação Especial",
    summary: "Evento cultural tradicional da Serra da Mantiqueira atrai milhares de visitantes com música, gastronomia e artesanato local",
    content: "O tradicional Festival de Inverno de Bonito celebra sua 30ª edição com uma programação diversificada que incluirá apresentações musicais, mostras gastronômicas e feiras de artesanato local.",
    publishedAt: generateRecentDate(0, 10, 15), // Hoje às 10:15
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
    source: "Estado de Minas",
    category: "Cultura"
  },
  {
    url: "https://www.hojeemdia.com.br/economia/mercado-central-reforma-modernizacao-2024.html",
    title: "Mercado Central de BH Recebe Investimento de R$ 50 Milhões em Modernização",
    summary: "Obras de revitalização preservam características históricas enquanto modernizam infraestrutura do tradicional centro de compras",
    content: "O icônico Mercado Central de Belo Horizonte está passando por uma ampla reforma que moderniza toda a infraestrutura, mantendo suas características históricas e culturais únicas que atraem turistas do mundo todo.",
    publishedAt: generateRecentDate(0, 14, 45), // Hoje às 14:45
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=400&fit=crop",
    source: "Hoje em Dia",
    category: "Economia"
  },
  {
    url: "https://www.superesportes.com.br/atletico-mg/titulo-estadual-classico-2024.html",
    title: "Atlético-MG Vence Clássico e Conquista 48º Título do Campeonato Mineiro",
    summary: "Galo derrotou o Cruzeiro por 2x1 com gol nos acréscimos e sagrou-se campeão mineiro mais uma vez",
    content: "Em partida emocionante no Mineirão, o Atlético-MG derrotou o rival Cruzeiro por 2 a 1, com gol decisivo nos acréscimos do segundo tempo, conquistando assim o Campeonato Mineiro pela 48ª vez em sua história centenária.",
    publishedAt: generateRecentDate(1, 22, 30), // Ontem às 22:30
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=400&fit=crop",
    source: "Super Esportes",
    category: "Esportes"
  },
  {
    url: "https://prefeitura.pbh.gov.br/noticias/parque-cidade-nova-area-lazer-2024",
    title: "Parque da Cidade Ganha Nova Área de Lazer com Investimento Municipal",
    summary: "Prefeitura investe em infraestrutura verde criando novos espaços para famílias e atividades ao ar livre",
    content: "A Prefeitura de Belo Horizonte inaugurou uma nova área de lazer no Parque da Cidade, equipada com playgrounds modernos, quadras esportivas e trilhas ecológicas para promover o bem-estar da população.",
    publishedAt: generateRecentDate(1, 16, 20), // Ontem às 16:20
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop",
    source: "Portal PBH",
    category: "Meio Ambiente"
  },
  {
    url: "https://jornaldecomercio.com/startup-mineira-investimento-agronegocio-2024",
    title: "Startup de BH Recebe Aporte de R$ 15 Milhões para Soluções no Agronegócio",
    summary: "Empresa sediada na capital desenvolve tecnologias inovadoras voltadas para sustentabilidade no setor agrícola",
    content: "Uma startup sediada em Belo Horizonte conseguiu captar R$ 15 milhões em investimentos para expandir suas soluções tecnológicas voltadas ao agronegócio sustentável, com foco em inteligência artificial e IoT.",
    publishedAt: generateRecentDate(1, 11, 10), // Ontem às 11:10
    imageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
    source: "Jornal do Commercio MG",
    category: "Tecnologia"
  },
  {
    url: "https://g1.globo.com/mg/minas-gerais/noticia/2024/01/13/ciclofaixa-nova-savassi.html",
    title: "Nova Ciclofaixa Liga Savassi ao Centro com 3,2 Km de Extensão",
    summary: "Projeto de mobilidade sustentável facilita deslocamento de ciclistas entre duas importantes regiões da cidade",
    content: "Foi inaugurada a nova ciclofaixa que conecta o bairro Savassi ao centro de Belo Horizonte, totalizando 3,2 quilômetros de via exclusiva para bicicletas, parte do projeto de mobilidade urbana sustentável da capital.",
    publishedAt: generateRecentDate(2, 9, 45), // Anteontem às 09:45
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
    source: "Portal G1 Minas",
    category: "Transporte"
  },
  {
    url: "https://www.em.com.br/politica/eleicoes-municipais-bh-candidatos-2024.html",
    title: "Pré-Candidatos à Prefeitura de BH Iniciam Movimentação para Eleições 2024",
    summary: "Diversos nomes começam a se articular politicamente visando as eleições municipais de outubro",
    content: "O cenário político de Belo Horizonte já movimenta possíveis candidatos à prefeitura nas eleições municipais de 2024, com diversos nomes de diferentes partidos iniciando suas articulações e pré-campanhas.",
    publishedAt: generateRecentDate(2, 15, 30), // Anteontem às 15:30
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop",
    source: "Estado de Minas",
    category: "Política"
  },
  
  // Notícias mais antigas (fora do range de 3 dias) para testar o filtro
  {
    url: "https://www.em.com.br/economia/inovacao-startups-bh-2024.html",
    title: "Ecossistema de Inovação de BH Atrai Novos Investimentos",
    summary: "Cidade se consolida como hub tecnológico com foco em startups e desenvolvimento sustentável",
    content: "Belo Horizonte tem se destacado no cenário nacional de inovação, atraindo investimentos significativos para o desenvolvimento de startups e projetos tecnológicos sustentáveis.",
    publishedAt: generateRecentDate(5, 13, 0), // 5 dias atrás - deve ser filtrada
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    source: "Estado de Minas",
    category: "Tecnologia"
  },
  {
    url: "https://www.hojeemdia.com.br/cultura/museu-arte-bh-exposicao-2024.html",
    title: "Museu de Arte de BH Inaugura Exposição sobre História Local",
    summary: "Nova mostra celebra a rica herança cultural e artística da capital mineira",
    content: "O Museu de Arte de Belo Horizonte apresenta uma exposição especial dedicada à história e cultura local, com obras de artistas mineiros renomados.",
    publishedAt: generateRecentDate(7, 11, 30), // 7 dias atrás - deve ser filtrada
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop",
    source: "Hoje em Dia",
    category: "Cultura"
  }
]

// Função para filtrar notícias dos últimos N dias
const filterRecentNews = (news: NewsItem[], daysLimit: number = 3): NewsItem[] => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysLimit)
  
  const filteredNews = news.filter(item => {
    const newsDate = new Date(item.publishedAt)
    return newsDate >= cutoffDate
  })
  
  console.log(`NewsService: Filtro aplicado - mantidas ${filteredNews.length} notícias dos últimos ${daysLimit} dias`)
  console.log(`NewsService: Data de corte: ${cutoffDate.toLocaleDateString('pt-BR')}`)
  
  return filteredNews
}

// Função principal que simula o scraping de múltiplos portais
export const scrapeNewsFromPortals = async (daysLimit: number = 3, useRealRSS: boolean = false, useWebScraping: boolean = false, maxNewsCount: number = 5): Promise<NewsItem[]> => {
  console.log('NewsService: Iniciando busca por notícias nos portais de BH')
  console.log(`NewsService: Buscando notícias dos últimos ${daysLimit} dias`)
  console.log(`NewsService: Máximo de ${maxNewsCount} notícias`)
  console.log(`NewsService: Modo: ${useWebScraping ? 'Web Scraping' : useRealRSS ? 'RSS Real' : 'Dados Simulados'}`)
  
  if (useWebScraping) {
    // Importa dinamicamente o serviço de web scraping
    const { scrapeAllPortals } = await import('./webScrapingService')
    
    try {
      console.log('NewsService: Tentando fazer web scraping dos portais...')
      const scrapedNews = await scrapeAllPortals(maxNewsCount, daysLimit)
      
      if (scrapedNews.length > 0) {
        console.log(`NewsService: ✓ ${scrapedNews.length} notícias obtidas via web scraping`)
        return scrapedNews
      } else {
        console.log('NewsService: ⚠ Nenhuma notícia encontrada via scraping, voltando para dados simulados')
      }
    } catch (error) {
      console.error('NewsService: ✗ Erro no web scraping, usando dados simulados:', error)
    }
  }
  
  if (useRealRSS) {
    // Importa dinamicamente o serviço RSS
    const { fetchAllRSSFeeds } = await import('./rssService')
    
    try {
      console.log('NewsService: Tentando buscar feeds RSS reais...')
      const rssNews = await fetchAllRSSFeeds(daysLimit)
      
      if (rssNews.length > 0) {
        console.log(`NewsService: ✓ ${rssNews.length} notícias RSS carregadas com sucesso`)
        return rssNews
      } else {
        console.log('NewsService: ⚠ Nenhuma notícia RSS encontrada, voltando para dados simulados')
      }
    } catch (error) {
      console.error('NewsService: ✗ Erro ao buscar RSS, usando dados simulados:', error)
    }
  }
  
  // Fallback para dados simulados
  console.log('NewsService: Usando dados simulados')
  
  // Simula delay de rede para scraping
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  console.log(`NewsService: Processando ${SIMULATED_SCRAPED_NEWS.length} artigos encontrados`)
  
  // Converte os dados simulados para o formato NewsItem
  const newsItems: NewsItem[] = SIMULATED_SCRAPED_NEWS.map((article, index) => ({
    id: `scraped-${index + 1}`,
    title: article.title,
    summary: article.summary,
    content: article.content,
    source: article.source,
    url: article.url,
    publishedAt: article.publishedAt.toISOString(),
    imageUrl: article.imageUrl,
    category: article.category,
    location: ""
  }))
  
  // Filtra apenas notícias dos últimos N dias
  const recentNews = filterRecentNews(newsItems, daysLimit)
  
  // Ordena por data de publicação (mais recentes primeiro)
  recentNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  
  console.log('NewsService: Notícias processadas e ordenadas por data')
  console.log('NewsService: Fontes encontradas:', [...new Set(recentNews.map(item => item.source))])
  
  return recentNews
}

// Função para simular scraping de um portal específico
export const scrapePortalByName = async (portalName: string): Promise<NewsItem[]> => {
  console.log(`NewsService: Buscando notícias específicas do portal: ${portalName}`)
  
  const portal = BH_NEWS_PORTALS.find(p => p.name === portalName)
  if (!portal) {
    console.warn(`NewsService: Portal ${portalName} não encontrado`)
    return []
  }
  
  const allNews = await scrapeNewsFromPortals()
  const portalNews = allNews.filter(item => item.source === portalName)
  
  console.log(`NewsService: Encontradas ${portalNews.length} notícias do ${portalName}`)
  return portalNews
}

// Função para obter estatísticas dos portais
export const getPortalStats = async () => {
  const allNews = await scrapeNewsFromPortals()
  
  const stats = BH_NEWS_PORTALS.map(portal => ({
    name: portal.name,
    url: portal.baseUrl,
    newsCount: allNews.filter(item => item.source === portal.name).length,
    categories: portal.categories,
    lastUpdate: allNews
      .filter(item => item.source === portal.name)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0]?.publishedAt
  }))
  
  console.log('NewsService: Estatísticas dos portais geradas:', stats)
  return stats
}