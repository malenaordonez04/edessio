import React from "react";


type RoleToggleProps = {
    selectedRole: 'student' | 'tutor';
    onRoleChange: (role: 'student' | 'tutor') => void;
};

const RoleToggle: React.FC<RoleToggleProps> = ({ selectedRole, onRoleChange }) => {
    const activeClasses = 'bg-secondary text-primary';
    const inactiveClasses = 'bg-primary text-accent';

    return(
        <div className="flex w-full rounded-full mb-3 border border-accent">
            <button
            type="button"
            onClick={() => onRoleChange('student')}
            className= {`w-1/2 rounded-l-full py-2 transition-colors duration-300 ${selectedRole === 'student' ? activeClasses : inactiveClasses}`}
            >
                Alumno
            </button>
            <button
            type="button"
            onClick={() => onRoleChange('tutor')}
            className= {`w-1/2 rounded-r-full py-2 transition-colors duration-300 ${selectedRole === 'tutor' ? activeClasses : inactiveClasses}`}
            >
                Profesor
            </button>
        </div>
    )
}

export default RoleToggle