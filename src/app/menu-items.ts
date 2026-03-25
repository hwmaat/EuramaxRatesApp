export interface MenuItem {
  text: string;
  path?: string;
  items?: MenuItem[];
  beginGroup?: boolean;
  icon?: string;
  access?: number[];
}

export const ACCESS = {
  ALL: 0
} as const;

export const menuItems: MenuItem[] = [
  {
    text: 'Home',
    path: '/home',
    icon: 'mdi mdi-home',
    access: [ACCESS.ALL]
  }
];