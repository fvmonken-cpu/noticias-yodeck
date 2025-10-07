import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Wifi, WifiOff, Globe, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
interface ConnectionStatusProps {
    isLoading: boolean;
    hasData: boolean;
    error?: Error | null;
    useWebScraping: boolean;
    dataSource: 'scraping' | 'rss' | 'fallback';
}
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isLoading, hasData, error, useWebScraping, dataSource })=>{
    if (isLoading) {
        return (<Card className="p-4 mb-4 bg-blue-50 border-blue-200" data-spec-id="loading-status">
        <div className="flex items-center gap-3" data-spec-id="H1fTS5Ni2PPi9ZvC">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" data-spec-id="i9lgAhlMJSNcJ4Gw"/>
          <div data-spec-id="D5qaw7Ru5RmetIIn">
            <p className="font-medium text-blue-900" data-spec-id="N3SgTsNASadN16YJ">
              {useWebScraping ? 'Conectando aos portais de notícias...' : 'Carregando notícias...'}
            </p>
            <p className="text-sm text-blue-600" data-spec-id="ylAx7aV2Kp7Iqlqn">
              {useWebScraping ? 'Tentando múltiplos proxies para acessar os sites de notícias' : 'Buscando as últimas notícias disponíveis'}
            </p>
          </div>
        </div>
      </Card>);
    }
    const getStatusInfo = ()=>{
        if (error && !hasData) {
            return {
                icon: <WifiOff className="w-5 h-5 text-red-600" data-spec-id="JebIxzWrCi5ylfPy"/>,
                title: 'Falha na conexão',
                description: 'Não foi possível acessar os portais de notícias',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-900'
            };
        }
        if (dataSource === 'fallback') {
            return {
                icon: <AlertTriangle className="w-5 h-5 text-yellow-600" data-spec-id="SmfpfuOZmYzwKX6K"/>,
                title: 'Modo offline',
                description: 'Exibindo notícias simuladas - portais inacessíveis',
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-200',
                textColor: 'text-yellow-900'
            };
        }
        if (dataSource === 'scraping') {
            return {
                icon: <Globe className="w-5 h-5 text-green-600" data-spec-id="ywmxcFS4tjhrGTqa"/>,
                title: 'Web scraping ativo',
                description: 'Conectado a múltiplos portais locais (alguns podem falhar por bloqueios CORS)',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-900'
            };
        }
        if (dataSource === 'rss') {
            return {
                icon: <Wifi className="w-5 h-5 text-blue-600" data-spec-id="nXfGmNLXa9tv0Sll"/>,
                title: 'RSS conectado',
                description: 'Notícias via feeds RSS',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-900'
            };
        }
        return {
            icon: <CheckCircle className="w-5 h-5 text-green-600" data-spec-id="iKTQaoaOM2D5K5o4"/>,
            title: 'Conectado',
            description: 'Notícias atualizadas',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-900'
        };
    };
    const statusInfo = getStatusInfo();
    return (<Card className={`p-3 mb-4 ${statusInfo.bgColor} ${statusInfo.borderColor}`} data-spec-id="connection-status">
      <div className="flex items-center justify-between" data-spec-id="GVFu6tiQKENT0mpD">
        <div className="flex items-center gap-3" data-spec-id="kCzLVlmhVWGBOZQy">
          {statusInfo.icon}
          <div data-spec-id="ZFL0YJncez23fR5O">
            <p className={`text-sm font-medium ${statusInfo.textColor}`} data-spec-id="KgGnIWhw6dHYTFcH">
              {statusInfo.title}
            </p>
            <p className="text-xs text-gray-600" data-spec-id="5jTYaWHiCrf5DQhi">
              {statusInfo.description}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2" data-spec-id="3IRolRKvUp3SpUpv">
          <Badge variant="outline" className="text-xs" data-spec-id="sa0Cuv5lDkl1GUHu">
            {dataSource === 'scraping' ? 'Scraping' : dataSource === 'rss' ? 'RSS' : 'Simulado'}
          </Badge>
          {hasData && (<Badge variant="secondary" className="text-xs" data-spec-id="1HaCIg1Zy6ZbfqU0">
              {hasData ? 'Online' : 'Offline'}
            </Badge>)}
        </div>
      </div>
    </Card>);
};
export default ConnectionStatus;
