/**
 * Tipos y utilidades compartidas entre apps/api y apps/web.
 * Se irán completando a medida que se definan los DTOs de cada caso de uso.
 */
export type BusinessType = 'chiringuito' | 'cafeteria' | 'food-truck' | 'restaurante' | 'tienda' | 'heladeria' | 'terraza' | 'otro';
export type WeatherCondition = 'soleado' | 'parcialmente-nublado' | 'nublado' | 'lluvia' | 'tormenta';
export interface Thresholds {
    values: number[];
}
export declare const DEFAULT_THRESHOLDS: number[];
