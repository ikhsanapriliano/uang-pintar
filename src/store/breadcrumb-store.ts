import { create } from "zustand";

export type TBreadcrumb = {
  title: string;
  link?: string;
};

export type TBreadcrumbState = {
  breadcrumbs: TBreadcrumb[];
  isBackVisible?: boolean;
  setBreadcrumbs: (items: TBreadcrumb[], isBackVisible?: boolean) => void;
  reset: () => void;
};

export const useBreadcrumb = create<TBreadcrumbState>((set) => ({
  breadcrumbs: [],
  isBackVisible: false,
  setBreadcrumbs: (items, isBackVisible) =>
    set({ breadcrumbs: items, isBackVisible }),
  reset: () => set({ breadcrumbs: [], isBackVisible: false }),
}));
