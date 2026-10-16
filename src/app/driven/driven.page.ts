import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonInput,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonButton,
  IonSpinner,
  AlertController
} from '@ionic/angular';

import {
  FechaNoFuturaDirective,
  obtenerHoy
} from './fecha-no-futura.directive';

interface UsuarioFormulario {
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string | null;
}

@Component({
  selector: 'app-driven',
  templateUrl: './driven.page.html',
  styleUrls: ['./driven.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonInput,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    CommonModule,
    FormsModule,
    FechaNoFuturaDirective,
    IonButton,
    IonSpinner
  ]
})
export class DrivenPage implements OnInit {

  public usuario: UsuarioFormulario = {
    nombre: '',
    email: '',
    password: '',
    fechaNacimiento: null
  };
  public hoy = obtenerHoy();
  public isSubmitting = signal(false);

  constructor(private alertController: AlertController) { }

  ngOnInit() {
  }

  public async onSubmit(formulario: NgForm): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 2000);
      });

      const alerta = await this.alertController.create({
        header: 'Formulario enviado',
        message: 'El formulario Template-Driven se ha enviado correctamente.',
        buttons: ['Aceptar']
      });

      await alerta.present();

      formulario.resetForm({
        nombre: '',
        email: '',
        password: '',
        fechaNacimiento: null
      });
    } catch (error) {
      console.error('Error durante el envío simulado:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

}
