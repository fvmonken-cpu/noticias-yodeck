import React from "react";
import NewsCarousel from "@/components/NewsCarousel";
import { useQuery } from "@tanstack/react-query";
import { scrapeNewsFromPortals } from "@/services/newsService";
import { useSharedConfig } from "@/hooks/useSharedConfig";

export default function Display() {
    // CSS agressivo para forçar tela completa
    React.useEffect(() => {
        // Adicionar classes para TV display
        document.documentElement.classList.add('tv-display');
        document.body.classList.add('tv-display');
        
        // Forçar estilos inline como backup
        const applyStyles = () => {
            document.documentElement.style.cssText = `
                margin: 0 !important;
                padding: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
            `;
            
            document.body.style.cssText = `
                margin: 0 !important;
                padding: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
            `;
        };
        
        applyStyles();
        
        // Aplicar novamente após um delay para garantir
        const timeout = setTimeout(applyStyles, 100);
        
        return () => {
            // Limpar classes e estilos
            document.documentElement.classList.remove('tv-display');
            document.body.classList.remove('tv-display');
            document.documentElement.style.cssText = '';
            document.body.style.cssText = '';
            clearTimeout(timeout);
        };
    }, []);

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
        refetchInterval: Math.max(refreshInterval * 1000, 60000),
        staleTime: 30 * 1000,
        retry: 3
    });
    
    const news = allNews;

    if (isLoading) {
        return (
            <div 
                className="tv-display-fullscreen"
                style={{
                    backgroundColor: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div style={{ color: 'white', fontSize: '24px' }}>
                    Carregando notícias...
                </div>
            </div>
        );
    }

    if (error) {
        console.error("Erro ao carregar notícias:", error);
        return (
            <div 
                className="tv-display-fullscreen"
                style={{
                    backgroundColor: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div style={{ color: 'red', fontSize: '24px' }}>
                    Erro ao carregar notícias
                </div>
            </div>
        );
    }
    
    return (
        <div 
            className="tv-display-fullscreen"
            style={{
                backgroundColor: '#000000'
            }}
        >
            <NewsCarousel news={news} />
        </div>
    );
}