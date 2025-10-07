import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Rss, CheckCircle, XCircle, Loader2, Globe } from "lucide-react";
import { testRSSFeed } from '../services/rssService';
const RSSDebugPanel = ({ isVisible }: {
    isVisible: boolean;
})=>{
    const [testUrl, setTestUrl] = useState('');
    const [testResults, setTestResults] = useState<Array<{
        url: string;
        status: 'success' | 'error' | 'loading';
        message: string;
    }>>([]);
    const testFeeds = [
        {
            name: 'O\'Reilly Radar',
            url: 'https://feeds.feedburner.com/oreilly/radar/pt'
        },
        {
            name: 'CNN Internacional',
            url: 'https://rss.cnn.com/rss/edition.rss'
        },
        {
            name: 'Reuters Top News',
            url: 'https://feeds.reuters.com/reuters/topNews'
        },
        {
            name: 'Hacker News',
            url: 'https://hnrss.org/frontpage'
        }
    ];
    const testFeedUrl = async (url: string, name: string = '')=>{
        const testId = `${name || url}-${Date.now()}`;
        setTestResults((prev)=>[
                ...prev,
                {
                    url: `${name} (${url})`,
                    status: 'loading',
                    message: 'Testando...'
                }
            ]);
        try {
            const isWorking = await testRSSFeed(url);
            setTestResults((prev)=>prev.map((result)=>result.url === `${name} (${url})` ? {
                        ...result,
                        status: isWorking ? 'success' : 'error',
                        message: isWorking ? 'RSS funcionando!' : 'RSS não acessível'
                    } : result));
        } catch (error) {
            setTestResults((prev)=>prev.map((result)=>result.url === `${name} (${url})` ? {
                        ...result,
                        status: 'error',
                        message: `Erro: ${error}`
                    } : result));
        }
    };
    const testAllFeeds = ()=>{
        setTestResults([]);
        testFeeds.forEach((feed)=>testFeedUrl(feed.url, feed.name));
    };
    const testCustomUrl = ()=>{
        if (testUrl.trim()) {
            testFeedUrl(testUrl.trim());
            setTestUrl('');
        }
    };
    if (!isVisible) return null;
    return (<Card className="mb-6 bg-yellow-50 border-yellow-200" data-spec-id="rss-debug-panel">
      <CardHeader className="pb-3" data-spec-id="rss-debug-header">
        <div className="flex items-center gap-2" data-spec-id="rss-debug-title">
          <Rss className="w-5 h-5 text-yellow-600" data-spec-id="WV8R1BeTUAZQ7DXE"/>
          <CardTitle className="text-lg text-yellow-800" data-spec-id="oSWZCahpG6mY3Usw">Debug RSS Feeds</CardTitle>
          <Badge variant="outline" className="text-xs" data-spec-id="mp1HYCZ1C16Zu5QT">Desenvolvimento</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4" data-spec-id="rss-debug-content">
        {}
        <div className="space-y-3" data-spec-id="main-feeds-test">
          <div className="flex items-center justify-between" data-spec-id="main-feeds-header">
            <h3 className="text-sm font-medium text-gray-700" data-spec-id="otAtHncBUxcTp9Et">Feeds de Teste</h3>
            <Button onClick={testAllFeeds} size="sm" variant="outline" data-spec-id="test-all-feeds-btn">
              <Globe className="w-4 h-4 mr-2" data-spec-id="67BSGVh652yPVD4m"/>
              Testar Todos
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2" data-spec-id="feeds-grid">
            {testFeeds.map((feed)=>(<Button key={feed.url} onClick={()=>testFeedUrl(feed.url, feed.name)} size="sm" variant="ghost" className="justify-start text-xs" data-spec-id="individual-feed-btn">
                <Rss className="w-3 h-3 mr-2" data-spec-id="jL2ad3Pt7DMA2lyo"/>
                {feed.name}
              </Button>))}
          </div>
        </div>

        {}
        <div className="space-y-2" data-spec-id="custom-url-test">
          <h3 className="text-sm font-medium text-gray-700" data-spec-id="q2jlX4Suygvgiv6C">Testar URL Customizada</h3>
          <div className="flex gap-2" data-spec-id="custom-url-input">
            <Input value={testUrl} onChange={(e)=>setTestUrl(e.target.value)} placeholder="https://exemplo.com/rss" className="text-xs" data-spec-id="url-input"/>
            <Button onClick={testCustomUrl} size="sm" disabled={!testUrl.trim()} data-spec-id="test-custom-btn">
              Testar
            </Button>
          </div>
        </div>

        {}
        {testResults.length > 0 && (<div className="space-y-2" data-spec-id="test-results">
            <h3 className="text-sm font-medium text-gray-700" data-spec-id="HdGRFPymsN9Q4Ove">Resultados</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto" data-spec-id="results-list">
              {testResults.map((result, index)=>(<div key={index} className="flex items-center gap-2 text-xs p-2 bg-white rounded border" data-spec-id="test-result-item">
                  {result.status === 'loading' && <Loader2 className="w-3 h-3 animate-spin text-blue-500" data-spec-id="F15vWnmyTnW2HA9Z"/>}
                  {result.status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" data-spec-id="gyPUGdrVAKZ4om0c"/>}
                  {result.status === 'error' && <XCircle className="w-3 h-3 text-red-500" data-spec-id="7tS2kYk2I5hWThVS"/>}
                  
                  <div className="flex-1" data-spec-id="xGq4kbATfF0oNm3V">
                    <div className="font-medium truncate" data-spec-id="OQYtb73o0nQ6hmIg">{result.url}</div>
                    <div className="text-gray-500" data-spec-id="AV1GF4GwzwxXMw3Y">{result.message}</div>
                  </div>
                </div>))}
            </div>
          </div>)}

        {}
        <div className="bg-blue-50 border border-blue-200 rounded p-3" data-spec-id="info-notice">
          <p className="text-xs text-blue-700" data-spec-id="info-text">
            <strong data-spec-id="FCTlVV7Sl71rJEQX">Info:</strong> Parser RSS implementado com fast-xml-parser e proxy AllOrigins para compatibilidade com browser.
            Feeds de teste incluem portais nacionais e internacionais conhecidos.
          </p>
        </div>
      </CardContent>
    </Card>);
};
export default RSSDebugPanel;
