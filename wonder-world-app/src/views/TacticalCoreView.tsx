import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { TerminalLog } from '../components/ui/TerminalLog';
import styles from './TacticalCoreView.module.css';
import { GameState, StateAPI } from '../api/client';
import { StorageService } from '../services/StorageService';
import { EgoService } from '../services/EgoService';
import { Link } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';

export const TacticalCoreView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [logs, setLogs] = useState<string[]>(['Sistema v1.0.0 en línea. Conectando al servidor...']);
  const [loading, setLoading] = useState(true);

  const addLog = (msg: string) => {
    setLogs(prev => {
      const newLogs = [...prev, msg];
      // Mantener solo los últimos 10 logs
      if (newLogs.length > 10) return newLogs.slice(newLogs.length - 10);
      return newLogs;
    });
  };

  useEffect(() => {
    const loadState = async () => {
      try {
        addLog('Iniciando sincronización con el servidor central...');
        const state = await StateAPI.getInitialState();
        setGameState(state);
        addLog('Sincronización exitosa. Datos recibidos.');
      } catch (error: any) {
        addLog(`ERROR de conexión: ${error.message || 'El servidor ASP.NET está inactivo'}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadState();
  }, []);

  const [showHelp, setShowHelp] = useState(false);

  const handleDescanso = async () => {
    if (loading) return;
    setLoading(true);
    addLog('Iniciando protocolo de Descanso Total...');
    try {
      const newState = await StateAPI.descansoTotal();
      setGameState(newState);
      addLog('Descanso completado. Energía al máximo. Estrés purgado.');
    } catch (error: any) { addLog(`ERROR: ${error.message}`); }
    finally { setLoading(false); }
  };

  const handleResetDay = async () => {
    if (loading) return;
    setLoading(true);
    addLog('Forzando reinicio de jornada (Reset Day)...');
    try {
      const newState = await StateAPI.resetDay();
      setGameState(newState);
      addLog('Jornada reiniciada. Ticks restaurados a 20.');
    } catch (error: any) { addLog(`ERROR: ${error.message}`); }
    finally { setLoading(false); }
  };

  const handleUndo = async () => {
    if (loading) return;
    setLoading(true);
    addLog('Intentando revertir último comando (Undo)...');
    try {
      const newState = await StateAPI.undo();
      setGameState(newState);
      addLog('Reversión exitosa. Estado anterior restaurado.');
    } catch (error: any) { 
      addLog(`ERROR Undo: ${error.response?.data?.message || error.message}`); 
    }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    if (!gameState) return;
    try {
      // Forzar que todos los servicios guarden su estado actual en localStorage antes de exportar
      EgoService.getNodes(); // esto carga, no guarda. Mejor no usar Service si no tiene forceSave
      
      const rawBackupStr = StorageService.exportFullBackup();
      const backupData = JSON.parse(rawBackupStr);
      
      // Inyección forzada de memoria RAM
      backupData.wonder_world_state = gameState;
      if (!backupData.wonder_world_egos) backupData.wonder_world_egos = EgoService.getNodes();
      
      // Si la rutina no existe, le ponemos un array vacío
      if (!backupData.wonder_world_routines) backupData.wonder_world_routines = [];
      
      if (backupData._DEBUG_ERROR) {
        delete backupData._DEBUG_ERROR;
      }
      
      const fullBackup = JSON.stringify(backupData, null, 2);
      
      try {
         // Intentar con API Nativa de Tauri (Desktop/Android)
         const filePath = await save({
            filters: [{ name: 'Wonder World Backup', extensions: ['json'] }],
            defaultPath: `TacticalCore_Backup_${Date.now()}.json`,
         });
         
         if (filePath) {
            await writeTextFile(filePath, fullBackup);
            addLog('Backup Full exportado exitosamente usando almacenamiento nativo.');
         } else {
            addLog('Exportación cancelada por el usuario.');
         }
      } catch (tauriError) {
         // Fallback Web (Browser estándar) - Usando Blob para mayor seguridad
         const blob = new Blob([fullBackup], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const dlAnchor = document.createElement('a');
         dlAnchor.setAttribute("href", url);
         dlAnchor.setAttribute("download", `TacticalCore_Backup_${Date.now()}.json`);
         document.body.appendChild(dlAnchor);
         dlAnchor.click();
         dlAnchor.remove();
         URL.revokeObjectURL(url);
         addLog('Backup Full exportado vía descarga web.');
      }
    } catch(err) {
      addLog('Error crítico durante la exportación.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonString = e.target?.result as string;
        addLog('Importando Full Backup...');
        setLoading(true);
        
        const success = StorageService.importFullBackup(jsonString);
        if (success) {
           addLog('Restauración completada con éxito. Reiniciando subsistemas...');
           setTimeout(() => {
             window.location.reload();
           }, 1500);
        } else {
           addLog('Error: El archivo JSON no tiene el formato de Full Backup correcto.');
        }
      } catch(err) {
        addLog('Error: Archivo JSON corrupto o inválido.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input file
  };

  const getDiaSemana = () => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[new Date().getDay()];
  };
  const subtitleDay = `${getDiaSemana()} | Operaciones Activas v1.0.0`;

  if (!gameState) {
    return (
      <div className="contenedor">
        <Header title="ALPHA FENRIR TACTICAL CORE" subtitle={subtitleDay} />
        <TerminalLog logs={logs} />
      </div>
    );
  }

  // Cálculos de progreso para barras UI
  const progEnergia = (gameState.energia / gameState.maxEnergia) * 100;
  const progEgo = (gameState.puntosEgo / gameState.maxEgo) * 100;
  const progMood = (gameState.mood / 10) * 100;

  return (
    <div className="contenedor">
      <Header title="ALPHA FENRIR TACTICAL CORE" subtitle={subtitleDay}>
        <Link to="/ego"><Button variant="advance" style={{ color: 'var(--azul-ego)', borderColor: 'var(--azul-ego)' }}>🧠 Matrix E.G.O.</Button></Link>
        <Link to="/daily-life"><Button variant="advance" style={{ color: 'var(--verde-triage)', borderColor: 'var(--verde-triage)' }}>📋 Vida Diaria</Button></Link>
        <Link to="/hunting"><Button variant="advance" style={{ color: 'var(--rojo-alerta)', borderColor: 'var(--rojo-alerta)' }}>⚔️ Caza</Button></Link>
        <Link to="/lair"><Button variant="advance" style={{ color: 'var(--texto-plata)', borderColor: 'var(--texto-plata)' }}>🌙 Guarida</Button></Link>
        <Link to="/store"><Button variant="advance" style={{ color: 'var(--morado-secreto, #9f7aea)', borderColor: 'var(--morado-secreto, #9f7aea)' }}>🛒 Tienda</Button></Link>
        <Button onClick={handleExport} style={{ color: 'var(--azul-ego)', borderColor: 'var(--azul-ego)' }}>📥 Exportar</Button>
        <label>
          <span className={styles.btnImportar}>📤 Importar</span>
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
        <Button onClick={handleUndo} disabled={loading}>↶ Deshacer</Button>
        <Button onClick={() => setShowHelp(true)} style={{ color: 'var(--texto-plata)', borderColor: 'var(--texto-plata)' }}>❓ Ayuda</Button>
        <Button onClick={handleResetDay} disabled={loading} style={{ color: 'var(--amarillo-mood)' }}>↺ Reset Day</Button>
        <Button variant="advance" onClick={handleDescanso} disabled={loading} style={{ color: '#ffd700' }}>💤 Descanso Total</Button>
      </Header>

      <div className={styles.gridStats}>
        <div className={styles.panelPrincipal}>
          <h2>Niveles Base</h2>
          <div className={styles.barrasGroup}>
            <ProgressBar label="Energía Biológica" progress={progEnergia} value={`${gameState.energia}/${gameState.maxEnergia}`} color="var(--azul-ego)" />
            <ProgressBar label="Puntos E.G.O." progress={progEgo} value={`${gameState.puntosEgo}/${gameState.maxEgo}`} color="var(--morado-secreto)" />
            <ProgressBar label="Mood (Estado de ánimo)" progress={progMood} value={`${gameState.mood}/10`} color="var(--amarillo-mood)" />
          </div>
        </div>

        <div className={styles.panelSecundario}>
          <h2>Indicadores de Estrés</h2>
          <div style={{ textAlign: 'center' }}>
            <div className={styles.valorTriage} style={{ color: gameState.triage === 'Rojo' ? 'var(--rojo-corrosion)' : 'var(--verde-triage)' }}>
              {gameState.triage.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0' }}>
              Nivel de Estrés Acumulado: <strong style={{ color: '#fff' }}>{gameState.estres}</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '5px' }}>
              Índice de Inestabilidad: <strong style={{ color: '#fff' }}>{gameState.inestabilidad}</strong>
            </div>
          </div>
        </div>
      </div>

      <TerminalLog logs={logs} />


      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="GLOSARIO DE TÁCTICAS Y ESTADÍSTICAS">
        <div style={{ color: 'var(--texto)', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
          <h4 style={{ color: 'var(--azul-ego)', marginTop: 0 }}>⚡ Energía Biológica</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
            Es tu resistencia física y mental principal. Se consume al realizar rutinas diarias y al canjear o reclutar en la Tienda. Se recupera parcialmente (4 pts) cada día, o mediante descansos y compras específicas. Si llega a 0, entrarás en estado crítico y no podrás rendir.
          </p>

          <h4 style={{ color: 'var(--rojo-alerta)' }}>⚠️ Estrés Acumulado</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
            Representa la tensión. Aumenta naturalmente (+1) cada día y dramáticamente al fallar rutinas o recibir ataques de Jefes. Si sube demasiado, corres riesgo de colapso. Puedes reducirlo mediante las purgas en la <b>Guarida</b> o activando nodos especiales <b>E.G.O</b>.
          </p>

          <h4 style={{ color: 'var(--morado-secreto)' }}>🧠 Puntos E.G.O</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
            Moneda espiritual de tu propia psique. Se farmea completando las tareas diarias exitosamente o con tropas. Los Puntos E.G.O te permiten equipar habilidades y modificadores en la <b>Matrix E.G.O</b>.
          </p>

          <h4 style={{ color: 'var(--amarillo-mood)' }}>✨ Mood (Estado de Ánimo)</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
            Indica tu moral. Subir tu Mood a través de eventos positivos o melodías mejora tu resistencia general, mientras que tenerlo bajo (debido a penalizaciones) te acerca al caos emocional.
          </p>

          <h4 style={{ color: 'var(--oro-moneda)' }}>🪙 Monedas de Manada & Irrompibles</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
            Las Monedas de Manada se obtienen intercambiando Energía (excedente) o derrotando ciertos jefes; sirven para comprar tropas. Las Monedas Irrompibles son escasas y permiten comprar items secretos y poderosos.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
          <Button onClick={() => setShowHelp(false)} style={{ borderColor: 'var(--texto-plata)' }}>Entendido</Button>
        </div>
      </Modal>

    </div>
  );
};
