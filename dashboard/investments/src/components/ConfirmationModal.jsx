// src/components/ConfirmationModal.jsx
import React, { useState, useEffect } from 'react';

// Basic styling (inline or via CSS modules/Tailwind classes passed as props)
const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    color: '#f3f4f6', // dark-text
};

const contentStyle = {
    backgroundColor: '#1f2937', // dark-card
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxWidth: '500px',
    width: '90%',
};

function ConfirmationModal({ isOpen, title, details, onConfirm, onCancel }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div style={modalStyle} onClick={onCancel}> {/* Close on backdrop click */}
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking inside */}
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', textAlign: 'center', marginBottom: '1.5rem' }}>{title}</h2>
                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #374151', paddingTop: '1.5rem', spaceY: '0.75rem' }}>
                    {Object.entries(details).map(([key, value]) => (
                        <p key={key}>
                            <span style={{ textTransform: 'capitalize', color: '#9ca3af' }}>{key.replace(/([A-Z])/g, ' $1')}: </span> {/* Add space before caps */}
                            <span style={{ fontWeight: '600' }}>{value}</span>
                        </p>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={onConfirm}
                        style={{ backgroundColor: '#10b981', color: 'white', fontWeight: 'bold', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                    >
                        Confirm
                    </button>
                    <button
                        onClick={onCancel}
                         style={{ backgroundColor: '#6b7280', color: 'white', fontWeight: 'bold', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', transition: 'background-color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;