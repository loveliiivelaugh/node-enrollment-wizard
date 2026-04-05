import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRegisteredNodes } from '../hooks/useNodeEnrollment';
import NodeStatusChip from './NodeStatusChip';

export default function NodeListTable() {
  const navigate = useNavigate();
  const { data: nodes, isLoading, isError } = useRegisteredNodes();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" sx={{ py: 2 }}>
        Failed to load nodes. Is the API running?
      </Typography>
    );
  }

  if (!nodes || nodes.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No registered nodes yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use the "Enroll New Node" button to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Display Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Hostname</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>OS</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Roles</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Environment</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Last Seen</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodes.map((node) => (
            <TableRow key={node.id} hover>
              <TableCell>{node.displayName}</TableCell>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {node.hostname}
                </Typography>
              </TableCell>
              <TableCell>{node.os}</TableCell>
              <TableCell>
                <NodeStatusChip status={node.status} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {node.roles.join(', ') || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ textTransform: 'capitalize' }}
                >
                  {node.environment}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {node.lastSeenAt
                    ? new Date(node.lastSeenAt).toLocaleString()
                    : '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/nodes/${node.id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
