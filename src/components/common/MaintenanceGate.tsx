import React from 'react';

interface MaintenanceGateProps {
    children: React.ReactNode;
}

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
    return <>{children}</>;
}
