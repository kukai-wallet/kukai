import { INavData } from '@coreui/angular';

export const sidebarNavItems: INavData[] = [
  {
    name: 'HOMEPAGECOMPONENT.OVERVIEW',
    url: '/overview',
    icon: 'icon-speedometer'
  },
  {
    name: 'HOMEPAGECOMPONENT.ACCOUNT',
    url: '/account',
    icon: 'icon-calculator'
  },
  {
    name: 'HOMEPAGECOMPONENT.BAKERY',
    url: '/bakery',
    icon: 'icon-pie-chart'
  },
  // {
  //   title: true,
  //   name: 'Options'
  // },
  // {
  //   name: 'Offline Signing',
  //   url: '/offline-signing',
  //   icon: 'icon-note',
  // },
  // {
  //   name: 'Backup',
  //   url: '/backup',
  //   icon: 'icon-paper-clip',
  // },
  {
    name: 'Github',
    url: 'https://github.com/kukai-wallet/kukai',
    icon: 'icon-social-github',
    class: 'mt-auto',
    variant: 'dark',
    attributes: { target: '_blank', rel: 'noopener' }
  },
  {
    name: 'Telegram',
    url: 'https://t.me/KukaiWallet',
    icon: 'icon-cursor',
    variant: 'info',
    attributes: { target: '_blank', rel: 'noopener' }
  },
  {
    name: 'Twitter',
    url: 'https://twitter.com/KukaiWallet/',
    icon: 'icon-social-twitter',
    variant: 'primary',
    attributes: { target: '_blank', rel: 'noopener' }
  }
];
