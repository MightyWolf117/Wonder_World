import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { RoutineAPI, StateAPI, RoutineNode, GameState } from '../api/client';
import styles from './DailyLifeView.module.css';

export const DailyLifeView: React.FC = () => {
  const [activeRoutines, setActiveRoutines] = useState<RoutineNode[]>([]);
  const [deudas, setDeudas] = useState<RoutineNode[]>([]);
  const [fueraDeHorario, setFueraDeHorario] = useState<RoutineNode[]>([]);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);

  // Nuevo estado para el CRUD
  const [newRoutine, setNewRoutine] = useState<Partial<RoutineNode>>({
    nombre: '', desc: '', tipo: 'diaria', freqType: 'semanal', param: 1, days: [],
    castigo: { energia: -1, estres: 1, mood: -1, ego: 0, monedas: 0 }
  });

  const loadData = async () => {
    try {
      const state = await StateAPI.getInitialState();
      setGameState(state);

      const todayData = await RoutineAPI.getToday();
      setActiveRoutines(todayData.active);
      setDeudas(todayData.deudas);
      setFueraDeHorario(todayData.fueraDeHorario);
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

  const handleForge = async (id: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await RoutineAPI.forgeShield(id);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!newRoutine.nombre) return;
    
    // Simulate UUID
    const newId = `r_${Date.now()}`;
    const payload: RoutineNode = {
      id: newId,
      nombre: newRoutine.nombre,
      desc: newRoutine.desc,
      tipo: newRoutine.tipo || 'diaria',
      freqType: newRoutine.freqType,
      param: newRoutine.param,
      days: newRoutine.days,
      castigo: newRoutine.castigo || { energia: 0, estres: 0, ego: 0, mood: 0, monedas: 0 },
      reincidenciaCount: 0,
      escudoActivo: false,
      completada: false
    };

    try {
       // Direct API access isn't fully CRUD mapped in client.ts for routines yet, 
       // We'll map addRoutine in RoutineAPI if needed, or modify RoutineService directly for now.
       // (Need to update client.ts RoutineAPI to expose addRoutine)
    } catch (e) {
      console.error(e);
    }
  };

  if (!gameState) return <div className={styles.contenedor}>Cargando HUD...</div>;

  const deltas = gameState.deltasAcumulados || { energia: 0, estres: 0, mood: 0, ego: 0 };

  return (
    <div className={styles.contenedor}>
      <Header title="ALPHA FENRIR TACTICAL CORE" subtitle="La Vida Diaria del Lobo">
        <Link to="/"><Button variant="advance">Volver al Core</Button></Link>
      </Header>

      <div className={styles.hudDeltas}>
        <div style={{ color: '#a0aec0', fontFamily: 'var(--fuente-hud)', fontSize: '0.85rem', marginBottom: '8px', width: '100%' }}>DELTAS ACUMULADOS POR DEUDAS:</div>
        <div className={styles.deltaStatBox}>
          <div className={styles.deltaCard}><div className={styles.deltaTitulo}>Δ Energía</div><div className={styles.deltaValor} style={{ color: deltas.energia < 0 ? 'var(--rojo-alerta, #ff3333)' : 'white'}}>{deltas.energia}</div></div>
          <div className={styles.deltaCard}><div className={styles.deltaTitulo}>Δ Estrés</div><div className={styles.deltaValor} style={{ color: deltas.estres > 0 ? 'var(--rojo-alerta, #ff3333)' : 'white'}}>+{deltas.estres}</div></div>
          <div className={styles.deltaCard}><div className={styles.deltaTitulo}>Δ Mood</div><div className={styles.deltaValor} style={{ color: deltas.mood < 0 ? 'var(--rojo-alerta, #ff3333)' : 'white'}}>{deltas.mood}</div></div>
          <div className={styles.deltaCard}><div className={styles.deltaTitulo}>Δ EGO</div><div className={styles.deltaValor} style={{ color: deltas.ego < 0 ? 'var(--rojo-alerta, #ff3333)' : 'white'}}>{deltas.ego}</div></div>
        </div>
      </div>

      <div className={styles.gridLayout}>
        <div className={`${styles.panel} ${styles.panelIzq}`}>
          <h2><span>Patrulla Activa (HOY)</span> <span style={{ fontSize: '0.7rem', color: '#4e6153' }}>{activeRoutines.length}</span></h2>
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
                    <button className={styles.btnTactic} onClick={() => handleComplete(r.id)} disabled={loading}>CUMPLIR</button>
                    <button className={styles.btnTactic} onClick={() => handleSkip(r.id)} disabled={loading} style={{ borderColor: 'var(--amarillo-mood)', color: 'var(--amarillo-mood)'}}>SALTAR</button>
                  </div>
                </div>
              </div>
            ))}
            {activeRoutines.length === 0 && <div style={{ color: 'var(--texto-secundario)' }}>No hay rutinas programadas para hoy.</div>}
          </div>

          <h2 style={{ marginTop: '20px' }}><span style={{ color: 'var(--rojo-alerta, #ff3333)'}}>Deudas Activas (Peligro)</span></h2>
          <div style={{ marginTop: '12px' }}>
            {deudas.map(r => (
              <div key={r.id} className={`${styles.lineaTarea} ${styles.lineaDeuda}`}>
                <div className={styles.tareaRowMain}>
                  <div className={styles.tareaInfo}>
                    <div className={styles.tareaNombre} style={{ color: 'var(--rojo-alerta, #ff3333)' }}>
                      {r.nombre}
                      <span className={styles.badgeReincidencia}>Reincidencia: x{r.reincidenciaCount}</span>
                    </div>
                    <div className={styles.tareaDescFx}>Fallada en turnos anteriores. Cumplir para despejar deuda.</div>
                  </div>
                  <div className={styles.btnGroup}>
                    <button className={styles.btnTactic} onClick={() => handleComplete(r.id)} disabled={loading} style={{ borderColor: 'var(--verde-triage)' }}>LIMPIAR DEUDA</button>
                  </div>
                </div>
              </div>
            ))}
            {deudas.length === 0 && <div style={{ color: 'var(--texto-secundario)' }}>No arrastras deudas. Excelente.</div>}
          </div>
        </div>

        <div className={`${styles.panel} ${styles.panelDer}`}>
          <h2><span>Fuera de Horario (Forjar Escudo)</span></h2>
          <div style={{ marginTop: '10px', color: '#718096', fontSize: '0.85rem', fontFamily: 'var(--fuente-hud)' }}>
            <p>Adelantar rutinas que no tocan hoy (Gasta 1 Energía). Protege contra futuros fallos automáticos.</p>
            {fueraDeHorario.map(r => (
              <div key={r.id} className={styles.lineaTarea} style={{ borderColor: 'var(--azul-ego)' }}>
                <div className={styles.tareaRowMain}>
                  <div className={styles.tareaInfo}>
                    <div className={styles.tareaNombre} style={{ color: 'var(--azul-ego)' }}>{r.nombre}</div>
                  </div>
                  <div className={styles.btnGroup}>
                    <button className={styles.btnTactic} onClick={() => handleForge(r.id)} disabled={loading} style={{ borderColor: 'var(--azul-ego)', color: 'var(--azul-ego)' }}>FORJAR ESCUDO (Coste: 1 Energía)</button>
                  </div>
                </div>
              </div>
            ))}
            {fueraDeHorario.length === 0 && <p>No hay rutinas no diarias o todas tienen escudo.</p>}
          </div>
        </div>
      </div>
      
      {/* CRUD Form (simplificado visualmente) */}
      <details style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', padding: '15px', marginTop: '20px', borderRadius: '4px' }}>
        <summary style={{ color: 'var(--verde-triage)', fontFamily: 'var(--fuente-hud)', cursor: 'pointer', fontWeight: 'bold' }}>+ Programar Nueva Tarea/Hábito</summary>
        <p style={{ color: '#a0aec0', fontSize: '0.8rem', marginTop: '10px' }}>* La lógica de almacenamiento interactivo para nuevas rutinas será integrada completamente en la capa de persistencia en breves. El modelo de datos ya lo soporta.</p>
      </details>
    </div>
  );
};
