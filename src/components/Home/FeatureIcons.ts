import { VpnHoodApp } from '@/services/VpnHoodApp';
import type { RouteLocationRaw } from 'vue-router';

export interface FeatureItem {
  icon: string;
  secondIcon?: string;
  title: string;
  pageLink: RouteLocationRaw;
  isActive: boolean;
}

export function getFeatureItems(): FeatureItem[] {
  const vhApp = VpnHoodApp.instance;
  return [
    {
      icon: 'mdi-call-split',
      secondIcon: 'mdi-ip-outline',
      title: 'SPLIT_IP',
      pageLink: { name: 'SPLIT_TUNNELING' },
      isActive: vhApp.data.isSplitIpViaDeviceActive || vhApp.data.isSplitIpViaAppActive,
    },
    {
      icon: 'mdi-call-split',
      secondIcon: 'mdi-web',
      title: 'SPLIT_DOMAINS',
      pageLink: { name: 'SPLIT_DOMAINS' },
      isActive: vhApp.data.isSplitDomainActive,
    },
    {
      icon: 'mdi-ip-network',
      title: 'CUSTOM_ENDPOINT',
      pageLink: { name: 'SERVERS' },
      isActive: vhApp.data.isCustomEndpointActive,
    },
    {
      icon: 'mdi-dns',
      title: 'DNS',
      pageLink: { name: 'DNS' },
      isActive: vhApp.data.isDnsCustomized,
    },
    {
      icon: 'mdi-diversify',
      title: 'PROXIES',
      pageLink: { name: 'PROXIES' },
      isActive: vhApp.data.state.isProxyEndPointActive,
    },
  ];
}
