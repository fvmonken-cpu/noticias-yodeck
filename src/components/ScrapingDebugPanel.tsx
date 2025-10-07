import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, CheckCircle, XCircle, Loader2, Search, Eye } from 'lucide-react';
import { testPortalScraping, getAvailablePortals, PORTAL_CONFIGS, scrapePortal } from '@/services/webScrapingService';
import { NewsItem } from '@/services/newsService';
interface ScrapingDebugPanelProps {
    isVisible: boolean;
}
const ScrapingDebugPanel: React.FC<ScrapingDebugPanelProps> = ({ isVisible })=>{
    const [testResults, setTestResults] = useState<Array<{
        portal: string;
        status: 'loading' | 'success' | 'error';
        message: string;
        count?: number;
    }>>([]);
    const [customUrl, setCustomUrl] = useState('');
    const [previewData, setPreviewData] = useState<NewsItem[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const availablePortals = getAvailablePortals();
    const testPortal = async (portalName: string)=>{
        const testId = `${portalName}-${Date.now()}`;
        setTestResults((prev)=>[
                ...prev,
                {
                    portal: portalName,
                    status: 'loading',
                    message: 'Testando scraping...'
                }
            ]);
        try {
            const isWorking = await testPortalScraping(portalName);
            setTestResults((prev)=>prev.map((result)=>result.portal === portalName && result.status === 'loading' ? {
                        ...result,
                        status: isWorking ? 'success' : 'error',
                        message: isWorking ? 'Scraping funcionando!' : 'Nenhuma notícia encontrada'
                    } : result));
        } catch (error) {
            setTestResults((prev)=>prev.map((result)=>result.portal === portalName && result.status === 'loading' ? {
                        ...result,
                        status: 'error',
                        message: `Erro: ${error}`
                    } : result));
        }
    };
    const testAllPortals = ()=>{
        setTestResults([]);
        availablePortals.forEach((portal)=>testPortal(portal));
    };
    const previewPortal = async (portalName: string)=>{
        try {
            const config = PORTAL_CONFIGS.find((p)=>p.name === portalName);
            if (!config) return;
            setShowPreview(true);
            setPreviewData([]);
            const items = await scrapePortal(config);
            setPreviewData(items.slice(0, 5));
        } catch (error) {
            console.error('Erro ao fazer preview:', error);
        }
    };
    if (!isVisible) return null;
    return (<Card className="mb-6 bg-green-50 border-green-200" data-spec-id="scraping-debug-panel">
      <CardHeader className="pb-3" data-spec-id="scraping-debug-header">
        <div className="flex items-center gap-2" data-spec-id="scraping-debug-title">
          <Search className="w-5 h-5 text-green-600" data-spec-id="search-icon"/>
          <CardTitle className="text-lg text-green-800" data-spec-id="panel-title">Debug Web Scraping</CardTitle>
          <Badge variant="outline" className="text-xs" data-spec-id="dev-badge">Desenvolvimento</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4" data-spec-id="scraping-debug-content">
        {}
        <div className="space-y-3" data-spec-id="portals-test-section">
          <div className="flex items-center justify-between" data-spec-id="portals-test-header">
            <h3 className="text-sm font-medium text-gray-700" data-spec-id="portals-title">Portais Brasileiros</h3>
            <Button onClick={testAllPortals} size="sm" variant="outline" data-spec-id="test-all-portals-btn">
              <Globe className="w-4 h-4 mr-2" data-spec-id="globe-icon"/>
              Testar Todos
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2" data-spec-id="portals-grid">
            {availablePortals.map((portal)=>(<div key={portal} className="flex gap-1" data-spec-id="portal-row">
                <Button onClick={()=>testPortal(portal)} size="sm" variant="ghost" className="flex-1 justify-start text-xs" data-spec-id="test-portal-btn">
                  <Search className="w-3 h-3 mr-2" data-spec-id="search-small-icon"/>
                  {portal}
                </Button>
                <Button onClick={()=>previewPortal(portal)} size="sm" variant="ghost" className="px-2" data-spec-id="preview-portal-btn">
                  <Eye className="w-3 h-3" data-spec-id="eye-icon"/>
                </Button>
              </div>))}
          </div>
        </div>

        {}
        <div className="space-y-2" data-spec-id="custom-url-section">
          <h3 className="text-sm font-medium text-gray-700" data-spec-id="custom-url-title">Testar Portal Customizado</h3>
          <div className="flex gap-2" data-spec-id="custom-url-input-row">
            <Input value={customUrl} onChange={(e)=>setCustomUrl(e.target.value)} placeholder="https://exemplo.com.br" className="text-xs" data-spec-id="custom-url-input"/>
            <Button onClick={()=>testPortal(customUrl)} size="sm" disabled={!customUrl.trim()} data-spec-id="test-custom-url-btn">
              Testar
            </Button>
          </div>
        </div>

        {}
        {testResults.length > 0 && (<div className="space-y-2" data-spec-id="test-results-section">
            <h3 className="text-sm font-medium text-gray-700" data-spec-id="results-title">Resultados</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto" data-spec-id="results-list">
              {testResults.map((result, index)=>(<div key={index} className="flex items-center gap-2 text-xs p-2 bg-white rounded border" data-spec-id="test-result-item">
                  {result.status === 'loading' && (<Loader2 className="w-3 h-3 animate-spin text-blue-500" data-spec-id="loading-icon"/>)}
                  {result.status === 'success' && (<CheckCircle className="w-3 h-3 text-green-500" data-spec-id="success-icon"/>)}
                  {result.status === 'error' && (<XCircle className="w-3 h-3 text-red-500" data-spec-id="error-icon"/>)}
                  
                  <div className="flex-1" data-spec-id="result-content">
                    <div className="font-medium truncate" data-spec-id="portal-name">{result.portal}</div>
                    <div className="text-gray-500" data-spec-id="result-message">{result.message}</div>
                  </div>
                </div>))}
            </div>
          </div>)}

        {}
        {showPreview && previewData.length > 0 && (<div className="space-y-2" data-spec-id="preview-section">
            <div className="flex items-center justify-between" data-spec-id="preview-header">
              <h3 className="text-sm font-medium text-gray-700" data-spec-id="preview-title">
                Preview ({previewData.length} notícias)
              </h3>
              <Button onClick={()=>setShowPreview(false)} size="sm" variant="ghost" data-spec-id="close-preview-btn">
                Fechar
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto" data-spec-id="preview-list">
              {previewData.map((item, index)=>(<div key={index} className="p-2 bg-white rounded border text-xs" data-spec-id="preview-item">
                  <div className="font-medium truncate" data-spec-id="preview-title">{item.title}</div>
                  <div className="text-gray-500 text-xs" data-spec-id="preview-source">
                    {item.source} • {new Date(item.publishedAt).toLocaleString()}
                  </div>
                  {item.imageUrl && (<div className="text-blue-500 text-xs truncate" data-spec-id="preview-image">
                      🖼️ {item.imageUrl}
                    </div>)}
                </div>))}
            </div>
          </div>)}

        {}
        <div className="bg-green-50 border border-green-200 rounded p-3" data-spec-id="info-notice">
          <p className="text-xs text-green-700" data-spec-id="info-text">
            <strong data-spec-id="info-label">Info:</strong> Web scraping implementado com Cheerio e Axios.
            Busca diretamente nos portais brasileiros por manchetes e imagens atualizadas.
            Contorna limitações de RSS desatualizados.
          </p>
        </div>
      </CardContent>
    </Card>);
};
export default ScrapingDebugPanel;
