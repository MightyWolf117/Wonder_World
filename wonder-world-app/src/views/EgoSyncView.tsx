import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { TerminalLog } from '../components/ui/TerminalLog';
import styles from './EgoSyncView.module.css';
import { StateAPI, EgoAPI, GameState, EgoNode } from '../api/client';
import { Link } from 'react-router-dom';

export const EgoSyncView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [egos, setEgos] = useState<EgoNode[]>([]);
  const [melody, setMelody] = useState('');
  const [logs, setLogs] = useState<string[]>(['Matriz v2.0 en línea. Esperando directrices...']);

  const [newEgo, setNewEgo] = useState({ id: '', nombreNormal: '', nombreCorroido: '', cd: '', imagenNormalB64: '', imagenCorroidaB64: '' });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'normal'|'corroida') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          if (tipo === 'normal') {
            setNewEgo(prev => ({ ...prev, imagenNormalB64: dataUrl }));
          } else {
            setNewEgo(prev => ({ ...prev, imagenCorroidaB64: dataUrl }));
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-9), msg]);
  };

  const loadData = async () => {
    try {
      const state = await StateAPI.getInitialState();
      const egoData = await EgoAPI.getAll();
      setGameState(state);
      setEgos(egoData);
    } catch (e: any) {
      addLog(`Error de conexión con la Matriz: ${e.message}`);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessMelody = async () => {
    if (!melody.trim()) return;
    try {
      addLog(`Procesando combustión de melodía: ${melody}`);
      const updatedEgos = await EgoAPI.processMelody(melody);
      setEgos(updatedEgos);
      setMelody('');
      addLog('Combustión finalizada exitosamente. Cooldowns reducidos.');
    } catch(e: any) { addLog('Error en la cámara de combustión.'); }
  };

  const handleActivate = async (id: string) => {
    try {
      addLog(`Activando nodo E.G.O: ${id}...`);
      await EgoAPI.activate(id);
      loadData();
    } catch(e: any) { addLog(`Error al activar ${id}`); }
  };

  const handleCreateEgo = async () => {
    if (!newEgo.id || !newEgo.nombreNormal) return;
    try {
      await EgoAPI.addEgo({
        id: newEgo.id,
        nombreNormal: newEgo.nombreNormal,
        nombreCorroido: newEgo.nombreCorroido,
        cooldownMax: parseInt(newEgo.cd) || 10,
        cooldownActual: 0,
        descNormal: 'Nuevo aliado registrado en la Matriz.',
        descCorroida: 'Aliado inestable.',
        imagenNormalB64: newEgo.imagenNormalB64 || undefined,
        imagenCorroidaB64: newEgo.imagenCorroidaB64 || undefined,
        afinidad: 'N/A'
      });
      addLog(`Nuevo E.G.O. registrado en base de datos: ${newEgo.id}`);
      setNewEgo({ id: '', nombreNormal: '', nombreCorroido: '', cd: '', imagenNormalB64: '', imagenCorroidaB64: '' });
      loadData();
    } catch(e: any) { addLog(`Error al registrar E.G.O`); }
  };

  if (!gameState) return <div className="contenedor">Cargando Matriz E.G.O...</div>;

  const isCorroded = gameState.triage === 'Rojo';

  return (
    <div className="contenedor">
      <Header title="MATRIX E.G.O. SYNC SYSTEM" subtitle="Módulo de Sincronización v2.0 | Operaciones Activas">
        <Link to="/"><Button variant="advance" style={{ color: 'var(--azul-ego)', borderColor: 'var(--azul-ego)' }}>Volver al Tactical Core</Button></Link>
      </Header>

      <div className={styles.barraSuperior}>
        <div style={{ fontFamily: 'var(--fuente-hud)', fontSize: '0.85rem' }}>
          ESTADO GLOBAL DEL TRIAGE (TACTICAL CORE):{' '}
          <strong className={isCorroded ? styles.triageRojo : styles.triageVerde}>
            {gameState.triage.toUpperCase()}
          </strong>
        </div>
      </div>

      <div className={styles.camaraCombustion}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '0.9rem', borderLeft: '3px solid var(--azul-ego)', paddingLeft: '8px' }}>
          CÁMARA DE COMBUSTIÓN: REDUCCIÓN DE ENFRIAMIENTO
        </h2>
        <p style={{ color: '#a0aec0', fontSize: '0.8rem', marginTop: '8px' }}>
          * El enfriamiento baja automáticamente 1 DÍA cada vez que pulsas "Pasar el Día".
          <br />* Puedes escribir una melodía (serie de letras largas) para bajar los Días inmediatamente (1 Día por cada 2 caracteres).
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            className={styles.inputMelodia}
            value={melody}
            onChange={(e) => setMelody(e.target.value)}
            placeholder="PEGA TU MELODÍA AQUÍ (EJ: SSS, CODsSCS...)" 
          />
          <button className={styles.btnMelodia} onClick={handleProcessMelody}>EJECUTAR REDUCCIÓN</button>
        </div>
      </div>

      <div className={styles.gridEgos}>
        {egos.map(ego => {
          const isReady = ego.cooldownActual === 0;
          const egoIsCorroded = isCorroded || !isReady;
          const currentImage = egoIsCorroded ? (ego.imagenCorroidaB64 || ego.imagenNormalB64) : ego.imagenNormalB64;

          return (
            <div key={ego.id} className={`${styles.egoCard} ${egoIsCorroded ? styles.egoCardCorroido : ''}`}>
              {currentImage ? (
                <img src={currentImage} alt={ego.nombreNormal} className={styles.fotoEgo} />
              ) : (
                <div className={styles.fotoPlaceholder}>FOTO REQUERIDA</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span className={`${styles.egoNombre} ${egoIsCorroded ? styles.egoNombreCorroido : ''}`}>
                  {egoIsCorroded ? ego.nombreCorroido : ego.nombreNormal}
                </span>
                {!isReady && <span className={styles.cooldownBadge}>{ego.cooldownActual} DÍAS CD</span>}
              </div>
              <p style={{ fontSize: '0.82rem', minHeight: '60px', color: '#a0aec0' }}>
                {egoIsCorroded ? ego.descCorroida : ego.descNormal}
              </p>
              <button 
                className={`${styles.btnActivar} ${egoIsCorroded ? styles.btnActivarCorroido : ''}`}
                onClick={() => handleActivate(ego.id)}
                disabled={!isReady}
              >
                {isReady ? 'ACTIVAR E.G.O.' : 'EN ENFRIAMIENTO'}
              </button>
            </div>
          );
        })}
      </div>

      <details style={{ background: 'var(--bg-tarjeta)', border: '1px solid var(--borde)', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
        <summary style={{ color: 'var(--verde-triage)', fontFamily: 'var(--fuente-hud)', cursor: 'pointer', fontWeight: 'bold' }}>+ Registrar Nuevo Aliado / E.G.O.</summary>
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
          {newEgo.imagenNormalB64 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#a0aec0', fontSize: '0.7rem' }}>Normal</div>
              <img src={newEgo.imagenNormalB64} alt="Preview Normal" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--borde)' }} />
            </div>
          )}
          {newEgo.imagenCorroidaB64 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--rojo-crisis, #ff3333)', fontSize: '0.7rem' }}>Corroída</div>
              <img src={newEgo.imagenCorroidaB64} alt="Preview Corroida" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--rojo-crisis, #ff3333)' }} />
            </div>
          )}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '15px' }}>
          <input placeholder="Clave ID (Ej: kaiser)" value={newEgo.id} onChange={e => setNewEgo({...newEgo, id: e.target.value})} style={{ background: '#0c1017', color: '#fff', border: '1px solid var(--borde)', padding: '8px', fontFamily: 'var(--fuente-hud)' }} />
          <input placeholder="Nombre Normal" value={newEgo.nombreNormal} onChange={e => setNewEgo({...newEgo, nombreNormal: e.target.value})} style={{ background: '#0c1017', color: '#fff', border: '1px solid var(--borde)', padding: '8px', fontFamily: 'var(--fuente-hud)' }} />
          <input placeholder="Nombre Corroído" value={newEgo.nombreCorroido} onChange={e => setNewEgo({...newEgo, nombreCorroido: e.target.value})} style={{ background: '#0c1017', color: '#fff', border: '1px solid var(--borde)', padding: '8px', fontFamily: 'var(--fuente-hud)' }} />
          <input placeholder="Enfriamiento Máximo (Días)" type="number" value={newEgo.cd} onChange={e => setNewEgo({...newEgo, cd: e.target.value})} style={{ background: '#0c1017', color: '#fff', border: '1px solid var(--borde)', padding: '8px', fontFamily: 'var(--fuente-hud)' }} />
          <div style={{ background: '#0c1017', border: '1px solid var(--borde)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <label style={{ color: '#a0aec0', fontFamily: 'var(--fuente-hud)', fontSize: '0.8rem', cursor: 'pointer' }}>
               Cargar Foto Normal
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'normal')} style={{ display: 'none' }} />
             </label>
          </div>
          <div style={{ background: '#1a0a0a', border: '1px solid var(--borde-crisis, #ff3333)', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <label style={{ color: '#ff9999', fontFamily: 'var(--fuente-hud)', fontSize: '0.8rem', cursor: 'pointer' }}>
               Cargar Foto Corroída
               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'corroida')} style={{ display: 'none' }} />
             </label>
          </div>
        </div>
        <Button onClick={handleCreateEgo} variant="advance" style={{ marginTop: '15px', width: '100%' }}>Añadir E.G.O. a la Matriz</Button>
      </details>

      <TerminalLog logs={logs} />
    </div>
  );
};
