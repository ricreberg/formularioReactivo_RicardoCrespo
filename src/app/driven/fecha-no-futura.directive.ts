import { Directive, forwardRef } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator
} from '@angular/forms';

export function obtenerHoy(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

@Directive({
  selector: '[appFechaNoFutura]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FechaNoFuturaDirective),
      multi: true
    }
  ]
})
export class FechaNoFuturaDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const fecha = String(control.value).slice(0, 10);

    return fecha > obtenerHoy() ? { fechaFutura: true } : null;
  }
}