function Modal({ children, onClose }) {
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-500/75 flex items-start justify-center pt-10 pb-20 px-4 z-40 overflow-y-auto"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-3xl max-h-full mb-4">
                {children}
            </div>
        </div>
    );
}

export default Modal;
