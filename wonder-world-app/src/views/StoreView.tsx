import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { StateAPI, GameState, StoreAPI, StoreCatalog } from '../api/client';
import { useDialog } from '../components/ui/DialogContext';
import styles from './StoreView.module.css';

export const StoreView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [catalog, setCatalog] = useState<StoreCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [canjesOpen, setCanjesOpen] = useState(false);
  const [tradeMultiplier, setTradeMultiplier] = useState(1);
  const { showAlert } = useDialog();

  const loadData = async () => {
    try {
      const [state, cat] = await Promise.all([
        StateAPI.getInitialState(),
        StoreAPI.getCatalog()
      ]);
      setGameState(state);
      setCatalog(cat);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTrade = async (type: string) => {
    try {
      setLoading(true);
      const state = await StoreAPI.trade(type, tradeMultiplier);
      setGameState(state);
      showAlert({ message: `Transacción (x${tradeMultiplier}) completada exitosamente.`, type: 'info' });
    } catch (err: any) {
      showAlert({ message: err.message || "Canje fallido: Revisa si tienes los recursos necesarios.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPlatoon = async (id: string) => {
    try {
      setLoading(true);
      const state = await StoreAPI.buyPlatoon(id);
      setGameState(state);
      showAlert({ message: "Reclutamiento exitoso. La tropa se ha unido a la causa.", type: 'info' });
    } catch (err: any) {
      showAlert({ message: err.message || "Compra fallida: Monedas insuficientes.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBuySecret = async (id: string) => {
    try {
      setLoading(true);
      const state = await StoreAPI.buySecretItem(id);
      setGameState(state);
      showAlert({ message: "Transacción encriptada completada.", type: 'info' });
    } catch (err: any) {
      showAlert({ message: err.message || "Compra fallida: Recursos insuficientes.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!gameState || !catalog) return <div style={{ color: 'white', padding: '20px' }}>Iniciando enlace con la Tienda...</div>;

  return (
    <div className={styles.contenedor}>
      <Header title="ALPHA FENRIR TACTICAL CORE" subtitle="La Tienda de la Manada">
        <Link to="/"><Button variant="advance">Volver al Core</Button></Link>
      </Header>

      <div className={styles.hudRecursos}>
        <div className={styles.recursoCaja}>
          <div className={styles.recursoTitulo}>MONEDAS DE MANADA</div>
          <div className={styles.controlesRecurso}>
            <div className={styles.recursoValor}>{gameState.monedas}</div>
          </div>
        </div>
        <div className={styles.recursoCaja}>
          <div className={styles.recursoTitulo}>MONEDAS IRROMPIBLES</div>
          <div className={styles.controlesRecurso}>
            <div className={styles.recursoValor} style={{ color: 'var(--azul-ego)' }}>{gameState.monedasIrrompibles}</div>
          </div>
        </div>
        <div className={styles.recursoCaja}>
          <div className={styles.recursoTitulo}>EVENTOS POSITIVOS</div>
          <div className={styles.controlesRecurso}>
            <div className={styles.recursoValor} style={{ color: 'var(--amarillo-mood)' }}>{gameState.eventos}</div>
          </div>
        </div>
      </div>

      <div className={styles.canjesContainer}>
        <div className={styles.canjesHeader} onClick={() => setCanjesOpen(!canjesOpen)}>
          <span>🔄 VER CANJES INVERSOS (CONVERSIÓN DE EXCEDENTES)</span>
          <span>{canjesOpen ? '▲' : '▼'}</span>
        </div>
        {canjesOpen && (
          <div className={styles.canjesBody}>
            <div style={{ padding: '10px 15px', textAlign: 'right', color: 'var(--texto)' }}>
              Multiplicador (x): <input type="number" min="1" value={tradeMultiplier} onChange={e => setTradeMultiplier(Math.max(1, parseInt(e.target.value) || 1))} style={{ width: '60px', padding: '5px', background: '#08090c', color: 'white', border: '1px solid var(--borde)', borderRadius: '4px', textAlign: 'center' }} />
            </div>
            <table className={styles.tablaCanjes}>
              <thead>
                <tr>
                  <th>Recurso Consumido (Excedente)</th>
                  <th>Resultado Obtenido</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: 'var(--rojo-alerta)' }}>+{1 * tradeMultiplier} Pobreza de Estrés</strong></td>
                  <td><span style={{ color: 'var(--amarillo-mood)' }}>+{1 * tradeMultiplier} Evento Positivo</span></td>
                  <td><button className={styles.btnTrade} onClick={() => handleTrade('estres_evento')} disabled={loading}>Canjear</button></td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--verde-triage)' }}>-{2 * tradeMultiplier} Puntos de Energía</strong></td>
                  <td><span style={{ color: 'white' }}>+{1 * tradeMultiplier} Moneda de Manada</span></td>
                  <td><button className={styles.btnTrade} onClick={() => handleTrade('energia_moneda')} disabled={loading || gameState.energia < (2 * tradeMultiplier)}>Canjear</button></td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--verde-triage)' }}>-{4 * tradeMultiplier} Puntos de Energía</strong></td>
                  <td><span style={{ color: 'var(--azul-ego)' }}>+{1 * tradeMultiplier} Moneda Irrompible</span></td>
                  <td><button className={styles.btnTrade} onClick={() => handleTrade('energia_irrompible')} disabled={loading || gameState.energia < (4 * tradeMultiplier)}>Canjear</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.seccionTitulo}>🛡️ TIENDA DEL BATALLÓN</div>
      <div className={styles.gridTropas}>
        {catalog.platoons.map((p: any, _idx: number) => (
          <div key={p.id} className={styles.cardTropa}>
            <div className={styles.tropaHeader}>
              <div>
                <div className={styles.tropaNombre}>{p.nombre}</div>
                <div className={styles.tropaBeneficio}>Beneficio Base: {p.productoDesc}</div>
              </div>
            </div>
            <div className={styles.gridMateria}>
              {p.integrantes?.map((m: any, idx: number) => (
                <div key={idx} className={styles.materiaCard}>
                  <div className={styles.miembroNombre}>{m.nombre} - {m.mensaje}</div>
                  <div className={styles.miembroEfecto}>{m.efecto}</div>
                </div>
              ))}
            </div>
            <Button 
              variant="advance" 
              style={{ width: '100%', borderColor: 'var(--verde-triage)', color: 'var(--verde-triage)' }}
              onClick={() => handleBuyPlatoon(p.id)}
              disabled={loading || gameState.monedas < p.costoMonedas}
            >
              🛒 Reclutar ({p.costoDesc})
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.seccionTitulo} style={{ color: 'var(--morado-secreto, #9f7aea)' }}>👁️ TIENDA SECRETA</div>
      <div className={styles.gridSecreta}>
        {catalog.secretItems.map(s => (
          <div key={s.id} className={styles.cardSecreta}>
            <div className={styles.secretaNombre}>{s.nombre}</div>
            <div className={styles.secretaEfecto}>{s.efecto}</div>
            <Button 
              style={{ width: '100%', fontSize: '0.8rem' }}
              onClick={() => handleBuySecret(s.id)}
              disabled={loading}
            >
              Comprar ({s.costoDesc})
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
