import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TextField, Button, Container, Typography } from '@mui/material';

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
            setNodes(data);
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
        if (!newNode.name || !newNode.image) {
            alert('Please provide both name and image URL.');
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('family_tree')
            .insert([
                {
                    name: newNode.name,
                    image: newNode.image,
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

    return (
        <Container>
            <Typography variant="h4">Edit Family Tree</Typography>

            {/* Dropdown to select a node to edit */}
            <select
                onChange={(e) => {
                    const nodeId = e.target.value;
                    setSelectedNode(nodes.find((n) => n.id === nodeId) || null);
                }}
                value={selectedNode ? selectedNode.id : ''}
                disabled={loading} // Disable select when loading
            >
                <option value="">Select a node</option>
                {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                        {node.name}
                    </option>
                ))}
            </select>

            {/* Render the form to edit the selected node */}
            {selectedNode && (
                <div>
                    <TextField
                        label="Name"
                        value={selectedNode.name || ''}
                        onChange={(e) => setSelectedNode({ ...selectedNode, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Image URL"
                        value={selectedNode.image || ''}
                        onChange={(e) => setSelectedNode({ ...selectedNode, image: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <Button
                        onClick={handleSave}
                        disabled={loading} // Disable save button when loading
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            )}

            {/* Loading state message */}
            {loading && <Typography variant="body1">Loading...</Typography>}

            <Typography variant="h5" sx={{ marginTop: 4 }}>Add New Node</Typography>

            {/* Form to add a new node */}
            <TextField
                label="Name"
                value={newNode.name}
                onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Image URL"
                value={newNode.image}
                onChange={(e) => setNewNode({ ...newNode, image: e.target.value })}
                fullWidth
                margin="normal"
            />
            <select
                value={newNode.parentid}
                onChange={(e) => setNewNode({ ...newNode, parentid: e.target.value })}
                fullWidth
                margin="normal"
            >
                <option value="">Select Parent (optional)</option>
                {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                        {node.name}
                    </option>
                ))}
            </select>
            <Button
                onClick={handleAddNode}
                disabled={loading} // Disable add button when loading
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ marginTop: 2 }}
            >
                {loading ? 'Adding...' : 'Add Node'}
            </Button>
        </Container>
    );
}
