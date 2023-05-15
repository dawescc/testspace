import { useState, useEffect } from 'react'
import { supabase } from '@/components/database'

const CountriesList = () => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    async function fetchCountries() {
      const { data, error } = await supabase.from('countries').select('*');
      if (data) {
        setCountries(data);
      }
    }

    fetchCountries();
  }, []);

  return (
    <div>
      <h1>List of countries</h1>
      <ul>
        {countries.map((country) => (
          <li key={country.id}>{country.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CountriesList;
