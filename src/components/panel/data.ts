export interface LayoutOption {
  id: string;
  name: string;
}

// Only the live header/footer remain — demo layout variants
// (Header3..Header10, Footer4/9/10, /home2..home10) were removed
// when the catalogue was migrated to the real backend.
export const headerLayouts: LayoutOption[] = [{ id: 'Basic', name: 'Basic' }];
export const footerLayouts: LayoutOption[] = [{ id: 'Basic', name: 'Basic' }];

export const themes: { name: string; img: string; href: string }[] = [];
