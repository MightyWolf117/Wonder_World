import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { StateAPI, GameState, LairAPI } from '../api/client';
import styles from './LairView.module.css';

const CATALOGO_RELOJ = [
  { id: "I", nombre: "Gruñir (Jugar corto)", desc: "-1 Estrés", costes: [ ['D'], ['Ds'] ], reqLimpieza: true },
  { id: "II", nombre: "Ladear la cabeza (Descansar)", desc: "-1 Estrés", costes: [ ['Ds'], ['D', 'D'] ], reqLimpieza: false },
  { id: "III", nombre: "Mover la cola (Social)", desc: "+1 Mood", costes: [ ['L'], ['D', 'D'], ['Ds', 'D'] ], reqLimpieza: true },
  { id: "IV", nombre: "Enroscarse (Jugar medio)", desc: "-2 Estrés", costes: [ ['S'], ['D', 'D', 'D'], ['Ds', 'D'] ], reqLimpieza: true },
  { id: "V", nombre: "Olfatearse (Aseo)", desc: "+1 Limpieza, -1 Estrés", costes: [ ['O'], ['D', 'L'], ['Ds', 'L'] ], reqLimpieza: false },
  { id: "VI", nombre: "Vigilar territorio (Ocio)", desc: "-2 Estrés", costes: [ ['S'], ['Ds', 'D', 'D'] ], reqLimpieza: false },
  { id: "VII", nombre: "Afilar garras (Aprender)", desc: "-2 Estrés, +1 Ego", costes: [ ['Ds', 'Ds'], ['O', 'D'] ], reqLimpieza: true },
  { id: "VIII", nombre: "Buscar manada (Jugar amigos)", desc: "+2 Mood", costes: [ ['S', 'L'], ['S', 'Ds'], ['S', 'S'] ], reqLimpieza: true },
  { id: "IX", nombre: "Lamerse heridas (Aseo prof.)", desc: "+2 Limpieza, -1 Estrés", costes: [ ['O', 'L'], ['O', 'Ds'], ['O', 'O'], ['Ds', 'Ds', 'L'] ], reqLimpieza: false },
  { id: "X", nombre: "Dejar huellas (Mundo)", desc: "+2 Mood, -1 Estrés", costes: [ ['S', 'O'], ['S', 'S'] ], reqLimpieza: true },
  { id: "XI", nombre: "Aullar (Jugar largo)", desc: "-4 Estrés, +2 Mood", costes: [ ['S', 'S'] ], reqLimpieza: true }
];

export const LairView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [melody, setMelody] = useState("");

  const loadData = async () => {
    try {
      const state = await StateAPI.getInitialState();
      setGameState(state);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleModLimpieza = async (delta: number) => {
    try { setLoading(true); setGameState(await LairAPI.modifyLimpieza(delta)); } finally { setLoading(false); }
  };

  const handleInject = async () => {
    if (!melody) return;
    try { 
      setLoading(true); 
      setGameState(await LairAPI.injectMelody(melody)); 
      setMelody("");
    } finally { setLoading(false); }
  };

  const handleDissolve = async (target: string) => {
    try { setLoading(true); setGameState(await LairAPI.dissolveS(target)); } finally { setLoading(false); }
  };

  const handleActivate = async (sectorId: string, costCombo: string[]) => {
    try {
      setLoading(true);
      setGameState(await LairAPI.activateSector(sectorId, costCombo));
    } finally {
      setLoading(false);
    }
  };

  const getValidCost = (costes: string[][], pool: {[key: string]: number}) => {
    for (const combo of costes) {
      if (combo.length === 0) continue;
      let valid = true;
      let tempPool = { ...pool };
      for (const nota of combo) {
        if (tempPool[nota] > 0) { tempPool[nota]--; } else { valid = false; break; }
      }
      if (valid) return combo;
    }
    return null;
  };

  if (!gameState) return <div style={{ color: 'white', padding: '20px' }}>Iniciando Guarida Lunar...</div>;

  const limpieza = gameState.limpieza;
  const pool = gameState.poolFrecuencias;

  return (
    <div className={styles.contenedor}>
      <Header title="GUARIDA LUNAR ALFA" subtitle="Terminal de Relajación Táctica">
        <Link to="/"><Button variant="advance">Volver al Core</Button></Link>
      </Header>

      <div className={styles.panelHabitat}>
        <div className={styles.habitatInfo}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>ESTADO DEL HÁBITAT</div>
            <div style={{ color: limpieza === 5 ? 'var(--verde-triage)' : (limpieza === 0 ? 'var(--rojo-frenesi)' : 'white') }}>
              {limpieza === 5 ? 'SANTUARIO IMPECABLE' : (limpieza === 0 ? 'ENTORNO CAÓTICO' : 'ESTABLE')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>LIMPIEZA ({limpieza}/5)</div>
            <div className={styles.barraLimpiezaBg}>
              <div className={styles.barraLimpiezaFill} style={{ width: `${(limpieza / 5) * 100}%`, background: limpieza === 0 ? 'var(--rojo-frenesi)' : 'var(--verde-triage)' }}></div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <Button onClick={() => handleModLimpieza(1)} disabled={loading} style={{ color: 'var(--verde-triage)' }}>+1 Limpieza</Button>
          <Button onClick={() => handleModLimpieza(-1)} disabled={loading} style={{ color: 'var(--rojo-frenesi)' }}>-1 Limpieza</Button>
        </div>
      </div>

      <div className={styles.inputSection}>
        <div style={{ marginBottom: '10px' }}>🎵 BÚSQUEDA TÁCTICA (Inyectar Cadena Melódica)</div>
        <input 
          className={styles.inputMelody} 
          placeholder="Pega la melodía aquí... (Ej: LDCCOSSLOE)" 
          value={melody} 
          onChange={e => setMelody(e.target.value.toUpperCase())} 
        />
        <Button onClick={handleInject} disabled={loading || !melody}>Cargar Cadena</Button>
      </div>

      <div className={styles.frecuenciasPool}>
        {['D', 'Ds', 'L', 'O', 'S'].map(k => (
          <div key={k} className={styles.frecuenciaToken}>
            <div style={{ color: k === 'S' ? 'var(--azul-ego)' : 'white' }}>{pool[k] || 0}</div>
            <div className={styles.frecuenciaNombre}>{k}</div>
          </div>
        ))}
      </div>

      <div className={styles.inputSection}>
        <div style={{ marginBottom: '10px' }}>⚡ MÓDULO DE ALQUIMIA (Fisión de S)</div>
        <div className={styles.alquimiaGrid}>
          <Button onClick={() => handleDissolve('O')} disabled={loading || !pool['S']}>S ➔ 1 O</Button>
          <Button onClick={() => handleDissolve('L')} disabled={loading || !pool['S']}>S ➔ 2 L</Button>
          <Button onClick={() => handleDissolve('Ds')} disabled={loading || !pool['S']}>S ➔ 2 Ds</Button>
          <Button onClick={() => handleDissolve('D')} disabled={loading || !pool['S']}>S ➔ 3 D</Button>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>⏱️ ASTROLABIO DE LA MANADA (Sectores de Ocio)</div>
      <div className={styles.astrolabeGrid}>
        {CATALOGO_RELOJ.map(sector => {
          const isBlockedByLimpieza = sector.reqLimpieza && limpieza === 0;
          const validCost = getValidCost(sector.costes, pool);

          return (
            <div key={sector.id} className={`${styles.sectorCard} ${isBlockedByLimpieza ? styles.sectorBloqueado : ''}`}>
              <div className={styles.sectorHeader}>
                <span className={styles.sectorRomano}>{sector.id}</span>
                <span className={styles.sectorNombre}>{sector.nombre}</span>
              </div>
              <div style={{ color: 'var(--verde-triage)', fontSize: '0.75rem', marginBottom: '8px' }}>Efecto: {sector.desc}</div>
              
              <div className={styles.sectorCostes}>
                Costes válidos: {sector.costes.map(c => c.join("+")).join(" o ")}
              </div>

              {isBlockedByLimpieza ? (
                <div style={{ color: 'var(--rojo-frenesi)', fontSize: '0.75rem', marginTop: 'auto' }}>
                  ⚠️ Bloqueado por Entorno Caótico
                </div>
              ) : (
                <Button 
                  disabled={loading || !validCost} 
                  onClick={() => handleActivate(sector.id, validCost!)}
                  style={{ marginTop: 'auto', borderColor: validCost ? 'var(--azul-ego)' : 'var(--borde)' }}
                >
                  {validCost ? `Activar (${validCost.join('+')})` : 'Frecuencias Insuficientes'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
