import React from 'react';
import '../styles/Modal.scss'; // Assume que você terá um arquivo de estilo para o modal

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modals: React.FC<ModalProps> = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {title && <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button">✖</button>
        </div>}
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default Modals;
