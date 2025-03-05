import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    TextField,
    Paper,
    IconButton,
    CircularProgress,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    FormHelperText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminPage() {
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [newNode, setNewNode] = useState({ name: '', image: '', parentid: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNodes();
    }, []);

    const fetchNodes = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('family_tree').select('*');
        if (error) {
            console.error(error);
        } else {
            // Sort nodes by ID in ascending order
            const sortedData = data.sort((a, b) => a.id - b.id);
            setNodes(sortedData);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!selectedNode) return;

        setLoading(true);
        const { error } = await supabase
            .from('family_tree')
            .update({ name: selectedNode.name, image: selectedNode.image })
            .eq('id', selectedNode.id);

        if (error) {
            console.error(error);
        } else {
            fetchNodes();
        }
        setLoading(false);
    };

    const handleAddNode = async () => {
        if (!newNode.name) {
            alert('Please provide a name.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('family_tree')
            .insert([
                {
                    name: newNode.name,
                    image: newNode.image || null, // Make image optional
                    parentid: newNode.parentid || null, // If no parent, set it as null
                },
            ]);

        if (error) {
            console.error(error);
        } else {
            setNewNode({ name: '', image: '', parentid: '' }); // Reset the form after adding
            fetchNodes(); // Fetch updated list of nodes
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this node?')) {
            setLoading(true);
            const { error } = await supabase
                .from('family_tree')
                .delete()
                .eq('id', id);

            if (error) {
                console.error(error);
            } else {
                fetchNodes(); // Fetch updated list after deletion
            }
            setLoading(false);
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Manage Family Tree</Typography>

            {/* Add New Node Section */}
            <Typography variant="h5" sx={{ marginTop: 4 }}>Add New Node</Typography>
            <TextField
                label="Name"
                value={newNode.name}
                onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Image URL (Optional)"
                value={newNode.image}
                onChange={(e) => setNewNode({ ...newNode, image: e.target.value })}
                fullWidth
                margin="normal"
            />

            {/* Dropdown to select parent */}
            <FormControl fullWidth margin="normal">
                <InputLabel id="parent-select-label">Select Parent (optional)</InputLabel>
                <Select
                    labelId="parent-select-label"
                    value={newNode.parentid}
                    onChange={(e) => setNewNode({ ...newNode, parentid: e.target.value })}
                    label="Select Parent (optional)"
                    style={{ backgroundColor: '#f0f0f0' }}
                >
                    <MenuItem value="">None</MenuItem>
                    {nodes.map((node) => (
                        <MenuItem key={node.id} value={node.id}>
                            {node.id} - {node.name}
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>Optional</FormHelperText>
            </FormControl>

            <Button
                onClick={handleAddNode}
                disabled={loading}
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ marginTop: 2 }}
            >
                {loading ? 'Adding...' : 'Add Node'}
            </Button>

            {/* Table for Displaying Nodes */}
            {loading ? (
                <CircularProgress sx={{ marginTop: 4 }} />
            ) : (
                <TableContainer component={Paper} sx={{ marginTop: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {nodes.map((node) => (
                                <TableRow key={node.id}>
                                    <TableCell>{node.id}</TableCell>
                                    <TableCell>{node.name}</TableCell>
                                    <TableCell>
                                        {node.image ? (
                                            <img
                                                src={node.image}
                                                alt={node.name}
                                                style={{ width: 50, height: 50, borderRadius: '50%' }}
                                            />
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">No image</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => setSelectedNode(node)}
                                            color="primary"
                                            sx={{ marginRight: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(node.id)}
                                            color="secondary"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Edit Selected Node Section */}
            {selectedNode && (
                <div>
                    <Typography variant="h5" sx={{ marginTop: 4 }}>Edit Node</Typography>
                    <TextField
                        label="ID"
                        value={selectedNode.id}
                        disabled
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Name"
                        value={selectedNode.name}
                        onChange={(e) => setSelectedNode({ ...selectedNode, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Image URL"
                        value={selectedNode.image}
                        onChange={(e) => setSelectedNode({ ...selectedNode, image: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            )}
        </Container>
    );
}
