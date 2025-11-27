import { Box, Car, Armchair, Building2, TreeDeciduous, Cone, Info, Trash2, Smartphone, Coffee, Store, Flame, Lightbulb, MapPin, Fence, Lamp } from 'lucide-react';

export type AssetCategory = 'Transit' | 'Furniture' | 'Structure' | 'Prop' | 'All';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  description: string;
  icon?: any; // Lucide icon component
  image?: string; // URL for image if available
}

export const ASSETS: Asset[] = [
  // Transit
  {
    id: 'transit-barrier',
    name: 'Barrier',
    category: 'Transit',
    description: 'A concrete safety barrier.',
    icon: Fence
  },
  {
    id: 'transit-bus-stop',
    name: 'Bus Stop',
    category: 'Transit',
    description: 'A standard city bus stop shelter.',
    icon: Store
  },
  {
    id: 'transit-hydrant',
    name: 'Hydrant',
    category: 'Transit',
    description: 'Red fire hydrant.',
    icon: Flame
  },
  {
    id: 'transit-traffic-cone',
    name: 'Traffic Cone',
    category: 'Transit',
    description: 'Safety cone for roadworks.',
    icon: Cone
  },
  {
    id: 'transit-street-light',
    name: 'Street Light',
    category: 'Transit',
    description: 'Tall street lamp for city lighting.',
    icon: Lamp
  },

  // Furniture
  {
    id: 'furniture-bench',
    name: 'Bench',
    category: 'Furniture',
    description: 'Wooden park bench.',
    icon: Armchair
  },
  {
    id: 'furniture-trash-can',
    name: 'Trash Can',
    category: 'Furniture',
    description: 'Public waste bin.',
    icon: Trash2
  },
  {
    id: 'furniture-phone-booth',
    name: 'Phone Booth',
    category: 'Furniture',
    description: 'Classic red telephone box.',
    icon: Smartphone
  },
  {
    id: 'furniture-vending-machine',
    name: 'Vending Machine',
    category: 'Furniture',
    description: 'Soda vending machine.',
    icon: Box
  },

  // Structure
  {
    id: 'structure-fountain',
    name: 'Fountain',
    category: 'Structure',
    description: 'Decorative water fountain.',
    icon: Coffee // Approximation
  },
  {
    id: 'structure-statue',
    name: 'Statue',
    category: 'Structure',
    description: 'Stone statue on a pedestal.',
    icon: Info
  },
  {
    id: 'structure-gazebo',
    name: 'Gazebo',
    category: 'Structure',
    description: 'Wooden park gazebo.',
    icon: Building2
  },

  // Prop
  {
    id: 'prop-tree',
    name: 'Tree',
    category: 'Prop',
    description: 'Standard oak tree.',
    icon: TreeDeciduous
  },
  {
    id: 'prop-bush',
    name: 'Bush',
    category: 'Prop',
    description: 'Green landscaping bush.',
    icon: TreeDeciduous
  },
  {
    id: 'prop-dumpster',
    name: 'Dumpster',
    category: 'Prop',
    description: 'Large metal waste container.',
    icon: Trash2
  },
  {
    id: 'prop-cardboard-box',
    name: 'Cardboard Box',
    category: 'Prop',
    description: 'Simple cardboard box.',
    icon: Box
  }
];
