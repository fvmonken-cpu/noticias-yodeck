import { useState, useEffect } from 'react';

interface SharedConfig {
  selectedCategories: string[];
  autoRefresh: boolean;
  refreshInterval: number;
  daysFilter: number;
  maxNewsCount: number;
  useWebScraping: boolean;
}

const DEFAULT_CONFIG: SharedConfig = {
  selectedCategories: [],
  autoRefresh: true,
  refreshInterval: 1800, // 30 minutes
  daysFilter: 3,
  maxNewsCount: 8, // Mais notícias para TV
  useWebScraping: true // Web scraping ativo por padrão
};

const STORAGE_KEY = 'yodeck-news-config';

export const useSharedConfig = () => {
  const [config, setConfig] = useState<SharedConfig>(DEFAULT_CONFIG);
  
  // Carregar configuração do localStorage na inicialização
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        console.log('SharedConfig: Configuração carregada do localStorage:', parsedConfig);
        setConfig({ ...DEFAULT_CONFIG, ...parsedConfig });
      } catch (error) {
        console.error('SharedConfig: Erro ao carregar configuração:', error);
      }
    }
  }, []);
  
  // Salvar configuração no localStorage sempre que mudar
  const updateConfig = (updates: Partial<SharedConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    console.log('SharedConfig: Configuração atualizada:', newConfig);
  };
  
  return {
    config,
    updateConfig,
    // Funções individuais para compatibilidade
    selectedCategories: config.selectedCategories,
    setSelectedCategories: (categories: string[]) => updateConfig({ selectedCategories: categories }),
    
    autoRefresh: config.autoRefresh,
    setAutoRefresh: (enabled: boolean) => updateConfig({ autoRefresh: enabled }),
    
    refreshInterval: config.refreshInterval,
    setRefreshInterval: (interval: number) => updateConfig({ refreshInterval: interval }),
    
    daysFilter: config.daysFilter,
    setDaysFilter: (days: number) => updateConfig({ daysFilter: days }),
    
    maxNewsCount: config.maxNewsCount,
    setMaxNewsCount: (count: number) => updateConfig({ maxNewsCount: count }),
    
    useWebScraping: config.useWebScraping,
    setUseWebScraping: (enabled: boolean) => updateConfig({ useWebScraping: enabled })
  };
};