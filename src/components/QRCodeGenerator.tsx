import { useEffect, useState } from "react";
import QRCode from "qrcode";
interface QRCodeGeneratorProps {
    url: string;
    size?: number;
    className?: string;
}
const QRCodeGenerator = ({ url, size = 120, className = "" }: QRCodeGeneratorProps)=>{
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>("");
    console.log('QRCodeGenerator: Gerando QR code para URL:', url);
    useEffect(()=>{
        const generateQRCode = async ()=>{
            try {
                setIsLoading(true);
                setError("");
                const qrCodeDataUrl = await QRCode.toDataURL(url, {
                    width: size,
                    margin: 1,
                    color: {
                        dark: '#1f2937',
                        light: '#ffffff'
                    },
                    errorCorrectionLevel: 'M'
                });
                setQrCodeUrl(qrCodeDataUrl);
                console.log('QRCodeGenerator: QR code gerado com sucesso');
            } catch (err) {
                console.error('QRCodeGenerator: Erro ao gerar QR code:', err);
                setError('Erro ao gerar QR code');
            } finally{
                setIsLoading(false);
            }
        };
        if (url) {
            generateQRCode();
        }
    }, [
        url,
        size
    ]);
    if (isLoading) {
        return (<div className={`flex items-center justify-center bg-gray-100 rounded ${className}`} style={{
            width: size,
            height: size
        }} data-spec-id="qr-code-loading">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600" data-spec-id="g3DYgXcugbRVc06V"></div>
      </div>);
    }
    if (error) {
        return (<div className={`flex items-center justify-center bg-red-50 rounded text-red-500 text-xs ${className}`} style={{
            width: size,
            height: size
        }} data-spec-id="qr-code-error">
        <span data-spec-id="gNxQDW1ye42KCB8s">QR Error</span>
      </div>);
    }
    return (<div className={`relative ${className}`} data-spec-id="qr-code-container">
      <img src={qrCodeUrl} alt={`QR Code para ${url}`} className="rounded border border-gray-200" width={size} height={size} data-spec-id="qr-code-image"/>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 text-center whitespace-nowrap" data-spec-id="5iS78K84ehT25umP">
        <span data-spec-id="qr-code-label">Escaneie para ler</span>
      </div>
    </div>);
};
export default QRCodeGenerator;
