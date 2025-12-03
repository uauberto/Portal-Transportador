import React, { useState } from 'react';
import { Copy, Check, Database } from 'lucide-react';

// O conteúdo dos scripts SQL é incorporado aqui como strings para fácil exibição.
const sqlTransportadoras = `
-- Estrutura da tabela para Transportadoras
-- Utilizada para vincular usuários e NF-es a uma empresa específica.
CREATE TABLE transportadoras (
    id VARCHAR(255) PRIMARY KEY,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);
`.trim();

const sqlUsers = `
-- Estrutura da tabela para Usuários
-- Gerencia o acesso ao sistema. A senha deve ser armazenada como HASH.
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'CARRIER')),
    password_hash VARCHAR(255) NOT NULL,
    carrierId VARCHAR(255),
    FOREIGN KEY (carrierId) REFERENCES transportadoras(id) ON DELETE SET NULL
);
`.trim();

const sqlNfes = `
-- Estrutura da tabela para Notas Fiscais Eletrônicas (NF-e)
-- Armazena os dados principais e o XML completo de cada nota.
CREATE TABLE nfes (
    id VARCHAR(44) PRIMARY KEY, -- Chave de acesso da NF-e (44 caracteres)
    number VARCHAR(20) NOT NULL,
    series VARCHAR(10) NOT NULL,
    issuedAt TIMESTAMP WITH TIME ZONE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('AUTORIZADA', 'CANCELADA', 'PENDENTE')),
    route VARCHAR(255),
    senderName VARCHAR(255) NOT NULL,
    senderCnpj VARCHAR(20) NOT NULL,
    recipientName VARCHAR(255) NOT NULL,
    recipientCnpj VARCHAR(20) NOT NULL,
    carrierId VARCHAR(255) NOT NULL,
    xmlContent TEXT NOT NULL,
    FOREIGN KEY (carrierId) REFERENCES transportadoras(id) ON DELETE CASCADE
);
`.trim();

const sqlSeed = `
-- Dados iniciais para popular o banco de dados (SEED)

-- 1. Inserir Transportadoras
INSERT INTO transportadoras (id, name, cnpj) VALUES
('c1', 'TransRápido Logística', '12.345.678/0001-90'),
('c2', 'Super Via Transportes', '98.765.432/0001-10');

-- 2. Inserir Usuários (IMPORTANTE: A senha '123' é um placeholder, use um hash real gerado no seu backend!)
INSERT INTO users (id, name, email, role, password_hash, carrierId) VALUES
('u1', 'Administrador', 'admin@portal.com', 'ADMIN', 'seu_hash_para_senha_123', NULL),
('u2', 'Operador TransRápido', 'user@transrapido.com', 'CARRIER', 'seu_hash_para_senha_123', 'c1');

-- 3. Inserir Notas Fiscais (o XML completo deve ser inserido no campo xmlContent)
INSERT INTO nfes (id, number, series, issuedAt, amount, status, route, senderName, senderCnpj, recipientName, recipientCnpj, carrierId, xmlContent) VALUES
('31250517291576000158550120009513541348716910', '951354', '12', '2025-05-04T14:47:00Z', 876.13, 'AUTORIZADA', 'MG-Capital', 'ORGAFARMA ORGANIZACAO FARMACEUTICA', '17291576000158', 'ALESSANDRO REZENDE SANTOS', '09412526000153', 'c1', '<?xml version="1.0" ...></nfeProc>'),
('35240517291576000158550120009513551348716911', '951355', '12', '2025-05-05T12:15:00Z', 1420.50, 'AUTORIZADA', 'SP-MG', 'INDUSTRIA ABC LTDA', '11111111000111', 'DROGARIA SAO PAULO', '61412110000155', 'c1', '<?xml version="1.0" ...></nfeProc>'),
('35240517291576000158550120009513551348716999', '888001', '1', '2025-05-06T17:30:00Z', 5500.00, 'PENDENTE', 'Sul-Sudeste', 'MOVEIS ELEGANCE', '22222222000122', 'LOJA DE DECORACAO', '33333333000133', 'c2', '<?xml version="1.0" ...></nfeProc>');
`.trim();

const CodeBlock: React.FC<{ title: string; code: string }> = ({ title, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 font-display text-lg">{title}</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-md transition"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <pre className="p-6 text-sm text-indigo-900 bg-indigo-50/30 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const AdminSqlScripts = () => {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
          <Database size={32} className="text-brand-600"/>
          Scripts do Banco de Dados
        </h1>
        <p className="text-gray-500 text-lg mt-1">
          Utilize estes scripts para criar a estrutura e popular seu banco de dados SQL localmente.
        </p>
      </div>

      <CodeBlock title="Tabela: transportadoras" code={sqlTransportadoras} />
      <CodeBlock title="Tabela: users" code={sqlUsers} />
      <CodeBlock title="Tabela: nfes" code={sqlNfes} />
      <CodeBlock title="Dados Iniciais (Seed)" code={sqlSeed} />

    </div>
  );
};
