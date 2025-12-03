import React, { useState } from 'react';
import { NFe } from '../types';
import { X, FileText, Download, Code } from 'lucide-react';
import { Button } from './ui/Button';
import { downloadDanfePdf } from '../services/nfeService';

interface Props {
  nfe: NFe | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFeDetailModal: React.FC<Props> = ({ nfe, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'xml'>('details');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !nfe) return null;

  const handleDownloadPDF = async () => {
    if (nfe.pdfUrl) {
      window.open(nfe.pdfUrl, '_blank');
      return;
    }
    
    setIsGeneratingPdf(true);
    try {
      await downloadDanfePdf(nfe.xmlContent);
    } catch (e: any) {
      console.error("Erro PDF", e);
      alert(`Erro ao gerar PDF: ${e.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-display font-bold text-gray-900">Nota Fiscal #{nfe.number}</h3>
            <p className="text-sm text-gray-500 mt-1 font-mono">{nfe.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-8 flex space-x-8">
           <button 
             onClick={() => setActiveTab('details')}
             className={`py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition ${activeTab === 'details' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
             <div className="flex items-center gap-2"><FileText size={18}/> Detalhes</div>
           </button>
           <button 
             onClick={() => setActiveTab('xml')}
             className={`py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition ${activeTab === 'xml' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
           >
              <div className="flex items-center gap-2"><Code size={18}/> XML Original</div>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
           {activeTab === 'details' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Emitente</h4>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{nfe.senderName}</p>
                  <p className="text-gray-500 text-sm mt-1">{nfe.senderCnpj}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Destinatário</h4>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{nfe.recipientName}</p>
                  <p className="text-gray-500 text-sm mt-1">{nfe.recipientCnpj}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Dados Fiscais</h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">Série</span>
                      <span className="font-bold text-gray-900">{nfe.series}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">Emissão</span>
                      <span className="font-bold text-gray-900">{new Date(nfe.issuedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-gray-500">Rota</span>
                      <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{nfe.route}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Valor Total</h4>
                  <p className="text-4xl font-display font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nfe.amount)}
                  </p>
                </div>
             </div>
           )}

           {activeTab === 'xml' && (
             <div className="bg-dark-900 rounded-xl p-6 overflow-x-auto h-full shadow-inner border border-dark-800">
               <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                 {nfe.xmlContent}
               </pre>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex justify-end gap-4">
          <Button variant="outline" size="md" onClick={onClose}>Fechar</Button>
          
          <Button variant="secondary" size="md" onClick={handleDownloadPDF} isLoading={isGeneratingPdf}>
            <FileText size={18} className="mr-2" /> PDF (DANFE)
          </Button>

          <Button size="md" onClick={() => {
             const blob = new Blob([nfe.xmlContent], { type: 'text/xml' });
             const url = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = `NFe_${nfe.id}.xml`;
             a.click();
             window.URL.revokeObjectURL(url);
          }}>
            <Download size={18} className="mr-2" /> Download XML
          </Button>
        </div>
      </div>
    </div>
  );
};