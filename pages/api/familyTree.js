import { supabase } from '../../lib/supabaseClient';
export default async function handler(req, res) {
    const { data, error } = await supabase.from('family_tree').select('*');
    console.log(`data: ${data}`);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
}