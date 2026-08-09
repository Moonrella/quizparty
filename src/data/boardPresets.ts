import { type BoardPreset, type TileType } from '../types';

function makeTiles(layout: number[][], types: TileType[]): BoardPreset['tiles'] {
  const infoMap: Record<string, { emoji: string; label: string }> = {
    wheel:    { emoji: '●', label: '转盘' },
    fortune:  { emoji: '◆', label: '命运' },
    property: { emoji: '■', label: '地产' },
    treasure: { emoji: '▲', label: '宝箱' },
    safe:     { emoji: '○', label: '安全' },
    empty:    { emoji: '',  label: '留空' },
  };

  return layout.map(([r, c], index) => {
    const type = types[index % types.length];
    const info = infoMap[type];
    return {
      index, type, label: info.label, emoji: info.emoji, row: r, col: c,
      propertyPrice: type === 'property' ? 50 + index * 8 : undefined,
      toll: type === 'property' ? 15 + Math.floor(index / 2) * 8 : undefined,
    };
  });
}

const classicLayout: number[][] = [
  [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],
  [1,5],[2,5],[3,5],
  [4,5],[4,4],[4,3],[4,2],[4,1],[4,0],
  [3,0],[2,0],[1,0],
  [1,1],[1,2],[1,3],[1,4],
  [2,4],[3,4],
  [3,3],[3,2],[3,1],
  [2,1],
];

const classicTypes: TileType[] = [
  'property','safe','property','treasure','property','wheel',
  'property','fortune','property',
  'treasure','property','safe','property','wheel','property',
  'fortune','property','property',
  'safe','property','treasure','wheel',
  'property','fortune',
  'treasure','property','safe',
  'property',
];

export const BOARD_PRESETS: BoardPreset[] = [
  {
    id: 'classic',
    name: '经典棋盘',
    emoji: '○',
    description: '默认棋盘，适合大多数游戏',
    rows: 5,
    cols: 6,
    tiles: makeTiles(classicLayout, classicTypes),
    size: classicLayout.length,
  },
];

export function getBoardPreset(id: string): BoardPreset {
  const custom = loadCustomBoards();
  return custom.find(b => b.id === id) || BOARD_PRESETS.find(b => b.id === id) || BOARD_PRESETS[0];
}

export function loadCustomBoards(): BoardPreset[] {
  const raw = localStorage.getItem('quizparty_custom_boards');
  if (raw) try { return JSON.parse(raw) as BoardPreset[]; } catch { /* ignore */ }
  return [];
}
