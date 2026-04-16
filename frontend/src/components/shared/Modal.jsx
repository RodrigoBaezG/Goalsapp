function Modal({ children }) {
    return (
        <div className="fixed inset-0 bg-gray-500/75 flex items-start justify-center pt-10 pb-20 px-4 z-40 overflow-y-auto">
            <div className="w-full translate-x-9 max-w-3xl max-h-full mb-4">{children}</div>
        </div>
    );
}

export default Modal;
