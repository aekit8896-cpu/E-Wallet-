import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, FileText, Receipt, Settings, Users, LogOut,
  Plus, Printer, CheckCircle, FileCheck, Trash2,
  Menu, X, Save, Building, UserPlus
} from 'lucide-react';

// --- Constants & Config ---

const LOGO_URL = 'https://img2.pic.in.th/Gemini_Generated_Image_cwzzrfcwzzrfcwzz.png';

// Default Data (Used if LocalStorage is empty)
const DEFAULT_OFFICE_INFO = {
  village: 'ໂພນຕ້ອງ',
  district: 'ໄຊເສດຖາ',
  province: 'ນະຄອນຫຼວງວຽງຈັນ',
  taxId: '000-111-222',
  headerLine1: 'ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ',
  headerLine2: 'ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ'
};

const DEFAULT_USERS = [
  { id: 1, name: 'ທ່ານ ນາຍບ້ານ', username: 'admin', password: 'admin', role: 'admin' },
  { id: 2, name: 'ນາງ ສົມສີ (ທະບຽນ)', username: 'staff', password: '1234', role: 'staff' },
];

const DEFAULT_DOC_TYPES = {
  residency: { id: 'residency', name: 'ໃບຢັ້ງຢືນທີ່ຢູ່', price: 10000 },
  guarantee: { id: 'guarantee', name: 'ໃບຄ້ຳປະກັນ', price: 20000 },
  family: { id: 'family', name: 'ໃບຢັ້ງຢືນຄອບຄົວ', price: 15000 },
  character: { id: 'character', name: 'ໃບຢັ້ງຢືນຄຸນສົມບັດ', price: 25000 },
  moving: { id: 'moving', name: 'ໃບຍົກຍ້າຍ', price: 30000 },
  other: { id: 'other', name: 'ບໍລິການອື່ນໆ', price: 5000 },
};

// --- Helper Functions ---

const formatCurrency = (amount: number) => new Intl.NumberFormat('lo-LA', { style: 'currency', currency: 'LAK' }).format(amount);
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('lo-LA', { year: 'numeric', month: 'long', day: 'numeric' });
};
const generateId = (prefix: string) => `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

// --- Components ---

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
      active ? 'bg-blue-800 text-white shadow-md translate-x-1' : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
    }`}
  >
    <div className={active ? 'text-white' : 'text-blue-300'}>{icon}</div>
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, subtext, icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-xl ${colorClass} bg-opacity-10`}>
      {React.cloneElement(icon, { className: `w-8 h-8 ${colorClass.replace('bg-', 'text-')}` })}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 font-[Phetsarath OT]">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  </div>
);

// --- Main App ---

export default function VOMSApp() {
  // Global Setup
  useEffect(() => {
    // Add Google Font for fallback
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // --- State ---
  // Data State with LocalStorage
  const [officeInfo, setOfficeInfo] = useState(() => JSON.parse(localStorage.getItem('voms_office') || 'null') || DEFAULT_OFFICE_INFO);
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('voms_users') || 'null') || DEFAULT_USERS);
  const [fees, setFees] = useState(() => JSON.parse(localStorage.getItem('voms_fees') || 'null') || DEFAULT_DOC_TYPES);
  const [documents, setDocuments] = useState(() => JSON.parse(localStorage.getItem('voms_docs') || 'null') || []);

  // Sync to LocalStorage
  useEffect(() => localStorage.setItem('voms_office', JSON.stringify(officeInfo)), [officeInfo]);
  useEffect(() => localStorage.setItem('voms_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('voms_fees', JSON.stringify(fees)), [fees]);
  useEffect(() => localStorage.setItem('voms_docs', JSON.stringify(documents)), [documents]);

  // UI State
  const [user, setUser] = useState<any>(null); // Current logged in user
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('general'); // general, users, services
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Forms & Modals
  const [printData, setPrintData] = useState<any>(null);
  const [printMode, setPrintMode] = useState('doc');
  const [formData, setFormData] = useState({ type: 'residency', citizen: '', citizenId: '', address: '', reason: '' });
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'staff' });
  const [newDocType, setNewDocType] = useState({ name: '', price: '' });
  const [showAddModal, setShowAddModal] = useState<{ type: string | null }>({ type: null }); // 'user' or 'doc'

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const dailyDocs = documents.filter((d: any) => d.date === today);
    return {
      totalDocs: documents.length,
      todayDocs: dailyDocs.length,
      totalRevenue: documents.reduce((sum: number, d: any) => sum + parseInt(d.fee), 0),
      dailyRevenue: dailyDocs.reduce((sum: number, d: any) => sum + parseInt(d.fee), 0)
    };
  }, [documents]);

  // --- Handlers ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find((u: any) => u.username === loginCreds.username && u.password === loginCreds.password);
    if (found) {
      setUser(found);
      setLoginError('');
    } else {
      setLoginError('ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const feeInfo = (fees as any)[formData.type];
    const newDoc = {
      ...formData,
      id: generateId('DOC'),
      invoiceId: generateId('INV'),
      date: new Date().toISOString().split('T')[0],
      fee: feeInfo.price,
      feeName: feeInfo.name,
      issuer: user.name,
      timestamp: new Date().toISOString()
    };
    setDocuments([newDoc, ...documents]);
    setPrintData(newDoc);
    setPrintMode('doc');
    setFormData(prev => ({ ...prev, citizen: '', citizenId: '', reason: '' }));
  };

  const handleUpdateOffice = (e: React.FormEvent) => {
    e.preventDefault();
    alert('ບັນທຶກຂໍ້ມູນຫ້ອງການສຳເລັດ!');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some((u: any) => u.username === newUser.username)) {
      alert('ຊື່ຜູ້ໃຊ້ນີ້ມີໃນລະບົບແລ້ວ');
      return;
    }
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setNewUser({ name: '', username: '', password: '', role: 'staff' });
    setShowAddModal({ type: null });
  };

  const handleDeleteUser = (id: number) => {
    if (users.length <= 1) { alert('ບໍ່ສາມາດລຶບຜູ້ໃຊ້ທັງໝົດໄດ້'); return; }
    if (window.confirm('ຕ້ອງການລຶບຜູ້ໃຊ້ນີ້ແທ້ບໍ່?')) {
      setUsers(users.filter((u: any) => u.id !== id));
    }
  };

  const handleAddDocType = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `custom_${Date.now()}`;
    setFees({ ...(fees as any), [id]: { id, name: newDocType.name, price: parseInt(newDocType.price) } });
    setNewDocType({ name: '', price: '' });
    setShowAddModal({ type: null });
  };

  // --- Render ---

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-[Phetsarath OT, Noto Sans Lao]">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <img src={LOGO_URL} alt="Logo" className="w-24 h-24 object-contain mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 font-[Phetsarath OT]">ລະບົບບໍລິຫານຫ້ອງການບ້ານ</h1>
            <p className="text-gray-500">ກະລຸນາເຂົ້າສູ່ລະບົບ</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text" placeholder="ຊື່ຜູ້ໃຊ້ (Username)"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={loginCreds.username} onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })}
            />
            <input
              type="password" placeholder="ລະຫັດຜ່ານ (Password)"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={loginCreds.password} onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })}
            />
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button type="submit" className="w-full py-3 bg-blue-900 text-white rounded-xl font-bold shadow-lg hover:bg-blue-800 transition">
              ເຂົ້າສູ່ລະບົບ
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-400">Default: admin / admin</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden font-sans" style={{ fontFamily: '"Phetsarath OT", "Noto Sans Lao", sans-serif' }}>
      <style>{`
        @font-face {
          font-family: 'Phetsarath OT';
          src: local('Phetsarath OT'), local('Phetsarath');
        }
        @media print {
          @page { size: auto; margin: 0; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; background: white; }
          .no-print { display: none !important; }
        }
      `}</style>
      <aside className={`fixed md:relative inset-y-0 left-0 w-72 bg-blue-900 text-white flex flex-col z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} print:hidden`}>
        <div className="p-6 flex items-center space-x-4 border-b border-blue-800">
          <img src={LOGO_URL} className="w-10 h-10 object-contain bg-white rounded-full p-1" alt="Logo" />
          <div>
            <h1 className="font-bold text-lg leading-none">VOMS</h1>
            <span className="text-xs text-blue-300 opacity-80">Office Management</span>
          </div>
          <button className="md:hidden ml-auto" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="ໜ້າຫຼັກ (Dashboard)" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Plus size={20} />} label="ອອກເອກະສານ" active={activeTab === 'issue'} onClick={() => setActiveTab('issue')} />
          <SidebarItem icon={<FileText size={20} />} label="ປະຫວັດເອກະສານ" active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
          {user.role === 'admin' && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-semibold text-blue-400 uppercase">Administrator</div>
              <SidebarItem icon={<Settings size={20} />} label="ຕັ້ງຄ່າລະບົບ" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </>
          )}
        </nav>
        <div className="p-4 bg-blue-950/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center font-bold text-lg">{user.name[0]}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-blue-300 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="flex items-center justify-center gap-2 w-full py-2 bg-blue-800/50 hover:bg-red-600/80 rounded-lg text-sm transition">
            <LogOut size={16} /> ອອກຈາກລະບົບ
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:hidden">
        <header className="bg-white border-b p-4 md:hidden flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)}><Menu /></button>
            <span className="font-bold">VOMS</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">ພາບລວມລະບົບ</h2>
                <p className="text-gray-500">ຫ້ອງການບ້ານ {officeInfo.village}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="ເອກະສານວັນນີ້" value={stats.todayDocs} subtext="ສະບັບ" icon={<FileText />} colorClass="bg-blue-500" />
                <StatCard title="ລາຍຮັບວັນນີ້" value={formatCurrency(stats.dailyRevenue)} icon={<Receipt />} colorClass="bg-green-500" />
                <StatCard title="ເອກະສານທັງໝົດ" value={stats.totalDocs} subtext="ສະສົມ" icon={<FileCheck />} colorClass="bg-purple-500" />
                <StatCard title="ລາຍຮັບລວມ" value={formatCurrency(stats.totalRevenue)} icon={<Building />} colorClass="bg-orange-500" />
              </div>
            </div>
          )}

          {activeTab === 'issue' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">ອອກເອກະສານ</h2>
                <p className="text-gray-500">ສ້າງເອກະສານໃໝ່ ແລະ ພິມໃບຮັບເງິນ</p>
              </div>
              <form onSubmit={handleCreateDocument} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className="px-4 py-3 border rounded-xl"
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  {Object.values(fees as any).map((fee: any) => (
                    <option key={fee.id} value={fee.id}>{fee.name} - {formatCurrency(fee.price)}</option>
                  ))}
                </select>
                <input className="px-4 py-3 border rounded-xl" placeholder="ຊື່ຜູ້ຂໍ" value={formData.citizen} onChange={e => setFormData(prev => ({ ...prev, citizen: e.target.value }))} required />
                <input className="px-4 py-3 border rounded-xl" placeholder="ເລກບັດປະຈຳຕົວ" value={formData.citizenId} onChange={e => setFormData(prev => ({ ...prev, citizenId: e.target.value }))} required />
                <input className="px-4 py-3 border rounded-xl" placeholder="ທີ່ຢູ່" value={formData.address} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} required />
                <textarea className="md:col-span-2 px-4 py-3 border rounded-xl" placeholder="ເຫດຜົນ" value={formData.reason} onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))} required />
                <button type="submit" className="md:col-span-2 inline-flex justify-center items-center gap-2 py-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800">
                  <CheckCircle size={18} /> ບັນທຶກແລະອອກເອກະສານ
                </button>
              </form>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">ປະຫວັດເອກະສານ</h2>
                <p className="text-gray-500">ລາຍການທຸກເອກະສານທີ່ໄດ້ອອກ</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="p-3">ເລກທີ</th>
                      <th className="p-3">ປະເພດ</th>
                      <th className="p-3">ຜູ້ຂໍ</th>
                      <th className="p-3">ວັນທີ</th>
                      <th className="p-3">ຄ່າທຳນຽມ</th>
                      <th className="p-3">ຈັດການ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length === 0 && (
                      <tr><td className="p-4 text-center text-gray-400" colSpan={6}>ຍັງບໍ່ມີຂໍ້ມູນ</td></tr>
                    )}
                    {documents.map((doc: any) => (
                      <tr key={doc.id} className="border-t">
                        <td className="p-3 font-mono text-xs">{doc.id}</td>
                        <td className="p-3">{doc.feeName}</td>
                        <td className="p-3">{doc.citizen}</td>
                        <td className="p-3">{formatDate(doc.date)}</td>
                        <td className="p-3">{formatCurrency(doc.fee)}</td>
                        <td className="p-3">
                          <button
                            onClick={() => { setPrintData(doc); setPrintMode('doc'); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg"
                          >
                            <Printer size={14} /> ພິມ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && user.role === 'admin' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">ຕັ້ງຄ່າລະບົບ</h2>
                <p className="text-gray-500">ຂໍ້ມູນຫ້ອງການ, ຜູ້ໃຊ້ ແລະ ຄ່າບໍລິການ</p>
              </div>
              <div className="flex gap-2">
                <button className={`px-4 py-2 rounded-lg ${settingsTab === 'general' ? 'bg-blue-900 text-white' : 'bg-white border'}`} onClick={() => setSettingsTab('general')}>ຂໍ້ມູນຫ້ອງການ</button>
                <button className={`px-4 py-2 rounded-lg ${settingsTab === 'users' ? 'bg-blue-900 text-white' : 'bg-white border'}`} onClick={() => setSettingsTab('users')}>ຜູ້ໃຊ້</button>
                <button className={`px-4 py-2 rounded-lg ${settingsTab === 'services' ? 'bg-blue-900 text-white' : 'bg-white border'}`} onClick={() => setSettingsTab('services')}>ຄ່າບໍລິການ</button>
              </div>

              {settingsTab === 'general' && (
                <form onSubmit={handleUpdateOffice} className="bg-white p-6 rounded-2xl border grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="px-4 py-3 border rounded-xl" value={officeInfo.village} onChange={e => setOfficeInfo({ ...officeInfo, village: e.target.value })} />
                  <input className="px-4 py-3 border rounded-xl" value={officeInfo.district} onChange={e => setOfficeInfo({ ...officeInfo, district: e.target.value })} />
                  <input className="px-4 py-3 border rounded-xl" value={officeInfo.province} onChange={e => setOfficeInfo({ ...officeInfo, province: e.target.value })} />
                  <input className="px-4 py-3 border rounded-xl" value={officeInfo.taxId} onChange={e => setOfficeInfo({ ...officeInfo, taxId: e.target.value })} />
                  <button type="submit" className="md:col-span-2 inline-flex justify-center items-center gap-2 py-3 bg-blue-900 text-white rounded-xl"><Save size={18} /> ບັນທຶກ</button>
                </form>
              )}

              {settingsTab === 'users' && (
                <div className="bg-white p-6 rounded-2xl border space-y-4">
                  <button onClick={() => setShowAddModal({ type: 'user' })} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg"><UserPlus size={16} /> ເພີ່ມຜູ້ໃຊ້</button>
                  <div className="space-y-2">
                    {users.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between border rounded-xl p-3">
                        <div className="flex items-center gap-2"><Users size={16} /> {u.name} ({u.username})</div>
                        <button onClick={() => handleDeleteUser(u.id)} className="text-red-600"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {settingsTab === 'services' && (
                <div className="bg-white p-6 rounded-2xl border space-y-4">
                  <button onClick={() => setShowAddModal({ type: 'doc' })} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg"><Plus size={16} /> ເພີ່ມປະເພດເອກະສານ</button>
                  {Object.values(fees as any).map((fee: any) => (
                    <div key={fee.id} className="flex items-center justify-between border rounded-xl p-3">
                      <span>{fee.name}</span>
                      <span className="font-semibold">{formatCurrency(fee.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {printData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">ຕົວຢ່າງການພິມ ({printMode})</h3>
              <button onClick={() => setPrintData(null)}><X /></button>
            </div>
            <div className="print-area border rounded-xl p-4 space-y-1 text-sm">
              <p><strong>ເລກທີ:</strong> {printData.id}</p>
              <p><strong>ຜູ້ຂໍ:</strong> {printData.citizen}</p>
              <p><strong>ປະເພດ:</strong> {printData.feeName}</p>
              <p><strong>ຄ່າທຳນຽມ:</strong> {formatCurrency(printData.fee)}</p>
            </div>
            <div className="flex justify-end gap-2 no-print">
              <button onClick={() => setPrintData(null)} className="px-4 py-2 border rounded-lg">ປິດ</button>
              <button onClick={() => window.print()} className="px-4 py-2 bg-blue-900 text-white rounded-lg inline-flex items-center gap-2"><Printer size={16} /> ພິມ</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal.type === 'user' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddUser} className="bg-white w-full max-w-md rounded-2xl p-6 space-y-3">
            <h3 className="font-bold">ເພີ່ມຜູ້ໃຊ້ໃໝ່</h3>
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="ຊື່" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} required />
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
            <select className="w-full px-3 py-2 border rounded-lg" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="staff">staff</option>
              <option value="admin">admin</option>
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-2 border rounded-lg" onClick={() => setShowAddModal({ type: null })}>ຍົກເລີກ</button>
              <button type="submit" className="px-3 py-2 bg-blue-900 text-white rounded-lg">ບັນທຶກ</button>
            </div>
          </form>
        </div>
      )}

      {showAddModal.type === 'doc' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddDocType} className="bg-white w-full max-w-md rounded-2xl p-6 space-y-3">
            <h3 className="font-bold">ເພີ່ມປະເພດເອກະສານ</h3>
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="ຊື່ບໍລິການ" value={newDocType.name} onChange={e => setNewDocType({ ...newDocType, name: e.target.value })} required />
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="ຄ່າທຳນຽມ" type="number" value={newDocType.price} onChange={e => setNewDocType({ ...newDocType, price: e.target.value })} required />
            <div className="flex justify-end gap-2">
              <button type="button" className="px-3 py-2 border rounded-lg" onClick={() => setShowAddModal({ type: null })}>ຍົກເລີກ</button>
              <button type="submit" className="px-3 py-2 bg-blue-900 text-white rounded-lg">ບັນທຶກ</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root') || document.querySelector('app-root');
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <VOMSApp />
    </React.StrictMode>
  );
}
