import { ReservaCreate, ReservaQuery, ReservaConfirmar, ReservaReprogramar, DisponibilidadQuery } from '../schemas/reservas.js';
import { anularReserva, atenderReserva, confirmarReserva, crearReserva, listarReservas, reprogramarReserva, verificarDisponibilidad } from '../repositories/reservas-repository.js';

export async function listarReservasService(q: ReservaQuery) { return listarReservas(q); }
export async function crearReservaService(input: ReservaCreate, usuarioId: number, usucre: string, pc?: string) { return crearReserva(input, usuarioId, usucre, pc); }
export async function confirmarService(id: number, input: ReservaConfirmar, usumod: string, pc?: string) {
  return confirmarReserva(id, input, usumod, pc);
}
export async function atenderService(id: number, usumod: string, pc?: string) {
  return atenderReserva(id, usumod, pc);
}
export async function anularService(id: number, usumod: string, pc?: string) {
  return anularReserva(id, usumod, pc);
}
export async function reprogramarService(id: number, input: ReservaReprogramar, usumod: string, pc?: string) {
  return reprogramarReserva(id, input, usumod, pc);
}
export async function disponibilidadService(q: DisponibilidadQuery) { return verificarDisponibilidad(q); }