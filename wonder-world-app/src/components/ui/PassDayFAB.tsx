import React, { useState, useEffect } from 'react';
import { GameState, StateAPI, RoutinePenalties, RoutineAPI } from '../../api/client';
import { Button } from './Button';
import { Modal } from './Modal';
import { useDialog } from './DialogContext';
import styles from './PassDayFAB.module.css';
import { useNavigate } from 'react-router-dom';

export const PassDayFAB: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [estimation, setEstimation] = useState<RoutinePenalties | null>(null);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useDialog();
  const navigate = useNavigate();

  const loadState = async () => {
    const state = await StateAPI.getInitialState();
    setGameState(state);
  };

  useEffect(() => {
    loadState();
  }, []);

  const handleIntentarPasarDia = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await loadState();
      const est = await RoutineAPI.getEstimation();
      setEstimation(est);
      setShowModal(true);
    } catch (err: any) {
      showAlert({ message: "Error al estimar el fin de día.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResetDay = async () => {
    try {
      setLoading(true);
      await StateAPI.pasarDia();
      setShowModal(false);
      showAlert({ message: "Un nuevo día ha comenzado.", type: 'info' });
      navigate('/');
      window.location.reload();
    } catch (err: any) {
      showAlert({ message: err.message || "Error al avanzar el día.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!gameState) return null;

  return (
    <>
      <div className={styles.fabContainer} onClick={handleIntentarPasarDia}>
        <div className={styles.fabButton}>
          <span className={styles.fabIcon}>⏳</span>
          <span className={styles.fabText}>Pasar el Día</span>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="CONFIRMAR FIN DE JORNADA">
        <div style={{ color: 'var(--texto)', marginBottom: '20px' }}>
          <p>Se reiniciarán las rutinas y se aplicarán los resultados del día.</p>
          
          {estimation && (
            <ul style={{ background: '#0a0a0a', padding: '15px 30px', borderRadius: '4px', border: '1px solid #333' }}>
              {estimation.energia < 0 && <li style={{ color: 'var(--verde-triage)' }}>Rutinas (Energía): {estimation.energia}</li>}
              {estimation.estres > 0 && <li style={{ color: 'var(--rojo-alerta)' }}>Rutinas (Estrés): +{estimation.estres}</li>}
              {estimation.mood < 0 && <li style={{ color: 'var(--amarillo-mood)' }}>Rutinas (Mood): {estimation.mood}</li>}
              {estimation.ego < 0 && <li style={{ color: 'var(--morado-secreto)' }}>Rutinas (Puntos E.G.O): {estimation.ego}</li>}
              
              {/* Avisos de Jefes Activos o Enrage */}
              {gameState.activeBosses.filter(b => b.estadoFinal !== "terminado" && b.estadoFinal !== "domado" && ((b.tipo === "domable" && b.diasActivos >= b.limiteDias) || (b.tipo === "indomable" && b.hpRupturaActual > 0))).map(b => (
                <li key={b.id} style={{ color: 'var(--rojo-frenesi)', fontWeight: 'bold' }}>
                  ⚠️ Jefe [{b.nombre}]: Daño Inminente (-{b.valorCastigo} {b.statCastigo})
                </li>
              ))}

              {estimation.energia === 0 && estimation.estres === 0 && estimation.mood === 0 && estimation.ego === 0 && !gameState.activeBosses.some(b => b.estadoFinal !== "terminado" && b.estadoFinal !== "domado" && ((b.tipo === "domable" && b.diasActivos >= b.limiteDias) || (b.tipo === "indomable" && b.hpRupturaActual > 0))) && (
                <li style={{ color: 'var(--verde-triage)', listStyle: 'none', marginLeft: '-20px' }}>No hay penalizaciones pendientes.</li>
              )}
            </ul>
          )}
          <p style={{ fontSize: '0.8rem', color: '#888' }}>¿Proceder al siguiente ciclo?</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button onClick={() => setShowModal(false)} disabled={loading}>Cancelar</Button>
          <Button variant="advance" onClick={handleConfirmResetDay} disabled={loading} style={{ color: 'var(--rojo-frenesi)' }}>
            {loading ? 'Procesando...' : 'Confirmar Pase de Día'}
          </Button>
        </div>
      </Modal>
    </>
  );
};
