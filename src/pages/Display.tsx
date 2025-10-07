import NewsCarousel from "@/components/NewsCarousel";
import { useQuery } from "@tanstack/react-query";
import { scrapeNewsFromPortals } from "@/services/newsService";

export default function Display() {
  console.log("Display: Página dedicada para exibição em TV/Yodeck - v1.1");
  
  const { data: news = [], isLoading, error } = useQuery({
    queryKey: ["news"],
    queryFn: () => scrapeNewsFromPortals(3, false, false, 5),
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
    staleTime: 60 * 1000 // Considera os dados válidos por 1 minuto
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando notícias...</div>
      </div>
    );
  }

  if (error) {
    console.error("Erro ao carregar notícias:", error);
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Erro ao carregar notícias</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black">
      <NewsCarousel news={news} />
    </div>
  );
}