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
  IonButtons,
  IonIcon,
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
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

interface RegistroEnviado {
  nombre: string;
  email: string;
  fechaNacimiento: string;
}

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
    ReactiveFormsModule,
    IonButtons,
    IonIcon
  ],
})
export class HomePage {
  public registroForm: FormGroup;
  public isSubmitting = signal(false);
  public hoy = obtenerHoy();
  public modoOscuro = signal(false);

  public cambiarModoOscuro(): void {
    this.modoOscuro.update(valor => !valor);

    document.documentElement.classList.toggle(
      'ion-palette-dark',
      this.modoOscuro()
    );


  }
  public ultimoEnvio = signal<RegistroEnviado | null>(null);

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController
  ) {
    addIcons({ moonOutline, sunnyOutline });
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
      this.ultimoEnvio.set({
        nombre: formData.nombre,
        email: formData.email,
        fechaNacimiento: String(formData.fechaNacimiento).slice(0, 10)
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
        `Fecha de nacimiento: ${dia}/${mes}/${anio}`,
        'Contraseña: Oculta'
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
