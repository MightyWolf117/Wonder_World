import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { StateAPI, GameState, BossAPI, BossNode } from '../api/client';
import { GameStateService } from '../services/GameStateService';
import styles from './HuntingZoneView.module.css';

export const HuntingZoneView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Perfil
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ titulo: "", avatarB64: "", consejo: "" });

  // Recados
  const [newRecado, setNewRecado] = useState("");

  const [form, setForm] = useState({
    nombre: "", descripcion: "", tipo: "domable", limiteDias: 1, 
    hpRupturaMax: 1, hpEjecucionMax: 0, restriccion: "", statCastigo: "estres", valorCastigo: 1
  });

  const loadData = async () => {
    try {
      const state = await StateAPI.getInitialState();
      setGameState(state);
      setProfileForm({
         titulo: state.tituloJugador || "Lobo Errante | Rango E",
         avatarB64: state.avatarB64 || "",
         consejo: state.consejoBatallonActual || "Sigue adelante."
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 150, 150);
          setProfileForm(prev => ({ ...prev, avatarB64: canvas.toDataURL('image/jpeg', 0.8) }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    GameStateService.updateState(state => {
       state.tituloJugador = profileForm.titulo;
       state.avatarB64 = profileForm.avatarB64;
       state.consejoBatallonActual = profileForm.consejo;
    });
    setEditProfile(false);
    await loadData();
    setLoading(false);
  };

  const handleAddRecado = async () => {
    if (!newRecado) return;
    setLoading(true);
    GameStateService.updateState(state => {
       if (!state.pendientesRapidos) state.pendientesRapidos = [];
       state.pendientesRapidos.push({ id: `rec_${Date.now()}`, txt: newRecado });
    });
    setNewRecado("");
    await loadData();
    setLoading(false);
  };

  const handleDeleteRecado = async (id: string) => {
    setLoading(true);
    GameStateService.updateState(state => {
       state.pendientesRapidos = state.pendientesRapidos.filter(r => r.id !== id);
    });
    await loadData();
    setLoading(false);
  };

  const handleCreateBoss = async () => {
    try {
      setLoading(true);
      const newBoss: Omit<BossNode, "id"|"extraCazas"> = {
        ...form,
        diasActivos: 0,
        hpRupturaActual: form.hpRupturaMax,
        hpEjecucionActual: form.tipo === 'domable' ? form.hpEjecucionMax : 0,
        estadoFinal: "caza"
      };
      const state = await BossAPI.addBoss(newBoss as any);
      setGameState(state);
      setForm({ ...form, nombre: "", descripcion: "" });
    } finally {
      setLoading(false);
    }
  };

  const handleAttack = async (id: string, freqType: string) => {
    try {
      setLoading(true);
      const state = await BossAPI.attackBoss(id, freqType);
      setGameState(state);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAmmo = async (type: string) => {
    try {
      setLoading(true);
      const state = await BossAPI.loadAmmo(type);
      setGameState(state);
    } finally {
      setLoading(false);
    }
  };

  if (!gameState) return <div style={{ color: 'white', padding: '20px' }}>Iniciando Teatro de Operaciones...</div>;

  return (
    <div className={styles.contenedor}>
      <Header title="TEATRO DE OPERACIONES ACTIVAS" subtitle="Zona de Caza (Gestor de Proyectos)">
        <Link to="/"><Button variant="advance">Volver al Core</Button></Link>
      </Header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '25px' }}>
        
        {/* PERFIL MILITAR */}
        <div className={styles.profileBox}>
          {editProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={profileForm.titulo} onChange={e => setProfileForm({...profileForm, titulo: e.target.value})} placeholder="Título / Rango" className={styles.inputProfile} />
              <input type="text" value={profileForm.consejo} onChange={e => setProfileForm({...profileForm, consejo: e.target.value})} placeholder="Consejo del Batallón" className={styles.inputProfile} />
              <label style={{ fontSize: '0.8rem', color: 'var(--azul-ego)', cursor: 'pointer', border: '1px solid var(--azul-ego)', padding: '5px', textAlign: 'center' }}>
                Subir Avatar (Auto Resize)
                <input type="file" accept="image/*" onChange={handleProfileImageUpload} style={{ display: 'none' }} />
              </label>
              <Button onClick={handleSaveProfile} variant="advance">Guardar Perfil</Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div className={styles.avatarContainer}>
                {gameState.avatarB64 ? <img src={gameState.avatarB64} alt="Avatar" className={styles.avatarImg} /> : <div className={styles.avatarImg}>N/A</div>}
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--texto-plata)' }}>{gameState.tituloJugador}</div>
                <div style={{ fontSize: '0.75rem', color: '#a0aec0', fontStyle: 'italic', marginTop: '5px' }}>"{gameState.consejoBatallonActual}"</div>
                <button onClick={() => setEditProfile(true)} style={{ background: 'transparent', border: 'none', color: 'var(--azul-ego)', cursor: 'pointer', fontSize: '0.7rem', marginTop: '10px', padding: 0 }}>[Editar Perfil]</button>
              </div>
            </div>
          )}
        </div>

        {/* PENDIENTES RÁPIDOS */}
        <div className={styles.recadosBox}>
          <div style={{ fontSize: '0.85rem', color: 'var(--azul-ego)', marginBottom: '10px', fontFamily: 'var(--fuente-hud)' }}>PENDIENTES RÁPIDOS (RECADOS)</div>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <input type="text" value={newRecado} onChange={e => setNewRecado(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddRecado()} placeholder="Añadir pendiente..." className={styles.inputProfile} style={{ flex: 1 }} />
            <Button onClick={handleAddRecado}>+</Button>
          </div>
          <div className={styles.recadosList}>
            {(gameState.pendientesRapidos || []).map(r => (
              <div key={r.id} className={styles.recadoItem}>
                <span>- {r.txt}</span>
                <button onClick={() => handleDeleteRecado(r.id)} className={styles.recadoDelBtn}>X</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.hudSuperior}>
        <div className={styles.bloqueInfo}>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0', fontFamily: 'var(--fuente-hud)' }}>FRECUENCIAS DE CAZA DISPUESTAS</div>
          <div className={styles.ammoPool}>
            {Array.from({ length: gameState.poolFrecuencias["C"] || 0 }).map((_, i) => (
              <span key={`C-${i}`} className={styles.bulletToken}>C</span>
            ))}
            {Array.from({ length: gameState.poolFrecuencias["S"] || 0 }).map((_, i) => (
              <span key={`S-${i}`} className={`${styles.bulletToken} ${styles.bulletTokenS}`}>S</span>
            ))}
            {(gameState.poolFrecuencias["C"] === 0 && gameState.poolFrecuencias["S"] === 0) && 
              <span style={{color: '#4a5568', fontSize: '0.75rem'}}>Cargador Vacío</span>
            }
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            <Button onClick={() => handleLoadAmmo("C")} disabled={loading} style={{ color: 'var(--verde-triage)' }}>+ Cargar C</Button>
            <Button onClick={() => handleLoadAmmo("S")} disabled={loading} style={{ color: 'var(--azul-ego)' }}>+ Cargar S</Button>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--fuente-hud)', marginBottom: '10px' }}>🛠️ FORJAR OBJETIVO (PROYECTO)</div>
      <div className={styles.formCrear}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0', marginBottom: '4px' }}>Nombre de la Amenaza</label>
          <input type="text" placeholder="Ej: Examen Final" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0', marginBottom: '4px' }}>Clasificación</label>
          <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} style={{ width: '100%', boxSizing: 'border-box' }}>
            <option value="domable">Domable (Tarea/Proyecto)</option>
            <option value="indomable">Indomable (Hábito/Crítico)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0', marginBottom: '4px' }}>{form.tipo === 'indomable' ? 'Victorias Necesarias' : 'Tiempo Límite (Días)'}</label>
          <input type="number" placeholder="Días" value={form.limiteDias} onChange={e => setForm({...form, limiteDias: parseInt(e.target.value)})} style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0', marginBottom: '4px' }}>HP de Ruptura</label>
          <input type="number" placeholder="Ej: 5" value={form.hpRupturaMax} onChange={e => setForm({...form, hpRupturaMax: parseInt(e.target.value)})} style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        {form.tipo === 'domable' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0', marginBottom: '4px' }}>HP de Ejecución</label>
            <input type="number" placeholder="Ej: 1" value={form.hpEjecucionMax} onChange={e => setForm({...form, hpEjecucionMax: parseInt(e.target.value)})} style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
        )}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0', marginBottom: '4px' }}>Penalización (Stat)</label>
          <select value={form.statCastigo} onChange={e => setForm({...form, statCastigo: e.target.value})} style={{ width: '100%', boxSizing: 'border-box' }}>
            <option value="estres">Aumenta Estrés</option>
            <option value="energia">Drena Energía</option>
            <option value="mood">Baja Mood</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#a0aec0', marginBottom: '4px' }}>Daño de Penalización</label>
          <input type="number" placeholder="Ej: 5" value={form.valorCastigo} onChange={e => setForm({...form, valorCastigo: parseInt(e.target.value)})} style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
          <Button onClick={handleCreateBoss} disabled={loading || !form.nombre} style={{ width: '100%' }}>Añadir al Teatro de Operaciones</Button>
        </div>
      </div>

      <div className={styles.gridJefes}>
        {gameState.activeBosses.map(boss => (
          <div key={boss.id} className={`${styles.jefeCard} ${styles[boss.estadoFinal] || ''}`}>
            <div className={styles.jefeHeader}>
              <span className={styles.jefeNombre}>{boss.nombre}</span>
              <span className={`${styles.jefeBadge} ${boss.tipo === 'domable' ? styles.badgeDomable : styles.badgeIndomable}`}>{boss.tipo}</span>
            </div>
            
            <div className={styles.jefeDesc}>
              Días: {boss.diasActivos} / {boss.limiteDias} | Castigo: -{boss.valorCastigo} {boss.statCastigo.toUpperCase()}
              {boss.estadoFinal === 'endless' && <div style={{ color: 'var(--oro-moneda)' }}>MODO ENDLESS ACTIVO (+{boss.extraCazas || 0} Cazas Extra)</div>}
              {boss.estadoFinal === 'enrage' && <div style={{ color: 'var(--rojo-frenesi)' }}>⚠️ ENRAGE ⚠️ Castigos Diarios.</div>}
            </div>

            <div>
              <div style={{fontSize: '0.65rem'}}>Ruptura ({boss.hpRupturaActual}/{boss.hpRupturaMax})</div>
              <div className={styles.barraHp}>
                <div className={styles.fillRuptura} style={{ width: `${(boss.hpRupturaActual / boss.hpRupturaMax) * 100}%` }}></div>
              </div>
              {boss.tipo === 'domable' && (
                <>
                  <div style={{fontSize: '0.65rem'}}>Ejecución ({boss.hpEjecucionActual}/{boss.hpEjecucionMax})</div>
                  <div className={styles.barraHp}>
                    <div className={styles.fillEjecucion} style={{ width: `${(boss.hpEjecucionActual / Math.max(1, boss.hpEjecucionMax)) * 100}%` }}></div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.actions}>
              <Button 
                onClick={() => handleAttack(boss.id, "C")} 
                disabled={loading || (boss.tipo === 'domable' && boss.hpRupturaActual === 0) || gameState.poolFrecuencias["C"] === 0} 
                style={{ flex: 1, borderColor: 'var(--verde-triage)', color: 'var(--verde-triage)' }}
              >Disparar [C]</Button>
              {boss.tipo === 'domable' && (
                <Button onClick={() => handleAttack(boss.id, "S")} disabled={loading || boss.hpRupturaActual > 0 || boss.hpEjecucionActual === 0 || gameState.poolFrecuencias["S"] === 0} style={{ flex: 1, borderColor: 'var(--azul-ego)', color: 'var(--azul-ego)' }}>Ejecutar [S]</Button>
              )}
              <Button onClick={async () => { await BossAPI.deleteBoss(boss.id); loadData(); }} style={{ borderColor: 'var(--rojo-frenesi)', color: 'var(--rojo-frenesi)' }}>X</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
