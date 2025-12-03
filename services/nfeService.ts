import { NFe, NFeFilter } from '../types';
import JSZip from 'jszip';

const API_URL = 'http://localhost:3001/api';

export const getNFes = async (carrierId: string, filters: NFeFilter): Promise<NFe[]> => {
  const params = new URLSearchParams();
  
  // Se o usuário é admin, 'ALL' é passado. Se for transportadora, seu ID é passado.
  // O backend decide o que fazer com essa informação.
  if (carrierId) {
    params.append('carrierId', carrierId);
  }

  if (filters.issueDate) {
    params.append('issueDate', filters.issueDate);
  }
  if (filters.number) {
    params.append('number', filters.number);
  }
  if (filters.route) {
    params.append('route', filters.route);
  }

  const response = await fetch(`${API_URL}/nfes?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar NF-es do servidor.');
  }
  return await response.json();
};

/**
 * Generates a ZIP file containing the XMLs of the provided NFes.
 */
export const generateZip = async (nfes: NFe[], carrierName: string): Promise<Blob> => {
    const zip = new JSZip();
    
    nfes.forEach(nfe => {
        const fileName = `NFe_${nfe.id}.xml`;
        zip.file(fileName, nfe.xmlContent);
    });

    return await zip.generateAsync({ type: 'blob' });
};

/**
 * Helper function to fetch the PDF Blob from the external API without triggering download.
 */
const fetchPdfBlob = async (xmlContent: string): Promise<Blob> => {
    if (!xmlContent || xmlContent.length < 50) {
        throw new Error("Conteúdo XML inválido ou vazio.");
    }

    try {
        const response = await fetch('https://api.meudanfe.com.br/v2/fd/convert/xml-to-da', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Api-Key': '93d79eb8-e531-4d9d-a2a7-f54cb8219e52',
                'Content-Type': 'text/plain'
            },
            body: xmlContent.trim()
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorBody = await response.json();
                errorMessage += ` - ${errorBody.error || errorBody.message || JSON.stringify(errorBody)}`;
            } catch {
                 const errorText = await response.text();
                 errorMessage += ` - ${errorText || response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const jsonResponse = await response.json();
        let pdfBase64 = jsonResponse.data || jsonResponse.pdf || jsonResponse.base64;
        
        if (pdfBase64) {
             pdfBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
             const byteCharacters = atob(pdfBase64);
             const byteNumbers = new Array(byteCharacters.length);
             for (let i = 0; i < byteCharacters.length; i++) {
                 byteNumbers[i] = byteCharacters.charCodeAt(i);
             }
             const byteArray = new Uint8Array(byteNumbers);
             return new Blob([byteArray], { type: 'application/pdf' });
        }
        
        throw new Error(`Estrutura JSON da API de PDF desconhecida.`);

    } catch (error: any) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Erro de Conexão: Possível bloqueio de CORS ou falha de rede ao contatar a API de PDF.');
        }
        throw error;
    }
};

/**
 * Downloads a single PDF immediately.
 */
export const downloadDanfePdf = async (xmlContent: string): Promise<void> => {
    try {
        const blob = await fetchPdfBlob(xmlContent);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `DANFE_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (e: any) {
        console.error("PDF Generation failed:", e);
        throw e;
    }
}

/**
 * Generates a ZIP file containing the PDFs (DANFEs) of the provided NFes.
 * Uses sequential processing to avoid Rate Limiting from the API.
 */
export const generatePdfZip = async (nfes: NFe[]): Promise<Blob> => {
    const zip = new JSZip();
    
    for (const nfe of nfes) {
        try {
            if (nfes.length > 1) await new Promise(r => setTimeout(r, 500)); 
            const blob = await fetchPdfBlob(nfe.xmlContent);
            zip.file(`DANFE_${nfe.number}.pdf`, blob);
        } catch (error: any) {
            console.error(`Erro ao gerar PDF para nota ${nfe.number}:`, error);
            zip.file(`ERRO_NFe_${nfe.number}.txt`, `Falha ao gerar PDF: ${error.message}`);
        }
    }

    return await zip.generateAsync({ type: 'blob' });
};
