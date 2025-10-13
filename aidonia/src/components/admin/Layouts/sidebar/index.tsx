"use client";

import { Logo } from "@/app/admin/logo";
import { cn } from "@/app/admin/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_DATA } from "./data";
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));

    // Uncomment the following line to enable multiple expanded items
    // setExpandedItems((prev) =>
    //   prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    // );
  };

  useEffect(() => {
    // Keep collapsible open, when it's subpage is active
    NAV_DATA.some((section) => {
      return section.items.some((item) => {
        return item.items?.some((subItem) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }

            // Break the loop
            return true;
          }
        });
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[280px] overflow-hidden border-r border-primary-200 bg-white backdrop-blur-xl transition-[width] duration-300 ease-out shadow-lg shadow-primary-100/25",
          isMobile ? "fixed bottom-0 top-0 z-50 shadow-2xl" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="flex h-full flex-col py-8 pl-6 pr-4">
          <div className="relative pr-4">
            <Link
              href={"/admin"}
              onClick={() => isMobile && toggleSidebar()}
              className="px-0 py-3 min-[850px]:py-2 block"
            >
              <Logo />
            </Link>

            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="absolute left-3/4 right-4.5 top-1/2 -translate-y-1/2 text-right"
              >
                <span className="sr-only">Close Menu</span>

                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-2 min-[850px]:mt-8">
            {NAV_DATA.map((section, sectionIndex) => (
              <div key={section.label} className={`${sectionIndex > 0 ? 'mt-8' : ''} mb-7`}>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-primary-600">
                  {section.label}
                </h2>

                <nav role="navigation" aria-label={section.label}>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const hasSubItems = item.items && item.items.length > 0;
                      const itemHref = "url" in item ? item.url : `/${item.title.toLowerCase().split(" ").join("-")}`;
                      const isItemActive = hasSubItems 
                        ? item.items!.some(({ url }) => url === pathname)
                        : pathname === itemHref;

                      return (
                        <li key={item.title}>
                          <MenuItem
                            {...(hasSubItems 
                              ? { onClick: () => toggleExpanded(item.title) }
                              : { as: "link" as const, href: itemHref }
                            )}
                            isActive={isItemActive}
                            className="flex items-center gap-3"
                          >
                            <item.icon
                              className="size-5 shrink-0 text-current"
                              aria-hidden="true"
                            />
                            <span className="font-medium">{item.title}</span>
                            {hasSubItems && (
                              <ChevronUp
                                className={cn(
                                  "ml-auto size-4 rotate-180 transition-transform duration-200 text-slate-600",
                                  expandedItems.includes(item.title) && "rotate-0",
                                )}
                                aria-hidden="true"
                              />
                            )}
                          </MenuItem>

                          {hasSubItems && expandedItems.includes(item.title) && (
                            <ul
                              className="ml-6 mr-0 space-y-1 pb-3 pr-0 pt-2 border-l-2 border-primary-200"
                              role="menu"
                            >
                              {item.items!.map((subItem) => (
                                <li key={subItem.title} role="none" className="pl-4">
                                  <MenuItem
                                    as="link"
                                    href={subItem.url}
                                    isActive={pathname === subItem.url}
                                    className="text-sm py-2 rounded-lg"
                                  >
                                    <span className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                      {subItem.title}
                                    </span>
                                  </MenuItem>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
