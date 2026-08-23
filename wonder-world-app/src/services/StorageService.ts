export const StorageService = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  },
  load: <T>(key: string): T | null => {
    try {
      const val = localStorage.getItem(key);
      if (val) return JSON.parse(val) as T;
    } catch (e) {
      console.error("Error loading from localStorage", e);
    }
    return null;
  },
  exportFullBackup: () => {
    const backup: Record<string, any> = {};
    const KNOWN_KEYS = [
      'wonder_world_state',
      'wonder_world_state_history',
      'wonder_world_egos',
      'wonder_world_routines',
      'wonder_world_inventory'
    ];
    
    let found = 0;

    for (const key of KNOWN_KEYS) {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          backup[key] = JSON.parse(val);
          found++;
        }
      } catch (e) {
        console.error(`Error parsing key ${key} for backup`);
      }
    }

    if (found === 0) {
      backup["_DEBUG_ERROR"] = "Ninguna de las llaves conocidas existe en localStorage.";
    }

    return JSON.stringify(backup, null, 2);
  },
  importFullBackup: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) throw new Error("Invalid backup format");
      
      let importedKeys = 0;
      const KNOWN_KEYS = [
        'wonder_world_state',
        'wonder_world_state_history',
        'wonder_world_egos',
        'wonder_world_routines',
        'wonder_world_inventory'
      ];

      // Verificar si es un archivo de backup del formato antiguo (Legacy)
      if (data.energia !== undefined && data.estres !== undefined) {
        localStorage.setItem('wonder_world_state', JSON.stringify(data));
        importedKeys++;
        console.log("Legacy backup imported successfully.");
      } else {
        // Formato nuevo: Limpiar primero las llaves conocidas para que no quede data vieja
        for (const key of KNOWN_KEYS) {
           localStorage.removeItem(key);
        }
        
        // Recorrer e importar
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith('wonder_world_')) {
            localStorage.setItem(key, JSON.stringify(value));
            importedKeys++;
          }
        }
      }
      return importedKeys > 0;
    } catch (e) {
      console.error("Error importing backup", e);
      return false;
    }
  }
};
