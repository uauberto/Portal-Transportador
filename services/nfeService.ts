import { NFe, NFeFilter, UserRole } from '../types';
import JSZip from 'jszip';
import { db } from './mockData';

export const getNFes = async (carrierId: string, filters: NFeFilter): Promise<NFe[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  let nfes = db.getNFes();

  // 1. Filter by Carrier (if not fetching all)
  // If carrierId is provided and valid, filter. If it's a special flag to fetch all (like from admin), skip.
  // In this local impl, we pass the carrierId explicitly.
  if (carrierId && carrierId !== 'ALL') {
    nfes = nfes.filter(n => n.carrierId === carrierId);
  }

  // 2. Filter by Date
  if (filters.issueDate) {
    nfes = nfes.filter(n => n.issuedAt.startsWith(filters.issueDate || ''));
  }

  // 3. Filter by Number
  if (filters.number) {
    nfes = nfes.filter(n => n.number.includes(filters.number || ''));
  }

  // 4. Filter by Route
  if (filters.route) {
     nfes = nfes.filter(n => n.route.toLowerCase().includes((filters.route || '').toLowerCase()));
  }

  // 5. Sort (Newest first)
  nfes.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

  return nfes;
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
 * Helper function to fetch the PDF Blob from the API without triggering download.
 */
const fetchPdfBlob = async (xmlContent: string): Promise<Blob> => {
    // Validate XML content before sending
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
                // Try to parse JSON error first
                const errorBody = await response.json();
                if (errorBody && (errorBody.error || errorBody.message)) {
                    errorMessage += ` - ${errorBody.error || errorBody.message}`;
                } else {
                    errorMessage += ` - ${JSON.stringify(errorBody)}`;
                }
            } catch (jsonErr) {
                // If not JSON, try text
                 const errorText = await response.text();
                 errorMessage += ` - ${errorText || response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        
        // If API returns JSON with Base64
        if (contentType && contentType.includes('application/json')) {
             const jsonResponse = await response.json();
             
             // Check common fields for base64
             let pdfBase64 = jsonResponse.data || jsonResponse.pdf || jsonResponse.base64;

             if (jsonResponse.url) {
                 // If it returns a URL, we need to fetch the blob from that URL
                 const urlResponse = await fetch(jsonResponse.url);
                 return await urlResponse.blob();
             } 
             
             if (pdfBase64) {
                 // Clean the base64 string (remove data URI scheme if present)
                 // e.g., "data:application/pdf;base64,JVBER..." -> "JVBER..."
                 pdfBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");

                 try {
                     // Convert Base64 to Blob
                     const byteCharacters = atob(pdfBase64);
                     const byteNumbers = new Array(byteCharacters.length);
                     for (let i = 0; i < byteCharacters.length; i++) {
                         byteNumbers[i] = byteCharacters.charCodeAt(i);
                     }
                     const byteArray = new Uint8Array(byteNumbers);
                     return new Blob([byteArray], { type: 'application/pdf' });
                 } catch (e) {
                     console.error("Erro ao decodificar Base64", e);
                     throw new Error("Falha ao decodificar o PDF retornado pela API.");
                 }
             }
             
             console.error("Resposta JSON inesperada:", jsonResponse);
             throw new Error(`Estrutura JSON desconhecida. Campos esperados não encontrados.`);
        } else {
             // If API returns Blob directly
             return await response.blob();
        }
    } catch (error: any) {
        // Handle CORS or Network errors explicitly
        if (error.message === 'Failed to fetch') {
            throw new Error('Erro de Conexão: Possível bloqueio de CORS ou falha de rede. A API pode não permitir acesso direto do navegador.');
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
    
    // Process SEQUENTIALLY to avoid 429 Too Many Requests / API Blocking
    // Using a for...of loop with await ensures we wait for one to finish before starting the next
    for (const nfe of nfes) {
        try {
            // Small delay to be gentle with the API
            if (nfes.length > 1) {
                await new Promise(r => setTimeout(r, 500)); 
            }
            
            const blob = await fetchPdfBlob(nfe.xmlContent);
            zip.file(`DANFE_${nfe.number}.pdf`, blob);
        } catch (error: any) {
            console.error(`Erro ao gerar PDF para nota ${nfe.number}:`, error);
            // Add a text file explaining the error for this specific note
            zip.file(`ERRO_NFe_${nfe.number}.txt`, `Falha ao gerar PDF: ${error.message}`);
        }
    }

    return await zip.generateAsync({ type: 'blob' });
};