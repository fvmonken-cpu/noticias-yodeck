import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Eye, QrCode } from "lucide-react";
import { NewsItem } from "./NewsApp";
import QRCodeGenerator from "./QRCodeGenerator";
interface NewsGridProps {
    news: NewsItem[];
}
const NewsGrid = ({ news }: NewsGridProps)=>{
    console.log('NewsGrid: Renderizando grade de notícias');
    console.log('NewsGrid: Total de notícias:', news.length);
    const formatPublishDate = (dateString: string)=>{
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} às ${hours}:${minutes}`;
    };
    const getCategoryColor = (category: string)=>{
        const colors: Record<string, string> = {
            'Transporte': 'bg-blue-100 text-blue-800',
            'Cultura': 'bg-purple-100 text-purple-800',
            'Economia': 'bg-green-100 text-green-800',
            'Esportes': 'bg-orange-100 text-orange-800',
            'Meio Ambiente': 'bg-emerald-100 text-emerald-800',
            'Tecnologia': 'bg-indigo-100 text-indigo-800',
            'Política': 'bg-red-100 text-red-800',
            'Saúde': 'bg-pink-100 text-pink-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };
    const handleReadMore = (url: string, title: string)=>{
        console.log('NewsGrid: Abrindo notícia externa:', title);
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    if (news.length === 0) {
        return (<div className="text-center py-12" data-spec-id="empty-news-state">
        <Eye className="w-16 h-16 mx-auto text-gray-300 mb-4" data-spec-id="aFAf3838WfVUKyo5"/>
        <h3 className="text-lg font-medium text-gray-500 mb-2" data-spec-id="dOnQ39yAC3eYLDf1">
          Nenhuma notícia encontrada
        </h3>
        <p className="text-gray-400" data-spec-id="YXvJstiZty8rfO13">
          Tente ajustar os filtros ou aguarde novas atualizações.
        </p>
      </div>);
    }
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-spec-id="news-grid">
      {news.map((item)=>(<Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={()=>handleReadMore(item.url, item.title)} data-spec-id="news-card">
          {item.imageUrl && (<div className="relative overflow-hidden" data-spec-id="news-image-container">
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" data-spec-id="news-image"/>
              <div className="absolute top-3 left-3" data-spec-id="CzoqQyV8xcvnsOQ3">
                <Badge className={getCategoryColor(item.category)} data-spec-id="category-badge">
                  {item.category}
                </Badge>
              </div>
            </div>)}
          
          <CardHeader className="pb-3" data-spec-id="news-card-header">
            <div className="flex items-start justify-between gap-2 mb-2" data-spec-id="u7bysjY0kJJrUeHn">
              <Badge variant="outline" className="text-xs" data-spec-id="source-badge">
                {item.source}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-gray-500" data-spec-id="publish-time">
                <Calendar className="w-3 h-3" data-spec-id="PqIeVNmUw1NQifME"/>
                {formatPublishDate(item.publishedAt)}
              </div>
            </div>
            
            <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors" data-spec-id="news-title">
              {item.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0" data-spec-id="news-content">
            <p className="text-gray-600 text-sm mb-3 line-clamp-3" data-spec-id="news-summary">
              {item.summary}
            </p>
            
            <div className="flex items-end justify-between gap-4" data-spec-id="Up6pU2lIcjSnodBn">
              <div className="flex-1" data-spec-id="MOBGXZuZte6QAhwo">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 p-0 h-auto" onClick={(e)=>{
            e.stopPropagation();
            handleReadMore(item.url, item.title);
        }} data-spec-id="read-more-button">
                  <ExternalLink className="w-4 h-4 mr-1" data-spec-id="TzsKNMEC7Zxp1Skk"/>
                  Ler completa
                </Button>
              </div>
              
              <div className="flex flex-col items-center" data-spec-id="qr-code-section">
                <QRCodeGenerator url={item.url} size={80} className="mb-1" data-spec-id="news-qr-code"/>
              </div>
            </div>
          </CardContent>
        </Card>))}
    </div>);
};
export default NewsGrid;
