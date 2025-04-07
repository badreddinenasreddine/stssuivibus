const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vfczofpofoaovoexjpia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmY3pvZnBvZm9hb3ZvZXhqcGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTA4MDIsImV4cCI6MjA1OTE2NjgwMn0.swltb41nI_D4pDXFTYp2TuzSJPX1pBn_koIWlBn8HCg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertStation() {
    try {
        const { data, error } = await supabase
            .from('stations')
            .insert([
                {
                    id: 'sousse-1',
                    name: 'Sousse',
                    latitude: 35.832843,
                    longitude: 10.630860
                }
            ])
            .select();

        if (error) {
            console.error('Erreur lors de l\'insertion de la station:', error);
        } else {
            console.log('Station insérée avec succès:', data);
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

insertStation(); 