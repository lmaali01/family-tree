import { supabase } from '../../lib/supabaseClient';
export default async function handler(req, res) {
    const { id, name, image, parentid } = req.body;
    const { data, error } = await supabase
        .from('family_tree')
        .update({ name, image, parentid })
        .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json(data);
}
