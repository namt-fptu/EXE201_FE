import { cn } from "@/app/admin/lib/utils";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { useSidebarContext } from "./sidebar-context";

const menuItemBaseStyles = cva(
  "rounded-xl px-4 py-3 font-medium transition-all duration-200 group relative",
  {
    variants: {
      isActive: {
        true: "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 font-semibold transform hover:scale-[1.02]",
        false:
          "text-slate-800 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md hover:transform hover:scale-[1.01] font-semibold",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

export function MenuItem(
  props: {
    className?: string;
    children: React.ReactNode;
    isActive: boolean;
  } & ({ as?: "button"; onClick: () => void } | { as: "link"; href: string }),
) {
  const { toggleSidebar, isMobile } = useSidebarContext();

  if (props.as === "link") {
    return (
      <Link
        href={props.href}
        // Close sidebar on clicking link if it's mobile
        onClick={() => isMobile && toggleSidebar()}
        className={cn(
          menuItemBaseStyles({
            isActive: props.isActive,
            className: "relative block",
          }),
          props.className,
        )}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      onClick={props.onClick}
      aria-expanded={props.isActive}
      className={menuItemBaseStyles({
        isActive: props.isActive,
        className: "flex w-full items-center gap-3",
      })}
    >
      {props.children}
    </button>
  );
}
