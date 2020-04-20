import { INavData } from '@coreui/angular';

export const sidebarNavItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/overview',
    icon: 'icon-speedometer'
  },
  {
    name: 'Account',
    url: '/account',
    icon: 'icon-calculator'
  },
  {
    name: 'Bakery',
    url: '/bakery',
    icon: 'icon-pie-chart'
  },
  {
    name: 'Github',
    url: 'https://github.com/kukai-wallet/kukai',
    icon: 'icon-social-github',
    class: 'mt-auto',
    variant: 'dark',
    attributes: { target: '_blank', rel: 'noopener' }
  },
  {
    name: 'Chat',
    url: 'https://riot.im/app/#/room/#kukai:matrix.org',
    icon: 'icon-bubbles',
    variant: 'success',
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
