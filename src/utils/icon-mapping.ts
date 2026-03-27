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
    "IconCarSeat": IconCarSeat,
    "IconDashboard": IconDashboard,
    "IconRadiator": IconRadiator,
    "IconEngine": IconEngine,
    "IconAlternator": IconAlternator,
    "IconSparkPlug": IconSparkPlug,
    "IconECU": IconECU,
    "IconSwitch": IconSwitch,
    "IconAirbag": IconAirbag,
    "IconKey": IconKey,
    "IconGearShifter": IconGearShifter,
    "IconBrakeDisc": IconBrakeDisc,
    "IconSteeringWheel": IconSteeringWheel,
    "IconFuel": IconFuel,
    "IconExhaust": IconExhaust,
    "PlusCircle": PlusCircle,
};

export function getCategoryIcon(iconName: string | null | undefined) {
    if (!iconName) return PlusCircle;
    return iconMap[iconName] || PlusCircle;
}
