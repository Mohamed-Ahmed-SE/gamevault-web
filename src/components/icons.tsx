import type { IconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowUpRight,
  Bell,
  Bookmark,
  Books,
  CalendarDots,
  Check,
  CheckCircle,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Clock,
  Compass,
  DotsThree,
  FloppyDisk,
  GameController,
  GridFour,
  Gear,
  Heart as HeartGlyph,
  House,
  List,
  MagnifyingGlass,
  Pause,
  PencilSimpleLine,
  Plus,
  Rocket,
  Sparkle,
  Star as StarGlyph,
  Trash,
  Trophy,
  Wrench,
  X,
  XCircle,
} from "@phosphor-icons/react/ssr";

export type GameVaultIcon = ComponentType<IconProps>;

export function Heart({ fill, ...props }: IconProps) {
  const isFilled = Boolean(fill && fill !== "none");
  const color = isFilled && fill !== "currentColor" ? fill : props.color;
  return <HeartGlyph {...props} color={color} weight={isFilled ? "fill" : "regular"} />;
}

export function Star({ fill, ...props }: IconProps) {
  const isFilled = Boolean(fill && fill !== "none");
  const color = isFilled && fill !== "currentColor" ? fill : props.color;
  return <StarGlyph {...props} color={color} weight={isFilled ? "fill" : "regular"} />;
}

export {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut as ExternalLink,
  ArrowUpRight,
  Bell,
  Bookmark,
  Books as LibraryBig,
  CalendarDots as CalendarDays,
  Check,
  CheckCircle as CheckCircle2,
  CaretDown as ChevronDown,
  CaretLeft as ChevronLeft,
  CaretRight as ChevronRight,
  CaretUp as ChevronUp,
  Clock,
  Compass,
  DotsThree as MoreHorizontal,
  FloppyDisk as Save,
  GameController as Gamepad2,
  GridFour as Grid,
  House,
  List,
  MagnifyingGlass as Search,
  Pause,
  PencilSimpleLine as Edit3,
  Plus,
  Rocket,
  Gear as Settings,
  Sparkle as Sparkles,
  Trash as Trash2,
  Trophy,
  Wrench,
  X,
  XCircle,
};
