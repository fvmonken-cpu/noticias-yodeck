import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar, MapPin, Newspaper, Globe } from "lucide-react";
import { toast } from "sonner";
import NewsHeader from "./NewsHeader";
import NewsCarousel from "./NewsCarousel";
import ConfigPanel from "./ConfigPanel";
import RSSDebugPanel from "./RSSDebugPanel";
import ScrapingDebugPanel from "./ScrapingDebugPanel";
import ConnectionStatus from "./ConnectionStatus";
import { scrapeNewsFromPortals } from "../services/newsService";
export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    content: string;
    source: string;
    url: string;
    publishedAt: string;
    imageUrl?: string;
    category: string;
    location: string;
}
const NewsApp = ()=>{
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(1800);
    const [daysFilter, setDaysFilter] = useState(3);
    const [maxNewsCount, setMaxNewsCount] = useState(5);
    const [useWebScraping, setUseWebScraping] = useState(true);
    const [dataSource, setDataSource] = useState<'scraping' | 'rss' | 'fallback'>('fallback');
    console.log('NewsApp: Renderizando aplicativo de notícias');
    console.log('NewsApp: Auto-refresh ativo:', autoRefresh);
    const { data: news, isLoading, error, refetch } = useQuery({
        queryKey: [
            'scraped-news',
            selectedCategories,
            daysFilter,
            maxNewsCount,
            useWebScraping
        ],
        queryFn: async ()=>{
            console.log('NewsApp: Iniciando scraping dos portais de BH...');
            console.log('NewsApp: Filtro de dias aplicado:', daysFilter);
            console.log('NewsApp: Usando web scraping:', useWebScraping);
            console.log('NewsApp: Máximo de notícias:', maxNewsCount);
            const scrapedNews = await scrapeNewsFromPortals(daysFilter, false, useWebScraping, maxNewsCount);
            let filteredNews = scrapedNews;
            if (selectedCategories.length > 0) {
                filteredNews = scrapedNews.filter((item)=>selectedCategories.includes(item.category));
            }
            console.log('NewsApp: Notícias carregadas dos portais:', filteredNews.length);
            let currentDataSource: 'scraping' | 'rss' | 'fallback' = 'fallback';
            if (filteredNews.length > 0) {
                const firstNewsId = filteredNews[0].id;
                if (firstNewsId.startsWith('scrape-') || firstNewsId.startsWith('fallback-')) {
                    currentDataSource = useWebScraping ? 'scraping' : 'fallback';
                } else if (firstNewsId.startsWith('rss-')) {
                    currentDataSource = 'rss';
                } else if (firstNewsId.startsWith('scraped-')) {
                    currentDataSource = 'fallback';
                }
            }
            setDataSource(currentDataSource);
            const sourceType = currentDataSource === 'scraping' ? 'scraped dos portais' : currentDataSource === 'rss' ? 'RSS reais' : 'simuladas';
            toast.success(`${filteredNews.length} notícias ${sourceType} dos últimos ${daysFilter} ${daysFilter === 1 ? 'dia' : 'dias'} carregadas`);
            return filteredNews;
        },
        refetchInterval: autoRefresh ? refreshInterval * 1000 : false,
        staleTime: 5 * 60 * 1000
    });
    useEffect(()=>{
        console.log('NewsApp: Configurando auto-refresh');
        if (autoRefresh) {
            toast.success(`Auto-refresh ativado (${refreshInterval}s)`);
        }
    }, [
        autoRefresh,
        refreshInterval
    ]);
    const handleRefresh = ()=>{
        console.log('NewsApp: Refresh manual solicitado');
        refetch();
        toast.success('Notícias atualizadas!');
    };
    const categories = Array.from(new Set(news?.map((item)=>item.category) || [
        'Transporte',
        'Cultura',
        'Economia',
        'Esportes',
        'Meio Ambiente',
        'Tecnologia',
        'Política'
    ]));
    console.log('NewsApp: Categorias disponíveis:', categories);
    if (error) {
        console.error('NewsApp: Erro ao carregar notícias:', error);
        return (<div className="min-h-screen flex items-center justify-center" data-spec-id="error-state">
        <Card className="p-6 text-center" data-spec-id="3hkUpcDSD8CnNLtF">
          <Newspaper className="w-12 h-12 mx-auto mb-4 text-red-500" data-spec-id="mzB3oJINsWsybseX"/>
          <h2 className="text-xl font-semibold mb-2" data-spec-id="DdTW0hGle20sMbQM">Erro ao carregar notícias</h2>
          <p className="text-muted-foreground mb-4" data-spec-id="456N5QZ3H8u5oDDG">
            Não foi possível fazer scraping dos portais de notícias locais.
          </p>
          <Button onClick={handleRefresh} variant="outline" data-spec-id="7tm7M0Od6hHP4dfb">
            <RefreshCw className="w-4 h-4 mr-2" data-spec-id="9SQkG2AYPBcHGoAW"/>
            Tentar novamente
          </Button>
        </Card>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" data-spec-id="news-app-container">
      <NewsHeader onRefresh={handleRefresh} isLoading={isLoading} newsCount={news?.length || 0} lastUpdate={news && news.length > 0 ? new Date(news[0].publishedAt).toLocaleString('pt-BR') : new Date().toLocaleTimeString('pt-BR')} data-spec-id="q6Hop2WGQJBQcdHP"/>
      
      <div className="container mx-auto px-4 py-6" data-spec-id="6MCAEs4Q54Il9QbV">
        <ConfigPanel categories={categories} selectedCategories={selectedCategories} onCategoriesChange={setSelectedCategories} autoRefresh={autoRefresh} onAutoRefreshChange={setAutoRefresh} refreshInterval={refreshInterval} onRefreshIntervalChange={setRefreshInterval} daysFilter={daysFilter} onDaysFilterChange={setDaysFilter} maxNewsCount={maxNewsCount} onMaxNewsCountChange={setMaxNewsCount} useWebScraping={useWebScraping} onUseWebScrapingChange={setUseWebScraping} data-spec-id="tOQ5AbDRCFFyuGdp"/>

        <ConnectionStatus isLoading={isLoading} hasData={!!news && news.length > 0} error={error} useWebScraping={useWebScraping} dataSource={dataSource} data-spec-id="main-connection-status"/>

        {}
        <RSSDebugPanel isVisible={false} data-spec-id="ArGLFCPaPJNFm1rK"/>
        <ScrapingDebugPanel isVisible={useWebScraping} data-spec-id="scraping-debug"/>

        <div className="mb-6" data-spec-id="QQ62QJbmolM1bOFG">
          <div className="flex items-center gap-2 mb-4" data-spec-id="xnt71MW3FBrJ7224">
            <MapPin className="w-5 h-5 text-blue-600" data-spec-id="tpSqIpfJzB2yM51E"/>
            <h2 className="text-lg font-semibold text-gray-800" data-spec-id="Nva642v5j0RDL4W5">
              <Globe className="w-4 h-4 inline mr-2" data-spec-id="bRCvn0B1uXw9xaoC"/>
              Scraping de Portais Locais - BH e Região
            </h2>
            <div className="ml-auto flex items-center gap-2" data-spec-id="header-badges">
              <Badge variant="outline" className="text-xs" data-spec-id="days-filter-indicator">
                <Calendar className="w-3 h-3 mr-1" data-spec-id="TuHQLcK70TzWynBb"/>
                Últimos {daysFilter} {daysFilter === 1 ? 'dia' : 'dias'}
              </Badge>
              <Badge variant="secondary" data-spec-id="yAywJJcIcVwyQmOA">
                {news?.length || 0} notícias
              </Badge>
            </div>
          </div>
          
          {selectedCategories.length > 0 && (<div className="flex flex-wrap gap-2 mb-4" data-spec-id="tSBkCZNBA01vIjQs">
              <span className="text-sm text-gray-600" data-spec-id="bMfSXzzemrp6LR72">Filtros ativos:</span>
              {selectedCategories.map((category)=>(<Badge key={category} variant="outline" data-spec-id="14w9sz4krOG3qhld">
                  {category}
                </Badge>))}
            </div>)}
        </div>

        {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-spec-id="tvJlTwBEkJSUomvm">
            {[
        1,
        2,
        3,
        4,
        5,
        6
    ].map((i)=>(<Card key={i} className="p-6 animate-pulse" data-spec-id="news-skeleton">
                <div className="h-48 bg-gray-200 rounded mb-4" data-spec-id="GzaP9gz8Uq9Zsvmm"></div>
                <div className="h-4 bg-gray-200 rounded mb-2" data-spec-id="r8kRmRQuUkYOh92k"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4" data-spec-id="SgiLZHq0y9tEgvOP"></div>
              </Card>))}
          </div>) : (<NewsCarousel news={news || []} data-spec-id="lghSVJHdhrWZlNwl"/>)}
      </div>
    </div>);
};
export default NewsApp;
