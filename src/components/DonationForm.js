import React, { useState } from 'react';
import axios from 'axios';

function DonationForm() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Fruit',
    quantity: '',
    expiration_date: '',
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8000/api/donations/', formData)
      .then(res => alert('Donation logged!'))
      .catch(err => console.error(err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" onChange={handleChange} required />
      <select name="type" onChange={handleChange}>
        <option value="Fruit">Fruit</option>
        <option value="Vegetable">Vegetable</option>
        <option value="Meat">Meat</option>
        <option value="Dairy">Dairy</option>
        <option value="Other">Other</option>
      </select>
      <input name="quantity" type="number" placeholder="Quantity" onChange={handleChange} required />
      <input name="expiration_date" type="date" onChange={handleChange} required />
      <button type="submit">Submit</button>
    </form>
  );
}

export default DonationForm;