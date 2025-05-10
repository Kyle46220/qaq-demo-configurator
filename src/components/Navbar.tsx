'use client'
import React from 'react';

// Navbar component
const Navbar = () => {
  const navItems = [
    { name: 'About Us', href: 'https://qaq.com.au/about-us/' },
    { name: 'Products', href: 'https://qaq.com.au/products/' }, // Assuming a general products page
    { name: 'Clearance', href: 'https://qaq.com.au/product-category/promotions/' },
    { name: 'Designs', href: 'https://qaq.com.au/qaq-designs/' },
    { name: 'Gallery & Projects', href: 'https://qaq.com.au/domestic-projects/' },
    { name: 'Material Information', href: 'https://qaq.com.au/material-information/' }, // Assuming a general material info page
    { name: 'Brochure', href: 'https://www.qaq.com.au/QAQ_catalogue_2023.pdf' },
    { name: 'Contact', href: 'https://qaq.com.au/contact/' },
  ];

  return (
    <nav className="bg-[#fff] text-[#8e8e8e] p-4 flex items-center justify-between shadow-lg">
      <div>
        <a href="https://qaq.com.au/" target="_blank" rel="noopener noreferrer">
          <img src="/qaq-logo.png" alt="QAQ Logo" className="h-10" /> 
        </a>
      </div>
      <ul className="flex space-x-4">
        {navItems.map((item) => (
          <li key={item.name}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">
              {item.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar; 