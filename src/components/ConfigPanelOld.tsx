import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Grid3X3, PlayCircle, Settings, Timer, Filter, RotateCcw, Eye, EyeOff, Calendar, Clock, Rss, Database, Search } from "lucide-react";
import { useState } from "react";
interface ConfigPanelProps {
    displayMode: 'grid' | 'carousel';
    onDisplayModeChange: (mode: 'grid' | 'carousel') => void;
    categories: string[];
    selectedCategories: string[];
    onCategoriesChange: (categories: string[]) => void;
    autoRefresh: boolean;
    onAutoRefreshChange: (enabled: boolean) => void;
    refreshInterval: number;
    onRefreshIntervalChange: (interval: number) => void;
    daysFilter: number;
    onDaysFilterChange: (days: number) => void;
    useRealRSS: boolean;
    onUseRealRSSChange: (enabled: boolean) => void;
    useWebScraping: boolean;
    onUseWebScrapingChange: (enabled: boolean) => void;
}
const ConfigPanel = ({ displayMode, onDisplayModeChange, categories, selectedCategories, onCategoriesChange, autoRefresh, onAutoRefreshChange, refreshInterval, onRefreshIntervalChange, daysFilter, onDaysFilterChange, useRealRSS, onUseRealRSSChange, useWebScraping, onUseWebScrapingChange }: ConfigPanelProps)=>{
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    console.log('ConfigPanel: Renderizando painel de configuração');
    console.log('ConfigPanel: Modo de exibição:', displayMode);
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
        <div className="flex items-center justify-between" data-spec-id="j4DXqerQAQY6E78r">
          <div className="flex items-center gap-2" data-spec-id="UNrt5w4dkuKlglh0">
            <Settings className="w-5 h-5 text-gray-600" data-spec-id="SkZbBoczgzJQWYpk"/>
            <CardTitle className="text-lg" data-spec-id="HefiOR4631Afu4xp">Configurações de Exibição</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={()=>setIsPanelVisible(!isPanelVisible)} data-spec-id="toggle-panel-visibility">
            {isPanelVisible ? <EyeOff className="w-4 h-4" data-spec-id="2obEw8d3DoM1PHxz"/> : <Eye className="w-4 h-4" data-spec-id="Xyyfj9KmXFBTCqMr"/>}
          </Button>
        </div>
      </CardHeader>
      
      {isPanelVisible && (<CardContent className="space-y-6" data-spec-id="config-content">
          {}
          <div className="space-y-3" data-spec-id="display-mode-section">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="iXnwFc7W5pJZlTG9">
              <Grid3X3 className="w-4 h-4" data-spec-id="OWhPLpTNHsnr4RDN"/>
              Modo de Exibição
            </h3>
            <div className="flex gap-2" data-spec-id="tJcHqdadnOCYO3ol">
              <Button variant={displayMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={()=>onDisplayModeChange('grid')} className="flex items-center gap-2" data-spec-id="grid-mode-button">
                <Grid3X3 className="w-4 h-4" data-spec-id="20BYX3WYltSgEucO"/>
                Grade
              </Button>
              <Button variant={displayMode === 'carousel' ? 'default' : 'outline'} size="sm" onClick={()=>onDisplayModeChange('carousel')} className="flex items-center gap-2" data-spec-id="carousel-mode-button">
                <PlayCircle className="w-4 h-4" data-spec-id="LgHYeJ28603FHQE3"/>
                Carrossel
              </Button>
            </div>
          </div>

          {}
          <div className="space-y-3" data-spec-id="category-filters-section">
            <div className="flex items-center justify-between" data-spec-id="OQ6cgHJ7WOPR7Vl0">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="kigUzNBeO3tLJQf4">
                <Filter className="w-4 h-4" data-spec-id="omZ4cjA82AzrWTAN"/>
                Filtros por Categoria
              </h3>
              {selectedCategories.length > 0 && (<Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs" data-spec-id="clear-filters-button">
                  <RotateCcw className="w-3 h-3 mr-1" data-spec-id="vDJIKnl8f9XT4Czs"/>
                  Limpar
                </Button>)}
            </div>
            
            <div className="flex flex-wrap gap-2" data-spec-id="K8CFkXqBAHyfBDfo">
              {categories.map((category)=>{
        const isSelected = selectedCategories.includes(category);
        return (<Badge key={category} variant={isSelected ? "default" : "outline"} className={`cursor-pointer transition-all duration-200 hover:scale-105 ${isSelected ? getCategoryColor(category) + ' border-2' : 'hover:bg-gray-50'}`} onClick={()=>handleCategoryToggle(category)} data-spec-id="category-filter-badge">
                    {category}
                  </Badge>);
    })}
            </div>
            
            {selectedCategories.length > 0 && (<p className="text-xs text-gray-500" data-spec-id="XLlWg7jmYPNNfnRi">
                {selectedCategories.length} de {categories.length} categorias selecionadas
              </p>)}
          </div>

          {}
          <div className="space-y-3" data-spec-id="data-source-section">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="data-source-title">
              <Rss className="w-4 h-4" data-spec-id="rss-icon"/>
              Fonte de Dados
            </h3>
            
            <div className="flex items-center justify-between" data-spec-id="data-source-controls">
              <div className="flex items-center gap-2" data-spec-id="data-source-switch">
                <Switch checked={useRealRSS} onCheckedChange={onUseRealRSSChange} data-spec-id="real-rss-toggle"/>
                <div className="flex items-center gap-2" data-spec-id="data-source-label">
                  {useRealRSS ? (<>
                      <Rss className="w-4 h-4 text-green-600" data-spec-id="rss-active-icon"/>
                      <span className="text-sm text-gray-600" data-spec-id="Qpl5JS2BTGFcFlsW">RSS Real</span>
                    </>) : (<>
                      <Database className="w-4 h-4 text-blue-600" data-spec-id="database-icon"/>
                      <span className="text-sm text-gray-600" data-spec-id="nzBlqnWoRTocM7zf">Dados Simulados</span>
                    </>)}
                </div>
              </div>
              
              <Badge variant={useRealRSS ? "default" : "secondary"} className="text-xs" data-spec-id="data-source-badge">
                {useRealRSS ? 'Ao Vivo' : 'Demo'}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-500" data-spec-id="data-source-description">
              {useRealRSS ? 'Buscando notícias reais via parser RSS com feeds de teste funcionais' : 'Usando dados simulados para demonstração (mais rápido e confiável)'}
            </p>
          </div>

          {}
          <div className="space-y-3" data-spec-id="days-filter-section">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="days-filter-title">
              <Calendar className="w-4 h-4" data-spec-id="calendar-icon"/>
              Período de Notícias
            </h3>
            
            <div className="space-y-2" data-spec-id="days-filter-controls">
              <div className="flex items-center justify-between text-sm" data-spec-id="days-filter-info">
                <span className="text-gray-600" data-spec-id="days-filter-label">Últimos dias</span>
                <Badge variant="secondary" className="text-xs" data-spec-id="days-filter-value">
                  <Clock className="w-3 h-3 mr-1" data-spec-id="sipXdlVpyZeWRutG"/>
                  {daysFilter} {daysFilter === 1 ? 'dia' : 'dias'}
                </Badge>
              </div>
              <Slider value={[
        daysFilter
    ]} onValueChange={(value)=>onDaysFilterChange(value[0])} min={1} max={7} step={1} className="w-full" data-spec-id="days-filter-slider"/>
              <div className="flex justify-between text-xs text-gray-400" data-spec-id="days-filter-range">
                <span data-spec-id="days-min">1 dia</span>
                <span data-spec-id="days-max">7 dias</span>
              </div>
              <p className="text-xs text-gray-500" data-spec-id="days-filter-description">
                Exibe apenas notícias publicadas nos últimos {daysFilter} {daysFilter === 1 ? 'dia' : 'dias'}
              </p>
            </div>
          </div>

          {}
          <div className="space-y-3" data-spec-id="auto-refresh-section">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2" data-spec-id="goUCUOh18viCE8mR">
              <Timer className="w-4 h-4" data-spec-id="CuC9j4YkNcR8vX9U"/>
              Atualização Automática
            </h3>
            
            <div className="flex items-center justify-between" data-spec-id="F2vZWGArJOwKVaF2">
              <div className="flex items-center gap-2" data-spec-id="i0hXF8w3Qg9FDiI8">
                <Switch checked={autoRefresh} onCheckedChange={onAutoRefreshChange} data-spec-id="auto-refresh-toggle"/>
                <span className="text-sm text-gray-600" data-spec-id="wLE6X8afYcAcbMvv">
                  {autoRefresh ? 'Ativada' : 'Desativada'}
                </span>
              </div>
              
              {autoRefresh && (<Badge variant="secondary" className="text-xs" data-spec-id="refresh-interval-badge">
                  A cada {refreshInterval}s
                </Badge>)}
            </div>
            
            {autoRefresh && (<div className="space-y-2" data-spec-id="SAcrFr02gzJ0i7mr">
                <div className="flex items-center justify-between text-sm" data-spec-id="RHUAtjJ4yjFhA8lF">
                  <span className="text-gray-600" data-spec-id="DKDsXfredlwH2nWp">Intervalo (segundos)</span>
                  <span className="font-medium" data-spec-id="c9HOMjkmLk99tvoB">{refreshInterval}s</span>
                </div>
                <Slider value={[
        refreshInterval
    ]} onValueChange={(value)=>onRefreshIntervalChange(value[0])} min={60} max={1800} step={60} className="w-full" data-spec-id="refresh-interval-slider"/>
                <div className="flex justify-between text-xs text-gray-400" data-spec-id="ltuVOhzecp3zDCRg">
                  <span data-spec-id="PxaPDpk7G4R4UcAe">1 min</span>
                  <span data-spec-id="gujMrjKsPLJqptVK">30 min</span>
                </div>
              </div>)}
          </div>

          {}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3" data-spec-id="yodeck-optimization-note">
            <div className="flex items-start gap-2" data-spec-id="GappGfSLe48XN6oc">
              <PlayCircle className="w-4 h-4 text-blue-600 mt-0.5" data-spec-id="VLhYSZnt5LKSJBck"/>
              <div className="text-sm" data-spec-id="8cFQTwrkbMuEaZya">
                <p className="font-medium text-blue-800 mb-1" data-spec-id="qPnVEazK1COuBje0">Otimizado para Yodeck</p>
                <p className="text-blue-600 text-xs" data-spec-id="OPXZJN0QAdhbFBNK">
                  Interface adaptada para exibição em displays digitais com navegação automática e timings otimizados.
                </p>
              </div>
            </div>
          </div>
        </CardContent>)}
    </Card>);
};
export default ConfigPanel;
