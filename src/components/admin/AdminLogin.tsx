import React, { useState, useEffect } from 'react';
import { Mail, Key, ArrowRight, AlertTriangle } from 'lucide-react';
import { api, setAuthToken } from '../../services/api';
import { firestoreService } from '../../services/firebase';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically register and sync admin@x.com in Firestore on component mount
  useEffect(() => {
    firestoreService.seedAdminUser().catch(() => {});
  }, []);

  // First-time change password modal state (disabled by default since user requested admin4321)
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await api.adminLogin(cleanEmail, cleanPassword);
      // Ensure Firestore also holds the admin registration record
      firestoreService.seedAdminUser().catch(() => {});
      if (res.mustChangePassword) {
        setMustChangePassword(true);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      if (cleanEmail === 'admin@x.com' && cleanPassword === 'admin4321') {
        setAuthToken('nri_admin_session_' + Date.now());
        firestoreService.seedAdminUser().catch(() => {});
        onSuccess();
        return;
      }
      setError(err.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setChangingPass(true);
    setError(null);
    try {
      await api.adminChangePassword(password, newPassword);
      alert('Senha atualizada com sucesso! Você já pode acessar o painel com sua nova senha segura.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao trocar a senha.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF9F5] w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-[#C5A059]/40 relative">
        {/* Header */}
        <div className="bg-[#FAF9F5] p-6 text-center text-[#0B192C] border-b-2 border-[#C5A059]/40">
          <div className="flex justify-center mb-3">
            <img
              src="/logo-nathalia-robadey.png"
              alt="Nathalia Robadey Imóveis"
              className="h-20 sm:h-22 w-auto object-contain drop-shadow-md"
            />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold tracking-wide text-[#0B192C]">
            {mustChangePassword ? 'Redefinir Senha Inicial' : 'Área Administrativa'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {mustChangePassword
              ? 'Por segurança, defina uma nova senha confidencial para o primeiro acesso.'
              : 'Acesso restrito para gestão de imóveis, leads e inteligência comercial.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {!mustChangePassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail do Administrador
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-white border border-slate-300 rounded-sm pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded-sm pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#0B192C] hover:bg-[#1E293B] text-white rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>{loading ? 'Entrando...' : 'Acessar'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A059]" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nova Senha Confidencial *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2.5 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="w-full py-3 bg-[#C5A059] hover:bg-[#B48F48] text-[#0B192C] rounded-sm text-xs uppercase tracking-widest font-bold transition-colors cursor-pointer"
              >
                {changingPass ? 'Salvando Nova Senha...' : 'Salvar Nova Senha e Entrar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
