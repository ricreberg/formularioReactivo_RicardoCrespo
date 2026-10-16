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
  AlertController,
  IonButtons,
  IonIcon
} from '@ionic/angular';

import {
  FechaNoFuturaDirective,
  obtenerHoy
} from './fecha-no-futura.directive';

import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

interface UsuarioFormulario {
  nombre: string;
  email: string;
  password: string;
  fechaNacimiento: string | null;
}
interface RegistroEnviado extends UsuarioFormulario {
  fechaNacimiento: string;
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
    IonSpinner,
    IonButtons,
    IonIcon
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
  public modoOscuro = signal(false);
  public ultimoEnvio = signal<RegistroEnviado | null>(null);

  constructor(private alertController: AlertController) {
    addIcons({ moonOutline, sunnyOutline });
  }

  ngOnInit(): void {
    this.modoOscuro.set(
      document.documentElement.classList.contains('ion-palette-dark')
    );
  }

  public cambiarModoOscuro(): void {
    const activarOscuro =
      !document.documentElement.classList.contains('ion-palette-dark');

    document.documentElement.classList.toggle(
      'ion-palette-dark',
      activarOscuro
    );

    this.modoOscuro.set(activarOscuro);
  }

  public async onSubmit(formulario: NgForm): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    if (formulario.invalid) {
      formulario.form.markAllAsTouched();
      return;
    }

    const formData: RegistroEnviado = {
      nombre: this.usuario.nombre,
      email: this.usuario.email,
      password: this.usuario.password,
      fechaNacimiento: String(this.usuario.fechaNacimiento).slice(0, 10)
    };

    this.isSubmitting.set(true);

    try {
      const passwordCifrada = await this.cifrarPassword(formData.password);

      console.log('Datos del formulario Template-Driven:');
      console.log('Nombre:', formData.nombre);
      console.log('Correo electrónico:', formData.email);
      console.log('Contraseña cifrada:', passwordCifrada);
      console.log('Fecha de nacimiento:', formData.fechaNacimiento);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 2000);
      });

      this.ultimoEnvio.set(formData);

      const alerta = await this.alertController.create({
        header: 'Formulario enviado',
        message: 'El formulario Template-Driven se ha enviado correctamente.',
        buttons: [
          {
            text: 'Descargar PDF',
            handler: () => {
              void this.descargarPdf();
              return false;
            }
          },
          {
            text: 'Aceptar',
            role: 'cancel'
          }
        ]
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

  private async cifrarPassword(password: string): Promise<{
    algoritmo: string;
    iv: string;
    contenido: string;
  }> {
    const clave = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const texto = new TextEncoder().encode(password);

    const resultado = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      clave,
      texto
    );

    const aHexadecimal = (bytes: Uint8Array): string =>
      Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');

    return {
      algoritmo: 'AES-GCM',
      iv: aHexadecimal(iv),
      contenido: aHexadecimal(new Uint8Array(resultado))
    };
  }
  public async descargarPdf(): Promise<void> {
    const datos = this.ultimoEnvio();

    if (!datos) {
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const documento = new jsPDF();

      const [anio, mes, dia] = datos.fechaNacimiento.split('-');

      documento.setFontSize(18);
      documento.text('Justificante del formulario', 20, 25);

      documento.setFontSize(12);

      const contenido = [
        `Nombre: ${datos.nombre}`,
        `Correo electrónico: ${datos.email}`,
        `Contraseña: ${datos.password}`,
        `Fecha de nacimiento: ${dia}/${mes}/${anio}`
      ];

      let posicionY = 45;

      for (const campo of contenido) {
        const lineas: string[] = documento.splitTextToSize(campo, 170);

        for (const linea of lineas) {
          if (posicionY > 275) {
            documento.addPage();
            posicionY = 20;
          }

          documento.text(linea, 20, posicionY);
          posicionY += 7;
        }

        posicionY += 5;
      }

      documento.save('registro-enviado.pdf');
    } catch (error) {
      console.error('Error al generar el PDF:', error);

      const alerta = await this.alertController.create({
        header: 'No se pudo generar el PDF',
        message: 'Inténtalo de nuevo.',
        buttons: ['Aceptar']
      });

      await alerta.present();
    }
  }
}
