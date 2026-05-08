declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  type Icon = ComponentType<
    SVGProps<SVGSVGElement> & {
      absoluteStrokeWidth?: boolean;
      size?: number | string;
    }
  >;

  export const Activity: Icon;
  export const ArrowDownUp: Icon;
  export const BarChart3: Icon;
  export const CheckCircle2: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const CircleAlert: Icon;
  export const Database: Icon;
  export const FileSpreadsheet: Icon;
  export const Filter: Icon;
  export const Info: Icon;
  export const LayoutDashboard: Icon;
  export const ListFilter: Icon;
  export const LockKeyhole: Icon;
  export const Route: Icon;
  export const Search: Icon;
  export const ShieldCheck: Icon;
  export const TableProperties: Icon;
  export const X: Icon;
}

