'use strict';

const FRUITS_DATA = [
  { id: 1,  name: '藍莓', emoji: '🫐', radius: 14 },
  { id: 2,  name: '葡萄', emoji: '🍇', radius: 19 },
  { id: 3,  name: '櫻桃', emoji: '🍒', radius: 24 },
  { id: 4,  name: '龍眼', emoji: '🟤', radius: 29 },
  { id: 5,  name: '荔枝', emoji: '❤️',  radius: 34 },
  { id: 6,  name: '草莓', emoji: '🍓', radius: 40 },
  { id: 7,  name: '山竹', emoji: '🟣', radius: 46 },
  { id: 8,  name: '檸檬', emoji: '🍋', radius: 52 },
  { id: 9,  name: '橘子', emoji: '🍊', radius: 59 },
  { id: 10, name: '蘋果', emoji: '🍎', radius: 66 },
  { id: 11, name: '香蕉', emoji: '🍌', radius: 74 },
  { id: 12, name: '木瓜', emoji: '🟠', radius: 82 },
  { id: 13, name: '椰子', emoji: '🥥', radius: 90 },
  { id: 14, name: '西瓜', emoji: '🍉', radius: 99 },
  { id: 15, name: '榴槤', emoji: '🌟', radius: 108 },
];

const DIFFICULTY_CONFIG = {
  easy:   { name: '簡單', targetFruitId: 5,  timeLimit: 180, dropTypes: [1, 2, 3] },
  medium: { name: '中等', targetFruitId: 8,  timeLimit: 300, dropTypes: [1, 2, 3] },
  hard:   { name: '困難', targetFruitId: 11, timeLimit: 420, dropTypes: [1, 2, 3] },
  expert: { name: '專家', targetFruitId: 15, timeLimit: 600, dropTypes: [1, 2, 3] },
};
