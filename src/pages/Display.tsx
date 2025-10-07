import React from "react";
import NewsCarousel from "@/components/NewsCarousel";
import { useQuery } from "@tanstack/react-query";
import { scrapeNewsFromPortals } from "@/services/newsService";
import { useSharedConfig } from "@/hooks/useSharedConfig";

export default function Display() {
    // Garantir que não há overflow no body para TV Full HD
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        
        return () => {
            // Limpar quando sair da página
            document.body.style.overflow = '';
            document.body.style.margin = '';
            document.body.style.padding = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.margin = '';
            document.documentElement.style.padding = '';
        };
    }, []);

    // Usar as MESMAS configurações da página principal (sincronização via localStorage)
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

    // Estado de carregamento
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-xl">Carregando notícias...</div>
            </div>
        );
    }

    // Estado de erro
    if (error) {
        console.error("Erro ao carregar notícias:", error);
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-500 text-xl">Erro ao carregar notícias</div>
            </div>
        );
    }
    
    // Renderização principal - Full HD (1920x1080) otimizado para TV
    return (
        <div 
            className="bg-black" 
            style={{
                width: '100vw',
                height: '100vh',
                minHeight: '100vh',
                maxHeight: '100vh',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 50
            }}
        >
            <NewsCarousel news={news} />
        </div>
    );
}