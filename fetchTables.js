const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vfczofpofoaovoexjpia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmY3pvZnBvZm9hb3ZvZXhqcGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTA4MDIsImV4cCI6MjA1OTE2NjgwMn0.swltb41nI_D4pDXFTYp2TuzSJPX1pBn_koIWlBn8HCg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchTables() {
    const { data, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

    if (error) {
        console.error('Error fetching tables:', error);
    } else {
        console.log('Tables in Supabase:', data);
    }
}

async function fetchDriversTableSchema() {
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .limit(1); // Fetching one row to get the column names

    if (error) {
        console.error('Error fetching drivers table schema:', error);
    } else {
        console.log('Schema of drivers table:', data); // Log the schema
    }
}

fetchTables();
fetchDriversTableSchema(); // Call the new function to fetch schema