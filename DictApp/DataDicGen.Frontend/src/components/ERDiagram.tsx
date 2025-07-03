import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './ERDiagram.css';
import { TableSchemaDto, ColumnSchemaDto } from '../types/api-types';

// Componente personalizado para las tablas
const TableNode = ({ data }: { data: any }) => {
  return (
    <div className="table-node">
      <div className="table-header">
        <strong>{data.tableName}</strong>
      </div>
      <div className="table-columns">
        {data.columns.map((column: ColumnSchemaDto, index: number) => (
          <div 
            key={index} 
            className={`column ${column.isPrimaryKey ? 'primary-key' : ''} ${column.isForeignKey ? 'foreign-key' : ''}`}
          >
            <span className="column-name">{column.columnName}</span>
            <span className="column-type">{column.dataType}</span>
            {column.isPrimaryKey && <span className="pk-indicator">🔑</span>}
            {column.isForeignKey && <span className="fk-indicator">🔗</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Tipos de nodos personalizados
const nodeTypes = {
  tableNode: TableNode,
};

interface ERDiagramProps {
  tables: TableSchemaDto[];
}

export const ERDiagram: React.FC<ERDiagramProps> = ({ tables }) => {
  // Generar nodos a partir de las tablas
  const initialNodes: Node[] = useMemo(() => {
    return tables.map((table, index) => ({
      id: table.tableName,
      type: 'tableNode',
      position: { 
        x: (index % 3) * 350, 
        y: Math.floor(index / 3) * 300 
      },
      data: {
        tableName: table.tableName,
        columns: table.columns,
      },
    }));
  }, [tables]);

  // Generar edges basándose en las relaciones
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    tables.forEach((table) => {
      if (table.tableRelationships && table.tableRelationships !== "Sin relaciones detectadas.") {
        // Buscar nombres de tablas en el texto de relaciones
        const relationshipText = table.tableRelationships.toLowerCase();
        
        tables.forEach((otherTable) => {
          if (otherTable.tableName !== table.tableName && 
              relationshipText.includes(otherTable.tableName.toLowerCase())) {
            
            edges.push({
              id: `${table.tableName}-${otherTable.tableName}`,
              source: table.tableName,
              target: otherTable.tableName,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#3498db', strokeWidth: 2 },
              label: 'Relación'
              // Quitar markerEnd para evitar error de handles
            });
          }
        });
      }
    });
    
    return edges;
  }, [tables]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="er-diagram-container">
      <div className="er-diagram-header">
        <h3>Diagrama Entidad-Relación</h3>
        <p>Visualización interactiva de la estructura de la base de datos</p>
      </div>
      <div className="er-diagram" style={{ width: '100%', height: '600px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
};