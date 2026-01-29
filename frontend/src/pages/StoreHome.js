import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const StoreHome = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL || ''}/api/store/services`);
      setServices(res.data.services || []);
    } catch (error) {
      console.error("Error fetching services", error);
    } finally {
      setLoading(false);
    }
  };

  const ServiceCard = ({ service, index }) => {
    const isPremium = index < 3; // Mock logic for premium

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`relative group bg-void-surface border ${isPremium ? 'border-cyber-red/50' : 'border-white/5'} hover:border-cyber-red transition-all duration-300 rounded-xl overflow-hidden`}
      >
        {isPremium && (
          <div className="absolute top-0 right-0 bg-cyber-red text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> DESTAQUE
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-void flex items-center justify-center border border-white/10 group-hover:border-cyber-red/50 transition-colors">
              <Zap className={`w-6 h-6 ${isPremium ? 'text-cyber-red' : 'text-white'}`} />
            </div>
            <div className="text-right">
              <p className="text-xs text-text-dim line-through">R$ {(service.preco_base || service.preco_final * 1.2).toFixed(2)}</p>
              <p className="text-xl font-bold text-cyber-green">R$ {service.preco_final?.toFixed(2)}</p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyber-red transition-colors truncate">{service.nome}</h3>
          <p className="text-sm text-text-secondary mb-6 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${service.qtd_disp > 0 ? 'bg-cyber-green' : 'bg-red-500'}`} />
            {service.qtd_disp > 0 ? `${service.qtd_disp} disponíveis` : 'Esgotado'}
          </p>

          <button
            onClick={() => setSelectedService(service)}
            disabled={service.qtd_disp <= 0}
            className="w-full bg-void-highlight hover:bg-cyber-red text-white font-medium py-3 rounded-lg border border-white/10 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(255,0,60,0.3)] disabled:opacity-50 disabled:hover:bg-void-highlight disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            COMPRAR
          </button>
        </div>

        {/* Glitch overlay on hover */}
        <div className="absolute inset-0 bg-cyber-red/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 mix-blend-overlay" />
      </motion.div>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white font-unbounded mb-2 glitch-text" data-text="CATÁLOGO">CATÁLOGO</h1>
          <p className="text-text-secondary">Explore nossos produtos digitais exclusivos.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-void-surface rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      )}

      <PaymentModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService || {}}
        onSuccess={() => {
            fetchServices();
        }}
      />
    </div>
  );
};

export default StoreHome;
