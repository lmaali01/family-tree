import { useEffect, useState, useRef } from 'react';
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
            backgroundColor: '#afdafd', // White background for nodes
            padding: '6px 12px', // Reduced padding to make nodes smaller
            borderRadius: '20px',
            boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            height:'auto',
            cursor: 'pointer',
            fontFamily: 'sans-serif', // Apply Eskander font style
            color: '#333', // Dark text color
            fontWeight: 'bold', // Make text bold
        }}
        onClick={() => onClick(node)}
    >
        {node.image && (
            <img
                src={node.image}
                alt={node.name}
                style={{
                    borderRadius: '50%',
                    width: '50px', // Smaller image size
                    height: '50px',
                    objectFit: 'cover',
                    marginBottom: '6px', // Reduced space between image and text
                }}
            />
        )}
        {/* <img
            src="https://cdn-icons-png.flaticon.com/512/2815/2815428.png"
            alt="Icon"
            style={{
                width: '20px', // Smaller icon
                height: '20px',
                objectFit: 'contain',
                marginBottom: '6px', // Space between the image and the text
            }}
        /> */}
        <Typography
            variant="body2"
            style={{
                fontWeight: 'bold', // Bold text
                color: '#333',
                fontSize: '15px', // Smaller font size for compact nodes
                lineHeight: '1.2',
                fontFamily: 'revert-layer'
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
    const [expandedNodes, setExpandedNodes] = useState(new Set()); // Track expanded nodes
    const [showChildren, setShowChildren] = useState({}); // Track visibility of children nodes
    const [selectedNode, setSelectedNode] = useState(null);

    const containerRef = useRef(null); // Ref for container
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        // Load the Eskander font only in the browser (client-side)
        const loadFont = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Eskander&display=swap';
            document.head.appendChild(link);
        };
        loadFont();

        // Apply Eskander font to the body element
        document.body.style.fontFamily = 'Eskander, Arial, sans-serif';
       
        fetchFamilyData();

    }, []);

    const fetchFamilyData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('family_tree').select('*');
        if (error) {
            console.error(error);
        } else {
            data.sort((a, b) => a.id - b.id);
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

    const renderTree = (nodes, parentId = null) => {
        return nodes.map((node) => {
            const isExpanded = showChildren[node.id];
            const isSibling = parentId === node.parentid;

            return (
                <TreeNode key={node.id} label={<CustomNode node={node} onClick={handleNodeClick} />}>
                    {/* Render children only if the node is expanded */}
                    {isExpanded && node.children && node.children.length > 0 && renderTree(node.children, node.id)}
                </TreeNode>
            );
        });
    };

    const handleNodeClick = (node) => {
        // Reset familyData before updating it
        setFamilyData([]);

        // Set the selected node to the clicked node
        setSelectedNode(node);

        // Hide siblings' children
        setShowChildren((prev) => {
            const newShowChildren = { ...prev };

            // Toggle the clicked node's children visibility
            newShowChildren[node.id] = !prev[node.id];

            // Hide the children of all sibling nodes
            if (node.parentid) {
                const parentChildren = findNodeById(node.parentid, familyData)?.children || [];
                parentChildren.forEach((sibling) => {
                    if (sibling.id !== node.id) {
                        newShowChildren[sibling.id] = false; // Hide siblings' children
                    }
                });
            }

            return newShowChildren;
        });

        // Get the family data to render (with the third parent logic if needed)
        const nodesToRender = getThirdParent(node);
        setFamilyData(nodesToRender);
    };

    const getThirdParent = (node) => {
        const firstParent = findNodeById(node.parentid, familyData);
        if (!firstParent) return allFamilyData;
        const secondParent = findNodeById(firstParent.parentid, familyData);
        if (!secondParent) return allFamilyData;
        const thirdParent = findNodeById(secondParent.parentid, familyData);
        if (!thirdParent) return allFamilyData;
        thirdParent.parentid = null;
        return [thirdParent];
    };

    function findNodeById(id, data) {
        for (const parent of data) {
            if (parent.id === id) return parent;
            const child = findNodeById(id, parent.children || []);
            if (child) return child;
        }
        return null;
    }

    return (
        <Container>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
                py={4}
                style={{
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: 'auto',
                    with:'100%',
                    position: 'relative',
                    textAlign: 'center',
                    padding: '10px',
                }}
            >
                {/* Add a dark overlay to reduce opacity of the background image */}
                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 50% opacity dark overlay
                        zIndex: -1,
                    }}
                />
                <img
                    src="https://github.com/lmaali01/family-tree/blob/main/public/Screen%20Shot%202025-03-08%20at%203.36.26%20PM.png?raw=true"
                    alt="Family Tree"
                    style={{
                        width: '75%',
                        height: '60px',
                        borderRadius: '60px',
                        marginBottom: '2px',
                    }}
                />
                {/* Display the image instead of the text */}
                <img
                    src="https://github.com/lmaali01/family-tree/blob/main/public/Screen%20Shot%202025-03-08%20at%202.45.01%20PM.png?raw=true"
                    alt="Family Tree"
                    style={{
                        width: '50%%',
                        height: '50px',
                        borderRadius: '60px',
                        marginBottom: '2px',
                    }}
                />
                {loading ? (
                    <CircularProgress />
                ) : familyData.length > 0 ? (
                    <Box
                        ref={containerRef}
                        sx={{
                            width: '100%',
                            height: '80vh',
                            display: 'flex',
                            justifyContent: 'center',
                            padding: 2,
                        }}
                    >
                        <Tree
                            lineWidth={'2px'}
                            lineColor={'#ffff00'}
                            lineBorderRadius={'60px'}
                            label={<CustomNode node={familyData[0]} onClick={handleNodeClick} />}
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: containerWidth * 0.8, // Dynamically set width based on container size
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
