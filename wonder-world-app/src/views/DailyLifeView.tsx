import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { RoutineAPI, RoutineNode, RoutinePenalties } from '../api/client';
import styles from './DailyLifeView.module.css';

export const DailyLifeView: React.FC = () => {
  const [activeRoutines, setActiveRoutines] = useState<RoutineNode[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [estimation, setEstimation] = useState<RoutinePenalties>({ energia: 0, estres: 0, mood: 0, ego: 0, limiteMentalRoto: false, limiteFisicoRoto: false, limiteSocialRoto: false });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const todayData = await RoutineAPI.getToday();
      setActiveRoutines(todayData.active);
      setCompletedIds(todayData.completed);
      
      const est = await RoutineAPI.getEstimation();
      setEstimation(est);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (id: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await RoutineAPI.complete(id);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async (id: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await RoutineAPI.skip(id);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contenedor}>
      <Header title="ALPHA FENRIR TACTICAL CORE" subtitle="La Vida Diaria del Lobo">
        <Link to="/"><Button variant="advance">Volver al Core</Button></Link>
      </Header>

      <div className={styles.hudDeltas}>
        <div className={styles.deltaStatBox}>
          <div className={styles.deltaCard}><div className={styles.deltaTitulo}>Δ Energía</div><div className={styles.deltaValor} style={{ color: estimation.energia < 0 ? 'var(--rojo-alerta, #ff3333)' : 'white'}}>{estimation.energia}</div></div>
          <div className={styles.deltaCard}><div className={styles.deltaTitulo}>Δ Estrés</div><div className={styles.deltaValor} style={{ color: estimation.estres > 0 ? 'var(--rojo-alerta, #ff3333)' : 'white'}}>+{estimation.estres}</div></div>
          <div className={styles.deltaCard}><div className={styles.deltaTitulo}>Δ Mood</div><div className={styles.deltaValor} style={{ color: estimation.mood < 0 ? 'var(--rojo-alerta, #ff3333)' : 'white'}}>{estimation.mood}</div></div>
          <div className={styles.deltaCard}><div className={styles.deltaTitulo}>Δ EGO</div><div className={styles.deltaValor} style={{ color: estimation.ego < 0 ? 'var(--rojo-alerta, #ff3333)' : 'white'}}>{estimation.ego}</div></div>
        </div>
      </div>

      <div className={styles.gridLayout}>
        <div className={`${styles.panel} ${styles.panelIzq}`}>
          <h2><span>Patrulla Activa de Hoy</span> <span style={{ fontSize: '0.7rem', color: '#4e6153' }}>{activeRoutines.length} Tareas</span></h2>
          <div style={{ marginTop: '12px' }}>
            {activeRoutines.map(r => (
              <div key={r.id} className={styles.lineaTarea}>
                <div className={styles.tareaRowMain}>
                  <div className={styles.tareaInfo}>
                    <div className={styles.tareaNombre}>
                      {r.nombre}
                      <span className={styles.badgeTag}>{r.tipo}</span>
                    </div>
                    <div className={styles.tareaDescFx}>{r.desc}</div>
                  </div>
                  <div className={styles.btnGroup}>
                    <button 
                      className={`${styles.btnTactic} ${completedIds.includes(r.id) ? styles.activeCumplida : ''}`}
                      onClick={() => handleComplete(r.id)}
                      disabled={loading}
                    >Cumplida</button>
                    <button 
                      className={`${styles.btnTactic} ${!completedIds.includes(r.id) ? styles.activeSaltada : ''}`}
                      onClick={() => handleSkip(r.id)}
                      disabled={loading}
                    >Saltada</button>
                  </div>
                </div>
              </div>
            ))}
            {activeRoutines.length === 0 && <div style={{ color: 'var(--texto-secundario)' }}>No hay rutinas activas programadas para hoy.</div>}
          </div>
        </div>

        <div className={`${styles.panel} ${styles.panelDer}`}>
          <h2><span>Próximas Tareas</span></h2>
          <div style={{ marginTop: '10px', color: '#718096', fontSize: '0.85rem', fontFamily: 'var(--fuente-hud)' }}>
            <p>Panel de reservas y adelantos en desarrollo para iteraciones futuras.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
