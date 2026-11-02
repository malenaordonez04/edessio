//Componente proximanete para ordenarme la mente. 
import React from 'react';

interface PlaceholderViewProps {
    title: string;
    icon: any;
    message?: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, icon: Icon, message }) => {
    return (
        <div className="bg-white p-12 rounded-lg shadow-sm text-center border-2 border-dashed border-gray-200 h-full flex flex-col justify-center items-center min-h-[400px]">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
                <Icon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-500 mt-2 max-w-md">
                {message || "Esta funcionalidad estará disponible próximamente. Estamos trabajando en ello."}
            </p>
        </div>
    );
};

export default PlaceholderView;