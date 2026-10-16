import { Component, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonList,
  IonItem,
  IonButton,
  IonSpinner,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  AlertController
} from '@ionic/angular';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

function obtenerHoy(): string {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const fecha = String(control.value).slice(0, 10);

  return fecha > obtenerHoy() ? { fechaFutura: true } : null;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonList,
    IonItem,
    IonButton,
    IonSpinner,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    ReactiveFormsModule
  ],
})
export class HomePage {
  public registroForm: FormGroup;
  public isSubmitting = signal(false);
  public hoy = obtenerHoy();

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        ]
      ],
      fechaNacimiento: [null, [Validators.required, fechaNoFutura]],
    });
  }
  public async onSubmit(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData = this.registroForm.value;
      console.log('Payload a enviar a la API REST:', formData);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 2000);
      });

      const alert = await this.alertController.create({
        header: 'Formulario enviado',
        message: 'El formulario se ha enviado correctamente.',
        buttons: ['Aceptar']
      });

      await alert.present();

      this.registroForm.reset();
    } catch (error) {
      console.error('Error durante el envío simulado:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
