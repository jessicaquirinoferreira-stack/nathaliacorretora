import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check } from 'lucide-react';

export const CookieBanner: React.FC<{ onOpenPolicy: () => void }> = ({ onOpenPolicy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('nri_cookies_accepted');
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('nri_cookies_accepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-[#0B192C]/95 backdrop-blur-md border-t border-[#C5A059]/30 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
          <ShieldCheck className="w-5 h-5 text-[#C5A059] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Utilizamos cookies e tecnologias similares para personalizar sua experiência, salvar preferências de busca e analisar o tráfego com segurança, em total conformidade com a <span className="text-[#E5C989] font-medium">LGPD</span>. Consulte nossa{' '}
            <button
              onClick={onOpenPolicy}
              className="text-[#C5A059] underline hover:text-[#E5C989] cursor-pointer"
            >
              Política de Cookies e Privacidade
            </button>.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={handleAccept}
            className="flex items-center space-x-1.5 bg-[#C5A059] hover:bg-[#B48F48] text-[#0B192C] font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aceitar e Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
