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
    const [allFamilyData, setAllFamilyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [thirdParent, setThirdParent] = useState(true); 
    const [expandedNodes, setExpandedNodes] = useState(new Set()); // Track which nodes are expanded
    const [showChildren, setShowChildren] = useState({}); // Track the visibility of children nodes
    const [selectedNode, setSelectedNode] = useState(null);

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
            console.log(data);
            data.sort((a, b) => a.id - b.id);  // Sort data by id
            const formattedData = formatTreeData(data);
            setFamilyData(formattedData);
            setAllFamilyData(formattedData);
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
                if (map.has(item.parentid)) {
                    map.get(item.parentid).children.push(map.get(item.id));
                }
            } else {
                tree.push(map.get(item.id));
            }
        });

        return tree;
    };

    const renderTree = (nodes) => {
        return nodes.map((node) => {
            const isExpanded = showChildren[node.id];
            return (
                <TreeNode key={node.id} label={<CustomNode node={node} onClick={handleNodeClick} />}>
                    {isExpanded && node.children && node.children.length > 0 && renderTree(node.children)}
                </TreeNode>
            );
        });
    };

    function getThirdParent(node) {

        console.log(`node: ${JSON.stringify(node)}`);
        console.log(`parent_node: ${JSON.stringify(findNodeById(node.parentid, familyData))}`)

        const firstParent = findNodeById(node.parentid, familyData);
        if (!firstParent) return allFamilyData; // If no first parent, return an empty array

        const secondParent = findNodeById(firstParent.parentid, familyData);
        if (!secondParent) return allFamilyData; // If no second parent, return an empty array

        const thirdParent = findNodeById(secondParent.parentid, familyData);
        if (!thirdParent) return allFamilyData; // If no third parent, return an empty array

        thirdParent.parentid = null;
        //setThirdParent(thirdParent);
        return [thirdParent]; // Return third parent as an array
    }


    function findNodeById(id, data) {
        for (const parent of data) {
            if (parent.id === id) return parent;
            const child = findNodeById(id, parent.children || []);
            if (child) return child;
        }
        return null;
    }

    const handleNodeClick = (node) => {
        // Reset familyData before updating it
        setFamilyData([]);

        // Get the third parent of the selected node
        const nodesToRender = getThirdParent(node, allFamilyData);

        // Set the selected node to the clicked node
        setSelectedNode(node);

        // Rebind the familyData with the third parent
        setFamilyData(nodesToRender);

        setShowChildren((prev) => ({
            ...prev,
            [node.id]: !prev[node.id], // Toggle visibility of the clicked node's children
        }));
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
                    <Box
                        sx={{
                            width: '100%',
                            height: '80vh',
                            display: 'flex',
                            justifyContent: 'center',
                            overflow: 'auto',
                            padding: 2,
                        }}
                    >
                        <Tree
                            lineWidth={'2px'}
                            lineColor={'#0A74DA'}
                            lineBorderRadius={'10px'}
                            label={<CustomNode node={familyData[0]} onClick={handleNodeClick} />}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '10px',
                                width: '50%',
                                flexDirection: 'column',
                            }}
                        >
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
