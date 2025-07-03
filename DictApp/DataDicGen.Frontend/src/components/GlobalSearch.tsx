import React, { useState, useMemo } from 'react';
import { TextField, Box, Typography, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface GlobalSearchProps {
  tables: any[];
  onSearchResults: (filteredTables: any[]) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ tables, onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTables = useMemo(() => {
    if (!searchTerm.trim()) {
      return tables;
    }

    const term = searchTerm.toLowerCase();
    return tables.filter(table => {
      // Buscar en nombre de tabla
      const tableNameMatch = table.tableName.toLowerCase().includes(term);
      
      // Buscar en descripción de tabla
      const tableDescMatch = table.tableDescription?.toLowerCase().includes(term) || false;
      
      // Buscar en nombres de columnas
      const columnNameMatch = table.columns.some((col: any) => 
        col.columnName.toLowerCase().includes(term)
      );
      
      // Buscar en descripciones de columnas
      const columnDescMatch = table.columns.some((col: any) => 
        col.description?.toLowerCase().includes(term) || false
      );
      
      // Buscar en tipos de datos
      const dataTypeMatch = table.columns.some((col: any) => 
        col.dataType.toLowerCase().includes(term)
      );

      return tableNameMatch || tableDescMatch || columnNameMatch || columnDescMatch || dataTypeMatch;
    });
  }, [tables, searchTerm]);

  // Notificar resultados al componente padre
  React.useEffect(() => {
    onSearchResults(filteredTables);
  }, [filteredTables, onSearchResults]);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        placeholder="🔍 Buscar tablas, columnas, tipos de datos..."
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
        variant="outlined"
        sx={{ borderRadius: 2 }}
      />
      {searchTerm && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {filteredTables.length} resultado(s) encontrado(s) para "{searchTerm}"
        </Typography>
      )}
    </Box>
  );
};
