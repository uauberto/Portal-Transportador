import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  login, 
  loginDemo,
  logout, 
  getAllUsers, 
  updateUserConfig, 
  getAllCarriers, 
  createCarrier, 
  updateCarrier, 
  deleteCarrier,
  getCurrentSession
} from './services/authService';
import { getNFes, generateZip, generatePdfZip } from './services/nfeService';
import { User, NFe, NFeStatus, UserRole, Transportadora } from './types';
import { Button } from './components/ui/Button';
import { NFeDetailModal } from './components/NFeDetailModal';
import { AdminSqlScripts } from './components/AdminSqlScripts';
import { 
  Truck, 
  LogOut, 
  FileArchive, 
  Calendar, 
  ChevronRight, 
  LayoutDashboard,
  Package,
  MapPin,
  FileText,
  Users,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Info,
  Building,
  Plus,
  Edit2,
  Trash2,
  Database
} from 'lucide-react';

// --- Auth Context
const AuthContext = React.createContext<{
  user: User | null;
  loginUser: (u: string, p: string) => Promise<void>;
  loginUserDemo: () => Promise<void>;
  logoutUser: () => void;
  isLoadingAuth: boolean;
}>({ user: null, loginUser: async () => {}, loginUserDemo: async () => {}, logoutUser: () => {}, isLoadingAuth: true });

// --- Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole }: { children?: React.ReactNode, requiredRole?: UserRole }) => {
  const { user, isLoadingAuth } = React.useContext(AuthContext);
  
  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-4 border-brand-500 rounded-full border-t-transparent"></div></div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  
  if (requiredRole && user.role !== requiredRole) {
     return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// --- Components Pages

const LoginPage = () => {
  const [email, setEmail] = useState('admin@portal.com'); // Pre-fill for convenience
  const [password, setPassword] = useState('123'); // Pre-fill for convenience
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser, loginUserDemo } = React.useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await loginUser(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha no login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async () => {
    setIsLoading(true);
    try {
      await loginUserDemo();
    } catch (e: any) {
      setError(e.message || "Erro ao iniciar demo");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-900 font-sans p-4 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
      
      <div className="text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md mb-6 shadow-2xl border border-white/20">
           <Truck className="text-white" size={48} />
        </div>
        <h2 className="text-4xl font-display font-bold text-white tracking-wide uppercase drop-shadow-md">Portal do Transportador</h2>
        <p className="text-blue-200 mt-2 font-light text-lg">Logística segura e eficiente</p>
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="p-10">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center font-display">Acesso ao Portal</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
              <input 
                type="email" 
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-gray-50 text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent outline-none transition duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 text-base text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-600 focus:bg-white focus:border-transparent outline-none transition duration-200 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-brand-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-lg flex items-center gap-2">
                 <Info size={18} /> {error}
              </div>
            )}

            <Button type="submit" className="w-full py-4 text-lg font-bold shadow-lg shadow-brand-500/30" size="lg" isLoading={isLoading}>
              ENTRAR
            </Button>
            
            <Button type="button" onClick={handleDemo} className="w-full" variant="outline">Testar com Usuário Admin</Button>

          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-brand-200 uppercase font-bold tracking-widest opacity-80">
          Portal do Transportador &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};

// --- ADMIN USER MANAGEMENT PAGE ---

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [carriers, setCarriers] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllUsers(), getAllCarriers()])
      .then(([usersData, carriersData]) => {
        setUsers(usersData);
        setCarriers(carriersData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const originalUsers = users;
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
      await updateUserConfig(userId, { role: newRole });
    } catch (err) {
      alert("Falha ao atualizar a função do usuário.");
      setUsers(originalUsers);
    }
  };

  const handleCarrierChange = async (userId: string, carrierId: string) => {
     const originalUsers = users;
     setUsers(users.map(u => u.id === userId ? { ...u, carrierId: carrierId || undefined } : u));
     try {
       await updateUserConfig(userId, { carrierId: carrierId || undefined });
     } catch (err) {
       alert("Falha ao vincular a transportadora.");
       setUsers(originalUsers);
     }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900">Gerenciamento de Acessos</h1>
        <p className="text-gray-500 text-lg mt-1">Configure quem pode acessar o sistema e quais dados podem visualizar.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-base">
          <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Usuário</th>
              <th className="px-6 py-5">Email</th>
              <th className="px-6 py-5">Função (Role)</th>
              <th className="px-6 py-5">Transportadora Vinculada</th>
              <th className="px-6 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando usuários...</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-5 font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-5 text-gray-600">{u.email}</td>
                  <td className="px-6 py-5">
                    <select 
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className={`border rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wide cursor-pointer focus:ring-2 focus:ring-offset-1 transition ${u.role === UserRole.ADMIN ? 'text-red-700 bg-red-50 border-red-200 focus:ring-red-200' : 'text-blue-700 bg-blue-50 border-blue-200 focus:ring-blue-200'}`}
                    >
                      <option value={UserRole.CARRIER}>Transportadora</option>
                      <option value={UserRole.ADMIN}>Administrador</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    {u.role === UserRole.ADMIN ? (
                      <span className="text-gray-400 italic text-sm">Acesso total</span>
                    ) : (
                      <select
                        value={u.carrierId || ''}
                        onChange={(e) => handleCarrierChange(u.id, e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full max-w-xs focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm bg-white"
                      >
                         <option value="">-- Nenhuma --</option>
                         {carriers.map(c => (
                           <option key={c.id} value={c.id}>{c.name}</option>
                         ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 bg-amber-50 border border-amber-200 p-5 rounded-lg flex gap-4 text-base text-amber-900 shadow-sm">
        <Lock size={24} className="flex-shrink-0 text-amber-600" />
        <div>
           <p className="font-bold mb-1">Nota de Segurança</p>
           <p className="text-amber-800/80 text-sm leading-relaxed">Usuários configurados como <strong>ADMINISTRADOR</strong> possuem acesso irrestrito. Usuários <strong>TRANSPORTADORA</strong> visualizam apenas notas fiscais vinculadas à sua organização.</p>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN CARRIER MANAGEMENT PAGE ---

const AdminCarrierManagement = () => {
  const [carriers, setCarriers] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');

  const fetchCarriers = () => {
    setLoading(true);
    getAllCarriers().then(setCarriers).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  const handleOpenModal = (carrier?: Transportadora) => {
    if (carrier) {
      setEditingId(carrier.id);
      setFormName(carrier.name);
      setFormCnpj(carrier.cnpj);
    } else {
      setEditingId(null);
      setFormName('');
      setFormCnpj('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCarrier(editingId, { name: formName, cnpj: formCnpj });
      } else {
        await createCarrier({ name: formName, cnpj: formCnpj });
      }
      setIsModalOpen(false);
      fetchCarriers();
    } catch (err) {
      alert("Erro ao salvar transportadora");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transportadora?")) {
      await deleteCarrier(id);
      fetchCarriers();
    }
  };

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-display font-bold text-gray-900">Transportadoras</h1>
           <p className="text-gray-500 text-lg mt-1">Cadastre e gerencie as empresas parceiras.</p>
        </div>
        <Button onClick={() => handleOpenModal()} size="lg" className="shadow-md shadow-brand-500/20">
           <Plus size={20} className="mr-2" /> Nova Transportadora
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-base">
          <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-6 py-5">Razão Social / Nome</th>
              <th className="px-6 py-5">CNPJ</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan={3} className="p-8 text-center text-gray-500">Carregando...</td></tr>
            ) : carriers.length === 0 ? (
               <tr><td colSpan={3} className="p-12 text-center text-gray-400">Nenhuma transportadora cadastrada.</td></tr>
            ) : (
              carriers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-5 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-5 text-gray-600 font-mono text-base">{c.cnpj}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(c)}
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition" 
                        title="Editar"
                      >
                         <Edit2 size={18} />
                      </button>
                      <button 
                         onClick={() => handleDelete(c.id)}
                         className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                         title="Excluir"
                      >
                         <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-scale-in">
             <h3 className="text-2xl font-display font-bold text-gray-900 mb-6">
               {editingId ? 'Editar Transportadora' : 'Nova Transportadora'}
             </h3>
             <form onSubmit={handleSave} className="space-y-5">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome</label>
                 <input 
                   type="text" 
                   value={formName} 
                   onChange={e => setFormName(e.target.value)}
                   className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                   required
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CNPJ</label>
                 <input 
                   type="text" 
                   value={formCnpj} 
                   onChange={e => setFormCnpj(e.target.value)}
                   className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                   required
                 />
               </div>
               <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                 <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                 <Button type="submit" isLoading={isSubmitting}>Salvar</Button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};


// --- DASHBOARD ---

const DashboardLayout = () => {
  const { user, logoutUser } = React.useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { label: 'Documentos Fiscais', path: '/dashboard', icon: Package, adminOnly: false },
  ];

  if (user?.role === UserRole.ADMIN) {
    navItems.push(
        { label: 'Usuários & Permissões', path: '/admin/users', icon: Users, adminOnly: true },
        { label: 'Transportadoras', path: '/admin/carriers', icon: Building, adminOnly: true },
        { label: 'Scripts SQL', path: '/admin/sql', icon: Database, adminOnly: true }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <aside className="bg-dark-900 text-slate-300 w-full md:w-72 flex-shrink-0 flex flex-col shadow-2xl z-20">
        
        <div className="h-20 flex items-center px-6 bg-dark-950/50 border-b border-dark-800 shadow-sm backdrop-blur-sm">
          <Truck className="text-brand-500 mr-3 flex-shrink-0" size={28} />
          <span className="font-display font-bold text-base text-white tracking-wide uppercase leading-tight">Portal do<br/>Transportador</span>
        </div>

        <div className="px-6 py-8 border-b border-dark-800/50 bg-gradient-to-b from-dark-800 to-transparent">
           <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2">Conectado como</p>
           <div className="flex items-center gap-3 text-white text-base font-medium truncate">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
             {user?.name}
           </div>
        </div>

        <nav className="flex-1 py-8 space-y-1 overflow-y-auto">
           {navItems.map((item, idx) => {
             const isActive = location.pathname === item.path;
             return (
               <Link 
                  key={idx} 
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group ${
                    isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
                    : 'text-slate-400 hover:bg-dark-800 hover:text-white'
                  }`}
               >
                 <item.icon size={20} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand-400'}`} />
                 <span className="text-sm font-medium">{item.label}</span>
               </Link>
             )
           })}
        </nav>

        <div className="p-4 border-t border-dark-800 bg-dark-950/30">
           <button onClick={logoutUser} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition w-full px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400">
             <LogOut size={18} /> Sair
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
           <div className="flex items-center text-gray-400 text-sm font-medium">
              <span className="mr-2">Portal</span> <ChevronRight size={14} /> <span className="ml-2 text-gray-900">
                {location.pathname.includes('admin') ? 'Administração' : 'Dashboard'}
              </span>
           </div>
           <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer transition">
                 <Settings size={18} />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 relative">
          <Routes>
            <Route path="/" element={<NFeList user={user} />} />
            <Route path="/users" element={<AdminUserManagement />} />
             <Route path="/carriers" element={<AdminCarrierManagement />} />
             <Route path="/sql" element={<AdminSqlScripts />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// --- NFE LIST COMPONENT ---

const NFeList = ({ user }: { user: User | null }) => {
  const [nfes, setNfes] = useState<NFe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [filterDate, setFilterDate] = useState('');
  const [filterNumber, setFilterNumber] = useState('');
  const [filterRoute, setFilterRoute] = useState('');

  const [downloading, setDownloading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [viewNFe, setViewNFe] = useState<NFe | null>(null);

  useEffect(() => {
    if (user) {
      const targetCarrierId = user.role === UserRole.ADMIN ? 'ALL' : user.carrierId;
      
      setLoading(true);
      getNFes(targetCarrierId || '', { 
        issueDate: filterDate, 
        number: filterNumber, 
        route: filterRoute 
      })
        .then(setNfes)
        .catch(e => {
            console.error(e);
            alert("Falha ao carregar documentos: " + e.message);
        })
        .finally(() => setLoading(false));
    }
  }, [user, filterDate, filterNumber, filterRoute]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(nfes.map(n => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;
    setDownloading(true);
    try {
      const selectedNfes = nfes.filter(n => selectedIds.has(n.id));
      const blob = await generateZip(selectedNfes, user?.name || 'Transportadora');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `xmls_selecionados_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Erro ao gerar ZIP de XMLs");
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkPdfDownload = async () => {
    if (selectedIds.size === 0) return;
    setDownloadingPdf(true);
    try {
      const selectedNfes = nfes.filter(n => selectedIds.has(n.id));
      const blob = await generatePdfZip(selectedNfes);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `pdfs_danfes_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      alert("Erro ao gerar ZIP de PDFs. Verifique o console.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="p-8 md:p-10 animate-fade-in">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Documentos Fiscais</h1>
            <p className="text-gray-500 text-lg mt-1">Visualize, filtre e baixe os arquivos XML e PDF.</p>
          </div>
          <div className="flex gap-4">
             {selectedIds.size > 0 && (
                <div className="bg-brand-50 border border-brand-200 text-brand-700 px-5 py-2 rounded-lg flex items-center gap-4 animate-scale-in shadow-sm">
                  <span className="font-medium text-sm">{selectedIds.size} selecionadas</span>
                  
                  <Button size="sm" onClick={handleBulkDownload} isLoading={downloading} disabled={downloadingPdf} variant="outline" className="bg-white hover:bg-gray-50">
                    <FileArchive size={18} className="mr-2" /> XML (.ZIP)
                  </Button>

                  <Button size="sm" onClick={handleBulkPdfDownload} isLoading={downloadingPdf} disabled={downloading}>
                    <FileText size={18} className="mr-2" /> PDF (.ZIP)
                  </Button>
                </div>
             )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Data</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                <input 
                  type="date" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-transparent outline-none transition-all"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Número</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Ex: 123456" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-transparent outline-none transition-all"
                  value={filterNumber}
                  onChange={e => setFilterNumber(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Rota</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Ex: SP-RJ" 
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white focus:border-transparent outline-none transition-all"
                  value={filterRoute}
                  onChange={e => setFilterRoute(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 w-16 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={nfes.length > 0 && selectedIds.size === nfes.length}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-8 py-5">Nota</th>
                  <th className="px-8 py-5">Data</th>
                  <th className="px-8 py-5">Origem / Destino</th>
                  <th className="px-8 py-5">Rota</th>
                  <th className="px-8 py-5 w-32">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="p-16 text-center text-gray-400 flex flex-col items-center"><div className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full mb-2"></div>Carregando...</td></tr>
                ) : nfes.length === 0 ? (
                  <tr><td colSpan={6} className="p-16 text-center text-gray-400">Nenhum documento encontrado.</td></tr>
                ) : (
                  nfes.map((nfe) => (
                    <tr key={nfe.id} className={`group hover:bg-brand-50/30 transition duration-150 ${selectedIds.has(nfe.id) ? 'bg-brand-50/60' : ''}`}>
                      <td className="px-8 py-5 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(nfe.id)}
                          onChange={() => handleSelectOne(nfe.id)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-bold text-gray-900 text-base">#{nfe.number}</span>
                      </td>
                      <td className="px-8 py-5 text-gray-500 font-medium">
                         {new Date(nfe.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex flex-col">
                           <span className="font-semibold text-gray-800">{nfe.senderName}</span>
                           <span className="text-gray-400 text-xs mt-0.5 flex items-center gap-1"><Truck size={10}/> {nfe.recipientName}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <span className="inline-block px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                           {nfe.route}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => setViewNFe(nfe)}
                          className="text-brand-600 hover:text-brand-800 p-2 rounded-full hover:bg-brand-50 transition transform hover:scale-110 active:scale-95"
                          title="Visualizar"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <NFeDetailModal 
          isOpen={!!viewNFe} 
          nfe={viewNFe} 
          onClose={() => setViewNFe(null)} 
        />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    try {
      const currentUser = getCurrentSession();
      setUser(currentUser);
    } catch (e) {
      console.error("Auth check failed", e);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const loginUser = async (u: string, p: string) => {
    const userData = await login(u, p);
    setUser(userData);
  };

  const loginUserDemo = async () => {
    const userData = await loginDemo();
    setUser(userData);
  }

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, loginUserDemo, logoutUser, isLoadingAuth }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
}
