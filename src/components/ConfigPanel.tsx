import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Grid3X3, PlayCircle, Settings, Timer, Filter, RotateCcw, Eye, EyeOff, Calendar, Clock, Rss, Database, Search, RefreshCw, Hash, Clock3 } from "lucide-react";
import { useState } from "react";
interface ConfigPanelProps {
    categories: string[];
    selectedCategories: string[];
    onCategoriesChange: (categories: string[]) => void;
    autoRefresh: boolean;
    onAutoRefreshChange: (enabled: boolean) => void;
    refreshInterval: number;
    onRefreshIntervalChange: (interval: number) => void;
    daysFilter: number;
    onDaysFilterChange: (days: number) => void;
    maxNewsCount: number;
    onMaxNewsCountChange: (count: number) => void;
    useWebScraping: boolean;
    onUseWebScrapingChange: (enabled: boolean) => void;
}
const ConfigPanel = ({ categories, selectedCategories, onCategoriesChange, autoRefresh, onAutoRefreshChange, refreshInterval, onRefreshIntervalChange, daysFilter, onDaysFilterChange, maxNewsCount, onMaxNewsCountChange, useWebScraping, onUseWebScrapingChange }: ConfigPanelProps)=>{
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    console.log('ConfigPanel: Renderizando painel de configuração');
    console.log('ConfigPanel: Categorias selecionadas:', selectedCategories);
    const handleCategoryToggle = (category: string)=>{
        console.log('ConfigPanel: Alternando categoria:', category);
        const newSelection = selectedCategories.includes(category) ? selectedCategories.filter((c)=>c !== category) : [
            ...selectedCategories,
            category
        ];
        onCategoriesChange(newSelection);
    };
    const clearAllFilters = ()=>{
        console.log('ConfigPanel: Limpando todos os filtros');
        onCategoriesChange([]);
    };
    const getCategoryColor = (category: string)=>{
        const colors: Record<string, string> = {
            'Transporte': 'bg-blue-100 text-blue-800 border-blue-200',
            'Cultura': 'bg-purple-100 text-purple-800 border-purple-200',
            'Economia': 'bg-green-100 text-green-800 border-green-200',
            'Esportes': 'bg-orange-100 text-orange-800 border-orange-200',
            'Meio Ambiente': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'Tecnologia': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'Política': 'bg-red-100 text-red-800 border-red-200',
            'Saúde': 'bg-pink-100 text-pink-800 border-pink-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    };
    return (<Card className="mb-6 bg-white shadow-sm" data-spec-id="config-panel">
            <CardHeader className="pb-3" data-spec-id="config-header">
                <div className="flex items-center justify-between" data-spec-id="header-controls">
                    <div className="flex items-center gap-2" data-spec-id="header-title">
                        <Settings className="w-5 h-5 text-gray-600" data-spec-id="settings-icon"/>
                        <CardTitle className="text-lg" data-spec-id="panel-title">Configurações de Exibição</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" onClick={()=>setIsPanelVisible(!isPanelVisible)} data-spec-id="toggle-panel-visibility">
                        {isPanelVisible ? <EyeOff className="w-4 h-4" data-spec-id="hide-icon"/> : <Eye className="w-4 h-4" data-spec-id="show-icon"/>}
                    </Button>
                </div>
            </CardHeader>
            
            {isPanelVisible && (<CardContent className="space-y-6" data-spec-id="config-content">


                    {}
                    <div className="space-y-3" data-spec-id="data-source-section">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="data-source-title">
                            <Rss className="w-4 h-4" data-spec-id="rss-icon"/>
                            Fonte de Dados
                        </h3>
                        
                        {}
                        <div className="flex items-center justify-between" data-spec-id="web-scraping-controls">
                            <div className="flex items-center gap-2" data-spec-id="web-scraping-switch">
                                <Switch checked={useWebScraping} onCheckedChange={onUseWebScrapingChange} data-spec-id="web-scraping-toggle"/>
                                <div className="flex items-center gap-2" data-spec-id="web-scraping-label">
                                    {useWebScraping ? (<>
                                            <Search className="w-4 h-4 text-purple-600" data-spec-id="scraping-active-icon"/>
                                            <span className="text-sm text-gray-600" data-spec-id="scraping-active-text">Web Scraping</span>
                                        </>) : (<>
                                            <Search className="w-4 h-4 text-gray-400" data-spec-id="scraping-inactive-icon"/>
                                            <span className="text-sm text-gray-400" data-spec-id="scraping-inactive-text">Web Scraping</span>
                                        </>)}
                                </div>
                            </div>
                            
                            {useWebScraping && (<Badge variant="default" className="text-xs bg-purple-100 text-purple-800" data-spec-id="web-scraping-badge">
                                    Portais Diretos
                                </Badge>)}
                        </div>
                        

                        
                        <p className="text-xs text-gray-500" data-spec-id="data-source-description">
                            {useWebScraping ? 'Busca notícias diretamente nos portais brasileiros via web scraping' : 'Busca notícias via RSS feeds dos portais configurados'}
                        </p>
                    </div>

                    {}
                    {}
                    <div className="space-y-3" data-spec-id="category-filters-section">
                        <div className="flex items-center justify-between" data-spec-id="category-filters-header">
                            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="category-filters-title">
                                <Filter className="w-4 h-4" data-spec-id="filter-icon"/>
                                Filtros por Categoria
                            </h3>
                            {selectedCategories.length > 0 && (<Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs" data-spec-id="clear-filters-button">
                                    <RotateCcw className="w-3 h-3 mr-1" data-spec-id="clear-icon"/>
                                    Limpar
                                </Button>)}
                        </div>
                        
                        <div className="flex flex-wrap gap-2" data-spec-id="category-badges">
                            {categories.map((category)=>{
        const isSelected = selectedCategories.includes(category);
        return (<Badge key={category} variant={isSelected ? "default" : "outline"} className={`cursor-pointer transition-all duration-200 hover:scale-105 ${isSelected ? getCategoryColor(category) + ' border-2' : 'hover:bg-gray-50'}`} onClick={()=>handleCategoryToggle(category)} data-spec-id="category-filter-badge">
                                        {category}
                                    </Badge>);
    })}
                        </div>
                        
                        {selectedCategories.length > 0 && (<p className="text-xs text-gray-500" data-spec-id="selected-categories-count">
                                {selectedCategories.length} de {categories.length} categorias selecionadas
                            </p>)}
                    </div>

                    {}
                    <div className="space-y-4" data-spec-id="advanced-settings-section">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="advanced-settings-title">
                            <Settings className="w-4 h-4" data-spec-id="advanced-settings-icon"/>
                            Configurações Avançadas
                        </h3>
                        
                        {}
                        <div className="space-y-2" data-spec-id="max-news-control">
                            <div className="flex items-center justify-between" data-spec-id="max-news-header">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="max-news-label">
                                    <Hash className="w-4 h-4" data-spec-id="hash-icon"/>
                                    Máximo de notícias
                                </label>
                                <Badge variant="outline" className="text-xs" data-spec-id="max-news-value">
                                    {maxNewsCount} notícias
                                </Badge>
                            </div>
                            <Slider value={[
        maxNewsCount
    ]} onValueChange={(value)=>onMaxNewsCountChange(value[0])} min={3} max={15} step={1} className="w-full" data-spec-id="max-news-slider"/>
                            <p className="text-xs text-gray-500" data-spec-id="max-news-description">
                                Define quantas notícias serão exibidas no pool de rotação
                            </p>
                        </div>

                        {}
                        <div className="space-y-2" data-spec-id="refresh-interval-control">
                            <div className="flex items-center justify-between" data-spec-id="refresh-interval-header">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="refresh-interval-label">
                                    <Clock3 className="w-4 h-4" data-spec-id="clock-icon"/>
                                    Intervalo de atualização
                                </label>
                                <Badge variant="outline" className="text-xs" data-spec-id="refresh-interval-value">
                                    {Math.round(refreshInterval / 60)} min
                                </Badge>
                            </div>
                            <Slider value={[
        refreshInterval
    ]} onValueChange={(value)=>onRefreshIntervalChange(value[0])} min={300} max={7200} step={300} className="w-full" data-spec-id="refresh-interval-slider"/>
                            <p className="text-xs text-gray-500" data-spec-id="refresh-interval-description">
                                A cada quantos minutos buscar novas notícias (5 min - 2 horas)
                            </p>
                        </div>

                        {}
                        <div className="space-y-2" data-spec-id="days-filter-control">
                            <div className="flex items-center justify-between" data-spec-id="days-filter-header">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="days-filter-label">
                                    <Calendar className="w-4 h-4" data-spec-id="calendar-icon"/>
                                    Dias para buscar
                                </label>
                                <Badge variant="outline" className="text-xs" data-spec-id="days-filter-value">
                                    {daysFilter} {daysFilter === 1 ? 'dia' : 'dias'}
                                </Badge>
                            </div>
                            <Slider value={[
        daysFilter
    ]} onValueChange={(value)=>onDaysFilterChange(value[0])} min={1} max={7} step={1} className="w-full" data-spec-id="days-filter-slider"/>
                            <p className="text-xs text-gray-500" data-spec-id="days-filter-description">
                                Buscar notícias publicadas nos últimos N dias
                            </p>
                        </div>

                        {}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3" data-spec-id="system-status">
                            <div className="flex items-start gap-2" data-spec-id="status-content">
                                <RotateCcw className="w-4 h-4 text-green-600 mt-0.5" data-spec-id="rotate-icon"/>
                                <div className="text-sm" data-spec-id="status-text">
                                    <p className="font-medium text-green-800 mb-1" data-spec-id="status-title">Sistema Ativo</p>
                                    <p className="text-green-600 text-xs" data-spec-id="status-description">
                                        • {maxNewsCount} notícias em rotação<br data-spec-id="K4j4wCDSAGKUETUf"/>
                                        • Atualização a cada {Math.round(refreshInterval / 60)} minutos<br data-spec-id="XjacA3E4uTNtiSVs"/>
                                        • Busca últimos {daysFilter} {daysFilter === 1 ? 'dia' : 'dias'}<br data-spec-id="DF9rA7RzyIakYJd3"/>
                                        • Otimizado para Yodeck
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3" data-spec-id="yodeck-optimization-note">
                        <div className="flex items-start gap-2" data-spec-id="optimization-content">
                            <PlayCircle className="w-4 h-4 text-blue-600 mt-0.5" data-spec-id="play-icon"/>
                            <div className="text-sm" data-spec-id="optimization-text">
                                <p className="font-medium text-blue-800 mb-1" data-spec-id="optimization-title">Otimizado para TV Indoor</p>
                                <p className="text-blue-600 text-xs" data-spec-id="optimization-description">
                                    Sistema com web scraping direto dos portais + fallback RSS + dados simulados.
                                    Interface adaptada para displays digitais.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>)}
        </Card>);
};
export default ConfigPanel;
