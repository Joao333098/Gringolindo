import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, Users } from 'lucide-react';
import { toast } from 'sonner';

const RankingUsers = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ranking`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRanking(data.ranking || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (posicao) => {
    switch (posicao) {
      case 1:
        return <Crown className="w-6 h-6 text-cyber-yellow" />;
      case 2:
        return <Medal className="w-6 h-6 text-text-primary" />;
      case 3:
        return <Medal className="w-6 h-6 text-cyber-red" />;
      default:
        return <Star className="w-5 h-5 text-text-secondary" />;
    }
  };

  const getRankColor = (posicao) => {
    switch (posicao) {
      case 1:
        return 'border-cyber-yellow/50 bg-cyber-yellow/10';
      case 2:
        return 'border-text-primary/50 bg-text-primary/10';
      case 3:
        return 'border-cyber-red/50 bg-cyber-red/10';
      default:
        return 'border-white/10 bg-void-highlight';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-cyber-red font-mono animate-pulse loading-dots">
          CARREGANDO RANKING
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-6 h-6 text-cyber-red" />
          <h1 className="text-xl font-unbounded font-bold text-text-primary">
            RANKING DE USUARIOS
          </h1>
        </div>
        <p className="text-text-secondary font-mono text-sm">
          Top usuarios com maior saldo no sistema
        </p>
      </div>

      {/* Top 3 */}
      {ranking.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <div className="glass-card rounded-3xl p-4 text-center order-1">
            <div className="mb-3">
              <Medal className="w-8 h-8 text-text-primary mx-auto mb-2" />
              <div className="text-2xl font-unbounded font-bold text-text-primary">#2</div>
            </div>
            <img 
              src={ranking[1]?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/1.png'}
              alt={ranking[1]?.username}
              className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-text-primary/50"
            />
            <div className="text-sm font-mono text-text-primary truncate mb-1">
              {ranking[1]?.username || 'Usuario Desconhecido'}
            </div>
            <div className="text-lg font-unbounded font-bold text-cyber-green">
              R$ {ranking[1]?.saldo.toFixed(2)}
            </div>
          </div>

          {/* 1st Place */}
          <div className="glass-card rounded-3xl p-4 text-center order-2 transform scale-110">
            <div className="mb-3">
              <Crown className="w-10 h-10 text-cyber-yellow mx-auto mb-2 animate-pulse" />
              <div className="text-3xl font-unbounded font-bold text-cyber-yellow">#1</div>
            </div>
            <img 
              src={ranking[0]?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt={ranking[0]?.username}
              className="w-20 h-20 rounded-full mx-auto mb-2 border-3 border-cyber-yellow/70 shadow-lg"
            />
            <div className="text-base font-mono text-text-primary truncate mb-1 font-bold">
              {ranking[0]?.username || 'Usuario Desconhecido'}
            </div>
            <div className="text-xl font-unbounded font-bold text-cyber-green">
              R$ {ranking[0]?.saldo.toFixed(2)}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="glass-card rounded-3xl p-4 text-center order-3">
            <div className="mb-3">
              <Medal className="w-8 h-8 text-cyber-red mx-auto mb-2" />
              <div className="text-2xl font-unbounded font-bold text-cyber-red">#3</div>
            </div>
            <img 
              src={ranking[2]?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/2.png'}
              alt={ranking[2]?.username}
              className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-cyber-red/50"
            />
            <div className="text-sm font-mono text-text-primary truncate mb-1">
              {ranking[2]?.username || 'Usuario Desconhecido'}
            </div>
            <div className="text-lg font-unbounded font-bold text-cyber-green">
              R$ {ranking[2]?.saldo.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Ranking Completo */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-unbounded font-bold text-lg text-text-primary">
            RANKING COMPLETO
          </h3>
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
            <Users className="w-4 h-4" />
            {ranking.length} usuarios
          </div>
        </div>
        
        {ranking.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-text-dim mx-auto mb-4" />
            <p className="text-text-secondary font-mono text-sm">
              Nenhum usuario com saldo encontrado
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((user, index) => (
              <div 
                key={user.user_id} 
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:scale-102 ${getRankColor(user.posicao)}`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(user.posicao)}
                  <div className={`text-lg font-unbounded font-bold ${
                    user.posicao <= 3 ? 'text-cyber-red' : 'text-text-secondary'
                  }`}>
                    #{user.posicao}
                  </div>
                </div>
                
                <img 
                  src={user.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                  onError={(e) => {
                    e.target.src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-text-primary truncate font-bold">
                    {user.username || 'Usuario Desconhecido'}
                  </div>
                  <div className="text-xs text-text-dim font-mono">
                    ID: {user.user_id}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-unbounded font-bold text-cyber-green">
                    R$ {user.saldo.toFixed(2)}
                  </div>
                  <div className="text-xs text-text-dim font-mono">
                    {((user.saldo / (ranking[0]?.saldo || 1)) * 100).toFixed(1)}% do top
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-unbounded font-bold text-cyber-red mb-1">
            {ranking.length}
          </div>
          <div className="text-xs font-mono text-text-secondary uppercase">
            Total Usuarios
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-unbounded font-bold text-cyber-green mb-1">
            R$ {ranking.reduce((sum, user) => sum + user.saldo, 0).toFixed(0)}
          </div>
          <div className="text-xs font-mono text-text-secondary uppercase">
            Saldo Total
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-unbounded font-bold text-cyber-yellow mb-1">
            R$ {ranking.length > 0 ? (ranking.reduce((sum, user) => sum + user.saldo, 0) / ranking.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-xs font-mono text-text-secondary uppercase">
            Media
          </div>
        </div>
        
        <div className="glass-card rounded-2xl p-4 text-center">
          <div className="text-2xl font-unbounded font-bold text-text-primary mb-1">
            R$ {ranking[0]?.saldo.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs font-mono text-text-secondary uppercase">
            Maior Saldo
          </div>
        </div>
      </div>

      {/* Botao de Atualizar */}
      <div className="text-center">
        <button
          onClick={fetchRanking}
          className="cyber-btn py-3 px-6 rounded-full flex items-center gap-2 mx-auto"
        >
          <Trophy className="w-4 h-4" />
          ATUALIZAR RANKING
        </button>
      </div>
    </div>
  );
};

export default RankingUsers;