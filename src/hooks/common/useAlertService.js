// hooks/common/useAlertService.js
import { useMemo } from 'react';
import { useAlertSafe } from './useAlertSafe';
import { createAlertService } from '../../services/alert/alertService';

/**
 * Hook para usar o AlertService em qualquer componente
 * Combina useAlertSafe com o serviço de alertas centralizado
 * 
 * @returns {Object} Serviço de alertas
 */
export const useAlertService = () => {
  // Obter o hook de alerta seguro
  const alertHook = useAlertSafe();
  
  // Criar e memoizar o serviço de alertas
  const alertService = useMemo(() => {
    return createAlertService(alertHook);
  }, [alertHook]);
  
  return alertService;
};

export default useAlertService;