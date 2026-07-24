export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const LEVEL_WIDTH = 7200;

export const PLAYER_SPEED = 220;
export const JUMP_VELOCITY = -640;
export const GRAVITY_Y = 900;

export const FIRE_COOLDOWN_MS = 220;
export const WATER_GUN_RANGE = 260;
// El chorro de agua sale en parabola (afectado por la gravedad del mundo)
// en vez de en linea recta; estos son su velocidad horizontal y el impulso
// vertical inicial hacia arriba.
export const WATER_GUN_SPEED_X = 650;
export const WATER_GUN_LAUNCH_VY = -80;

export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_TOUCH_DAMAGE = 30;
export const PLAYER_INVULNERABLE_MS = 1000;

export const ENEMY_MAX_HEALTH = 20;
export const BULLET_DAMAGE = 10;


export const HEAT_ZONE_SLOW_FACTOR = 0.5;
export const HEAT_ZONE_DAMAGE_PER_TICK = 5;
export const HEAT_ZONE_TICK_MS = 500;
