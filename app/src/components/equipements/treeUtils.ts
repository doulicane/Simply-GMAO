import type { Equipment } from '@/types';
import type { TreeNode, EquipmentFilters } from './types';
import { SUB_ASSEMBLIES } from './types';

function getZoneFromLocation(location: string): string {
  const loc = location.toLowerCase();
  if (loc.includes('presse') || loc.includes('découpe') || loc.includes('decoupe') || loc.includes('recuit')) return 'Zone A — Production';
  if (loc.includes('laquage') || loc.includes('sérigraphie') || loc.includes('serigraphie') || loc.includes('emballage')) return 'Zone B — Finition';
  if (loc.includes('air comprime') || loc.includes('électricité') || loc.includes('electricite') || loc.includes('eau') || loc.includes('utilite')) return 'Zone C — Utilités';
  if (loc.includes('quai') || loc.includes('entrepôt') || loc.includes('entrepot') || loc.includes('stockage') || loc.includes('expédition')) return 'Zone D — Stockage & Expédition';
  if (location.startsWith('Hall A')) return 'Hall A — Presses';
  if (location.startsWith('Hall B')) return 'Hall B — Laquage';
  if (location.startsWith('Hall C')) return 'Hall C — Sérigraphie';
  if (location.startsWith('Hall D')) return 'Hall D — Thermique';
  if (location.startsWith('Hall E')) return 'Hall E — Expédition';
  if (location.startsWith('Sous-sol')) return 'Sous-sol — Utilités';
  if (location.startsWith('Magasin')) return 'Magasin — Manutention';
  if (location.includes('Extraction')) return 'Hall A — Extraction';
  return 'Autre';
}

function getLineGroup(line: string): string {
  return line;
}

export function buildEquipmentTree(equipment: Equipment[]): TreeNode {
  const siteNode: TreeNode = {
    id: 'site-1',
    name: 'Saint-Gaudens — Site principal',
    type: 'site',
    children: [],
    expanded: true,
  };

  const zoneMap = new Map<string, TreeNode>();

  for (const eq of equipment) {
    const zoneName = getZoneFromLocation(eq.location);
    let zoneNode = zoneMap.get(zoneName);
    if (!zoneNode) {
      zoneNode = {
        id: `zone-${zoneName}`,
        name: zoneName,
        type: 'zone',
        children: [],
        expanded: false,
      };
      zoneMap.set(zoneName, zoneNode);
      siteNode.children.push(zoneNode);
    }

    const lineName = getLineGroup(eq.line);
    let lineNode = zoneNode.children.find((c) => c.name === lineName && c.type === 'line');
    if (!lineNode) {
      lineNode = {
        id: `line-${zoneName}-${lineName}`,
        name: lineName,
        type: 'line',
        children: [],
        expanded: false,
      };
      zoneNode.children.push(lineNode);
    }

    const machineNode: TreeNode = {
      id: eq.id,
      name: eq.name,
      type: 'machine',
      status: eq.status,
      criticality: eq.criticality,
      equipment: eq,
      children: [],
      expanded: false,
    };

    // Add sub-assemblies
    const subs = SUB_ASSEMBLIES.filter((s) => s.equipmentId === eq.id);
    for (const sub of subs) {
      machineNode.children.push({
        id: sub.id,
        name: sub.name,
        type: 'subAssembly',
        criticality: sub.criticality,
        children: [],
        parentId: eq.id,
      });
    }

    lineNode.children.push(machineNode);
  }

  // Sort zones, lines, and machines
  siteNode.children.sort((a, b) => a.name.localeCompare(b.name));
  for (const zone of siteNode.children) {
    zone.children.sort((a, b) => a.name.localeCompare(b.name));
    for (const line of zone.children) {
      line.children.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return siteNode;
}

export function filterTree(node: TreeNode, filters: EquipmentFilters): TreeNode | null {
  const matchesSearch = (n: TreeNode) => {
    if (!filters.search) return true;
    const term = filters.search.toLowerCase();
    return n.name.toLowerCase().includes(term) || (n.equipment?.code ?? '').toLowerCase().includes(term);
  };

  const matchesLevel = (n: TreeNode) => {
    if (filters.level === 'all') return true;
    return n.type === filters.level;
  };

  const matchesZone = (n: TreeNode) => {
    if (filters.zone === 'all' || !filters.zone) return true;
    if (n.type === 'machine' && n.equipment) {
      return getZoneFromLocation(n.equipment.location) === filters.zone;
    }
    return true;
  };

  const matchesCriticality = (n: TreeNode) => {
    if (filters.criticality === 'all') return true;
    return n.criticality === filters.criticality;
  };

  const matchesStatus = (n: TreeNode) => {
    if (filters.status === 'all') return true;
    return n.status === filters.status;
  };

  const nodeMatches = (n: TreeNode) =>
    matchesSearch(n) && matchesLevel(n) && matchesZone(n) && matchesCriticality(n) && matchesStatus(n);

  function filterNode(n: TreeNode): TreeNode | null {
    const children = n.children
      .map((c) => filterNode(c))
      .filter((c): c is TreeNode => c !== null);

    if (n.type === 'machine') {
      if (nodeMatches(n)) {
        return { ...n, children, expanded: children.length > 0 };
      }
      return null;
    }

    if (children.length > 0 || nodeMatches(n)) {
      return { ...n, children, expanded: true };
    }

    return null;
  }

  return filterNode(node);
}

export function flattenTreeToMachines(node: TreeNode): Equipment[] {
  const machines: Equipment[] = [];
  function walk(n: TreeNode) {
    if (n.type === 'machine' && n.equipment) {
      machines.push(n.equipment);
    }
    for (const child of n.children) {
      walk(child);
    }
  }
  walk(node);
  return machines;
}

export function countMachinesAndSubAssemblies(node: TreeNode): { machines: number; subAssemblies: number } {
  let machines = 0;
  let subAssemblies = 0;
  function walk(n: TreeNode) {
    if (n.type === 'machine') machines++;
    if (n.type === 'subAssembly') subAssemblies++;
    for (const child of n.children) walk(child);
  }
  walk(node);
  return { machines, subAssemblies };
}
