import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Box, CircularProgress, Container, Typography, Paper } from '@mui/material';
import dynamic from 'next/dynamic';

// Dynamically import Tree and TreeNode to avoid SSR issues
const Tree = dynamic(() => import('react-organizational-chart').then(mod => mod.Tree), { ssr: false });
const TreeNode = dynamic(() => import('react-organizational-chart').then(mod => mod.TreeNode), { ssr: false });

// Custom node rendering function
const CustomNode = ({ node, onClick }) => (
    <Paper
        style={{
            backgroundColor: '#fffaaa', // Soft blue color for cards
            padding: '8px 16px', // Smaller padding to make the card smaller
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            cursor: 'pointer',
            fontFamily: 'Eskander, Arial, sans-serif', // Apply Eskander Arabic font style
        }}
        onClick={() => onClick(node)}
    >
        {node.image && (
            <img
                src={node.image}
                alt={node.name}
                style={{
                    borderRadius: '50%',
                    width: '60px', // Smaller image size
                    height: '60px',
                    objectFit: 'cover',
                    marginBottom: '8px', // Adjust margin for smaller cards
                }}
            />
        )}
        <Typography
            variant="body2"
            style={{
                fontWeight: 'bold',
                color: '#333',
                fontSize: '14px', // Smaller font size
                lineHeight: '1.2',
            }}
        >
            {node.name}
        </Typography>
    </Paper>
);

export default function FamilyPage() {
    const [familyData, setFamilyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedNodes, setExpandedNodes] = useState(new Set()); // Track which nodes are expanded
    const [showChildren, setShowChildren] = useState({}); // Track the visibility of children nodes

    useEffect(() => {
        // Load the Eskander font only in the browser (client-side)
        const loadFont = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Eskander&display=swap';
            document.head.appendChild(link);
        };
        loadFont();

        fetchFamilyData();
    }, []);

    const fetchFamilyData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('family_tree').select('*');
        if (error) {
            console.error(error);
        } else {
            const formattedData = formatTreeData(data);
            console.log('Formatted Family Data:', formattedData); // Log data structure
            setFamilyData(formattedData);
        }
        setLoading(false);
    };

    const formatTreeData = (data) => {
        if (!Array.isArray(data)) return [];

        const map = new Map();
        data.forEach((item) => {
            map.set(item.id, { ...item, children: [] });
        });

        const tree = [];
        data.forEach((item) => {
            if (item.parentid) {
                // If the parent exists, push the current item to the parent's children array
                if (map.has(item.parentid)) {
                    map.get(item.parentid).children.push(map.get(item.id));
                }
            } else {
                // If no parent, it is a root node
                tree.push(map.get(item.id));
            }
        });

        return tree;
    };

    // Recursive function to render nodes with children
    const renderTree = (nodes) => {
        return nodes.map((node) => {
            const isExpanded = showChildren[node.id]; // Check if children are visible for this node

            return (
                <TreeNode key={node.id} label={<CustomNode node={node} onClick={handleNodeClick} />}>
                    {/* Render the children if expanded */}
                    {isExpanded && node.children && node.children.length > 0 && renderTree(node.children)}
                </TreeNode>
            );
        });
    };

    // Handle node click to toggle visibility of children
    const handleNodeClick = (node) => {
        setShowChildren((prev) => {
            return {
                ...prev,
                [node.id]: !prev[node.id], // Toggle the visibility of children
            };
        });
    };

    return (
        <Container>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                py={4}
            >
                <Typography variant="h4" gutterBottom style={{ fontFamily: 'Eskander, Arial, sans-serif' }}>
                    شجره عائله ال داوود بيت محسير
                </Typography>
                {loading ? (
                    <CircularProgress />
                ) : familyData.length > 0 ? (
                    <Box sx={{ width: '100%', height: '80vh', display: 'flex', justifyContent: 'center' }}>
                        <Tree
                            lineWidth={'2px'}
                            lineColor={'#0A74DA'}
                            lineBorderRadius={'10px'}
                            label={<CustomNode node={familyData[0]} onClick={handleNodeClick} />}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '10px', // To give space between nodes
                                width: '50%',
                            }}
                        >
                            {/* Render the root node */}
                            {renderTree(familyData[0].children)}
                        </Tree>
                    </Box>
                ) : (
                    <Typography variant="h6" color="textSecondary">
                        No family data available.
                    </Typography>
                )}
            </Box>
        </Container>
    );
}
