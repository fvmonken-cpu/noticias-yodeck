import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, TrendingUp, Newspaper } from "lucide-react";
interface NewsHeaderProps {
    onRefresh: () => void;
    isLoading: boolean;
    newsCount: number;
    lastUpdate: string;
}
const NewsHeader = ({ onRefresh, isLoading, newsCount, lastUpdate }: NewsHeaderProps)=>{
    console.log('NewsHeader: Renderizando cabeçalho');
    console.log('NewsHeader: Contagem de notícias:', newsCount);
    console.log('NewsHeader: Último update:', lastUpdate);
    return (<header className="bg-white shadow-sm border-b" data-spec-id="news-header">
      <div className="container mx-auto px-4 py-4" data-spec-id="oR0sJbB9Slyt00CJ">
        <div className="flex items-center justify-between" data-spec-id="WTBS4NASt9Ku2Cz8">
          <div className="flex items-center gap-3" data-spec-id="lJpH7l0aDHGpwEEv">
            <div className="bg-blue-600 text-white p-2 rounded-lg" data-spec-id="app-logo">
              <Newspaper className="w-6 h-6" data-spec-id="mKmNOLq5mlqqanJv"/>
            </div>
            <div data-spec-id="sj7ZXSTEUJXnRDwx">
              <h1 className="text-2xl font-bold text-gray-900" data-spec-id="app-title">
                BH News Center
              </h1>
              <p className="text-sm text-gray-600" data-spec-id="app-subtitle">
                Scraping automático de portais locais • Yodeck Digital Signage
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4" data-spec-id="HDLoxgOICPrKMpD3">
            <div className="flex items-center gap-2 text-sm text-gray-600" data-spec-id="news-stats">
              <TrendingUp className="w-4 h-4" data-spec-id="ymLWtV8NXQwHG49L"/>
              <Badge variant="outline" className="font-medium" data-spec-id="edlKH0kSx8lX8m9C">
                {newsCount} notícias ativas
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600" data-spec-id="last-update">
              <Clock className="w-4 h-4" data-spec-id="q6AGslHKE67KCHwZ"/>
              <span data-spec-id="UUcxoHNxdKKb3VFX">Atualizado às {lastUpdate}</span>
            </div>
            
            <Button onClick={onRefresh} disabled={isLoading} variant="outline" size="sm" className="flex items-center gap-2" data-spec-id="refresh-button">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} data-spec-id="jxSQCEUmQvFaZwAG"/>
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>
      </div>
    </header>);
};
export default NewsHeader;
