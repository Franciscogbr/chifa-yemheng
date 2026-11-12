import { describe, expect, it } from 'vitest';
import {
  calcularDistanciaHaversineKm,
  calcularSugerenciaCosto,
} from '../../../../utils/delivery-costo.js';

describe('Caja blanca - delivery-costo', () => {
  describe('calcularDistanciaHaversineKm', () => {
    it('devuelve 0 para las mismas coordenadas', () => {
      expect(calcularDistanciaHaversineKm(-14.058616, -75.717849, -14.058616, -75.717849)).toBe(0);
    });

    it('calcula distancia entre Ica y una ubicación cercana', () => {
      const resultado = calcularDistanciaHaversineKm(-14.058616, -75.717849, -14.074954, -75.775628);
      expect(resultado).toBeCloseTo(6.51, 1);
    });

    it('devuelve distancia positiva para coordenadas distintas', () => {
      const resultado = calcularDistanciaHaversineKm(-12.0464, -77.0428, -14.058616, -75.717849);
      expect(resultado).toBeGreaterThan(0);
    });
  });

  describe('calcularSugerenciaCosto', () => {
    const parametrosBase = {
      costoBase: 0.17,
      radioKm: 2,
      recargoKm: 0.1,
    };

    it('aplica recargo cuando la distancia excede el radio', () => {
      const result = calcularSugerenciaCosto({
        ...parametrosBase,
        distanciaTarifaKm: 3,
        distanciaCoberturaKm: 5,
        radioCoberturaKm: 10,
      });

      expect(result).toEqual({
        distanciaKm: 3,
        fueraRadio: true,
        dentroCobertura: true,
        costoSugerido: 0.27,
      });
    });

    it('no aplica recargo cuando está dentro del radio', () => {
      const result = calcularSugerenciaCosto({
        ...parametrosBase,
        distanciaTarifaKm: 1.5,
        distanciaCoberturaKm: 5,
        radioCoberturaKm: 10,
      });

      expect(result.costoSugerido).toBe(0.17);
      expect(result.fueraRadio).toBe(false);
    });

    it('marca fuera de cobertura cuando excede el radio de cobertura', () => {
      const result = calcularSugerenciaCosto({
        ...parametrosBase,
        distanciaTarifaKm: 1,
        distanciaCoberturaKm: 11,
        radioCoberturaKm: 10,
      });

      expect(result.dentroCobertura).toBe(false);
      expect(result.fueraRadio).toBe(false);
    });

    it('mantiene dentro los límites exactos de cobertura', () => {
      const enLimite = calcularSugerenciaCosto({
        ...parametrosBase,
        distanciaTarifaKm: 2,
        distanciaCoberturaKm: 10,
        radioCoberturaKm: 10,
      });
      expect(enLimite.fueraRadio).toBe(false);
      expect(enLimite.dentroCobertura).toBe(true);
    });

    it('permite cobertura cuando radioCoberturaKm es null', () => {
      const sinLimite = calcularSugerenciaCosto({
        ...parametrosBase,
        distanciaTarifaKm: null,
        distanciaCoberturaKm: 100,
        radioCoberturaKm: null,
      });
      expect(sinLimite.dentroCobertura).toBe(true);
    });

    it('rechaza parámetros no finitos', () => {
      expect(() =>
        calcularSugerenciaCosto({
          ...parametrosBase,
          costoBase: Number.NaN,
          distanciaTarifaKm: null,
          distanciaCoberturaKm: null,
          radioCoberturaKm: null,
        }),
      ).toThrow('INVALID_DELIVERY_COST_INPUT');
    });

    it('rechaza valores negativos en costoBase', () => {
      expect(() =>
        calcularSugerenciaCosto({
          ...parametrosBase,
          costoBase: -1,
          distanciaTarifaKm: null,
          distanciaCoberturaKm: null,
          radioCoberturaKm: null,
        }),
      ).toThrow('INVALID_DELIVERY_COST_INPUT');
    });
  });
});
