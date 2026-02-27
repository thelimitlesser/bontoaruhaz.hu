import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
}

export const IconCarDoor: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/door.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/door.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconHeadlight: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/headlight.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/headlight.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconWindshield: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/windshield.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/windshield.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconSideMirror: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/mirror.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/mirror.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconCarSeat: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/seat.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/seat.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconDashboard: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/displays.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/displays.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconRadiator: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/hvac.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/hvac.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconEngine: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/engine.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/engine.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconAlternator: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/alternator.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/alternator.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconSparkPlug: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/ignition.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/ignition.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconECU: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/ecu.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/ecu.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconSwitch: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/switch.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/switch.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconAirbag: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/airbag.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/airbag.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconKey: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/lock.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/lock.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconGearShifter: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/transmission.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/transmission.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconBrakeDisc: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/brakes.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/brakes.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconSteeringWheel: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/steering.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/steering.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconFuel: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/fuel.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/fuel.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);

export const IconExhaust: React.FC<IconProps> = ({ size, className = '', strokeWidth, strokeLinecap, strokeLinejoin, stroke, fill, ...props }) => (
    <span
        className={`inline-block ${className}`}
        style={{
            WebkitMaskImage: "url('/category-icons/exhaust.png')",
            WebkitMaskSize: 'contain',
            WebkitMaskPosition: 'center',
            WebkitMaskRepeat: 'no-repeat',
            maskImage: "url('/category-icons/exhaust.png')",
            maskSize: 'contain',
            maskPosition: 'center',
            maskRepeat: 'no-repeat',
            backgroundColor: 'currentColor'
        }}
    />
);
