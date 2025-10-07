import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, ExternalLink, Play, Pause, QrCode } from "lucide-react";
import { NewsItem } from "./NewsApp";
import QRCodeGenerator from "./QRCodeGenerator";
interface NewsCarouselProps {
    news: NewsItem[];
}
const NewsCarousel = ({ news }: NewsCarouselProps)=>{
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    console.log('NewsCarousel: Renderizando carrossel de notícias');
    console.log('NewsCarousel: Índice atual:', currentIndex);
    console.log('NewsCarousel: Auto-play ativo:', isAutoPlay);
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
            'Transporte': 'bg-blue-500',
            'Cultura': 'bg-purple-500',
            'Economia': 'bg-green-500',
            'Esportes': 'bg-orange-500',
            'Meio Ambiente': 'bg-emerald-500',
            'Tecnologia': 'bg-indigo-500',
            'Política': 'bg-red-500',
            'Saúde': 'bg-pink-500'
        };
        return colors[category] || 'bg-gray-500';
    };
    const nextSlide = ()=>{
        console.log('NewsCarousel: Próximo slide');
        setCurrentIndex((prevIndex)=>prevIndex === news.length - 1 ? 0 : prevIndex + 1);
    };
    const prevSlide = ()=>{
        console.log('NewsCarousel: Slide anterior');
        setCurrentIndex((prevIndex)=>prevIndex === 0 ? news.length - 1 : prevIndex - 1);
    };
    const goToSlide = (index: number)=>{
        console.log('NewsCarousel: Indo para slide:', index);
        setCurrentIndex(index);
    };
    const handleReadMore = (url: string, title: string)=>{
        console.log('NewsCarousel: Abrindo notícia externa:', title);
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    const toggleAutoPlay = ()=>{
        console.log('NewsCarousel: Alternando auto-play');
        setIsAutoPlay(!isAutoPlay);
    };
    useEffect(()=>{
        if (isAutoPlay && !isHovered && news.length > 1) {
            const interval = setInterval(()=>{
                nextSlide();
            }, 8000);
            return ()=>clearInterval(interval);
        }
    }, [
        isAutoPlay,
        isHovered,
        currentIndex,
        news.length
    ]);
    if (news.length === 0) {
        return (<div className="text-center py-12" data-spec-id="empty-carousel-state">
        <h3 className="text-lg font-medium text-gray-500 mb-2" data-spec-id="JP4IyaWgvWZXIzRZ">
          Nenhuma notícia disponível
        </h3>
        <p className="text-gray-400" data-spec-id="GJGsMVXKe1KR8BTT">
          Aguarde novas atualizações ou ajuste os filtros.
        </p>
      </div>);
    }
    const currentNews = news[currentIndex];
    return (<div className="relative" onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)} data-spec-id="news-carousel">
      {}
      <Card className="overflow-hidden bg-white shadow-xl" data-spec-id="carousel-main-card">
        <div className="relative h-96 md:h-[500px]" data-spec-id="xGswTpXR5jhLP7pN">
          {currentNews.imageUrl && (<div className="absolute inset-0" data-spec-id="carousel-image-container">
              <img src={currentNews.imageUrl} alt={currentNews.title} className="w-full h-full object-cover" data-spec-id="carousel-image"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" data-spec-id="Pi3LRQfGQix3L8eM"></div>
            </div>)}
          
          {}
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white" data-spec-id="carousel-content-overlay">
            <div className="mb-4" data-spec-id="lfazQOQjCAJUareR">
              <div className="flex items-center gap-3 mb-3" data-spec-id="an3yN9sc86UYEvnW">
                <Badge className={`${getCategoryColor(currentNews.category)} text-white border-0`} data-spec-id="carousel-category-badge">
                  {currentNews.category}
                </Badge>
                <Badge variant="outline" className="text-white border-white/50 bg-black/20" data-spec-id="carousel-source-badge">
                  {currentNews.source}
                </Badge>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" data-spec-id="carousel-title">
                {currentNews.title}
              </h2>
              
              <p className="text-lg text-gray-200 mb-4 line-clamp-2" data-spec-id="carousel-summary">
                {currentNews.summary}
              </p>
              
              <div className="flex items-end justify-between gap-6" data-spec-id="Lz8WyfLKLe4B0gdD">
                <div className="flex-1" data-spec-id="carousel-info-section">
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-3" data-spec-id="Xk9RrG6uR2TL9Lfk">
                    <div className="flex items-center gap-1" data-spec-id="carousel-time">
                      <Calendar className="w-4 h-4" data-spec-id="LmGk6WhsGjDHsUV2"/>
                      {formatPublishDate(currentNews.publishedAt)}
                    </div>
                  </div>
                  
                  <Button onClick={()=>handleReadMore(currentNews.url, currentNews.title)} className="bg-blue-600 hover:bg-blue-700 text-white" data-spec-id="carousel-read-more">
                    <ExternalLink className="w-4 h-4 mr-2" data-spec-id="rZMRhdKQSq8fIAdF"/>
                    Ler completa
                  </Button>
                </div>
                
                <div className="flex flex-col items-center text-center" data-spec-id="carousel-qr-section">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20" data-spec-id="qr-container-backdrop">
                    <QRCodeGenerator url={currentNews.url} size={100} className="mb-2" data-spec-id="carousel-qr-code"/>
                    <p className="text-xs text-white/80 font-medium" data-spec-id="qr-instruction">
                      <QrCode className="w-3 h-3 inline mr-1" data-spec-id="wJMGTo0H4tYgVmYy"/>
                      Escaneie para ler no celular
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {}
      {news.length > 1 && (<>
          <Button variant="outline" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg" onClick={prevSlide} data-spec-id="carousel-prev-button">
            <ChevronLeft className="w-5 h-5" data-spec-id="jfBbwnHGulGTcADL"/>
          </Button>
          
          <Button variant="outline" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-lg" onClick={nextSlide} data-spec-id="carousel-next-button">
            <ChevronRight className="w-5 h-5" data-spec-id="7eWkzbCF0EJw23yQ"/>
          </Button>
        </>)}

      {}
      <Button variant="outline" size="icon" className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 border-0 text-white" onClick={toggleAutoPlay} data-spec-id="carousel-autoplay-toggle">
        {isAutoPlay ? <Pause className="w-4 h-4" data-spec-id="wZi47g9P2EWS1de7"/> : <Play className="w-4 h-4" data-spec-id="cdwhOy6Njy3EVegL"/>}
      </Button>

      {}
      {news.length > 1 && (<div className="flex justify-center gap-2 mt-6" data-spec-id="carousel-indicators">
          {news.map((_, index)=>(<button key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`} onClick={()=>goToSlide(index)} data-spec-id="carousel-indicator"/>))}
        </div>)}

      {}
      {isAutoPlay && !isHovered && news.length > 1 && (<div className="absolute bottom-0 left-0 w-full h-1 bg-black/20" data-spec-id="carousel-progress-container">
          <div className="h-full bg-blue-600 transition-all duration-1000 ease-linear" style={{
        width: '100%',
        animation: 'progress 8s linear infinite'
    }} data-spec-id="carousel-progress-bar"/>
        </div>)}

      <style data-spec-id="3RMLrNonAmDoUqCs">{`
        @keyframes progress {
          from { width: 0% }
          to { width: 100% }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>);
};
export default NewsCarousel;
