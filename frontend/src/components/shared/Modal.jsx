function Modal({ children, onClose }) {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && onClose) onClose();
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '40px',
                paddingBottom: '40px',
                paddingLeft: '16px',
                paddingRight: '16px',
                zIndex: 40,
                overflowY: 'auto',
                animation: 'fadeIn 0.15s ease',
            }}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
        >
            <div style={{
                width: '100%',
                maxWidth: '600px',
                animation: 'slideUp 0.2s ease',
            }}>
                {children}
            </div>
        </div>
    );
}

export default Modal;
