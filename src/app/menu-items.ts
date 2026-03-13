export interface MenuItem {
    text: string;
    path?: string;
    items?: MenuItem[];
    beginGroup?:boolean;
    icon?:string;
    access?: number[];
  }
  
  export const ACCESS = { ALL: 0, ADMIN: 1, SALES: 5, PLANNING: 10, FINANCE: 15, PRODUCTION: 25 } as const;

  export const menuItems: MenuItem[] = [
    { text: 'Home', path: 'dashboard', icon :'mdi mdi-home', access:[ACCESS.ADMIN, ACCESS.SALES] },
    {
      text: 'Production planning',
      icon :'mdi mdi-file-arrow-up-down-outline',
      access:[ACCESS.ADMIN, ACCESS.PLANNING, ACCESS.PRODUCTION],
      items: [
        { text: 'Production planning', path: '/planning/production' },
      ]
    },
    {
      text: 'Base data',
      icon :'mdi mdi-apps',
      access:[ACCESS.ADMIN, ACCESS.PLANNING, ACCESS.PRODUCTION],
      items: [
        
        { text: 'Oven Settings', path: '/basedata/ovensettings'},
        { text: 'Metal Specifications', path: '/basedata/metalspecs'},
        { text: 'Finishes', path: '/basedata/finishes'},
        { text: 'Paints', path: '/basedata/paints'},
        { text: 'Specmetrics', path: '/basedata/specmetrics' },
        { text: 'Oven', 
          items: [
          { text: 'Oven settings', path: '/basedata/ovensettings', access:[ACCESS.ADMIN]},
          { text: 'Peak metal temp', path: '/basedata/peakmetaltemp', access:[ACCESS.ADMIN]}
         ],
        },
        { text: 'Production Lines', path: '/basedata/productionlines'}
      ]
    },
    {
      text: 'Admin',
      access:[ACCESS.ADMIN],
      icon: 'mdi mdi-account-cog-outline',
      items: [
        { text: 'Users', 
          icon: 'mdi mdi-account-group-outline',
          items: [
          { text: 'Users', path: 'admin/users', access:[ACCESS.ADMIN]},
          { text: 'Usergroups', path: 'admin/usergroups', access:[ACCESS.ADMIN]}
        ]},            
        { text: 'System Settings', path: 'settings', icon: 'mdi mdi-cogs',
        items: [
             { text: 'System', path: 'system/settings', access:[ACCESS.ADMIN]},
        ]},
        {text: 'AI Monitor', path: 'admin/pollingmonitor', access:[ACCESS.ADMIN]}  
      ]
    } ,
    
  ];
  