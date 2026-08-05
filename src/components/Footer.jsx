import React from 'react';

function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer>
            <p>Keeper App ⓒ {year} | Enterprise Note Management System</p>
        </footer>
    );
}

export default Footer;
