import NewsCarousel from "@/components/NewsCarousel";
import { useQuery } from "@tanstack/react-query";
import { scrapeNewsFromPortals } from "@/services/newsService";
import { useSharedConfig } from "@/hooks/useSharedConfig";

export default function Display() {
    // Usar as MESMAS configurações da página principal
    const { 
        selectedCategories, 
        daysFilter, 
        maxNewsCount, 
        useWebScraping,
        refreshInterval 
    } = useSharedConfig();
    
    console.log("Display: Página Full HD para TV/Yodeck");
    console.log("Display: Configurações sincronizadas:", { 
        selectedCategories, 
        daysFilter, 
        maxNewsCount, 
        useWebScraping,
        refreshInterval 
    });
    
    // Query usando as configurações compartilhadas
    const { data: allNews = [], isLoading, error } = useQuery({
        queryKey: ['display-news', selectedCategories, daysFilter, maxNewsCount, useWebScraping],
        queryFn: async () => {
            console.log('Display: Buscando notícias com configurações sincronizadas...');
            const scrapedNews = await scrapeNewsFromPortals(daysFilter, false, useWebScraping, maxNewsCount);
            
            // Aplicar filtro de categorias se houver
            let filteredNews = scrapedNews;
            if (selectedCategories.length > 0) {
                filteredNews = scrapedNews.filter(item => 
                    selectedCategories.includes(item.category)
                );
                console.log(`Display: ${scrapedNews.length} → ${filteredNews.length} notícias após filtro de categoria`);
            }
            
            return filteredNews;
        },
        refetchInterval: Math.max(refreshInterval * 1000, 60000), // Mín. 1 minuto para TV
        staleTime: 30 * 1000, // Mais agressivo para TV
        retry: 3
    });
    
    const news = allNews;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Carregando notícias...</div>
            </div>
        );
    }

    if (error) {
        console.error("Erro ao carregar notícias:", error);
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-500 text-xl">Erro ao carregar notícias</div>
            </div>
        );
    }
    
    return (
        <div className="w-screen h-screen overflow-hidden bg-black">
            <NewsCarousel news={news} />
        </div>
    );
}