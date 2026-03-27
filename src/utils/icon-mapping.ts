import {
    IconCarDoor,
    IconHeadlight,
    IconWindshield,
    IconSideMirror,
    IconCarSeat,
    IconDashboard,
    IconRadiator,
    IconEngine,
    IconAlternator,
    IconSparkPlug,
    IconECU,
    IconSwitch,
    IconAirbag,
    IconKey,
    IconGearShifter,
    IconBrakeDisc,
    IconSteeringWheel,
    IconFuel,
    IconExhaust
} from "@/components/icons/AutoIcons";
import { PlusCircle, LucideIcon } from "lucide-react";

export const iconMap: Record<string, any> = {
    "IconCarDoor": IconCarDoor,
    "IconHeadlight": IconHeadlight,
    "IconWindshield": IconWindshield,
    "IconSideMirror": IconSideMirror,
    "IconMirror": IconSideMirror, // Alias
    "IconCarSeat": IconCarSeat,
    "IconSeat": IconCarSeat, // Alias
    "IconDashboard": IconDashboard,
    "IconDisplays": IconDashboard, // Alias
    "IconRadiator": IconRadiator,
    "IconHvac": IconRadiator, // Alias
    "IconEngine": IconEngine,
    "IconAlternator": IconAlternator,
    "IconSparkPlug": IconSparkPlug,
    "IconIgnition": IconSparkPlug, // Alias
    "IconECU": IconECU,
    "IconEcu": IconECU, // Alias (case-insensitive fix already handles this, but good for clarity)
    "IconSwitch": IconSwitch,
    "IconAirbag": IconAirbag,
    "IconKey": IconKey,
    "IconLock": IconKey, // Alias
    "IconGearShifter": IconGearShifter,
    "IconTransmission": IconGearShifter, // Alias
    "IconBrakeDisc": IconBrakeDisc,
    "IconBrakes": IconBrakeDisc, // Alias
    "IconSteeringWheel": IconSteeringWheel,
    "IconSteering": IconSteeringWheel, // Alias
    "IconFuel": IconFuel,
    "IconExhaust": IconExhaust,
    "PlusCircle": PlusCircle,
};

export function getCategoryIcon(iconName: string | null | undefined) {
    if (!iconName) return PlusCircle;
    
    // Case-insensitive lookup
    const normalizedKey = iconName.toLowerCase();
    const mapKey = Object.keys(iconMap).find(key => key.toLowerCase() === normalizedKey);
    
    return mapKey ? iconMap[mapKey] : PlusCircle;
}
