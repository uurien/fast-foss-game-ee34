export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const LEVEL_WIDTH = 7200;

export const PLAYER_SPEED = 220;
export const JUMP_VELOCITY = -500;
export const GRAVITY_Y = 900;

export const FIRE_COOLDOWN_MS = 220;
export const WATER_GUN_RANGE = 260;
// El chorro de agua sale en parabola (afectado por la gravedad del mundo)
// en vez de en linea recta; estos son su velocidad horizontal y el impulso
// vertical inicial hacia arriba.
export const WATER_GUN_SPEED_X = 650;
export const WATER_GUN_LAUNCH_VY = -20;

export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_TOUCH_DAMAGE = 30;
export const PLAYER_INVULNERABLE_MS = 1000;

export const ENEMY_MAX_HEALTH = 20;
export const BULLET_DAMAGE = 10;


export const HEAT_ZONE_SLOW_FACTOR = 0.5;
export const HEAT_ZONE_DAMAGE_PER_TICK = 10;
export const HEAT_ZONE_TICK_MS = 500;

export const BOSS_MAX_HEALTH = 300;
// La primera columna esta en x=6000 y mide 92 px. Con el semiancho fisico
// de Begitxo, x=6080 garantiza que ya la ha cruzado por completo cuando se
// cierra a su espalda.
export const BOSS_TRIGGER_X = 6080;
export const BOSS_TELEGRAPH_MS = 650;
export const BOSS_VULNERABLE_MS = 1100;
export const BOSS_ATTACK_COOLDOWN_MS = 1800;
export const BOSS_MAX_STORMS = 3;
export const BOSS_STORM_HEALTH = 30;
